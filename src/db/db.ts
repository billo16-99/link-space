import { openDatabaseSync } from 'expo-sqlite';
import type { DbClient } from './client';
import { createExpoClient } from './expo-client';
import { migrate } from './schema';

let client: DbClient | null = null;

export function getDbClient(): DbClient {
  if (!client) {
    const db = openDatabaseSync('linkspace.db');
    client = createExpoClient(db);
    migrate(client);
  }
  return client;
}
