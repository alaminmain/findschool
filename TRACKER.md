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
See [`docs/PUBLISH.md`](docs/PUBLISH.md) for the step-by-step. The short list:

1. ~~Run the scraper across all 492 upazilas → produce a complete `schools_raw.csv`.~~ ✅
2. ~~Build `find-school.db` and drop into `mobile/assets/db/`.~~ ✅
3. ~~Rasterize SVG brand assets.~~ ✅ (`mobile/assets/{icon,adaptive-icon,splash,favicon}.png`, `mobile/store/{play-icon,feature-graphic}.png`)
4. ~~Privacy policy hosted~~ ✅ — site source in `docs/`. Enable GitHub Pages on `main`/`/docs`.
5. **Google Play Console developer account** ($25 one-time). Cannot be done programmatically.
6. **Expo / EAS account** + `npx eas build --profile production -p android`.
7. **Capture 8 phone screenshots** from a running emulator per `mobile/store/screenshots-plan.md`.
8. **Upload AAB**, paste listings + answers from `mobile/store/`, submit for review.

Google Maps API key is **not** required for the first build — no school has GPS
yet, so the MapView never mounts. Add the key when the agentic-AI geocoding
pass populates coordinates.

## Optional follow-ups (not blocking)
- ~~Nominatim geocoding fallback in the admin tool for rows missing lat/long.~~ ✅ Done — see `admin/README.md`.
- **Geocode the 65k IPEMIS rows** — none have lat/long. The `--geocode` pass
  needs a self-hosted Nominatim (public tier won't allow bulk). Until then,
  the MapView screen shows "No GPS coordinates on file" for every school.
- Merge supplementary CSV sources (e.g. `cleaned_school_data.csv`) for
  schools the IPEMIS API misses (private secondary, madrasahs, colleges).
- OCR-based PDF importer is in `scraper/parse_mpo_pdf.py` (RapidOCR) for
  ad-hoc scanned circulars from MoE.
- iOS track (listing copy reusable; needs APNs + separate App Store Connect setup).
- In-app "report a missing school" mailto link → pre-fills hello@findschool.app.
