import { createTestDbClient } from '../../tests/helpers/sqljs-client';
import type { DbClient } from './client';
import { migrate } from './schema';
import { seedDefaultSpaces, seedDemoLinks } from './seed';

describe('seedDefaultSpaces', () => {
  let db: DbClient;

  beforeEach(async () => {
    db = await createTestDbClient();
    migrate(db);
  });

  it('does not insert any spaces', () => {
    seedDefaultSpaces(db);

    const count = db.get<{ n: number }>('SELECT COUNT(*) AS n FROM spaces');
    expect(count?.n).toBe(0);
  });
});

describe('seedDemoLinks', () => {
  let db: DbClient;

  beforeEach(async () => {
    db = await createTestDbClient();
    migrate(db);
  });

  it('does not insert any links', () => {
    seedDemoLinks(db);

    const count = db.get<{ n: number }>('SELECT COUNT(*) AS n FROM links');
    expect(count?.n).toBe(0);
  });
});
