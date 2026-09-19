import { useEffect, useState } from 'react';
import { getDbClient } from '../db/db';
import {
  createLink,
  deleteLink,
  findByUrl,
  getLink,
  listBySpace,
  listLooseLinks,
  moveLink,
  setPinned,
  updateLink,
  type CreateLinkInput,
  type UpdateLinkInput,
} from '../repositories/links';
import { notifyDbChanged, subscribeToDbChanges } from '../store/events';
import type { Link } from '../types';

export function useLinksBySpace(spaceId: string | null): Link[] {
  const [links, setLinks] = useState<Link[]>(() =>
    listBySpace(getDbClient(), spaceId)
  );
  useEffect(
    () =>
      subscribeToDbChanges(() => setLinks(listBySpace(getDbClient(), spaceId))),
    [spaceId]
  );
  return links;
}

export function useLink(id: string): Link | null {
  const [link, setLink] = useState<Link | null>(() => getLink(getDbClient(), id));
  useEffect(
    () =>
      subscribeToDbChanges(() => {
        const current = getLink(getDbClient(), id);
        setLink((prev) =>
          prev && current && prev.updatedAt === current.updatedAt ? prev : current
        );
      }),
    [id]
  );
  return link;
}

export function useSaveLink(): (input: CreateLinkInput) => Link {
  return (input) => {
    const link = createLink(getDbClient(), input);
    notifyDbChanged();
    return link;
  };
}

export function useUpdateLink(): (id: string, patch: UpdateLinkInput) => Link | null {
  return (id, patch) => {
    const updated = updateLink(getDbClient(), id, patch);
    notifyDbChanged();
    return updated;
  };
}

export function useDeleteLink(): (id: string) => void {
  return (id) => {
    deleteLink(getDbClient(), id);
    notifyDbChanged();
  };
}

export function useMoveLink(): (id: string, spaceId: string | null) => void {
  return (id, spaceId) => {
    moveLink(getDbClient(), id, spaceId);
    notifyDbChanged();
  };
}

export function usePinLink(): (id: string, isPinned: boolean) => void {
  return (id, isPinned) => {
    setPinned(getDbClient(), id, isPinned);
    notifyDbChanged();
  };
}

export function useDuplicateCheck(): (url: string) => Link | null {
  return (url) => findByUrl(getDbClient(), url);
}

export function useLooseLinks(limit = 20): Link[] {
  const [links, setLinks] = useState<Link[]>(() =>
    listLooseLinks(getDbClient(), limit)
  );
  useEffect(
    () =>
      subscribeToDbChanges(() => setLinks(listLooseLinks(getDbClient(), limit))),
    [limit]
  );
  return links;
}