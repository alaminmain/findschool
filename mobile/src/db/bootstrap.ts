import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as SQLite from "expo-sqlite";

const DB_NAME = "find-school.db";
const DB_ASSET = require("../../assets/db/find-school.db");

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Ensures find-school.db exists in SQLite/ directory, copying it from the
 * bundled asset on first launch. expo-sqlite only reads DBs from that path.
 */
export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
  const dbPath = `${sqliteDir}/${DB_NAME}`;

  const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
  }

  const dbInfo = await FileSystem.getInfoAsync(dbPath);
  if (!dbInfo.exists) {
    const asset = Asset.fromModule(DB_ASSET);
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error("DB asset has no localUri");
    await FileSystem.copyAsync({ from: asset.localUri, to: dbPath });
  }

  _db = await SQLite.openDatabaseAsync(DB_NAME);
  // read-only + perf pragmas - this DB is shipped, never written to.
  await _db.execAsync(`
    PRAGMA query_only = ON;
    PRAGMA journal_mode = OFF;
    PRAGMA synchronous = OFF;
    PRAGMA temp_store = MEMORY;
  `);
  return _db;
}
