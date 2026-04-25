# DB Asset

Place the final `find-school.db` produced by `admin/FindSchool.Admin` here
(i.e. `mobile/assets/db/find-school.db`) before running the app.

The file is excluded from git (it's ~30–60 MB) but bundled into the Expo app
via `assetBundlePatterns` in `app.json`. `src/db/bootstrap.ts` copies it to
`documentDirectory/SQLite/` on first launch.
