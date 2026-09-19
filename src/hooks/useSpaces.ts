import { useEffect, useState } from 'react';
import { getDbClient } from '../db/db';
import {
  faviconsBySpace,
  listPinned,
  listRecent,
  previewLinksBySpace,
} from '../repositories/links';
import { searchDb, type SearchFilter } from '../repositories/search';
import {
  createSpace,
  deleteSpace,
  getSpace,
  listSpaces,
  reorderSpaces,
  spaceLinkCounts,
  updateSpace,
  type CreateSpaceInput,
  type UpdateSpaceInput,
} from '../repositories/spaces';
import { notifyDbChanged, subscribeToDbChanges } from '../store/events';
import type { Link, Space } from '../types';
import type { LinkPreview } from '../repositories/links';

export function useSpaces(): Space[] {
  const [spaces, setSpaces] = useState<Space[]>(() => listSpaces(getDbClient()));
  useEffect(
    () => subscribeToDbChanges(() => setSpaces(listSpaces(getDbClient()))),
    []
  );
  return spaces;
}

export function useSpace(id: string): Space | null {
  const [space, setSpace] = useState<Space | null>(() => getSpace(getDbClient(), id));
  useEffect(
    () =>
      subscribeToDbChanges(() => {
        const current = getSpace(getDbClient(), id);
        setSpace((prev) =>
          prev?.id === current?.id &&
          prev?.name === current?.name &&
          prev?.icon === current?.icon &&
          prev?.color === current?.color
            ? prev
            : current
        );
      }),
    [id]
  );
  return space;
}

export function useSpaceLinkCounts(): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    spaceLinkCounts(getDbClient())
  );
  useEffect(
    () => subscribeToDbChanges(() => setCounts(spaceLinkCounts(getDbClient()))),
    []
  );
  return counts;
}

export function useSpaceFavicons(): Record<string, string[]> {
  const [favicons, setFavicons] = useState<Record<string, string[]>>(() =>
    faviconsBySpace(getDbClient())
  );
  useEffect(
    () => subscribeToDbChanges(() => setFavicons(faviconsBySpace(getDbClient()))),
    []
  );
  return favicons;
}

export function useSpacePreviews(): Record<string, LinkPreview[]> {
  const [previews, setPreviews] = useState<Record<string, LinkPreview[]>>(() =>
    previewLinksBySpace(getDbClient())
  );
  useEffect(
    () => subscribeToDbChanges(() => setPreviews(previewLinksBySpace(getDbClient()))),
    []
  );
  return previews;
}

export function useRecentLinks(limit = 8): Link[] {
  const [links, setLinks] = useState<Link[]>(() => listRecent(getDbClient(), limit));
  useEffect(
    () => subscribeToDbChanges(() => setLinks(listRecent(getDbClient(), limit))),
    [limit]
  );
  return links;
}

export function usePinnedLinks(): Link[] {
  const [links, setLinks] = useState<Link[]>(() => listPinned(getDbClient()));
  useEffect(
    () => subscribeToDbChanges(() => setLinks(listPinned(getDbClient()))),
    []
  );
  return links;
}

export function useSearch(query: string, filter: SearchFilter) {
  const [result, setResult] = useState(() => searchDb(getDbClient(), query, filter));
  useEffect(() => {
    setResult(searchDb(getDbClient(), query, filter));
    return subscribeToDbChanges(() =>
      setResult(searchDb(getDbClient(), query, filter))
    );
  }, [query, filter]);
  return result;
}

export function useAddSpace(): (input: CreateSpaceInput) => Space {
  return (input) => {
    const space = createSpace(getDbClient(), input);
    notifyDbChanged();
    return space;
  };
}

export function useUpdateSpace(): (id: string, patch: UpdateSpaceInput) => Space | null {
  return (id, patch) => {
    const updated = updateSpace(getDbClient(), id, patch);
    notifyDbChanged();
    return updated;
  };
}

export function useDeleteSpace(): (id: string) => void {
  return (id) => {
    deleteSpace(getDbClient(), id);
    notifyDbChanged();
  };
}

export function useReorderSpaces(): (orderedIds: string[]) => void {
  return (orderedIds) => {
    reorderSpaces(getDbClient(), orderedIds);
    notifyDbChanged();
  };
}