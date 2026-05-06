import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "findschool:";

export const KEYS = {
  filters: `${PREFIX}filters`,
  favorites: `${PREFIX}favorites`,
  recents: `${PREFIX}recents`,
  locale: `${PREFIX}locale`,
} as const;

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — storage failure is non-fatal
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
