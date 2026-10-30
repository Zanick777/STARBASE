import { XMLParser } from 'fast-xml-parser';
import type { NewsItem } from './types';

export interface FeedSource { name: string; url: string; kind: 'rss' | 'hn'; aiOnly?: boolean; }
export const FEEDS: FeedSource[] = [
  { name: 'Hacker News', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', kind: 'hn' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', kind: 'rss' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', kind: 'rss' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', kind: 'rss' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', kind: 'rss' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', kind: 'rss' },
];

const text = (v: unknown): string => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === 'object') { const o = v as Record<string, unknown>; return text(o['#text'] ?? o['@_href'] ?? ''); }
  return '';
};
const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
export function decodeEntities(s: string): string {
  let prev = '';
  for (let i = 0; i < 2 && prev !== s; i++) {
    prev = s;
    s = s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
  }
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
const arr = <T>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

export function parseFeed(xml: string, source: string): NewsItem[] {
  const p = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const doc = p.parse(xml);
  const out: NewsItem[] = [];
  const rssItems = arr(doc?.rss?.channel?.item ?? doc?.['rdf:RDF']?.item);
  for (const it of rssItems) {
    const url = text(it.link) || text(it.guid);
    const title = decodeEntities(text(it.title));
    const d = Date.parse(text(it.pubDate) || text(it['dc:date']));
    if (title && url) out.push({ id: url, title, url, source, published: isNaN(d) ? Date.now() : d });
  }
  for (const e of arr(doc?.feed?.entry)) {
    const links = arr<any>(e.link);
    const alt = links.find((l) => !l['@_rel'] || l['@_rel'] === 'alternate') ?? links[0];
    const url = alt ? text(alt['@_href'] ?? alt) : '';
    const title = decodeEntities(text(e.title));
    const d = Date.parse(text(e.published) || text(e.updated));
    if (title && url) out.push({ id: url, title, url, source, published: isNaN(d) ? Date.now() : d });
  }
  return out;
}

export function mergeItems(lists: NewsItem[][], limit = 80): NewsItem[] {
  const seen = new Set<string>(); const all: NewsItem[] = [];
  for (const it of lists.flat()) { const k = it.url.replace(/[?#].*$/, ''); if (!seen.has(k)) { seen.add(k); all.push(it); } }
  return all.sort((a, b) => b.published - a.published).slice(0, limit);
}
