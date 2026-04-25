using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace FindSchool.Admin;

public sealed record GeoResult(double Latitude, double Longitude, string DisplayName);

/// <summary>
/// Nominatim (OpenStreetMap) forward-geocoder.
///
/// Usage policy (https://operations.osmfoundation.org/policies/nominatim/):
///   - Max 1 request per second.
///   - Valid User-Agent identifying the application and contact email.
///   - Cache results; do not hit the API for the same address twice.
///   - Do not run bulk geocoding; heavy jobs must self-host.
/// For the ~10-20% of rows in IPEMIS missing GPS, one pass fits the
/// "casual use" tier. For the full 65k we would need to self-host.
/// </summary>
public sealed class NominatimGeocoder : IDisposable
{
    private const string BaseUrl = "https://nominatim.openstreetmap.org/search";
    private readonly HttpClient _http;
    private readonly TimeSpan _minInterval = TimeSpan.FromMilliseconds(1100);
    private DateTime _lastCallUtc = DateTime.MinValue;
    private readonly SemaphoreSlim _gate = new(1, 1);

    public NominatimGeocoder(string contactEmail)
    {
        if (string.IsNullOrWhiteSpace(contactEmail))
            throw new ArgumentException("Nominatim requires a contact email in User-Agent.", nameof(contactEmail));

        _http = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(15),
        };
        _http.DefaultRequestHeaders.UserAgent.ParseAdd($"FindSchoolBD/0.1 ({contactEmail})");
        _http.DefaultRequestHeaders.AcceptLanguage.ParseAdd("en,bn");
    }

    public async Task<GeoResult?> GeocodeAsync(string address, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(address)) return null;

        await _gate.WaitAsync(ct);
        try
        {
            var wait = _minInterval - (DateTime.UtcNow - _lastCallUtc);
            if (wait > TimeSpan.Zero) await Task.Delay(wait, ct);

            var url = $"{BaseUrl}?format=jsonv2&limit=1&countrycodes=bd&addressdetails=0"
                    + $"&q={Uri.EscapeDataString(address)}";

            var results = await _http.GetFromJsonAsync<NominatimHit[]>(url, ct);
            _lastCallUtc = DateTime.UtcNow;

            if (results is null || results.Length == 0) return null;
            var hit = results[0];
            if (!double.TryParse(hit.Lat, out var lat) ||
                !double.TryParse(hit.Lon, out var lon))
                return null;

            return new GeoResult(lat, lon, hit.DisplayName ?? address);
        }
        catch (HttpRequestException)
        {
            return null; // transient; caller decides whether to retry
        }
        catch (TaskCanceledException)
        {
            return null;
        }
        finally
        {
            _gate.Release();
        }
    }

    public void Dispose() => _http.Dispose();

    private sealed record NominatimHit(
        [property: JsonPropertyName("lat")] string Lat,
        [property: JsonPropertyName("lon")] string Lon,
        [property: JsonPropertyName("display_name")] string? DisplayName);
}
