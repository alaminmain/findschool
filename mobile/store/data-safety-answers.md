# Play Console — Data Safety form answers

Use this as a reference when filling the "Data safety" section in Play
Console. Must stay consistent with `privacy-policy.md`.

## Data collection
**Does your app collect or share any of the required user data types?**
→ **No**

(If Sentry is later enabled in a release, flip this to Yes and declare:
"Crash logs" → purpose "App functionality" → collected & shared with
third-party; data is anonymized; not sold; users can't request deletion.)

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
