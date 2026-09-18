import { displayTitle, getDomain, isValidUrl, normalizeUrl } from './url';

describe('isValidUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('accepts a bare domain by assuming https', () => {
    expect(isValidUrl('example.com')).toBe(true);
  });

  it('accepts localhost', () => {
    expect(isValidUrl('http://localhost:8080')).toBe(true);
  });

  it('rejects non-URL input', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('   ')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
  });

  it('rejects non-web protocols', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('file:///etc/passwd')).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('adds a scheme when missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/');
  });

  it('lowercases the scheme and host', () => {
    expect(normalizeUrl('HTTP://EXAMPLE.com/Path')).toBe('http://example.com/Path');
  });

  it('preserves query parameters', () => {
    expect(normalizeUrl('https://example.com/search?q=hello')).toBe(
      'https://example.com/search?q=hello'
    );
  });

  it('strips the URL fragment', () => {
    expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
  });

  it('returns null for invalid input', () => {
    expect(normalizeUrl('not a url')).toBeNull();
  });
});

describe('getDomain', () => {
  it('extracts the domain from a URL', () => {
    expect(getDomain('https://www.youtube.com/watch?v=abc')).toBe('youtube.com');
  });

  it('keeps non-www subdomains', () => {
    expect(getDomain('https://sub.github.com/project')).toBe('sub.github.com');
  });

  it('lowercases the host', () => {
    expect(getDomain('https://EXAMPLE.com')).toBe('example.com');
  });

  it('works without an explicit scheme', () => {
    expect(getDomain('example.com/path')).toBe('example.com');
  });
});

describe('displayTitle', () => {
  it('prefers a non-empty title', () => {
    expect(displayTitle('https://example.com', 'Example — Home')).toBe('Example — Home');
  });

  it('falls back to the domain when title is missing', () => {
    expect(displayTitle('https://www.example.com/article', null)).toBe('example.com');
  });

  it('falls back to the domain when title is blank', () => {
    expect(displayTitle('https://example.com', '   ')).toBe('example.com');
  });
});