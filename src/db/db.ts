import { openDatabaseSync } from 'expo-sqlite';
import type { DbClient } from './client';
import { createExpoClient } from './expo-client';
import { migrate } from './schema';
import { seedDefaultSpaces } from './seed';

let client: DbClient | null = null;

export function getDbClient(): DbClient {
  if (!client) {
    const db = openDatabaseSync('linkspace.db');
    client = createExpoClient(db);
    migrate(client);
    seedDefaultSpaces(client);
  }
  return client;
}