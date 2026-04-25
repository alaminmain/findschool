import { openDatabase } from "./bootstrap";

export type School = {
  eiin: string;
  name: string;
  level: string;
  address: string;
  division: string;
  district: string;
  upazila: string;
  latitude: number | null;
  longitude: number | null;
};

const PAGE_SIZE = 50;

/**
 * FTS5 fuzzy/prefix search. Returns PAGE_SIZE rows at a time.
 * Falls back to a LIKE scan when the query is empty (for initial listing).
 */
export async function searchSchools(q: string, offset = 0): Promise<School[]> {
  const db = await openDatabase();
  const query = q.trim();

  if (!query) {
    return db.getAllAsync<School>(
      `SELECT eiin, name, level, address, division, district, upazila,
              latitude, longitude
       FROM Schools
       ORDER BY name
       LIMIT ? OFFSET ?`,
      [PAGE_SIZE, offset]
    );
  }

  // Escape FTS5 metacharacters, then add prefix wildcard to every token.
  const ftsQuery =
    query
      .replace(/["']/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => `${t}*`)
      .join(" ") || `${query}*`;

  return db.getAllAsync<School>(
    `SELECT s.eiin, s.name, s.level, s.address, s.division, s.district,
            s.upazila, s.latitude, s.longitude
     FROM schools_fts f
     JOIN Schools s ON s.rowid = f.rowid
     WHERE schools_fts MATCH ?
     ORDER BY rank
     LIMIT ? OFFSET ?`,
    [ftsQuery, PAGE_SIZE, offset]
  );
}

/** Bounded-viewport query for MapView. */
export async function schoolsInRegion(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  limit = 300
): Promise<School[]> {
  const db = await openDatabase();
  return db.getAllAsync<School>(
    `SELECT eiin, name, level, address, division, district, upazila,
            latitude, longitude
     FROM Schools
     WHERE latitude BETWEEN ? AND ?
       AND longitude BETWEEN ? AND ?
     LIMIT ?`,
    [minLat, maxLat, minLng, maxLng, limit]
  );
}
