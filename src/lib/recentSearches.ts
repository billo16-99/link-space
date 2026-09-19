const MAX_RECENT = 5;
let recent: string[] = [];

export function getRecentSearches(): string[] {
  return recent;
}

export function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  recent = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(0, MAX_RECENT);
}

export function clearRecentSearches() {
  recent = [];
}
