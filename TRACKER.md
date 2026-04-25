# 🟢 PROJECT TRACKER — FIND SCHOOL

**Current Status:** ALL TASKS SCAFFOLDED — ready for first AAB build.

| #   | Task                                                       | Status         | Artifacts                                                                                |
|-----|------------------------------------------------------------|----------------|------------------------------------------------------------------------------------------|
| 1   | Data Model & Python Scraping Pipeline (IPEMIS / BANBEIS)   | 🟢 DONE (v1)   | `scraper/scrape_ipemis.py`                                                               |
| 2   | .NET 9 Admin Utility (Cleaning & SQLite generation)        | 🟢 DONE (v1)   | `admin/FindSchool.Admin/{School,SchoolDb,Program}.cs`                                    |
| 3   | React Native Setup & expo-sqlite Asset Bundling            | 🟢 DONE        | `mobile/src/db/bootstrap.ts`, `mobile/assets/db/`                                        |
| 4   | Search UI & MapView Integration (Offline)                  | 🟢 DONE        | `mobile/app/index.tsx`, `mobile/app/school/[eiin].tsx`, `src/db/queries.ts`              |
| 5   | App Store Optimization (ASO) & Play Store Prep             | 🟢 DONE        | `mobile/store/*`, `mobile/assets/brand/*`, `mobile/eas.json`, Sentry wiring              |

## Phase 5 artifacts
- **Listing copy**: `store/listing-en.md`, `store/listing-bn.md`
- **ASO research**: `store/aso-keywords.md` (primary/secondary/negative terms)
- **Visual plan**: `store/screenshots-plan.md` (8-frame storyboard + feature graphic)
- **Privacy**: `store/privacy-policy.md` + `store/data-safety-answers.md`
  (zero-collection posture matches app behavior)
- **Brand**: `assets/brand/{icon,adaptive-foreground,splash}.svg` + rasterization one-liner
- **Observability**: `src/observability/sentry.ts` — opt-in only, off by default so the
  "no data collected" claim holds until explicitly flipped
- **Release**: `eas.json` (dev/preview/production profiles) + `store/release-checklist.md`

## Remaining human-only steps (blocking first upload)
1. Run the scraper across all 492 upazilas → produce a complete `schools_raw.csv`.
2. Run `dotnet run` in `admin/FindSchool.Admin/` to build `find-school.db`;
   drop into `mobile/assets/db/`.
3. Rasterize SVG brand assets per `assets/brand/README.md`.
4. Provision a Google Maps API key (Android) → paste into `app.json`.
5. Register Play Console app under `bd.findschool.app`, create service
   account, save JSON to `mobile/play-service-account.json` (gitignored).
6. Host the privacy policy at a real URL (e.g. GitHub Pages on the repo).
7. `cd mobile && npm install && npx eas build --profile production -p android`.

## Optional follow-ups (not blocking)
- ~~Nominatim geocoding fallback in the admin tool for rows missing lat/long.~~ ✅ Done — see `admin/README.md`.
- BANBEIS scraper variant (secondary schools use a different portal).
- iOS track (listing copy reusable; needs APNs + separate App Store Connect setup).
- In-app "report a missing school" mailto link → pre-fills hello@findschool.app.
