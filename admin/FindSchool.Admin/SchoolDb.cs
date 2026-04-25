using SQLite;

namespace FindSchool.Admin;

/// <summary>
/// Builds the find-school.db SQLite asset shipped with the mobile app.
/// Uses sqlite-net-pcl which auto-creates the table & indexes from attributes.
/// </summary>
public sealed class SchoolDb : IAsyncDisposable
{
    private readonly SQLiteAsyncConnection _conn;

    public SchoolDb(string dbPath)
    {
        var options = new SQLiteConnectionString(
            dbPath,
            SQLiteOpenFlags.Create | SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.SharedCache,
            storeDateTimeAsTicks: true
        );
        _conn = new SQLiteAsyncConnection(options);
    }

    public async Task InitializeAsync()
    {
        await _conn.CreateTableAsync<School>();
        // FTS5 virtual table for fuzzy school-name search on device.
        await _conn.ExecuteAsync(
            @"CREATE VIRTUAL TABLE IF NOT EXISTS schools_fts USING fts5(
                eiin UNINDEXED, name, name_bn, address, district, upazila,
                tokenize = 'unicode61',
                content='Schools', content_rowid='rowid'
            );");
    }

    public async Task BulkInsertAsync(IEnumerable<School> schools)
    {
        await _conn.RunInTransactionAsync(tx =>
        {
            foreach (var s in schools)
                tx.InsertOrReplace(s);
        });
    }

    public async Task RebuildFtsAsync()
    {
        await _conn.ExecuteAsync("INSERT INTO schools_fts(schools_fts) VALUES('rebuild');");
    }

    public async Task VacuumAsync() => await _conn.ExecuteAsync("VACUUM;");

    public Task<List<School>> GetMissingCoordsAsync(int limit) =>
        _conn.QueryAsync<School>(
            "SELECT * FROM Schools WHERE latitude IS NULL OR longitude IS NULL LIMIT ?",
            limit);

    public Task<int> UpdateCoordsAsync(string eiin, double lat, double lon) =>
        _conn.ExecuteAsync(
            "UPDATE Schools SET latitude = ?, longitude = ?, geocoded = 1 WHERE eiin = ?",
            lat, lon, eiin);

    public ValueTask DisposeAsync() => _conn.CloseAsync().AsValueTask();
}

internal static class TaskExt
{
    public static ValueTask AsValueTask(this Task t) => new(t);
}
