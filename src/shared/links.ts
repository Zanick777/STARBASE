import type { QuickLink } from './types';
export const DEFAULT_LINKS: QuickLink[] = [
  { id: 'github', name: 'GitHub', url: 'https://github.com' },
  { id: 'x', name: 'X', url: 'https://x.com' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com' },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com' },
  { id: 'grok', name: 'Grok', url: 'https://grok.com' },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com' },
];
export function sanitizeLinks(v: unknown): QuickLink[] | null {
  if (!Array.isArray(v)) return null;
  const out: QuickLink[] = [];
  for (const l of v) {
    if (!l || typeof l !== 'object') continue;
    const { id, name, url } = l as Record<string, unknown>;
    if (typeof id !== 'string' || typeof name !== 'string' || typeof url !== 'string') continue;
    try { const u = new URL(url); if (u.protocol !== 'http:' && u.protocol !== 'https:') continue; } catch { continue; }
    out.push({ id: id.slice(0, 64), name: name.slice(0, 40), url });
  }
  return out.slice(0, 64);
}
