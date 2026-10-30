import { describe, it, expect } from 'vitest';
import { parseFeed, mergeItems } from '../src/shared/feeds';
import { formatDate, isAllowedExternal, normalizeUrl, relativeTime, isAiRelated } from '../src/shared/util';
import { sanitizeLinks, DEFAULT_LINKS } from '../src/shared/links';

const RSS = `<?xml version="1.0"?><rss><channel><item><title>New LLM released</title><link>https://a.com/1</link><pubDate>Thu, 29 Oct 2026 10:00:00 GMT</pubDate></item><item><title>Second</title><link>https://a.com/2</link></item></channel></rss>`;
const ATOM = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><title type="html">Atom post</title><link rel="alternate" href="https://b.com/x"/><updated>2026-10-29T12:00:00Z</updated></entry></feed>`;

describe('feeds', () => {
  it('parses RSS', () => {
    const items = parseFeed(RSS, 'A');
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ title: 'New LLM released', url: 'https://a.com/1', source: 'A', sourceUrl: 'https://a.com' });
    expect(parseFeed(RSS, 'A', 'https://home.a')[0].sourceUrl).toBe('https://home.a');
    expect(items[0].published).toBe(Date.parse('2026-10-29T10:00:00Z'));
  });
  it('parses Atom', () => {
    expect(parseFeed(ATOM, 'B')[0]).toMatchObject({ title: 'Atom post', url: 'https://b.com/x' });
  });
  it('returns [] for garbage', () => expect(parseFeed('<html>nope</html>', 'x')).toEqual([]));
  it('merges, dedupes and sorts newest first', () => {
    const m = mergeItems([[{ id: '1', title: 'a', url: 'https://x/1?utm=1', source: 's', sourceUrl: '', published: 1 }],
      [{ id: '2', title: 'b', url: 'https://x/1', source: 's', sourceUrl: '', published: 5 }, { id: '3', title: 'c', url: 'https://x/3', source: 's', sourceUrl: '', published: 9 }]]);
    expect(m.map((i) => i.id)).toEqual(['3', '1']);
  });
});

describe('util', () => {
  it('allows only http(s) and spotify', () => {
    expect(isAllowedExternal('https://x.com')).toBe(true);
    expect(isAllowedExternal('spotify:')).toBe(true);
    expect(isAllowedExternal('file:///etc/passwd')).toBe(false);
    expect(isAllowedExternal('javascript:alert(1)')).toBe(false);
    expect(isAllowedExternal('not a url')).toBe(false);
  });
  it('normalizes urls', () => {
    expect(normalizeUrl('github.com')).toBe('https://github.com/');
    expect(normalizeUrl('ftp://x.com')).toBeNull();
    expect(normalizeUrl('  ')).toBeNull();
  });
  it('relative time', () => {
    expect(relativeTime(1000, 1000)).toBe('now');
    expect(relativeTime(0, 5 * 60e3)).toBe('5m');
    expect(relativeTime(0, 3 * 3600e3)).toBe('3h');
    expect(relativeTime(0, 2 * 86400e3)).toBe('2d');
  });
  it('detects AI topics', () => { expect(isAiRelated('OpenAI ships GPT-6')).toBe(true); expect(isAiRelated('Rust 2.0 released')).toBe(false); });
});

describe('links', () => {
  it('sanitizes', () => {
    expect(sanitizeLinks('x')).toBeNull();
    expect(sanitizeLinks([{ id: 'a', name: 'A', url: 'https://a.com' }, { id: 'b', name: 'B', url: 'javascript:1' }, 5])).toEqual([{ id: 'a', name: 'A', url: 'https://a.com' }]);
    expect(sanitizeLinks(DEFAULT_LINKS)).toHaveLength(6);
  });
});

import { decodeEntities } from '../src/shared/feeds';
describe('entities', () => {
  it('decodes numeric, named and double-escaped entities', () => {
    expect(decodeEntities('You don&#8217;t &amp; it&amp;#8217;s <b>bold</b>')).toBe('You don’t & it’s bold');
  });
});

describe('formatDate', () => {
  it('formats as "Mon D, YYYY · h:mm AM/PM"', () => {
    expect(formatDate(new Date(2026, 9, 29, 19, 42).getTime())).toBe('Oct 29, 2026 · 7:42 PM');
  });
});
