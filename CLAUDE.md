# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project in one paragraph

Find School BD is an **offline-first school directory** for Bangladesh. Three independent stacks produce one shipped artifact (`find-school.db`): a Python Playwright scraper (`scraper/`) harvests IPEMIS/BANBEIS into CSV, a .NET 9 console app (`admin/`) cleans the CSV into a SQLite database with an FTS5 virtual table, and an Expo app (`mobile/`) bundles that DB and runs fully offline after first launch. `TRACKER.md` is the live project status — update it when phase state changes.

## Repository layout

```
scraper/    Python + Playwright — IPEMIS scrape → schools_raw.csv
admin/      .NET 9 console app — CSV → find-school.db (sqlite-net-pcl + FTS5)
mobile/     Expo SDK 52 + expo-router — offline search, MapView, directions
  app/          routes (index search, school/[eiin] detail)
  src/db/       bootstrap.ts (first-run asset copy) + queries.ts (FTS5)
  src/observability/ Sentry init (opt-in only, off by default)
  store/        Play Store assets: listings (en+bn), ASO, privacy, checklist
  assets/brand/ SVG sources for icon/splash + rasterization guide
TRACKER.md  Live phase tracker (single source of truth for status)
```

## Stack-specific conventions

### scraper/ (Python)
- **Primary source**: `fetch_ipemis_api.py` hits the public DataTables endpoint
  `https://ipemis.dpe.gov.bd/load-lite-school-list`. No auth. 65,569 rows. Required
  headers: `x-requested-with: XMLHttpRequest` + a same-origin `referer`.
  Pagination is `start`/`length`; `length=1000` is the safe sweet spot.
- **Secondary (ad-hoc) source**: `parse_mpo_pdf.py` OCRs scanned MoE circulars via
  RapidOCR + positional column clustering. Use only when a JSON API isn't available.
- `scrape_ipemis.py` (the original Playwright stub) is kept for reference only —
  the public school-directory HTML page returns a system-error and requires login.
- Force UTF-8 stdout on Windows: `sys.stdout = io.TextIOWrapper(sys.stdout.buffer,
  encoding="utf-8", errors="replace")` — Bangla text crashes cp1252 otherwise.

### admin/ (.NET 9)
- `sqlite-net-pcl` attribute-driven schema (see `School.cs`). Don't hand-write DDL.
- Bulk inserts **must** use `RunInTransactionAsync` with 2,000-row batches; without this, 65k inserts take minutes.
- After insert: rebuild FTS (`INSERT INTO schools_fts(schools_fts) VALUES('rebuild')`) then `VACUUM`.
- Re-runs are idempotent via `[PrimaryKey]` on `Eiin` + `InsertOrReplace`.
- Geocoding fallback (`--geocode --email x`) uses Nominatim. **Hard rules**: 1 req/sec
  (enforced in `NominatimGeocoder`), User-Agent with contact email, results cached in
  `geocode-cache.json`. For bulk >5k rows, self-host Nominatim — don't lift the cap.

### mobile/ (Expo)
- Path alias `@/*` resolves to `mobile/src/*` (see `tsconfig.json`).
- **Never** load the full 65k rows into memory. Always paginate via `LIMIT/OFFSET` and rely on FlatList's `getItemLayout` + `onEndReached`.
- The shipped DB is read-only — `bootstrap.ts` applies `PRAGMA query_only = ON`; don't write to it.
- Search uses FTS5 with per-token `*` prefix wildcards in `queries.ts`.
- Sentry is **off by default** (requires both `extra.enableSentry=true` AND a DSN). Flipping this on requires a privacy-policy update first.
- Don't add runtime permissions. The app's zero-collection posture is a feature; the listing, privacy policy, and data-safety form all depend on it.

## Common commands

```bash
# Scraper
cd scraper && python scrape_ipemis.py --division Dhaka --district Dhaka --upazila Dhanmondi

# Admin (builds find-school.db from the CSV)
cd admin/FindSchool.Admin && dotnet run -- ../../scraper/schools_raw.csv find-school.db

# Mobile
cd mobile
npm install
npm run typecheck          # tsc --noEmit
npx expo run:android       # first run creates android/
npx eas build --profile production -p android   # AAB for Play
```

## Doing work here — rules of thumb

1. **Update `TRACKER.md`** whenever a phase's status changes. It's the spec; don't let it drift.
2. **Prefer editing existing files** over creating new ones. Three top-level folders is already the structure — don't add siblings unless asked.
3. **Don't commit generated binaries**: `schools_raw.csv`, `find-school.db`, rasterized PNGs, AAB/APK. All are in `.gitignore`. Brand SVGs and store markdown ARE committed.
4. **Respect the privacy posture**. Any change that adds network calls, analytics, or permissions is a policy change — flag it, update `store/privacy-policy.md` + `store/data-safety-answers.md` + Play Console before shipping.
5. **The DB is shipped, not synced.** Updates reach users via app updates only. There is no server; don't suggest one without explicit discussion.
6. **FlatList performance is not negotiable.** Keep `getItemLayout`, memoized `renderItem`, stable `keyExtractor`, debounced search, and keyset pagination. The 65k-row scale is only tractable because of these.

## Files Claude should rarely touch without asking

- `app.json` bundle IDs / signing config
- `eas.json` production profile
- `store/privacy-policy.md` and `store/data-safety-answers.md` (pair them — Play Console rejects mismatches)
- Anything under `mobile/assets/db/` (shipped DB)

## Known gaps / next-up work

- BANBEIS scraper variant (secondary schools are on a different portal than IPEMIS).
- Nominatim geocoding fallback in the admin tool for rows with missing lat/long.
- Real brand rasterization (SVGs committed; PNGs are generated on demand).
- First end-to-end dry run — until it happens, selectors and DB size are estimates.
