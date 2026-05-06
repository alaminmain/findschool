# Privacy Policy — Find School BD

**Last updated:** 6 May 2026
**Effective:** 6 May 2026
**Publisher:** Find School BD (hello@findschool.app)

## Plain-language summary
Find School is an offline school directory app for Bangladesh. **We do not
collect, transmit, store, sell, or share any personal information about you.**
All searches and map interactions happen on your device.

## 1. Information we do not collect
We do not collect, and we have no servers that receive:
- your name, email, phone number, or any account identifier
- your location coordinates (see § 4 — location is used only on-device, only
  when you tap "Near me", and is never stored or transmitted to us)
- your searches, tap events, or any analytics
- any advertising identifier

## 2. Information the app uses locally
The following stays on your device and is never transmitted:
- **School database** — a read-only SQLite file bundled with the app. No
  writes, no sync.
- **Search input** — your queries are executed against the local database in
  memory; nothing is logged.

## 3. Third-party services
- **Google Maps / Google Play Services** — when you tap "Get Directions" we
  hand off to Google Maps via a standard OS intent. Google's handling of that
  request is governed by Google's privacy policy
  (https://policies.google.com/privacy). Find School itself does not share
  anything with Google.
- **Crash reports (optional)** — if enabled in a future release, anonymous
  crash stack traces may be sent to Sentry. At launch this is disabled. If we
  enable it, we will update this policy before the release.

## 4. Permissions
- **Location (foreground only, optional)** — declared as
  `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` on Android. The app only
  asks for it the first time you tap **"Near me"** on the map screen. The
  coordinate is used once, in memory, to recenter the map view and is then
  discarded. It is never stored on your device, never written to the database,
  and never transmitted off your device. You can decline or revoke the
  permission in your device settings at any time; the rest of the app
  continues to work unchanged.
- The app declares no other runtime permissions. Network access is used only
  for system-level map rendering (tiles from Google) when you open the map;
  all school directory data stays local.

## 5. Children
The app is rated for all ages and does not knowingly target children, but
because it does not collect any information from anyone, it is safe for use
by minors.

## 6. Data retention & deletion
There is no server-side data to retain or delete. Removing the app deletes
the local database from your device. To request deletion of any support
email you've sent us, write to hello@findschool.app.

## 7. Changes
We will update the "Last updated" date above and announce material changes
in the release notes of the next version.

## 8. Contact
hello@findschool.app
