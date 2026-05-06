import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { getLocales } from "expo-localization";
import { en, type StringKey } from "./en";
import { bn } from "./bn";
import { KEYS, loadJson, saveJson } from "@/state/storage";

export type Locale = "en" | "bn";
export type LocalePref = Locale | "system";

const DICTS: Record<Locale, typeof en> = { en, bn };

type Subs = Record<string, string | number>;

function format(template: string, subs?: Subs): string {
  if (!subs) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = subs[k];
    return v == null ? "" : String(v);
  });
}

function detectDeviceLocale(): Locale {
  try {
    const locales = getLocales();
    const code = locales[0]?.languageCode ?? "en";
    if (code.toLowerCase().startsWith("bn")) return "bn";
  } catch {
    // expo-localization can throw on unusual platforms; fall through to en
  }
  return "en";
}

type Ctx = {
  locale: Locale;
  pref: LocalePref;
  setPref: (p: LocalePref) => void;
  t: (key: StringKey, subs?: Subs) => string;
  ready: boolean;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<LocalePref>("system");
  const [ready, setReady] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadJson<LocalePref>(KEYS.locale, "system");
      if (cancelled) return;
      setPrefState(stored);
      hydratedRef.current = true;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPref = useCallback((p: LocalePref) => {
    setPrefState(p);
    if (hydratedRef.current) saveJson(KEYS.locale, p);
  }, []);

  const locale: Locale = useMemo(() => {
    if (pref === "en" || pref === "bn") return pref;
    return detectDeviceLocale();
  }, [pref]);

  const t = useCallback(
    (key: StringKey, subs?: Subs) => format(DICTS[locale][key], subs),
    [locale]
  );

  const value = useMemo<Ctx>(
    () => ({ locale, pref, setPref, t, ready }),
    [locale, pref, setPref, t, ready]
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const v = useContext(I18nCtx);
  if (!v) throw new Error("useI18n must be used inside <I18nProvider>");
  return v;
}

/** Convenience: just the t function. */
export function useT() {
  return useI18n().t;
}
