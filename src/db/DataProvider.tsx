import type { ReactNode } from 'react';
import { getDbClient } from '../db/db';

export function DataProvider({ children }: { children: ReactNode }) {
  getDbClient();
  return <>{children}</>;
}