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
import { KEYS, loadJson, saveJson } from "./storage";

const RECENTS_CAP = 20;

type LibraryCtx = {
  favorites: ReadonlySet<string>;
  recents: readonly string[];
  ready: boolean;
  isFavorite: (eiin: string) => boolean;
  toggleFavorite: (eiin: string) => void;
  clearFavorites: () => void;
  recordRecent: (eiin: string) => void;
  clearRecents: () => void;
};

const Ctx = createContext<LibraryCtx | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recents, setRecents] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [favList, recList] = await Promise.all([
        loadJson<string[]>(KEYS.favorites, []),
        loadJson<string[]>(KEYS.recents, []),
      ]);
      if (cancelled) return;
      setFavorites(new Set(favList));
      setRecents(recList);
      hydratedRef.current = true;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveJson(KEYS.favorites, Array.from(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveJson(KEYS.recents, recents);
  }, [recents]);

  const isFavorite = useCallback(
    (eiin: string) => favorites.has(eiin),
    [favorites]
  );

  const toggleFavorite = useCallback((eiin: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(eiin)) next.delete(eiin);
      else next.add(eiin);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites(new Set()), []);

  const recordRecent = useCallback((eiin: string) => {
    setRecents((prev) => {
      const filtered = prev.filter((id) => id !== eiin);
      return [eiin, ...filtered].slice(0, RECENTS_CAP);
    });
  }, []);

  const clearRecents = useCallback(() => setRecents([]), []);

  const value = useMemo<LibraryCtx>(
    () => ({
      favorites,
      recents,
      ready,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      recordRecent,
      clearRecents,
    }),
    [
      favorites,
      recents,
      ready,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      recordRecent,
      clearRecents,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary(): LibraryCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return v;
}
