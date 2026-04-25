import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

/**
 * Initialize Sentry iff the build has a DSN AND the opt-in flag is on.
 * Keeps the privacy policy's "no data leaves the device" promise true by
 * default. To enable: set `extra.sentryDsn` + `extra.enableSentry = true`
 * via `app.config.ts` / EAS build profile, or EXPO_PUBLIC_SENTRY_DSN env.
 */
export function initSentry(): void {
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    sentryDsn?: string;
    enableSentry?: boolean;
  };
  const dsn = extra.sentryDsn || process.env.EXPO_PUBLIC_SENTRY_DSN || "";
  const enabled = extra.enableSentry === true && !!dsn;

  if (!enabled) return;

  Sentry.init({
    dsn,
    enableAutoSessionTracking: true,
    tracesSampleRate: 0.1,
    // We do not collect user identifiers. Scrub just in case.
    beforeSend(event) {
      if (event.user) delete event.user;
      if (event.request?.headers) delete event.request.headers;
      return event;
    },
  });
}

export const wrap = Sentry.wrap;
