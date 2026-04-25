# 🚀 Publish Find School BD — Step-by-Step

Work through this top to bottom. After each step there's a **"Tell Claude"**
line — paste that update back into the chat and I'll confirm + unblock the
next one.

Total active human time: **~2–4 hours.** Plus 24–48 hours of Play Console
review wait at the end.

---

## STEP 1 — Enable GitHub Pages for the privacy policy

⏱ 5 minutes · 💵 free

The repo already contains `docs/index.html` ready to serve.

1. Open https://github.com/alaminmain/findschool/settings/pages
2. Under **Build and deployment → Source**: select **Deploy from a branch**
3. **Branch**: `main` · **Folder**: `/docs` · click **Save**
4. Wait ~60 seconds, then visit https://alaminmain.github.io/findschool/
5. Confirm the privacy policy page loads with the green header

📨 **Tell Claude**: *"Pages live at <URL>"* (or paste the error if it 404s)

---

## STEP 2 — Create a Google Play Console developer account

⏱ 30–60 minutes · 💵 $25 one-time

> Skip this step if you already have an account.

1. Open https://play.google.com/console/signup
2. Sign in with the Google account you want to own the app
3. Choose **Organization** or **Personal** (Personal is fine for v1)
4. Pay $25 (Visa/Mastercard/PayPal). The fee is one-time, not annual.
5. Verify identity — Google requires a government-issued ID photo for new
   accounts. Approval is usually <24h but can take longer.

📨 **Tell Claude**: *"Play Console verified"* (or *"Pending verification"*
if Google is still reviewing)

---

## STEP 3 — Create an Expo / EAS account

⏱ 5 minutes · 💵 free

> Skip if you already have one.

1. Sign up at https://expo.dev/signup
2. Confirm the email link

📨 **Tell Claude**: *"Expo account ready"*

---

## STEP 4 — Link the local project to your Expo account

⏱ 5 minutes

```bash
cd D:/TestProject/findSchoolApp/mobile
npm install -g eas-cli
npx eas login
# paste your Expo email + password
npx eas init
# accept the prompts; this writes expo.extra.eas.projectId into app.json
```

📨 **Tell Claude**: *"EAS project linked, projectId is <id>"* — and commit
the `app.json` change with: `git add mobile/app.json && git commit -m "chore: link EAS project" && git push`

---

## STEP 5 — Build the production AAB

⏱ 15 min cloud build · 💵 free (Expo's free tier allows ~30 builds/month)

```bash
cd D:/TestProject/findSchoolApp/mobile
npx eas build --profile production --platform android
```

What you'll see:
- "Compressing project files…"
- "Build queued…"
- A URL like `https://expo.dev/accounts/.../builds/<id>` — open it to watch
- Build runs ~10–15 minutes
- When it finishes, EAS prints a download URL ending in `.aab`

📨 **Tell Claude**: *"AAB ready at <URL>"* (or paste any build error)

---

## STEP 6 — Capture screenshots from an Android emulator

⏱ 30–45 minutes

This is the only step that needs the app actually running. You need
**Android Studio** (free) installed for the emulator.

1. Open Android Studio → **Device Manager** → create a **Pixel 7** virtual
   device with Android 14
2. Boot it
3. Drag the `.aab` from EAS onto the emulator window — wait, AAB doesn't
   install directly. Instead use the EAS-provided `.apk` from the **preview**
   build profile, or run:
   ```bash
   cd D:/TestProject/findSchoolApp/mobile
   npx eas build --profile preview --platform android   # outputs .apk
   ```
4. `adb install path/to/find-school.apk`
5. Open the app, follow `mobile/store/screenshots-plan.md`'s 8-frame
   storyboard
6. For each frame:
   ```bash
   adb shell screencap -p /sdcard/s1.png
   adb pull /sdcard/s1.png ./mobile/store/screenshots/s1.png
   ```
   Repeat for s1.png through s8.png

📨 **Tell Claude**: *"8 screenshots captured in mobile/store/screenshots/"*
— I'll commit them and add captions if you want.

---

## STEP 7 — Play Console: create the app listing

⏱ 20 minutes

1. Open https://play.google.com/console
2. **Create app**:
   - Name: **Find School BD**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free**
   - Tick the developer-program-policy + US export-laws boxes
3. **Set up your app** sidebar — work top to bottom

### App content section
| Item                  | Answer / source                                                                 |
|-----------------------|---------------------------------------------------------------------------------|
| Privacy policy        | `https://alaminmain.github.io/findschool/`                                      |
| App access            | All functionality available without restrictions                                |
| Ads                   | **No, my app does not contain ads**                                             |
| Content rating        | Complete IARC questionnaire — expect **Everyone / PEGI 3**                      |
| Target audience       | **13+** (avoids Families Policy overhead; app is still safe for younger users)  |
| News app              | **No**                                                                          |
| Government app        | **No**                                                                          |
| COVID/health app      | **No**                                                                          |
| Data safety           | Use the cheat sheet at `mobile/store/data-safety-answers.md` — **No data collected** |

### Main store listing
| Field                | Source file / value                                  |
|----------------------|------------------------------------------------------|
| App name             | `Find School BD — Offline Directory`                 |
| Short description    | From `mobile/store/listing-en.md` (under 80 chars)   |
| Full description     | Paste full description from `listing-en.md`          |
| App icon (512×512)   | Upload `mobile/store/play-icon.png`                  |
| Feature graphic      | Upload `mobile/store/feature-graphic.png`            |
| Phone screenshots    | Upload all 8 from `mobile/store/screenshots/`        |

### Bengali translation
- Sidebar → **Grow → Store presence → Store listings**
- Add `Bengali (bn-BD)`
- Paste content from `mobile/store/listing-bn.md`

📨 **Tell Claude**: *"Listing complete except <X>"* if any field needs
clarification.

---

## STEP 8 — Upload AAB to Internal Testing

⏱ 15 minutes

1. **Test and release → Internal testing → Create new release**
2. Upload the `.aab` you got from EAS in Step 5
3. Release name auto-fills from version code; leave it
4. **Release notes**: paste *"First public release — 65,000+ schools
   searchable offline."*
5. **Save** → **Review release** → **Start rollout to Internal testing**
6. Add your email to the **Testers** list
7. Open the **Web URL** that Play Console gives you, on your phone, click
   **Become a tester**
8. Install the app from the Play Store link
9. Sanity check: search "Dhaka", tap a result, confirm details show
10. **Confirm**: no crashes, app icon shows, splash screen shows, search
    returns instant results

📨 **Tell Claude**: *"Internal testing live, app works on device"* — I'll
help debug if anything is broken.

---

## STEP 9 — Promote to Production

⏱ 5 minutes + 24–48 hour review

1. **Test and release → Production → Create new release**
2. **Use existing release** → pick the AAB from Internal testing
3. Same release notes as Step 8
4. **Rollout percentage**: start at **20%** — safer for first launch; you
   can scale to 100% over a few days as crash rate stays clean
5. **Save → Review release → Start rollout to Production**
6. Wait. First-app review at Google takes 24–48 hours; sometimes longer.

📨 **Tell Claude**: *"Submitted for review at <timestamp>"*

---

## STEP 10 — Live monitoring (first 7 days)

When approved, you'll get an email. The app appears at
`https://play.google.com/store/apps/details?id=bd.findschool.app`.

Daily check (5 min):
1. Play Console → **Vitals** — watch ANRs and crash rate
2. **Reviews** — reply to every review (big ASO signal)
3. If crash rate >1% from Vitals: halt rollout, debug, ship a patch
4. After 3 clean days: scale rollout 20% → 50% → 100%

📨 **Tell Claude**: *"App live, X installs, Y crashes"* — I'll help you
prioritize the post-launch backlog (geocoding, BANBEIS, iOS, etc.).

---

## Things you do NOT need before publishing

| Item                  | Why not                                                            |
|-----------------------|--------------------------------------------------------------------|
| Google Maps API key   | No school has GPS yet; the MapView never mounts                    |
| Sentry DSN            | Disabled by default; required for the privacy promise              |
| `play-service-account.json` | Only needed for `eas submit` automation; manual upload works |
| iOS build             | Single-platform launch is fine; iOS reuses 90% of the listing copy |

---

## If something breaks

Paste the error or screenshot back into the chat. I keep this checklist as
my map of where we are, so I'll know which step you were on without you
having to re-explain.
