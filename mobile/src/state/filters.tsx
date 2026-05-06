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
import type { Filters, SortKey } from "@/db/queries";
import { KEYS, loadJson, saveJson } from "./storage";

type FilterState = Filters & { sort: SortKey };

type Ctx = {
  state: FilterState;
  setDivision: (v: string | null) => void;
  setDistrict: (v: string | null) => void;
  setUpazila: (v: string | null) => void;
  setLevel: (v: string | null) => void;
  setSort: (v: SortKey) => void;
  reset: () => void;
  activeCount: number;
  ready: boolean;
};

const initial: FilterState = {
  division: null,
  district: null,
  upazila: null,
  level: null,
  sort: "name",
};

const FilterCtx = createContext<Ctx | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FilterState>(initial);
  const [ready, setReady] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadJson<FilterState>(KEYS.filters, initial);
      if (cancelled) return;
      setState(stored);
      hydratedRef.current = true;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveJson(KEYS.filters, state);
  }, [state]);

  const setDivision = useCallback((v: string | null) => {
    // Cascade: changing division resets district + upazila.
    setState((s) => ({ ...s, division: v, district: null, upazila: null }));
  }, []);

  const setDistrict = useCallback((v: string | null) => {
    // Changing district resets upazila.
    setState((s) => ({ ...s, district: v, upazila: null }));
  }, []);

  const setUpazila = useCallback((v: string | null) => {
    setState((s) => ({ ...s, upazila: v }));
  }, []);

  const setLevel = useCallback((v: string | null) => {
    setState((s) => ({ ...s, level: v }));
  }, []);

  const setSort = useCallback((v: SortKey) => {
    setState((s) => ({ ...s, sort: v }));
  }, []);

  const reset = useCallback(() => setState(initial), []);

  const activeCount = useMemo(() => {
    let n = 0;
    if (state.division) n++;
    if (state.district) n++;
    if (state.upazila) n++;
    if (state.level) n++;
    return n;
  }, [state.division, state.district, state.upazila, state.level]);

  const value = useMemo(
    () => ({
      state,
      setDivision,
      setDistrict,
      setUpazila,
      setLevel,
      setSort,
      reset,
      activeCount,
      ready,
    }),
    [
      state,
      setDivision,
      setDistrict,
      setUpazila,
      setLevel,
      setSort,
      reset,
      activeCount,
      ready,
    ]
  );

  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

export function useFilters(): Ctx {
  const v = useContext(FilterCtx);
  if (!v) throw new Error("useFilters must be used inside <FilterProvider>");
  return v;
}
