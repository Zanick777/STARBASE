export function isAllowedExternal(url: string): boolean {
  try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'spotify:'; }
  catch { return false; }
}
export function normalizeUrl(input: string): string | null {
  let s = input.trim(); if (!s) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = 'https://' + s;
  try { const u = new URL(s); return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.') ? u.toString() : null; } catch { return null; }
}
export function relativeTime(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return 'now';
  const m = Math.round(s / 60); if (m < 60) return `${m}m`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
export function formatDate(ts: number, locale?: string): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString(locale ?? 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString(locale ?? 'en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}
const AI_RE = /\b(ai|a\.i\.|llm|gpt|openai|anthropic|claude|gemini|grok|xai|llama|mistral|neural|machine learning|deep learning|model|agent|nvidia|gpu|transformer|diffusion|chatbot|robot)/i;
export const isAiRelated = (t: string) => AI_RE.test(t);
