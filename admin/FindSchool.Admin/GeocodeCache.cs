using System.Text.Json;

namespace FindSchool.Admin;

/// <summary>
/// On-disk JSON cache keyed by the normalized address.
/// Crucial: we must NEVER call Nominatim for the same address twice,
/// even across runs (usage policy + kindness). Load -> Save is a simple
/// dictionary; at ~65k rows the file fits easily in memory.
/// </summary>
public sealed class GeocodeCache
{
    private readonly string _path;
    private readonly Dictionary<string, CachedHit> _data;
    private bool _dirty;

    private GeocodeCache(string path, Dictionary<string, CachedHit> data)
    {
        _path = path;
        _data = data;
    }

    public static GeocodeCache Load(string path)
    {
        if (!File.Exists(path)) return new GeocodeCache(path, new(StringComparer.OrdinalIgnoreCase));
        var json = File.ReadAllText(path);
        var dict = JsonSerializer.Deserialize<Dictionary<string, CachedHit>>(json)
                   ?? new Dictionary<string, CachedHit>();
        return new GeocodeCache(path, new Dictionary<string, CachedHit>(dict, StringComparer.OrdinalIgnoreCase));
    }

    public static string Normalize(string address) =>
        string.Join(' ', (address ?? "").Trim().ToLowerInvariant()
                                               .Split(' ', StringSplitOptions.RemoveEmptyEntries));

    public bool TryGet(string address, out GeoResult? hit)
    {
        if (_data.TryGetValue(Normalize(address), out var c))
        {
            hit = c.IsMiss ? null : new GeoResult(c.Lat, c.Lon, c.DisplayName ?? "");
            return true;
        }
        hit = null;
        return false;
    }

    public void Put(string address, GeoResult? hit)
    {
        _data[Normalize(address)] = hit is null
            ? new CachedHit(0, 0, null, IsMiss: true)
            : new CachedHit(hit.Latitude, hit.Longitude, hit.DisplayName, IsMiss: false);
        _dirty = true;
    }

    public void Flush()
    {
        if (!_dirty) return;
        var tmp = _path + ".tmp";
        File.WriteAllText(tmp, JsonSerializer.Serialize(_data, new JsonSerializerOptions
        {
            WriteIndented = false,
        }));
        File.Move(tmp, _path, overwrite: true);
        _dirty = false;
    }

    public int Count => _data.Count;

    private sealed record CachedHit(double Lat, double Lon, string? DisplayName, bool IsMiss);
}
