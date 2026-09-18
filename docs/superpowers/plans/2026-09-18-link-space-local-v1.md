# Link Space — Local V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working offline-first React Native/Expo app (`Link Space`) where users save links, organize them into Spaces, search, pin, and open them — no accounts/cloud yet (Phase 5 deferred).

**Architecture:** UI (`app/`) → Hooks (`src/hooks`) → Repositories (`src/repositories`) → `DbClient` (`src/db`). The UI never touches SQL. Repositories are pure-data functions receiving an injected `DbClient` interface with two adapters: `expo-sqlite` (app) and `sql.js` (Jest, same SQL dialect). A tiny event emitter (`src/store/events.ts`) broadcasts DB changes so hooks re-query.

**Tech Stack:** Expo SDK 57 (React Native 0.86, React 19.2, TypeScript 6), expo-router (file-based), expo-sqlite (sync API), @expo/vector-icons, jest-expo 57 + sql.js for tests. No UI library, no state library — custom components + Context + emitter.

---

## Contracts (defined once, used across all tasks)

### src/types.ts

```ts
export interface Space {
  id: string;
  name: string;
  icon: string;      // emoji or material icon name
  color: string;     // hex
  position: number;  // 0-based sort key
  createdAt: number; // epoch ms
  updatedAt: number;
}

export interface Link {
  id: string;
  spaceId: string | null; // null = Inbox/Unsorted
  url: string;            // normalized
  title: string;
  description: string | null;
  domain: string;
  favicon: string | null;
  thumbnail: string | null;
  tags: string[];
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type AppearanceMode = 'dark' | 'light' | 'system';
```

### src/db/client.ts

```ts
export type BindValue = string | number | boolean | null;
export interface DbRunResult { changes: number; lastInsertRowid: number; }
export interface DbClient {
  exec(sql: string): void;
  run(sql: string, params?: BindValue[]): DbRunResult;
  all<T = Record<string, unknown>>(sql: string, params?: BindValue[]): T[];
  get<T = Record<string, unknown>>(sql: string, params?: BindValue[]): T | null;
}
```

Adapters: `src/db/expo-client.ts` wraps `SQLiteDatabase` sync methods
(`execSync`/`runSync`/`getAllSync`/`getFirstSync`). `tests/helpers/sqljs-client.ts`
wraps `initSqlJs()` from `sql.js` (dev-only).

### SQLite schema (src/db/schema.ts)

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'folder',
  color TEXT NOT NULL DEFAULT '#7C5CFF',
  position INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  space_id TEXT,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL,
  favicon TEXT,
  thumbnail TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_links_space_id ON links(space_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
CREATE INDEX IF NOT EXISTS idx_links_is_pinned ON links(is_pinned);
```

Migrate via `PRAGMA user_version` (start at 1). IDs: `crypto.randomUUID()`.
Timestamps: `Date.now()`. Deleting a Space sets its links' `space_id` to NULL
(Inbox/Unsorted). Default seed = the 4 demo Spaces from spec §7
(Personal–Study / Work–Freelance Tools / Entertainment–Music & Videos / Shopping–Deals & Shopping),
added only when the `spaces` table is empty.

### Seed (src/db/seed.ts)

```ts
export interface SeedSpace { name: string; icon: string; color: string; }
export const DEFAULT_SPACES: SeedSpace[] = [
  { name: 'Study Links',  icon: 'book',    color: '#7C5CFF' },
  { name: 'Freelance',    icon: 'briefcase', color: '#30B8D4' },
  { name: 'Music & Video', icon: 'music-note', color: '#FF8A5C' },
  { name: 'Deals & Shop', icon: 'tag',     color: '#30C48B' },
];
export function seedDefaultSpaces(db: DbClient): void; // only if spaces empty
```

### Repositories (src/repositories/)

`spaces.ts`:
```ts
createSpace(db, input: { name; icon?; color? }): Space
updateSpace(db, id, patch: { name?; icon?; color? }): Space | null
deleteSpace(db, id): void                 // links -> space_id NULL
reorderSpaces(db, orderedIds: string[]): void
listSpaces(db): Space[]                   // ORDER BY position ASC
getSpace(db, id): Space | null
spaceLinkCounts(db): Record<string, number>  // by spaceId, '' for Inbox
```

`links.ts`:
```ts
createLink(db, input: { url; title; spaceId?; description?; domain?; favicon?; thumbnail?; tags?; isPinned? }): Link  // domain fallback from url
updateLink(db, id, patch: { title?; spaceId?; description?; thumbnail?; tags? }): Link | null
deleteLink(db, id): void
setPinned(db, id, isPinned: boolean): void
moveLink(db, id, spaceId: string | null): void
getLink(db, id): Link | null
findByUrl(db, normalizedUrl: string): Link | null
listBySpace(db, spaceId: string | null): Link[]   // created_at DESC
listPinned(db): Link[]                             // created_at DESC
listRecent(db, limit = 20): Link[]                 // created_at DESC
linkCountBySpace(db, spaceId: string | null): number
```

`search.ts`:
```ts
export type SearchFilter = 'all' | 'spaces' | 'pinned' | 'recent' | 'tags';
export interface SearchResult { links: Link[]; spaces: Space[]; }
searchDb(db, query: string, filter: SearchFilter): SearchResult
```
Links matched on `title/url/domain/tags LIKE %q%`; Spaces on `name LIKE %q%`.

### lib/url.ts

```ts
export function isValidUrl(input: string): boolean;
export function normalizeUrl(input: string): string | null; // null when invalid
export function getDomain(url: string): string;             // strip www., lowercase, no port
export function displayTitle(url: string, title: string | null): string; // fallback: title ?? domain
```

### lib/metadata.ts

```ts
export interface LinkMetadata {
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  favicon: string | null;
  domain: string;
}
export function parseHtmlMetadata(html: string, baseUrl: string): LinkMetadata; // pure regex
export function faviconForDomain(domain: string): string; // google s2 favicons
export async function fetchMetadata(url: string, timeoutMs?: number): Promise<LinkMetadata>; // never throws; graceful fallback
```

### store/events.ts

```ts
export function subscribeToDbChanges(listener: () => void): () => void;
export function notifyDbChanged(): void;
```

### src/theme/tokens.ts + ThemeContext.tsx

Dark-first. `darkColors`, `lightColors` token sets, `spacing`, `radius`, `type`.
`ThemeProvider` resolves `AppearanceMode` (dark/light/system) + `useTheme()`.
Mode preference persisted via `expo-sqlite/kv-store` (`Storage.setItemSync`).

---

## Tasks

### Task 1: Scaffold (DONE)
Expo SDK 57 + expo-router + expo-sqlite + jest-expo + sql.js; `.npmrc` legacy-peer-deps; fresh git; typecheck green; initial commit.

### Task 2: Theme tokens + ThemeContext
**Files:** `src/theme/tokens.ts`, `src/theme/ThemeContext.tsx`, `src/theme/tokens.test.ts`

- [ ] TDD: `tokens.test.ts` asserts dark/light palettes contain required keys and every spacing/radius value ≥ 0.
- [ ] Implement tokens (dark: bg #0B0B0D, surface #151519, border #26262E, text #FFFFFF/#9B9BA6/#6E6E78, accent #7C5CFF; light: bg #F7F7F8, surface #FFFFFF, border #E4E4EA, text #111114/#6E6E78; danger #FF5A5F).
- [ ] TDD: `resolveAppearance(mode, systemMode)` pure function returns 'dark'|'light'.
- [ ] Implement ThemeProvider (context) + `useTheme()` hook; persist choice in kv-store.
- [ ] Run `npm test` + `npm run typecheck`; commit.

### Task 3: DbClient + schema + seed
**Files:** `src/db/client.ts`, `src/db/expo-client.ts`, `src/db/schema.ts`, `src/db/db.ts`, `src/db/seed.ts`, `src/db/seed.test.ts`, `tests/helpers/sqljs-client.ts`

- [ ] TDD: seed test — init DB, `seedDefaultSpaces` inserts 4 spaces with positions 0-3; running twice is a no-op.
- [ ] Implement schema/migrate + seed + sql.js test adapter.
- [ ] Run tests + typecheck; commit.

### Task 4: Spaces repository
**Files:** `src/repositories/spaces.ts`, `src/repositories/spaces.test.ts`
- [ ] TDD + impl: create/update/delete/reorder/list/get/spaceLinkCounts. Delete moves links to Inbox (space_id NULL).
- [ ] Commit.

### Task 5: Links repository
**Files:** `src/repositories/links.ts`, `src/repositories/links.test.ts`
- [ ] TDD + impl: create (domain fallback), update, delete, setPinned, moveLink, getLink, findByUrl (duplicate detection), listBySpace, listPinned, listRecent, linkCountBySpace. Tags persist as JSON.
- [ ] Commit.

### Task 6: URL utilities
**Files:** `src/lib/url.ts`, `src/lib/url.test.ts`
- [ ] TDD + impl: validate (http/https required), normalize (add scheme, lowercase host, strip hash), getDomain (strip www), displayTitle.
- [ ] Commit.

### Task 7: Metadata
**Files:** `src/lib/metadata.ts`, `src/lib/metadata.test.ts`
- [ ] TDD + impl: pure `parseHtmlMetadata` (og:title > <title>, og:image, description, icon), `faviconForDomain`, `fetchMetadata` timeout + graceful fallback (never throws).
- [ ] Commit.

### Task 8: Search
**Files:** `src/repositories/search.ts`, `src/repositories/search.test.ts`
- [ ] TDD + impl: `searchDb` across title/url/domain/tags + space name; filters all/spaces/pinned/recent/tags; LIKE-escaped.
- [ ] Commit.

### Task 9: Navigation shell + providers
**Files:** `app/_layout.tsx`, `src/db/DataProvider.tsx`, `src/store/events.ts`
- [ ] Root layout: ThemeProvider → DataProvider (opens DB, migrates, seeds) → expo-router Stack (dark bg). StatusBar light.
- [ ] Verify bundle via `npx expo export --platform android` (or start server smoke) + typecheck.
- [ ] Commit.

### Task 10: Home screen
**Files:** `app/index.tsx`, `src/components/*` (Button, SpaceCard, SearchBar, EmptyState, IconButton), `src/hooks/useSpaces.ts`, `src/hooks/useRecentLinks.ts`, `src/hooks/useLinkCounts.ts`
- [ ] Header (logo left-center, profile icon right), full-width SearchBar (navigates to /search), "Saved Link Spaces" title, 2-col space grid (icon/color, name, link count, 3 favicons, "+", ⋮ menu w/ edit-reorder-delete), Recently Saved list, floating "+ Add Link". Inbox card when unsorted links exist.
- [ ] Wire space card actions (rename via inline modal, delete w/ confirm, reorder up/down).
- [ ] Commit.

### Task 11: Space detail + Inbox
**Files:** `app/space/[id].tsx`, `src/hooks/useLinksBySpace.ts`
- [ ] Header w/ back; FlatList of LinkCards; empty state "No links in this Space yet." + Add Link; 3-dot space menu (rename/change icon/color/delete). Inbox variant for no id.
- [ ] Commit.

### Task 12: Add Link flow
**Files:** `app/add-link.tsx`, `src/hooks/useAddLink.ts`
- [ ] URL input → validate (inline error) → fetchMetadata preview card (editable title) → space picker (default first/Inbox) → optional tags → Save.
- [ ] Duplicate detection: `findByUrl` hit → Alert "Already saved" w/ Open / Cancel.
- [ ] Offline/network-fail → friendly copy, save still works. Loading spinner during metadata fetch.
- [ ] ~200-400ms transitions only. Commit.

### Task 13: LinkCard + actions
**Files:** `src/components/LinkCard.tsx`, `src/hooks/useLinkActions.ts`
- [ ] Compact card: favicon, title (1 line), domain + space name (secondary), [⋮] sheet → Open / Pin / Move / Edit / Delete. Open via `Linking.openURL(url)`. Thumbnail only when space exists.
- [ ] Commit.

### Task 14: Edit Link screen
**Files:** `app/edit-link/[id].tsx`
- [ ] Edit title, tags; change space; delete link (confirm); save.
- [ ] Commit.

### Task 15: Pinned + Recently Saved screens
**Files:** `app/pinned.tsx`, `app/recent.tsx`, `src/hooks/usePinnedLinks.ts`
- [ ] FlatList of LinkCards; empty states per spec §27; entry points from Home.
- [ ] Commit.

### Task 16: Search screen
**Files:** `app/search.tsx`, `src/hooks/useSearch.ts`
- [ ] Debounced live search (>150ms), filter chips (All/Spaces/Pinned/Recent/Tags), result sections, no-results state "No links found."
- [ ] Commit.

### Task 17: Settings screen
**Files:** `app/settings.tsx`, `src/hooks/useSettings.ts`
- [ ] Appearance (Dark/Light/System), About w/ version. Minimal.
- [ ] Commit.

### Task 18: Polish + verification
- [ ] All empty states (§27), loading states (§24), friendly errors (§25), dark/light consistency, `npm test` green, `npm run typecheck` green, `npm run doctor`, manual smoke on device via Expo Go.

---

## Out of scope (spec §31 + user decision)
Supabase/accounts/sync/RLS (Phase 5), Android share target (share-flow spec — reserved via Inbox `space_id NULL`), AI, bulk actions, notifications, in-app browser, subscriptions, custom themes beyond dark/light.