import type { DbClient } from './client';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'folder',
  color TEXT NOT NULL DEFAULT '#7C5CFF',
  position INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  space_id TEXT,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL,
  favicon TEXT,
  thumbnail TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_links_space_id ON links(space_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
CREATE INDEX IF NOT EXISTS idx_links_is_pinned ON links(is_pinned);
`;

export const SCHEMA_VERSION = 2;

export function migrate(db: DbClient): void {
  db.exec('PRAGMA foreign_keys = ON;');
  const row = db.get<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    db.exec(SCHEMA_SQL);
  }

  db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}
