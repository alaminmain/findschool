# Release Checklist — Google Play

## Pre-build
- [ ] `find-school.db` placed at `mobile/assets/db/find-school.db`
- [ ] Google Maps API key set in `app.json` (Android `config.googleMaps.apiKey`)
- [ ] Bundle ID `bd.findschool.app` registered (Play Console + Apple, if iOS)
- [ ] App version bumped in `app.json` (`expo.version`) — production profile
      auto-increments `versionCode` via `autoIncrement: true`
- [ ] Brand assets rasterized per `assets/brand/README.md`:
      `icon.png`, `adaptive-icon.png`, `splash.png`, `store/play-icon.png`,
      `store/feature-graphic.png`
- [ ] 8 phone screenshots rendered per `store/screenshots-plan.md`

## Build (EAS)
```bash
cd mobile
npm install
npx eas login
npx eas build:configure                    # first time only
npx eas build --profile preview --platform android   # APK for internal test
npx eas build --profile production --platform android # AAB for Play
```

## Play Console setup
1. Create app → name "Find School BD", default language `en-US`.
2. Add Bengali (`bn-BD`) as additional language. Paste `listing-bn.md`
   content into that locale's listing.
3. **App content**:
   - Privacy policy URL → link to hosted `privacy-policy.md`
   - Ads declaration → **No ads**
   - App access → "All functionality available without restrictions"
   - Content rating → complete IARC questionnaire → expect PEGI 3 / Everyone
   - Target audience → 13+ (even though safe for kids, avoids Families
     policy overhead)
   - Data safety → complete per `data-safety-answers.md`
   - Government app → **No**
   - News app → **No**
4. **Main store listing**:
   - Title / short desc / full desc → paste from `listing-en.md`
   - Graphics: icon 512 (`store/play-icon.png`), feature graphic 1024×500,
     phone screenshots
5. **App bundle**: upload the AAB from EAS.
6. **Testing track**: push to Internal testing first, invite 5 testers.
7. Promote to Closed → Open → Production once tester feedback is clean.

## Post-submit
- [ ] Monitor Play Console vitals for ANRs / crash rate in first 72 hours.
- [ ] If Sentry is enabled, set DSN via EAS env (`eas secret:create`) and
      flip `enableSentry: true` — rebuild. Update privacy policy to disclose.
- [ ] Respond to every review in the first 30 days (big ASO signal).

## SDK / compliance targets
- `compileSdkVersion` / `targetSdkVersion` = 34 (required for new apps in
  2026; Expo SDK 52 defaults to this).
- `minSdkVersion` = 23 (Expo 52 default; covers ~99% of BD devices).
- AAB size: keep under 150 MB. With the bundled DB at ~40–60 MB we're fine.

## Rollback plan
- Halt rollout in Play Console; no server-side kill switch needed because
  the app has no server component.
- If a bad DB ships, release a patch version pointing at a corrected
  asset — users re-copy on next launch.
