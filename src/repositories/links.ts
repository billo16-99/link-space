import type { DbClient } from '../db/client';
import { mapLinkRow, serializeTags } from '../db/rows';
import { newId } from '../lib/id';
import { displayTitle, getDomain } from '../lib/url';
import type { Link } from '../types';

export interface CreateLinkInput {
  url: string;
  title?: string;
  spaceId?: string | null;
  description?: string | null;
  domain?: string;
  favicon?: string | null;
  thumbnail?: string | null;
  tags?: string[];
  isPinned?: boolean;
  createdAt?: number;
}

export interface UpdateLinkInput {
  title?: string;
  spaceId?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  tags?: string[];
}

const CURRENTLY_SELECTED_COLUMNS =
  'id, space_id, url, title, description, domain, favicon, thumbnail, tags, is_pinned, created_at, updated_at';

function selectLink(db: DbClient, id: string): Link | null {
  const row = db.get(
    `SELECT ${CURRENTLY_SELECTED_COLUMNS} FROM links WHERE id = ?`,
    [id]
  );
  return row ? mapLinkRow(row as never) : null;
}

export function createLink(db: DbClient, input: CreateLinkInput): Link {
  const now = Date.now();
  const url = input.url.trim();
  const link: Link = {
    id: newId(),
    spaceId: input.spaceId ?? null,
    url,
    title: displayTitle(url, input.title ?? null),
    description: input.description ?? null,
    domain: input.domain ?? getDomain(url),
    favicon: input.favicon ?? null,
    thumbnail: input.thumbnail ?? null,
    tags: input.tags ?? [],
    isPinned: input.isPinned ?? false,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };

  db.run(
    `INSERT INTO links
       (id, space_id, url, title, description, domain, favicon, thumbnail, tags, is_pinned, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      link.id,
      link.spaceId,
      link.url,
      link.title,
      link.description,
      link.domain,
      link.favicon,
      link.thumbnail,
      serializeTags(link.tags),
      link.isPinned ? 1 : 0,
      link.createdAt,
      link.updatedAt,
    ]
  );
  return link;
}

export function getLink(db: DbClient, id: string): Link | null {
  return selectLink(db, id);
}

export function findByUrl(db: DbClient, normalizedUrl: string): Link | null {
  const row = db.get(
    `SELECT ${CURRENTLY_SELECTED_COLUMNS} FROM links WHERE url = ?`,
    [normalizedUrl]
  );
  return row ? mapLinkRow(row as never) : null;
}

export function updateLink(
  db: DbClient,
  id: string,
  patch: UpdateLinkInput
): Link | null {
  const existing = selectLink(db, id);
  if (!existing) {
    return null;
  }

  const next: Link = {
    ...existing,
    title: patch.title !== undefined ? patch.title.trim() || existing.title : existing.title,
    spaceId: patch.spaceId !== undefined ? patch.spaceId : existing.spaceId,
    description:
      patch.description !== undefined ? patch.description : existing.description,
    thumbnail: patch.thumbnail !== undefined ? patch.thumbnail : existing.thumbnail,
    tags: patch.tags !== undefined ? patch.tags : existing.tags,
    updatedAt: Date.now(),
  };

  db.run(
    `UPDATE links
       SET title = ?, space_id = ?, description = ?, thumbnail = ?, tags = ?, updated_at = ?
     WHERE id = ?`,
    [
      next.title,
      next.spaceId,
      next.description,
      next.thumbnail,
      serializeTags(next.tags),
      next.updatedAt,
      id,
    ]
  );
  return next;
}

export function deleteLink(db: DbClient, id: string): void {
  db.run('DELETE FROM links WHERE id = ?', [id]);
}

export function setPinned(db: DbClient, id: string, isPinned: boolean): void {
  db.run('UPDATE links SET is_pinned = ?, updated_at = ? WHERE id = ?', [
    isPinned ? 1 : 0,
    Date.now(),
    id,
  ]);
}

export function moveLink(db: DbClient, id: string, spaceId: string | null): void {
  db.run('UPDATE links SET space_id = ?, updated_at = ? WHERE id = ?', [
    spaceId,
    Date.now(),
    id,
  ]);
}

export function listBySpace(db: DbClient, spaceId: string | null): Link[] {
  const rows = db.all(
    `SELECT ${CURRENTLY_SELECTED_COLUMNS} FROM links
     WHERE space_id IS ? ORDER BY created_at DESC`,
    spaceId === null ? [null] : [spaceId]
  );
  return rows.map((row) => mapLinkRow(row as never));
}

export function listPinned(db: DbClient): Link[] {
  const rows = db.all(
    `SELECT ${CURRENTLY_SELECTED_COLUMNS} FROM links
     WHERE is_pinned = 1 ORDER BY created_at DESC`
  );
  return rows.map((row) => mapLinkRow(row as never));
}

export function listRecent(db: DbClient, limit = 20): Link[] {
  const rows = db.all(
    `SELECT ${CURRENTLY_SELECTED_COLUMNS} FROM links
     ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map((row) => mapLinkRow(row as never));
}

export function linkCountBySpace(db: DbClient, spaceId: string | null): number {
  const row = db.get<{ n: number }>(
    'SELECT COUNT(*) AS n FROM links WHERE space_id IS ?',
    spaceId === null ? [null] : [spaceId]
  );
  return row?.n ?? 0;
}