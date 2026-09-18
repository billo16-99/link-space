import type { DbClient } from './client';

export interface SeedSpace {
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_SPACES: SeedSpace[] = [
  { name: 'Study Links', icon: 'book', color: '#7C5CFF' },
  { name: 'Freelance', icon: 'briefcase', color: '#30B8D4' },
  { name: 'Music & Video', icon: 'music-note', color: '#FF8A5C' },
  { name: 'Deals & Shop', icon: 'tag', color: '#30C48B' },
];

export function seedDefaultSpaces(db: DbClient): void {
  const count = db.get<{ n: number }>('SELECT COUNT(*) AS n FROM spaces');
  if ((count?.n ?? 0) > 0) {
    return;
  }

  const now = Date.now();
  DEFAULT_SPACES.forEach((space, index) => {
    db.run(
      `INSERT INTO spaces (id, name, icon, color, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`space-${index + 1}`, space.name, space.icon, space.color, index, now, now]
    );
  });
}