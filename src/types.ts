export interface Space {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  createdAt: number;
  updatedAt: number;
}

export interface Link {
  id: string;
  spaceId: string | null;
  url: string;
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