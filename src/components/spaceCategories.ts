const CATEGORY_ACCENTS: Record<string, string> = {
  Personal: '#A56BFF',
  Work: '#20D889',
  Entertainment: '#22B5E8',
  Shopping: '#F5C21A',
};

export function categoryFor(_spaceId: string): string | null {
  return null;
}

export function categoryAccent(category: string, fallback: string): string {
  return CATEGORY_ACCENTS[category] ?? fallback;
}
