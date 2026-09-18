export type BindValue = string | number | boolean | null;

export interface DbRunResult {
  changes: number;
  lastInsertRowid: number;
}

export interface DbClient {
  exec(sql: string): void;
  run(sql: string, params?: BindValue[]): DbRunResult;
  all<T = Record<string, unknown>>(sql: string, params?: BindValue[]): T[];
  get<T = Record<string, unknown>>(sql: string, params?: BindValue[]): T | null;
}