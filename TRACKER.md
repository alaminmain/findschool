# 🟢 PROJECT TRACKER — FIND SCHOOL

**Current Status:** Build hygiene cleared (2026-04-28). Gradle release build passes
end-to-end through `:app:processReleaseManifest`. Ready for first EAS production AAB.

## Pre-flight cleanup completed 2026-04-27 (extended 2026-04-28)
- Bumped `app.json.version` → `1.0.0` (and `package.json.version` to match).
- Removed deprecated `expo.privacy: "public"` from `app.json` (no longer in schema).
- Sentry plugin pipeline: only `@sentry/react-native/expo` is wired (source-map +
  autolink in one). Runtime Sentry stays gated on `extra.enableSentry === true`
  AND a non-empty `extra.sentryDsn` — both false. Source-map upload at gradle
  time is suppressed via `SENTRY_DISABLE_AUTO_UPLOAD=true` in every `eas.json`
  build profile, so builds succeed without a `SENTRY_AUTH_TOKEN`. To enable
  Sentry: provide a DSN, flip `enableSentry`, drop the env var, and supply
  `SENTRY_AUTH_TOKEN`.
- Deduped `assetBundlePatterns` (`assets/db/*` was redundant under `**/*`).
- The local `mobile/android/` folder is gitignored and regenerated on every
  `expo prebuild`; an earlier checked-in copy had drifted (debug keystore on
  release, AAR-merged storage permissions). EAS regenerates a clean folder
  per build.
- **AAR-merged permission strip (2026-04-28):** filtering the source manifest
  is not enough — library AARs (notably `react-native-maps`' Play Services
  deps) re-inject `READ_/WRITE_EXTERNAL_STORAGE` during gradle's
  `processReleaseManifest`. `mobile/plugins/withCleanManifest.js` now emits
  `tools:node="remove"` directives for `READ_/WRITE_EXTERNAL_STORAGE`,
  `SYSTEM_ALERT_WINDOW`, `VIBRATE` so the manifest merger drops them. Verified:
  the merged release manifest contains only `INTERNET` plus
  normal/non-dangerous permissions (`ACCESS_NETWORK_STATE`, `WAKE_LOCK`,
  `RECEIVE_BOOT_COMPLETED`, `FOREGROUND_SERVICE`, internal signature-level
  receiver permission). None require runtime prompts and none change the
  data-safety answers.
- Ran `npx expo install --fix`: aligned `react-native@0.76.9`,
  `react-native-screens@~4.4.0`, `expo-sqlite@~15.1.4`,
  `@sentry/react-native@~6.10.0` to Expo SDK 52 expected versions.
- Resolved 19 transitive `npm audit` advisories down to **0** via three
  surgical `package.json` overrides — `uuid@^14`, `@xmldom/xmldom@^0.9`,
  `postcss@^8.5.10`. All three targets are build-time-only Expo CLI tooling
  (plist writer, metro CSS); none ships in the AAB. A `tar@^7` override was
  attempted and reverted because it broke `cacache`'s `tar.extract()` call.
  We did **not** run `npm audit fix --force` because its proposed remediation
  is to downgrade to `expo@49.0.23`, a 3-major SDK regression.
- `tsc --noEmit` passes; `expo-doctor` reports 17/17 checks passing;
  `npm audit` reports 0 vulnerabilities; `expo config --type prebuild`
  resolves end-to-end; `npx expo export --platform android` produces a clean
  3.67 MB Hermes bundle + 35.3 MB DB asset; `./gradlew :app:processReleaseManifest`
  succeeds in ~1m 44s.

## Version policy
- Stay on Expo SDK **52** through first ship + 30 days of vitals. The
  `npm outdated` "Latest" column shows SDK 55 across the board, but every
  one of those bumps requires the SDK 55 migration. Do that as a planned
  follow-up, not pre-launch.
- The four overrides above stay until SDK 55+ rolls newer transitive
  versions naturally. Recheck on every SDK bump.

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
