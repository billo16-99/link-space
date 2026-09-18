import { createTestDbClient } from '../../tests/helpers/sqljs-client';
import type { DbClient } from './client';
import { migrate } from './schema';
import { DEFAULT_SPACES, seedDefaultSpaces } from './seed';

describe('seedDefaultSpaces', () => {
  let db: DbClient;

  beforeEach(async () => {
    db = await createTestDbClient();
    migrate(db);
  });

  it('inserts all default spaces on an empty database', () => {
    seedDefaultSpaces(db);

    const spaces = db.all<{ name: string; icon: string; color: string; position: number }>(
      'SELECT name, icon, color, position FROM spaces ORDER BY position ASC'
    );

    expect(spaces).toHaveLength(DEFAULT_SPACES.length);
    spaces.forEach((space, index) => {
      expect(space.name).toBe(DEFAULT_SPACES[index].name);
      expect(space.icon).toBe(DEFAULT_SPACES[index].icon);
      expect(space.color).toBe(DEFAULT_SPACES[index].color);
      expect(space.position).toBe(index);
    });
  });

  it('is idempotent when called twice', () => {
    seedDefaultSpaces(db);
    seedDefaultSpaces(db);

    const count = db.get<{ n: number }>('SELECT COUNT(*) AS n FROM spaces');
    expect(count?.n).toBe(DEFAULT_SPACES.length);
  });

  it('does not seed when spaces already exist', () => {
    db.run('INSERT INTO spaces (id, name, icon, color, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      's1', 'Mine', 'star', '#FFFFFF', 0, 1, 1,
    ]);
    seedDefaultSpaces(db);

    const count = db.get<{ n: number }>('SELECT COUNT(*) AS n FROM spaces');
    expect(count?.n).toBe(1);
  });
});