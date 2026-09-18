import type { Link, Space } from '../types';

interface SpaceRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  created_at: number;
  updated_at: number;
}

interface LinkRow {
  id: string;
  space_id: string | null;
  url: string;
  title: string;
  description: string | null;
  domain: string;
  favicon: string | null;
  thumbnail: string | null;
  tags: string;
  is_pinned: number;
  created_at: number;
  updated_at: number;
}

export function mapSpaceRow(row: SpaceRow): Space {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((t): t is string => typeof t === 'string');
    }
  } catch {
    // Malformed tag data is treated as no tags.
  }
  return [];
}

export function mapLinkRow(row: LinkRow): Link {
  return {
    id: row.id,
    spaceId: row.space_id,
    url: row.url,
    title: row.title,
    description: row.description,
    domain: row.domain,
    favicon: row.favicon,
    thumbnail: row.thumbnail,
    tags: parseTags(row.tags),
    isPinned: row.is_pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeTags(tags: string[]): string {
  return JSON.stringify([...new Set(tags.map((t) => t.trim()).filter(Boolean))]);
}