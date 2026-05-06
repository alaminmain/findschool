import { openDatabase } from "./bootstrap";

export type School = {
  eiin: string;
  name: string;
  name_bn: string;
  level: string;
  address: string;
  division: string;
  district: string;
  upazila: string;
  latitude: number | null;
  longitude: number | null;
  // Optional — may be undefined if the DB build predates Phase G.
  total_teachers?: number | null;
  total_students?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
};

export type Filters = {
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  level?: string | null;
};

export type SortKey = "name" | "district" | "level";

const PAGE_SIZE = 50;

const SAFE_COLS = {
  s: ["division", "district", "upazila", "level"] as const,
};

function buildWhere(
  filters: Filters | undefined,
  alias = "" // empty for direct table, "s" when joined
): { sql: string; params: (string | number)[] } {
  const params: (string | number)[] = [];
  if (!filters) return { sql: "", params };
  const a = alias ? `${alias}.` : "";
  const clauses: string[] = [];
  for (const col of SAFE_COLS.s) {
    const v = filters[col];
    if (v) {
      clauses.push(`${a}${col} = ?`);
      params.push(v);
    }
  }
  return {
    sql: clauses.length ? clauses.join(" AND ") : "",
    params,
  };
}

const ORDER_BY: Record<SortKey, string> = {
  name: "name COLLATE NOCASE",
  district: "district COLLATE NOCASE, name COLLATE NOCASE",
  level: "level COLLATE NOCASE, name COLLATE NOCASE",
};

/**
 * FTS5 fuzzy/prefix search with optional filters and sort.
 * Returns PAGE_SIZE rows at a time.
 * - Empty query: filtered LIKE-style scan ordered by `sort`.
 * - Pure-digit query: EIIN prefix.
 * - Otherwise: FTS5 prefix wildcards. When filters are set, FTS rank is
 *   still used but post-filtered via a JOIN where clause.
 */
export async function searchSchools(
  q: string,
  offset = 0,
  filters?: Filters,
  sort: SortKey = "name"
): Promise<School[]> {
  const db = await openDatabase();
  const query = q.trim();
  const order = ORDER_BY[sort] ?? ORDER_BY.name;

  // EMPTY QUERY: full Schools scan with optional filters.
  if (!query) {
    const w = buildWhere(filters);
    const where = w.sql ? `WHERE ${w.sql}` : "";
    return db.getAllAsync<School>(
      `SELECT eiin, name, name_bn, level, address, division, district, upazila,
              latitude, longitude
       FROM Schools
       ${where}
       ORDER BY ${order}
       LIMIT ? OFFSET ?`,
      [...w.params, PAGE_SIZE, offset]
    );
  }

  // EIIN lookup: pure-digit queries hit the primary key directly.
  if (/^\d+$/.test(query)) {
    const w = buildWhere(filters);
    const where = w.sql ? ` AND ${w.sql}` : "";
    return db.getAllAsync<School>(
      `SELECT eiin, name, name_bn, level, address, division, district, upazila,
              latitude, longitude
       FROM Schools
       WHERE eiin LIKE ? || '%'${where}
       ORDER BY eiin
       LIMIT ? OFFSET ?`,
      [query, ...w.params, PAGE_SIZE, offset]
    );
  }

  // FTS5 prefix wildcards. With filters: post-filter on the joined Schools row.
  const ftsQuery =
    query
      .replace(/["']/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => `${t}*`)
      .join(" ") || `${query}*`;

  const w = buildWhere(filters, "s");
  const where = w.sql ? ` AND ${w.sql}` : "";
  // When user is text-searching, FTS rank ordering wins over user sort —
  // relevance > alphabetic when there's a query, matching common search UX.
  return db.getAllAsync<School>(
    `SELECT s.eiin, s.name, s.name_bn, s.level, s.address, s.division, s.district,
            s.upazila, s.latitude, s.longitude
     FROM schools_fts f
     JOIN Schools s ON s.rowid = f.rowid
     WHERE schools_fts MATCH ?${where}
     ORDER BY rank
     LIMIT ? OFFSET ?`,
    [ftsQuery, ...w.params, PAGE_SIZE, offset]
  );
}

type StringRow = { value: string };

export async function getDistinctDivisions(): Promise<string[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<StringRow>(
    `SELECT DISTINCT division AS value FROM Schools
     WHERE division IS NOT NULL AND division != ''
     ORDER BY value COLLATE NOCASE`
  );
  return rows.map((r) => r.value);
}

export async function getDistinctDistricts(division?: string | null): Promise<string[]> {
  const db = await openDatabase();
  const where = division ? `WHERE division = ? AND district != ''` : `WHERE district != ''`;
  const params = division ? [division] : [];
  const rows = await db.getAllAsync<StringRow>(
    `SELECT DISTINCT district AS value FROM Schools
     ${where}
     ORDER BY value COLLATE NOCASE`,
    params
  );
  return rows.map((r) => r.value);
}

export async function getDistinctUpazilas(district?: string | null): Promise<string[]> {
  const db = await openDatabase();
  const where = district ? `WHERE district = ? AND upazila != ''` : `WHERE upazila != ''`;
  const params = district ? [district] : [];
  const rows = await db.getAllAsync<StringRow>(
    `SELECT DISTINCT upazila AS value FROM Schools
     ${where}
     ORDER BY value COLLATE NOCASE`,
    params
  );
  return rows.map((r) => r.value);
}

export async function getDistinctLevels(): Promise<string[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<StringRow>(
    `SELECT DISTINCT level AS value FROM Schools
     WHERE level IS NOT NULL AND level != ''
     ORDER BY value COLLATE NOCASE`
  );
  return rows.map((r) => r.value);
}

export type DbMetadata = {
  dataAsOf: string | null;
  dbVersion: string | null;
  rowCount: number | null;
  geocodedCount: number | null;
  sourcePrimary: string | null;
};

/**
 * Read DB metadata. Returns null fields if the Metadata table is missing
 * (e.g. when the shipped DB was built before Phase F).
 */
export async function getDbMetadata(): Promise<DbMetadata> {
  const empty: DbMetadata = {
    dataAsOf: null,
    dbVersion: null,
    rowCount: null,
    geocodedCount: null,
    sourcePrimary: null,
  };
  try {
    const db = await openDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string }>(
      `SELECT key, value FROM Metadata`
    );
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const num = (v?: string) => {
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    return {
      dataAsOf: map.get("data_as_of") ?? null,
      dbVersion: map.get("db_version") ?? null,
      rowCount: num(map.get("row_count")),
      geocodedCount: num(map.get("geocoded_count")),
      sourcePrimary: map.get("source_primary") ?? null,
    };
  } catch {
    // Metadata table doesn't exist on older DB builds — treat as unknown.
    return empty;
  }
}

/**
 * Fetch schools by EIIN list, returned in the order requested
 * (so /recents preserves most-recent-first ordering from the caller).
 */
export async function getSchoolsByEiins(eiins: string[]): Promise<School[]> {
  if (eiins.length === 0) return [];
  const db = await openDatabase();
  const placeholders = eiins.map(() => "?").join(",");
  // SELECT * so Phase G's optional columns (total_teachers, phone, etc.) come
  // through if the shipped DB has them, and stay undefined otherwise.
  const rows = await db.getAllAsync<School>(
    `SELECT * FROM Schools WHERE eiin IN (${placeholders})`,
    eiins
  );
  const byEiin = new Map(rows.map((r) => [r.eiin, r]));
  // Preserve caller's ordering and silently drop EIINs that no longer exist
  // (e.g., if the shipped DB rev removed a school the user had favorited).
  return eiins.map((id) => byEiin.get(id)).filter((r): r is School => !!r);
}

/** Fetch one school by EIIN with all available columns. */
export async function getSchoolByEiin(eiin: string): Promise<School | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<School>(
    `SELECT * FROM Schools WHERE eiin = ?`,
    [eiin]
  );
  return row ?? null;
}

/** Bounded-viewport query for MapView. Honours active Filters. */
export async function schoolsInRegion(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  filters?: Filters,
  limit = 300
): Promise<School[]> {
  const db = await openDatabase();
  const w = buildWhere(filters);
  const extra = w.sql ? ` AND ${w.sql}` : "";
  return db.getAllAsync<School>(
    `SELECT eiin, name, name_bn, level, address, division, district, upazila,
            latitude, longitude
     FROM Schools
     WHERE latitude BETWEEN ? AND ?
       AND longitude BETWEEN ? AND ?${extra}
     LIMIT ?`,
    [minLat, maxLat, minLng, maxLng, ...w.params, limit]
  );
}
