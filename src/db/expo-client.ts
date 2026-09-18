import type { SQLiteDatabase } from 'expo-sqlite';
import type { BindValue, DbClient, DbRunResult } from './client';

export function createExpoClient(db: SQLiteDatabase): DbClient {
  return {
    exec: (sql: string): void => {
      db.execSync(sql);
    },
    run: (sql: string, params: BindValue[] = []): DbRunResult => {
      const result = db.runSync(sql, params);
      return {
        changes: result.changes,
        lastInsertRowid: Number(result.lastInsertRowId),
      };
    },
    all: <T>(sql: string, params: BindValue[] = []): T[] => db.getAllSync<T>(sql, params),
    get: <T>(sql: string, params: BindValue[] = []): T | null =>
      db.getFirstSync<T>(sql, params),
  };
}