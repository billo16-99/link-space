import type { DbClient } from '../db/client';
import { mapLinkRow, mapSpaceRow } from '../db/rows';
import type { Link, Space } from '../types';

export type SearchFilter = 'all' | 'spaces' | 'pinned' | 'recent' | 'tags';

export interface SearchResult {
  links: Link[];
  spaces: Space[];
}

const LINK_COLUMNS =
  'id, space_id, url, title, description, domain, favicon, thumbnail, tags, is_pinned, created_at, updated_at';

function escapeLike(query: string): string {
  return query.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function searchDb(
  db: DbClient,
  query: string,
  filter: SearchFilter
): SearchResult {
  const trimmed = query.trim();
  const result: SearchResult = { links: [], spaces: [] };

  if (!trimmed) {
    return result;
  }

  const like = `%${escapeLike(trimmed)}%`;

  if (filter === 'spaces') {
    result.spaces = db
      .all(
        `SELECT * FROM spaces WHERE name LIKE ? ESCAPE '\\' ORDER BY position ASC`,
        [like]
      )
      .map((row) => mapSpaceRow(row as never));
    return result;
  }

  if (filter === 'tags') {
    result.links = db
      .all(
        `SELECT ${LINK_COLUMNS} FROM links
         WHERE tags LIKE ? ESCAPE '\\'
         ORDER BY created_at DESC`,
        [like]
      )
      .map((row) => mapLinkRow(row as never));
    return result;
  }

  const where =
    filter === 'pinned'
      ? `is_pinned = 1 AND (title LIKE ? ESCAPE '\\' OR url LIKE ? ESCAPE '\\' OR domain LIKE ? ESCAPE '\\' OR tags LIKE ? ESCAPE '\\')`
      : `(title LIKE ? ESCAPE '\\' OR url LIKE ? ESCAPE '\\' OR domain LIKE ? ESCAPE '\\' OR tags LIKE ? ESCAPE '\\')`;

  result.links = db
    .all(`SELECT ${LINK_COLUMNS} FROM links WHERE ${where} ORDER BY created_at DESC`, [
      like,
      like,
      like,
      like,
    ])
    .map((row) => mapLinkRow(row as never));

  if (filter === 'all') {
    result.spaces = db
      .all(
        `SELECT * FROM spaces WHERE name LIKE ? ESCAPE '\\' ORDER BY position ASC`,
        [like]
      )
      .map((row) => mapSpaceRow(row as never));
  }

  return result;
}