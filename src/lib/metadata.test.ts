import { fetchMetadata, faviconForDomain, parseHtmlMetadata } from './metadata';

describe('parseHtmlMetadata', () => {
  it('extracts title, description, thumbnail, and favicon', () => {
    const html = `
      <html>
        <head>
          <title>The Title</title>
          <meta name="description" content="A short description." />
          <meta property="og:image" content="https://cdn.example.com/img.jpg" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body></body>
      </html>
    `;
    const meta = parseHtmlMetadata(html, 'https://example.com/page');

    expect(meta.title).toBe('The Title');
    expect(meta.description).toBe('A short description.');
    expect(meta.thumbnail).toBe('https://cdn.example.com/img.jpg');
    expect(meta.favicon).toBe('https://example.com/favicon.ico');
    expect(meta.domain).toBe('example.com');
  });

  it('prefers og:title over the <title> tag', () => {
    const html = `
      <head>
        <title>Tag Title</title>
        <meta property="og:title" content="OG Title" />
      </head>
    `;
    const meta = parseHtmlMetadata(html, 'https://example.com');
    expect(meta.title).toBe('OG Title');
  });

  it('handles reversed attribute order in meta tags', () => {
    const html = `
      <head>
        <meta content="Reversed Title" property="og:title" />
        <meta content="Reversed description" name="description" />
        <meta content="https://cdn.example.com/t.jpg" property="og:image" />
        <link href="/icon.png" rel="icon" />
      </head>
    `;
    const meta = parseHtmlMetadata(html, 'https://example.com');
    expect(meta.title).toBe('Reversed Title');
    expect(meta.description).toBe('Reversed description');
    expect(meta.thumbnail).toBe('https://cdn.example.com/t.jpg');
    expect(meta.favicon).toBe('https://example.com/icon.png');
  });

  it('resolves relative favicon and thumbnail paths', () => {
    const html = `
      <head>
        <meta property="og:image" content="/images/hero.png" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
    `;
    const meta = parseHtmlMetadata(html, 'https://docs.example.com/intro');
    expect(meta.thumbnail).toBe('https://docs.example.com/images/hero.png');
    expect(meta.favicon).toBe('https://docs.example.com/favicon.svg');
  });

  it('returns nulls for missing fields without error', () => {
    const html = '<html><head></head><body></body></html>';
    const meta = parseHtmlMetadata(html, 'https://example.com');

    expect(meta.title).toBeNull();
    expect(meta.description).toBeNull();
    expect(meta.thumbnail).toBeNull();
    expect(meta.favicon).toBeNull();
  });
});

describe('faviconForDomain', () => {
  it('returns a Google S2 favicon URL', () => {
    expect(faviconForDomain('example.com')).toBe(
      'https://www.google.com/s2/favicons?domain=example.com&sz=64'
    );
  });
});

describe('fetchMetadata', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('extracts metadata from the fetched HTML', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<title>Expo</title>'),
    });
    const meta = await fetchMetadata('https://expo.dev');
    expect(meta.title).toBe('Expo');
    expect(meta.domain).toBe('expo.dev');
  });

  it('returns a graceful fallback on a network error', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network'));
    const meta = await fetchMetadata('https://example.com');
    expect(meta.title).toBeNull();
    expect(meta.domain).toBe('example.com');
    expect(meta.favicon).toBeTruthy();
  });

  it('returns a graceful fallback on a timeout', async () => {
    globalThis.fetch = jest
      .fn()
      .mockImplementation(
        (_url: string, init?: { signal?: AbortSignal }): Promise<Response> =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          })
      );
    const meta = await fetchMetadata('https://slow.dev', 10);
    expect(meta.title).toBeNull();
    expect(meta.domain).toBe('slow.dev');
  });
});