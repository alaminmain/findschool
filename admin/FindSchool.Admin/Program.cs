using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using FindSchool.Admin;

// --- args ---
// <csv> <db> [--geocode --email you@example.com] [--max-geocode 2000]
var csvPath = PositionalOrDefault(0, "../../scraper/schools_raw.csv");
var dbPath  = PositionalOrDefault(1, "find-school.db");
var doGeocode = args.Contains("--geocode");
var email = Flag("--email");
var maxGeocode = int.Parse(Flag("--max-geocode") ?? "0", CultureInfo.InvariantCulture);

if (File.Exists(dbPath)) File.Delete(dbPath);

await using var db = new SchoolDb(dbPath);
await db.InitializeAsync();

// --- ingest ---
using (var reader = new StreamReader(csvPath))
using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
{
    HeaderValidated = null,
    MissingFieldFound = null,
}))
{
    const int batchSize = 2_000;
    var batch = new List<School>(batchSize);
    var total = 0;

    await foreach (var rec in csv.GetRecordsAsync<CsvRow>())
    {
        batch.Add(new School
        {
            Eiin = rec.eiin,
            Name = StripLeadingNumber(rec.name),
            NameBn = StripLeadingNumber(rec.name_bn ?? string.Empty),
            Level = rec.level,
            Address = rec.address,
            Division = rec.division,
            District = rec.district,
            Upazila = rec.upazila,
            Latitude = rec.latitude,
            Longitude = rec.longitude,
            Geocoded = false,
        });

        if (batch.Count >= batchSize)
        {
            await db.BulkInsertAsync(batch);
            total += batch.Count;
            Console.WriteLine($"Inserted {total} rows...");
            batch.Clear();
        }
    }
    if (batch.Count > 0)
    {
        await db.BulkInsertAsync(batch);
        total += batch.Count;
    }
    Console.WriteLine($"Ingest complete: {total} schools.");
}

// --- geocoding pass (optional) ---
if (doGeocode)
{
    if (string.IsNullOrWhiteSpace(email))
    {
        Console.Error.WriteLine("--geocode requires --email you@example.com (Nominatim usage policy).");
        return 2;
    }
    await GeocodeMissingAsync(db, email!, maxGeocode);
}

await db.RebuildFtsAsync();
await db.VacuumAsync();
Console.WriteLine($"Done. Wrote {dbPath}");
return 0;

// --- helpers ---

string? Flag(string name)
{
    var i = Array.IndexOf(args, name);
    return i >= 0 && i + 1 < args.Length ? args[i + 1] : null;
}

string PositionalOrDefault(int index, string fallback)
{
    var positionals = new List<string>();
    for (var i = 0; i < args.Length; i++)
    {
        if (args[i].StartsWith("--")) { i++; continue; } // skip flag + its value
        positionals.Add(args[i]);
    }
    return index < positionals.Count ? positionals[index] : fallback;
}

static async Task GeocodeMissingAsync(SchoolDb db, string email, int max)
{
    var cachePath = "geocode-cache.json";
    var cache = GeocodeCache.Load(cachePath);
    using var geo = new NominatimGeocoder(email);

    var pending = await db.GetMissingCoordsAsync(max > 0 ? max : int.MaxValue);
    Console.WriteLine($"Geocoding {pending.Count} schools missing GPS (cache has {cache.Count} entries)...");

    var hits = 0;
    var misses = 0;
    var cacheHits = 0;
    var flushEvery = 25;

    for (var i = 0; i < pending.Count; i++)
    {
        var s = pending[i];
        var address = BuildQuery(s);

        GeoResult? res;
        if (cache.TryGet(address, out res))
        {
            cacheHits++;
        }
        else
        {
            res = await geo.GeocodeAsync(address);
            cache.Put(address, res);
        }

        if (res is not null)
        {
            await db.UpdateCoordsAsync(s.Eiin, res.Latitude, res.Longitude);
            hits++;
        }
        else
        {
            misses++;
        }

        if ((i + 1) % flushEvery == 0)
        {
            cache.Flush();
            Console.WriteLine($"  [{i + 1}/{pending.Count}] hits={hits} misses={misses} cached={cacheHits}");
        }
    }

    cache.Flush();
    Console.WriteLine($"Geocoding done: hits={hits} misses={misses} cached={cacheHits}");
}

static string StripLeadingNumber(string raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return raw;
    var s = raw.Trim();

    // Drop a leading mauza/registration number with optional "No"/"No."/"No-" and any spacing.
    // Examples: "86no Raypur GPS" → "Raypur GPS", "108 NO. Bhothat" → "Bhothat",
    // "04 No- Modhupur" → "Modhupur", "189Bodol Gachhi" → "Bodol Gachhi", "21 Nowpara" → "Nowpara".
    var m = System.Text.RegularExpressions.Regex.Match(
        s,
        @"^\d{1,4}\s*(?:no[.\-]?)?\s+(?<rest>\S.+)$",
        System.Text.RegularExpressions.RegexOptions.IgnoreCase);

    return m.Success ? m.Groups["rest"].Value.Trim() : s;
}

static string BuildQuery(School s)
{
    // Nominatim likes "street, area, city, country" order.
    var parts = new[] { s.Name, s.Address, s.Upazila, s.District, "Bangladesh" }
        .Where(p => !string.IsNullOrWhiteSpace(p));
    return string.Join(", ", parts);
}

internal sealed record CsvRow(
    string eiin, string name, string? name_bn, string level, string address,
    string division, string district, string upazila,
    double? latitude, double? longitude);
