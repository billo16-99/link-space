import { createTestDbClient } from '../../tests/helpers/sqljs-client';
import type { DbClient } from '../db/client';
import { migrate } from '../db/schema';
import { createLink } from './links';
import { createSpace } from './spaces';
import { searchDb } from './search';

describe('searchDb', () => {
  let db: DbClient;

  beforeEach(async () => {
    db = await createTestDbClient();
    migrate(db);
  });

  function seed() {
    const work = createSpace(db, { name: 'Work Tools' });
    const fun = createSpace(db, { name: 'Fun Stuff' });
    const a = createLink(db, {
      url: 'https://github.com/react-native',
      title: 'React Native Docs',
      domain: 'github.com',
      tags: ['dev', 'mobile'],
      spaceId: work.id,
    });
    const b = createLink(db, {
      url: 'https://www.youtube.com/watch?v=x',
      title: 'Coding vlog',
      domain: 'youtube.com',
      tags: ['video'],
      spaceId: fun.id,
    });
    const c = createLink(db, {
      url: 'https://reacttraining.com/course',
      title: 'React Course',
      domain: 'reacttraining.com',
      tags: ['dev'],
      isPinned: true,
    });
    return { work, fun, a, b, c };
  }

  it('returns an empty result for an empty query', () => {
    const { work } = seed();
    const result = searchDb(db, '', 'all');
    expect(result).toEqual({ links: [], spaces: [] });
  });

  it('matches links by title', () => {
    seed();
    const { links, spaces } = searchDb(db, 'coding', 'all');
    expect(links.map((l) => l.title)).toEqual(['Coding vlog']);
    expect(spaces).toHaveLength(0);
  });

  it('matches links by url and domain', () => {
    seed();
    expect(searchDb(db, 'github', 'all').links).toHaveLength(1);
    expect(searchDb(db, 'youtube.com', 'all').links).toHaveLength(1);
  });

  it('matches spaces by name', () => {
    seed();
    const { spaces } = searchDb(db, 'work', 'all');
    expect(spaces.map((s) => s.name)).toEqual(['Work Tools']);
  });

  it('matches links by tag', () => {
    seed();
    const { links } = searchDb(db, 'video', 'all');
    expect(links.map((l) => l.title)).toEqual(['Coding vlog']);
  });

  it('returns only spaces for the spaces filter', () => {
    seed();
    const result = searchDb(db, 'react', 'spaces');
    expect(result.spaces).toHaveLength(0);
    expect(result.links).toHaveLength(0);
    expect(searchDb(db, 'work', 'spaces').spaces.map((s) => s.name)).toEqual(['Work Tools']);
  });

  it('returns only pinned links for the pinned filter', () => {
    seed();
    const { links, spaces } = searchDb(db, 'react', 'pinned');
    expect(links.map((l) => l.title)).toEqual(['React Course']);
    expect(spaces).toHaveLength(0);
  });

  it('matches only the tags field for the tags filter', () => {
    seed();
    const byTag = searchDb(db, 'dev', 'tags');
    expect(byTag.links.map((l) => l.title).sort()).toEqual([
      'React Course',
      'React Native Docs',
    ]);
    const byTitle = searchDb(db, 'coding', 'tags');
    expect(byTitle.links).toHaveLength(0);
  });

  it('orders newer links first', () => {
    seed();
    createLink(db, { url: 'https://a.dev/x1', title: 'Alpha', tags: ['unique'], createdAt: 1000 });
    createLink(db, { url: 'https://a.dev/x2', title: 'Beta', tags: ['unique'], createdAt: 2000 });

    const ordered = searchDb(db, 'unique', 'recent');
    expect(ordered.links).toHaveLength(2);
    expect(ordered.links[0].title).toBe('Beta');
    expect(ordered.links[1].title).toBe('Alpha');
  });

  it('escapes LIKE wildcards in the query', () => {
    seed();
    createLink(db, { url: 'https://a.dev/weird', title: '100% useful', tags: [] });
    createLink(db, { url: 'https://a.dev/under', title: 'under_score', tags: [] });

    expect(searchDb(db, '100%', 'all').links.map((l) => l.title)).toEqual(['100% useful']);
    expect(searchDb(db, 'under_score', 'all').links.map((l) => l.title)).toEqual(['under_score']);
  });

  it('includes tags matches in the all filter', () => {
    seed();
    const { links } = searchDb(db, 'mobile', 'all');
    expect(links.map((l) => l.title)).toEqual(['React Native Docs']);
  });
});