# Find School BD

> Offline-first directory of every government-registered primary & secondary school in Bangladesh. 65,000+ schools, searchable without an internet connection.

<p align="center">
  <img src="mobile/assets/brand/icon.svg" width="96" alt="Find School icon"/>
</p>

<p align="center">
  <a href="#"><img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="platform" src="https://img.shields.io/badge/platform-Android%20%7C%20iOS-green">
  <img alt="stack" src="https://img.shields.io/badge/stack-.NET%209%20%7C%20Expo%20%7C%20Playwright-orange">
</p>

---

## What it does

Find School lets parents, educators, and researchers locate any school in Bangladesh — by **name**, **EIIN**, **upazila**, or **district** — and get turn-by-turn directions with a single tap. The entire directory ships inside the app as a compiled SQLite database, so **the app works fully offline after first launch**.

## Architecture

```
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Python (Playwright) │    │   .NET 9 Admin CLI   │    │  React Native Expo   │
│  scrape IPEMIS/      │──▶ │  clean CSV → SQLite  │──▶ │  ship DB + search +  │
│  BANBEIS → CSV       │    │  geocode + FTS5      │    │  MapView (offline)   │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
         scraper/                     admin/                    mobile/
```

Three top-level folders, three independent stacks, one shipped artifact (`find-school.db`) that flows left → right.

## Repository layout

| Path        | What's inside                                                                           |
|-------------|-----------------------------------------------------------------------------------------|
| `scraper/`  | Python + Playwright script that harvests the IPEMIS school directory into CSV.          |
| `admin/`    | .NET 9 console app (`sqlite-net-pcl` + `CsvHelper`) that ingests the CSV into SQLite, builds indexes, and populates an FTS5 virtual table. |
| `mobile/`   | Expo (SDK 52) + Expo Router app with offline search, detail map, and directions deep links. |
| `mobile/store/` | Play Store listings (en + bn), ASO research, privacy policy, release checklist.     |
| `TRACKER.md`| Live project status across all five phases.                                             |

## Quick start

### Prerequisites
- Python 3.11+, .NET 9 SDK, Node 20+, Android Studio (for emulator) or a physical device.
- A Google Maps API key (Android) — only needed when you want the map screen rendering real tiles.

### 1) Harvest data
```bash
cd scraper
pip install playwright pandas && playwright install chromium
python scrape_ipemis.py --division Dhaka --district Dhaka --upazila Dhanmondi
# produces scraper/schools_raw.csv
```
Run it across every upazila to build the full 65k-row dataset.

### 2) Build the shipped SQLite DB
```bash
cd admin/FindSchool.Admin
dotnet run -- ../../scraper/schools_raw.csv find-school.db
cp find-school.db ../../mobile/assets/db/
```

### 3) Run the mobile app
```bash
cd mobile
npm install
# first native run generates android/ + ios/ folders
npx expo run:android
```
On first launch the app copies `find-school.db` from the asset bundle into `documentDirectory/SQLite/` — after that, zero network usage.

## How the offline search works

1. The .NET admin tool creates an FTS5 virtual table (`schools_fts`) alongside the main `Schools` table and rebuilds it after the bulk insert.
2. On device, `src/db/queries.ts` issues `MATCH` queries with per-token `*` wildcards for typo-tolerant prefix search.
3. The search screen (`app/index.tsx`) debounces input 250 ms, paginates 50 rows at a time, and tunes `FlatList` with `getItemLayout`, `windowSize=5`, and a memoized `renderItem` so scrolling stays at 60 fps even on low-end Android.

## Privacy posture

**Zero data collection at launch.** No accounts, no analytics, no ads. The app has no backend. Google Maps is invoked only via OS-level intents when the user taps *Get Directions*. Full policy: [`mobile/store/privacy-policy.md`](mobile/store/privacy-policy.md).

Sentry crash reporting exists in the code (`src/observability/sentry.ts`) but is **disabled by default** — both a DSN and an opt-in flag are required to activate it. If enabled in a future release, the privacy policy and Play Store data-safety form must be updated first.

## Project tracker

Live status in [`TRACKER.md`](TRACKER.md). All five phases are scaffolded; remaining work is the human-only steps (full scrape run, brand asset rasterization, Maps key provisioning, Play Console submission).

## Contributing

The repo is three separate stacks, so contributions are easiest if you scope PRs to one folder:

- `scraper/` — add BANBEIS support, or a Nominatim fallback for rows missing GPS.
- `admin/` — improve deduplication, add a verification pass that flags EIIN collisions.
- `mobile/` — accessibility passes, offline-friendly favorites, Bangla UI strings.

Missing a school? Email `hello@findschool.app` with the EIIN.

## License

MIT — see [`LICENSE`](LICENSE).

## Data attribution

School records are compiled from public data published by **IPEMIS** (Directorate of Primary Education) and **BANBEIS** (Bangladesh Bureau of Educational Information and Statistics). This project is not affiliated with either body.
