import { createTestDbClient } from '../../tests/helpers/sqljs-client';
import type { DbClient } from '../db/client';
import { migrate } from '../db/schema';
import type { Link } from '../types';
import { createSpace } from './spaces';
import {
  createLink,
  deleteLink,
  faviconsBySpace,
  findByUrl,
  getLink,
  linkCountBySpace,
  listBySpace,
  listPinned,
  listRecent,
  moveLink,
  setPinned,
  updateLink,
} from './links';

const NOW = 1_700_000_000_000;

describe('links repository', () => {
  let db: DbClient;

  beforeEach(async () => {
    db = await createTestDbClient();
    migrate(db);
  });

  it('creates a link with normalized store fields', () => {
    const link = createLink(db, {
      url: 'https://example.com/article',
      title: 'An Article',
      spaceId: null,
    });

    expect(link.id).toBeTruthy();
    expect(link.url).toBe('https://example.com/article');
    expect(link.title).toBe('An Article');
    expect(link.domain).toBe('example.com');
    expect(link.isPinned).toBe(false);
    expect(link.tags).toEqual([]);
    expect(link.spaceId).toBeNull();
  });

  it('falls back to the domain as the title', () => {
    const link = createLink(db, { url: 'https://www.youtube.com/watch?v=1' });
    expect(link.title).toBe('youtube.com');
  });

  it('accepts tags and pinned state', () => {
    const link = createLink(db, {
      url: 'https://example.com/music',
      title: 'Music',
      tags: ['music', 'fav'],
      isPinned: true,
    });

    expect(link.tags).toEqual(['music', 'fav']);
    expect(link.isPinned).toBe(true);
  });

  it('round-trips tags through storage', () => {
    const link = createLink(db, { url: 'https://a.dev/x', title: 'A', tags: ['x', 'y'] });
    const stored = listPinned(db);
    expect(stored).toHaveLength(0);
    const fetched = getLink(db, link.id);
    expect(fetched?.tags).toEqual(['x', 'y']);
  });

  it('throws on an exact duplicate URL', () => {
    createLink(db, { url: 'https://example.com/dup', title: 'First' });
    expect(() =>
      createLink(db, { url: 'https://example.com/dup', title: 'Second' })
    ).toThrow();
  });

  it('finds a link by normalized url', () => {
    const link = createLink(db, { url: 'https://example.com/lookup', title: 'Lookup' });
    expect(findByUrl(db, 'https://example.com/lookup')?.id).toBe(link.id);
    expect(findByUrl(db, 'https://other.dev/x')).toBeNull();
  });

  it('updates title, space, description and tags', () => {
    const space = createSpace(db, { name: 'Work' });
    const link = createLink(db, { url: 'https://a.dev/p', title: 'Old' });

    const updated = updateLink(db, link.id, {
      title: 'New',
      spaceId: space.id,
      description: 'desc here',
      tags: ['work'],
    });

    expect(updated?.title).toBe('New');
    expect(updated?.spaceId).toBe(space.id);
    expect(updated?.description).toBe('desc here');
    expect(updated?.tags).toEqual(['work']);
  });

  it('returns null when updating a missing link', () => {
    expect(updateLink(db, 'nope', { title: 'X' })).toBeNull();
  });

  it('deletes a link', () => {
    const link = createLink(db, { url: 'https://a.dev/delete', title: 'Delete me' });
    deleteLink(db, link.id);
    expect(getLink(db, link.id)).toBeNull();
  });

  it('pins and unpins a link', () => {
    const link = createLink(db, { url: 'https://a.dev/pin', title: 'Pin me' });
    setPinned(db, link.id, true);
    expect(getLink(db, link.id)?.isPinned).toBe(true);
    setPinned(db, link.id, false);
    expect(getLink(db, link.id)?.isPinned).toBe(false);
  });

  it('moves a link between spaces and into the inbox', () => {
    const space = createSpace(db, { name: 'Work' });
    const link = createLink(db, { url: 'https://a.dev/move', title: 'Move me' });
    expect(link.spaceId).toBeNull();

    moveLink(db, link.id, space.id);
    expect(getLink(db, link.id)?.spaceId).toBe(space.id);

    moveLink(db, link.id, null);
    expect(getLink(db, link.id)?.spaceId).toBeNull();
  });

  it('lists links by space in newest-first order', () => {
    const space = createSpace(db, { name: 'Space' });
    const old = createLink(db, { url: 'https://a.dev/1', title: 'Old', createdAt: NOW - 100 });
    const mid = createLink(db, { url: 'https://a.dev/2', title: 'Mid', createdAt: NOW + 100 });
    createLink(db, { url: 'https://a.dev/other', title: 'Other', createdAt: NOW });
    moveLink(db, old.id, space.id);
    moveLink(db, mid.id, space.id);

    const links = listBySpace(db, space.id);
    expect(links.map((l) => l.title)).toEqual(['Mid', 'Old']);
    expect(listBySpace(db, 'missing')).toEqual([]);
  });

  it('counts links per space including the inbox', () => {
    const space = createSpace(db, { name: 'Space' });
    createLink(db, { url: 'https://a.dev/1', title: 'A' });
    createLink(db, { url: 'https://a.dev/2', title: 'B' });
    createLink(db, { url: 'https://a.dev/3', title: 'C', spaceId: space.id });

    expect(linkCountBySpace(db, null)).toBe(2);
    expect(linkCountBySpace(db, space.id)).toBe(1);
  });

  it('lists pinned links newest-first', () => {
    const a = createLink(db, { url: 'https://a.dev/p1', title: 'Pinned old', createdAt: NOW });
    const b = createLink(db, { url: 'https://a.dev/p2', title: 'Pinned new', createdAt: NOW + 10 });
    createLink(db, { url: 'https://a.dev/n', title: 'Not pinned', createdAt: NOW + 20 });
    setPinned(db, a.id, true);
    setPinned(db, b.id, true);

    expect(listPinned(db).map((l) => l.title)).toEqual(['Pinned new', 'Pinned old']);
  });

  it('lists recent links newest-first with a limit', () => {
    for (let i = 1; i <= 25; i += 1) {
      createLink(db, { url: `https://a.dev/r${i}`, title: `Link ${i}`, createdAt: NOW + i });
    }

    const recent = listRecent(db, 10);
    expect(recent).toHaveLength(10);
    expect(recent[0].title).toBe('Link 25');
  });

  it('collects up to three favicons per space', () => {
    const work = createSpace(db, { name: 'Work' });
    const fun = createSpace(db, { name: 'Fun' });
    for (let i = 1; i <= 5; i += 1) {
      createLink(db, {
        url: `https://w${i}.dev/x`,
        title: `w${i}`,
        spaceId: work.id,
        favicon: `https://w${i}.dev/icon.png`,
      });
    }
    createLink(db, {
      url: 'https://f1.dev/x',
      title: 'f1',
      spaceId: fun.id,
      favicon: 'https://f1.dev/icon.png',
    });

    const favicons = faviconsBySpace(db);
    expect(favicons[work.id]).toHaveLength(3);
    expect(favicons[fun.id]).toEqual(['https://f1.dev/icon.png']);
  });
});