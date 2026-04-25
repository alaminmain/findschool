using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using FindSchool.Admin;

var csvPath = args.Length > 0 ? args[0] : "../../scraper/schools_raw.csv";
var dbPath  = args.Length > 1 ? args[1] : "find-school.db";

if (File.Exists(dbPath)) File.Delete(dbPath);

await using var db = new SchoolDb(dbPath);
await db.InitializeAsync();

using var reader = new StreamReader(csvPath);
using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
{
    HeaderValidated = null,
    MissingFieldFound = null,
});

const int batchSize = 2_000;
var batch = new List<School>(batchSize);
var total = 0;

await foreach (var rec in csv.GetRecordsAsync<CsvRow>())
{
    batch.Add(new School
    {
        Eiin = rec.eiin,
        Name = rec.name,
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

await db.RebuildFtsAsync();
await db.VacuumAsync();
Console.WriteLine($"Done. {total} schools written to {dbPath}");

internal sealed record CsvRow(
    string eiin, string name, string level, string address,
    string division, string district, string upazila,
    double? latitude, double? longitude);
