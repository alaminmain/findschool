const { withAndroidManifest } = require("@expo/config-plugins");

// Permissions we never want in the final merged manifest. Some sneak in via
// AAR-level merging (react-native-maps' Play Services deps inject the legacy
// storage permissions; we never request files). Filtering the source manifest
// alone does not stop AAR-merged entries — we also emit `tools:node="remove"`
// directives so the manifest merger drops them at gradle time.
const REMOVE = [
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.VIBRATE",
];

module.exports = function withCleanManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    manifest.$ = manifest.$ || {};
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    const removeSet = new Set(REMOVE);
    const existing = Array.isArray(manifest["uses-permission"])
      ? manifest["uses-permission"].filter(
          (p) => !removeSet.has(p.$["android:name"])
        )
      : [];

    const removalEntries = REMOVE.map((name) => ({
      $: {
        "android:name": name,
        "tools:node": "remove",
      },
    }));

    manifest["uses-permission"] = [...existing, ...removalEntries];
    return cfg;
  });
};
