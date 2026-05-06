# Play Console — Data Safety form answers

Use this as a reference when filling the "Data safety" section in Play
Console. Must stay consistent with `privacy-policy.md`.

## Data collection
**Does your app collect or share any of the required user data types?**
→ **No**

Notes / edge cases:
- **Approximate / precise location**: The app declares
  `ACCESS_FINE_LOCATION` so the user can tap "Near me" on the map to recenter
  it. The coordinate is used once in memory and discarded — **never stored on
  device, never transmitted, never collected**. Per Play's definition,
  this does NOT count as "collecting" location, because Play's definition
  requires data to leave the device or persist beyond the immediate use.
  Keep "Data collection: No" and answer the location-permission rationale
  prompt with: "Used only on user tap to recenter map; not stored or shared."
- **Crash logs (Sentry)**: still off in v1 builds. If enabled in a future
  release, flip this section to Yes and declare: "Crash logs" → purpose "App
  functionality" → collected & shared with third-party; data is anonymized;
  not sold; users can't request deletion.

## Security practices
**Is data encrypted in transit?**
→ N/A (no data collected). If asked to commit: **Yes** — the app has no
outbound traffic, so by definition no plaintext user data leaves the device.

**Do you provide a way for users to request data deletion?**
→ N/A (no server-side data). Select "Yes — users can request data deletion"
and link to hello@findschool.app for support-mail deletion.

**Has your app been independently validated against a global security
standard?**
→ No (not required).

## Family policy
- Target audience: 13+ but safe for children.
- No ads, no in-app purchases, no account.
- Complies with Google Play Families Policy by virtue of collecting zero data.

## Government apps / sensitive permissions
- We reference IPEMIS and BANBEIS **data** but the app is not a government
  app. Listing copy states this explicitly to avoid a takedown for
  "impersonating a government entity."

## Attestations to check in Play Console
- [ ] Data collection: None
- [ ] Data sharing: None
- [ ] Encryption in transit: N/A
- [ ] Data deletion: Email request available
- [ ] Ads: No ads
- [ ] COPPA / GDPR: No personal data handled
- [ ] Location permission rationale present and matches privacy policy § 4

## Sensitive permissions declared
- `android.permission.ACCESS_FINE_LOCATION` — foreground only, requested only
  on user tap of "Near me". Used in-memory to recenter the map; never stored
  or transmitted. Background location is **disabled** via
  `expo-location` plugin config (`isAndroidBackgroundLocationEnabled: false`).
