# Publish Checklist — Human-Only Steps

Everything that can be automated has been. What's left requires accounts,
billing, or actions that must be taken by you (or the project owner).

Estimated total time: **2–4 hours of human work**, plus 24–48 hours of Play
Console review wait time before the app appears in production.

---

## 1. Google Play Console developer account ($25 one-time)

If you don't have one already:

1. Visit https://play.google.com/console/signup
2. Pay the $25 one-time registration fee
3. Verify identity (Google requires government ID for new accounts in 2024+)

This unlocks the ability to upload AABs.

## 2. Host the privacy policy on GitHub Pages (free, ~5 minutes)

The repo already has `docs/index.html` ready to serve.

1. Visit `https://github.com/alaminmain/findschool/settings/pages`
2. Source: **Deploy from a branch**
3. Branch: **main**, Folder: **/docs**
4. Save. Within a minute the policy will live at:
   **https://alaminmain.github.io/findschool/**
5. Confirm it loads, then this becomes the URL you paste into the Play
   Console "Privacy policy URL" field later.

## 3. EAS account + project (free for builds, optional Pro tier)

```bash
cd mobile
npm install -g eas-cli      # if not already installed
npx eas login               # paste your Expo account credentials
npx eas init                # links the local project to your Expo account
                            # (creates an "expo.extra.eas.projectId" entry)
```

If you don't have an Expo account, sign up at https://expo.dev/signup
(free).

## 4. Build the production AAB

```bash
cd mobile
npx eas build --profile production --platform android
```

This runs in Expo's cloud (~15 minutes). When it finishes, EAS gives you a
download URL for the `.aab` file. The free tier allows ~30 builds/month
which is plenty for a single launch.

## 5. Play Console: create the app

1. Visit https://play.google.com/console
2. Create app:
   - App name: **Find School BD**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free**
3. Add Bengali (`bn-BD`) as a translation under
   *Grow → Store presence → Store listings*
4. Paste the listing copy:
   - English: from `mobile/store/listing-en.md`
   - Bengali: from `mobile/store/listing-bn.md`

## 6. Play Console: graphics

Upload from `mobile/assets/` and `mobile/store/`:

| Field                    | File                             | Size      |
|--------------------------|----------------------------------|-----------|
| App icon                 | `mobile/store/play-icon.png`     | 512×512   |
| Feature graphic          | `mobile/store/feature-graphic.png` | 1024×500 |
| Phone screenshots (2–8)  | **TODO: capture from emulator**  | 1080×2400 |

**Screenshots**: run the app on a Pixel 7 emulator, follow the storyboard in
`mobile/store/screenshots-plan.md` (8 frames). Capture with
`adb shell screencap -p /sdcard/s1.png`. This is the one piece of
publish-prep that genuinely requires the app running on a device.

## 7. Play Console: app content questionnaires

Use `mobile/store/data-safety-answers.md` as the cheat sheet. Specifically:

- **Privacy policy URL**: `https://alaminmain.github.io/findschool/`
- **App access**: All functionality available without restrictions
- **Ads**: No ads
- **Content rating**: complete IARC questionnaire → expect **Everyone / PEGI 3**
- **Target audience**: 13+ (avoids Families Policy overhead, app remains
  safe for younger users)
- **Data safety**: see the cheat sheet — answer **No data collected**
- **Government app?**: **No**
- **News app?**: **No**
- **Financial features?**: **No**

## 8. Play Console: upload AAB to Internal Testing first

1. Test and Release → Internal testing → Create new release
2. Upload the `.aab` from EAS
3. Add yourself + 1-2 trusted testers via email
4. Submit for review (Internal testing usually goes live within a few hours)
5. Install via the testing link, sanity-check on a real device

## 9. Promote to production

Once Internal testing looks clean:
1. Test and Release → Production → Create new release
2. Promote the same AAB from internal
3. Submit for review (24–48 hour first-app review)
4. Once approved, choose rollout %: start at 20%, monitor crash rate, then
   scale to 100% over a few days

## 10. Post-launch (first 30 days)

- Watch Play Console **Vitals** for ANRs and crash rate
- Reply to every review (big ASO signal)
- If a bad DB ships, release a patch version with a corrected
  `mobile/assets/db/find-school.db`; users re-copy on next launch

---

## What we deliberately deferred

| Item                  | Why deferred                                              | Plan                                                  |
|-----------------------|-----------------------------------------------------------|-------------------------------------------------------|
| GPS coordinates       | IPEMIS API doesn't return them; bulk Nominatim disallowed | Agentic AI pass, post-launch (per project decision)   |
| Google Maps API key   | App ships without rendering tiles (no GPS to render yet)  | Add when GPS data lands; set via EAS secret          |
| Sentry DSN            | Off by default to honour zero-data-collection policy      | Enable when there's appetite for crash insight        |
| iOS submission        | Single-platform launch                                    | Reuse listing copy after Android stabilizes          |
| BANBEIS / madrasahs   | Out of IPEMIS coverage                                    | Add as supplementary CSV imports later                |
