# FindSchool.Admin — CSV → SQLite generator

Takes the `schools_raw.csv` produced by the Python scraper and emits
`find-school.db`, the SQLite asset shipped inside the mobile app.

## Usage

```bash
cd admin/FindSchool.Admin

# Basic: ingest + FTS + VACUUM
dotnet run -- ../../scraper/schools_raw.csv find-school.db

# Ingest + geocode rows missing lat/long via Nominatim
dotnet run -- ../../scraper/schools_raw.csv find-school.db \
  --geocode --email you@example.com --max-geocode 2000
```

## Arguments

| Position / flag          | Default                              | What it does                                          |
|--------------------------|--------------------------------------|-------------------------------------------------------|
| `<csv>` (positional #1)  | `../../scraper/schools_raw.csv`      | Source CSV from the scraper                           |
| `<db>`  (positional #2)  | `find-school.db`                     | Output SQLite path (deleted before write)             |
| `--geocode`              | off                                  | Run Nominatim fallback for rows missing GPS           |
| `--email <addr>`         | —                                    | **Required** with `--geocode` (Nominatim policy)      |
| `--max-geocode <n>`      | unlimited                            | Cap on geocoding calls per run                        |

## Geocoding: Nominatim usage policy

`NominatimGeocoder.cs` enforces the rules from
https://operations.osmfoundation.org/policies/nominatim/:

- **1 request/second** — hard-enforced via semaphore + `Task.Delay` between calls.
- **User-Agent** includes your contact email (`--email`) so OSM can reach you
  before banning the IP.
- **Cache** — `GeocodeCache` writes `geocode-cache.json` next to the db. Every
  normalized address is recorded exactly once, including misses. Re-running
  will not re-hit the API for cached addresses.

For the ~10–20% of IPEMIS rows missing GPS this fits the "casual use" tier.
If you need to geocode all 65k rows from scratch, **self-host Nominatim** per
the policy — the public instance will rate-limit or ban bulk jobs.

## What gets written to the database

- `Schools` table — one row per EIIN, indexed on name / division / district / upazila
- `schools_fts` — FTS5 virtual table over name/address/district/upazila, rebuilt
  after ingest for millisecond on-device search

After ingest: `VACUUM` shrinks the file and compacts fragmentation, then the
resulting `find-school.db` is what you copy into `mobile/assets/db/`.

## Idempotency

- Re-running clears the output `.db` before writing (deterministic output).
- `geocode-cache.json` is preserved across runs — drop it to start fresh.
