function withScheme(input: string): string {
  const trimmed = input.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(withScheme(input));
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    return url.hostname.includes('.') || url.hostname === 'localhost';
  } catch {
    return false;
  }
}

export function normalizeUrl(input: string): string | null {
  if (!isValidUrl(input)) {
    return null;
  }
  const url = new URL(withScheme(input));
  url.hostname = url.hostname.toLowerCase();
  if (url.port === '80' || url.port === '443') {
    url.port = '';
  }
  url.hash = '';
  return url.toString();
}

export function getDomain(url: string): string {
  try {
    const parsed = new URL(withScheme(url));
    const host = parsed.hostname.toLowerCase();
    return host.startsWith('www.') ? host.slice(4) : host;
  } catch {
    return url.trim().toLowerCase();
  }
}

export function displayTitle(url: string, title: string | null | undefined): string {
  const trimmed = title?.trim();
  if (trimmed) {
    return trimmed;
  }
  return getDomain(url) || url.trim();
}