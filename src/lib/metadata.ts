import { getDomain } from './url';

export interface LinkMetadata {
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  favicon: string | null;
  domain: string;
}

const TITLE_TAG = /<title[^>]*>([^<]+)<\/title>/i;
const OG_TITLE = /<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i;
const OG_TITLE_REV = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i;
const META_DESC = /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i;
const META_DESC_REV = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i;
const OG_IMAGE = /<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i;
const OG_IMAGE_REV = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i;
const LINK_ICON =
  /<link\s+[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']*)["']/i;
const LINK_ICON_REV = /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["'][^"']*icon[^"']*["']/i;

function extract(pattern: RegExp, reverse: RegExp, html: string): string | null {
  const match = html.match(pattern) ?? html.match(reverse);
  return match?.[1]?.trim() || null;
}

function resolve(value: string | null, baseUrl: string): string | null {
  if (!value) {
    return null;
  }
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

export function parseHtmlMetadata(html: string, baseUrl: string): LinkMetadata {
  const title =
    extract(OG_TITLE, OG_TITLE_REV, html) ?? extract(TITLE_TAG, TITLE_TAG, html);
  const description = extract(META_DESC, META_DESC_REV, html);
  const thumbnail = resolve(extract(OG_IMAGE, OG_IMAGE_REV, html), baseUrl);
  const favicon = resolve(extract(LINK_ICON, LINK_ICON_REV, html), baseUrl);

  return {
    title,
    description,
    thumbnail,
    favicon,
    domain: getDomain(baseUrl),
  };
}

export function faviconForDomain(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export async function fetchMetadata(
  url: string,
  timeoutMs = 8000
): Promise<LinkMetadata> {
  const domain = getDomain(url);
  const fallback: LinkMetadata = {
    title: null,
    description: null,
    thumbnail: null,
    favicon: faviconForDomain(domain),
    domain,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      const html = await response.text();
      const parsed = parseHtmlMetadata(html, url);
      return {
        ...parsed,
        domain,
        favicon: parsed.favicon ?? faviconForDomain(domain),
      };
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return fallback;
  }
}