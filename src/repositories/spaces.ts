import type { DbClient } from '../db/client';
import { mapSpaceRow } from '../db/rows';
import { newId } from '../lib/id';
import type { Space } from '../types';

export interface CreateSpaceInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateSpaceInput {
  name?: string;
  icon?: string;
  color?: string;
}

function insertSpace(db: DbClient, input: CreateSpaceInput, position: number): Space {
  const now = Date.now();
  const row: Space = {
    id: newId(),
    name: input.name.trim(),
    icon: input.icon ?? 'folder',
    color: input.color ?? '#7C5CFF',
    position,
    createdAt: now,
    updatedAt: now,
  };
  db.run(
    `INSERT INTO spaces (id, name, icon, color, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [row.id, row.name, row.icon, row.color, row.position, row.createdAt, row.updatedAt]
  );
  return row;
}

export function createSpace(db: DbClient, input: CreateSpaceInput): Space {
  const row = db.get<{ maxPos: number | null }>(
    'SELECT MAX(position) AS maxPos FROM spaces'
  );
  const position = (row?.maxPos ?? -1) + 1;
  return insertSpace(db, input, position);
}

export function getSpace(db: DbClient, id: string): Space | null {
  const row = db.get('SELECT * FROM spaces WHERE id = ?', [id]);
  return row ? mapSpaceRow(row as never) : null;
}

export function listSpaces(db: DbClient): Space[] {
  const rows = db.all('SELECT * FROM spaces ORDER BY position ASC');
  return rows.map((row) => mapSpaceRow(row as never));
}

export function updateSpace(
  db: DbClient,
  id: string,
  patch: UpdateSpaceInput
): Space | null {
  const existing = getSpace(db, id);
  if (!existing) {
    return null;
  }

  const next: Space = {
    ...existing,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    icon: patch.icon ?? existing.icon,
    color: patch.color ?? existing.color,
    updatedAt: Date.now(),
  };

  db.run(
    'UPDATE spaces SET name = ?, icon = ?, color = ?, updated_at = ? WHERE id = ?',
    [next.name, next.icon, next.color, next.updatedAt, id]
  );
  return next;
}

export function deleteSpace(db: DbClient, id: string): void {
  db.run('DELETE FROM spaces WHERE id = ?', [id]);
}

export function reorderSpaces(db: DbClient, orderedIds: string[]): void {
  orderedIds.forEach((id, index) => {
    db.run('UPDATE spaces SET position = ?, updated_at = ? WHERE id = ?', [
      index,
      Date.now(),
      id,
    ]);
  });
}

export function spaceLinkCounts(db: DbClient): Record<string, number> {
  const rows = db.all<{ space_id: string | null; n: number }>(
    'SELECT space_id, COUNT(*) AS n FROM links GROUP BY space_id'
  );
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.space_id ?? ''] = row.n;
  }
  return counts;
}