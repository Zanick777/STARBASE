import { describe, it, expect } from 'vitest';
import { pathToFileURL } from 'url';

function normalizeUrl(url: string): string {
  try { const u = new URL(url); u.hash = ''; u.search = ''; return u.href; } catch { return url; }
}

function isAllowedAppUrl(url: string, devUrl: string | undefined, appFileUrl: string): boolean {
  if (devUrl && url.startsWith(devUrl)) return true;
  return normalizeUrl(url) === appFileUrl;
}

describe('URL validation', () => {
  const appFileUrl = pathToFileURL('/app/dist/index.html').href;
  const devUrl = 'http://localhost:5173';

  it('allows exact app file URL', () => {
    expect(isAllowedAppUrl(appFileUrl, undefined, appFileUrl)).toBe(true);
  });

  it('allows app file URL with hash/query stripped', () => {
    expect(isAllowedAppUrl(`${appFileUrl}?foo=bar`, undefined, appFileUrl)).toBe(true);
    expect(isAllowedAppUrl(`${appFileUrl}#section`, undefined, appFileUrl)).toBe(true);
    expect(isAllowedAppUrl(`${appFileUrl}?foo=bar#section`, undefined, appFileUrl)).toBe(true);
  });

  it('rejects other file URLs', () => {
    expect(isAllowedAppUrl('file:///etc/passwd', undefined, appFileUrl)).toBe(false);
    expect(isAllowedAppUrl('file:///app/other.html', undefined, appFileUrl)).toBe(false);
  });

  it('allows dev URL when provided', () => {
    expect(isAllowedAppUrl('http://localhost:5173', devUrl, appFileUrl)).toBe(true);
    expect(isAllowedAppUrl('http://localhost:5173/', devUrl, appFileUrl)).toBe(true);
    expect(isAllowedAppUrl('http://localhost:5173/foo', devUrl, appFileUrl)).toBe(true);
  });

  it('rejects other HTTP URLs', () => {
    expect(isAllowedAppUrl('http://evil.com', devUrl, appFileUrl)).toBe(false);
    expect(isAllowedAppUrl('https://example.com', devUrl, appFileUrl)).toBe(false);
  });

  it('rejects non-URL strings', () => {
    expect(isAllowedAppUrl('javascript:alert(1)', undefined, appFileUrl)).toBe(false);
    expect(isAllowedAppUrl('data:text/html,<script>alert(1)</script>', undefined, appFileUrl)).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('strips hash and query', () => {
    expect(normalizeUrl('https://example.com/path?foo=bar#hash')).toBe('https://example.com/path');
    expect(normalizeUrl('file:///path/to/file.html#section')).toBe('file:///path/to/file.html');
  });

  it('returns invalid URLs unchanged', () => {
    expect(normalizeUrl('not a url')).toBe('not a url');
    expect(normalizeUrl('javascript:alert(1)')).toBe('javascript:alert(1)');
  });
});
