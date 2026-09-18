import path from 'node:path';
import initSqlJs, { type Database, type SqlJsStatic, type SqlValue } from 'sql.js';
import type { BindValue, DbClient, DbRunResult } from '../../src/db/client';

let SQL: SqlJsStatic | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) =>
        path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
    });
  }
  return SQL;
}

export class SqlJsClient implements DbClient {
  constructor(private readonly db: Database) {}

  private coerce(params: BindValue[]): SqlValue[] {
    return params.map((value) => (typeof value === 'boolean' ? (value ? 1 : 0) : value));
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  run(sql: string, params: BindValue[] = []): DbRunResult {
    const stmt = this.db.prepare(sql);
    try {
      if (params.length > 0) {
        stmt.bind(this.coerce(params));
      }
      stmt.step();
    } finally {
      stmt.free();
    }
    const changes = this.db.getRowsModified();
    const result = this.db.exec('SELECT last_insert_rowid() AS id');
    const lastInsertRowid = Number(result[0]?.values[0]?.[0] ?? 0);
    return { changes, lastInsertRowid };
  }

  all<T = Record<string, unknown>>(sql: string, params: BindValue[] = []): T[] {
    const stmt = this.db.prepare(sql);
    const rows: T[] = [];
    try {
      if (params.length > 0) {
        stmt.bind(this.coerce(params));
      }
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
      }
    } finally {
      stmt.free();
    }
    return rows;
  }

  get<T = Record<string, unknown>>(sql: string, params: BindValue[] = []): T | null {
    return this.all<T>(sql, params)[0] ?? null;
  }
}

export async function createTestDbClient(): Promise<DbClient> {
  const sqljs = await getSqlJs();
  const db = new sqljs.Database();
  db.exec('PRAGMA foreign_keys = ON;');
  return new SqlJsClient(db);
}