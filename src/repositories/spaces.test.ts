import { createTestDbClient } from '../../tests/helpers/sqljs-client';
import type { DbClient } from '../db/client';
import { migrate } from '../db/schema';
import type { Space } from '../types';
import {
  createSpace,
  deleteSpace,
  getSpace,
  listSpaces,
  reorderSpaces,
  spaceLinkCounts,
  updateSpace,
} from './spaces';

describe('spaces repository', () => {
  let db: DbClient;

  beforeEach(async () => {
    db = await createTestDbClient();
    migrate(db);
  });

  it('creates a space with default icon and color', () => {
    const space = createSpace(db, { name: 'Work' });

    expect(space.id).toBeTruthy();
    expect(space.name).toBe('Work');
    expect(space.icon).toBe('folder');
    expect(space.color).toBe('#7C5CFF');
    expect(space.position).toBe(0);
    expect(space.createdAt).toBeGreaterThan(0);
  });

  it('increments position for each new space', () => {
    const first = createSpace(db, { name: 'A' });
    const second = createSpace(db, { name: 'B' });

    expect(first.position).toBe(0);
    expect(second.position).toBe(1);
  });

  it('accepts custom icon and color', () => {
    const space = createSpace(db, { name: 'Study', icon: 'book', color: '#FF0000' });

    expect(space.icon).toBe('book');
    expect(space.color).toBe('#FF0000');
  });

  it('updates a space icon and color', () => {
    const space = createSpace(db, { name: 'Study', icon: 'book', color: '#FF0000' });
    const updated = updateSpace(db, space.id, { name: 'Study 2', icon: 'star', color: '#00FF00' });

    expect(updated?.name).toBe('Study 2');
    expect(updated?.icon).toBe('star');
    expect(updated?.color).toBe('#00FF00');
  });

  it('returns null when updating a missing space', () => {
    expect(updateSpace(db, 'nope', { name: 'X' })).toBeNull();
  });

  it('deletes a space and moves its links to the inbox', () => {
    const space = createSpace(db, { name: 'Temp' });
    const now = Date.now();
    db.run(
      `INSERT INTO links (id, space_id, url, title, domain, tags, is_pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['l1', space.id, 'https://example.com', 'Example', 'example.com', '[]', 0, now, now]
    );

    deleteSpace(db, space.id);

    expect(getSpace(db, space.id)).toBeNull();
    const link = db.get<{ space_id: string | null }>('SELECT space_id FROM links WHERE id = ?', ['l1']);
    expect(link?.space_id).toBeNull();
  });

  it('reorders spaces by the given id order', () => {
    const a = createSpace(db, { name: 'A' });
    const b = createSpace(db, { name: 'B' });
    const c = createSpace(db, { name: 'C' });

    reorderSpaces(db, [c.id, a.id, b.id]);

    const names = listSpaces(db).map((s) => s.name);
    expect(names).toEqual(['C', 'A', 'B']);
  });

  it('lists spaces in position order', () => {
    const a = createSpace(db, { name: 'Never mind' });
    const b = createSpace(db, { name: 'Later' });
    const c = createSpace(db, { name: 'First' });
    reorderSpaces(db, [c.id, b.id, a.id]);

    const names = listSpaces(db).map((s) => s.name);
    expect(names).toEqual(['First', 'Later', 'Never mind']);
  });

  it('detaches links from a deleted space and counts the inbox', () => {
    const a = createSpace(db, { name: 'A' });
    const b = createSpace(db, { name: 'B' });
    const now = Date.now();
    const insert = (id: string, spaceId: string | null) =>
      db.run(
        `INSERT INTO links (id, space_id, url, title, domain, tags, is_pinned, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, spaceId, `https://${id}.dev`, id, `${id}.dev`, '[]', 0, now, now]
      );
    insert('l1', a.id);
    insert('l2', a.id);
    insert('l3', b.id);

    deleteSpace(db, a.id);

    const counts = spaceLinkCounts(db);
    expect(counts[b.id]).toBe(1);
    expect(counts['']).toBe(2);
  });

  it('exposes created and updated timestamps as epoch ms', () => {
    const space: Space = createSpace(db, { name: 'Time' });
    expect(Number.isFinite(space.createdAt)).toBe(true);
    expect(Number.isFinite(space.updatedAt)).toBe(true);
  });
});