import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FeedResult } from '../../shared/types';
import { relativeTime, isAiRelated, formatDate } from '../../shared/util';

const REFRESH_MS = 15 * 60 * 1000;

export function NewsFeed() {
  const [data, setData] = useState<FeedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'AI'>('ALL');
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try { const d = await window.starbase.getNews(); setData(d); window.dispatchEvent(new CustomEvent('starbase:news', { detail: d })); }
    catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    const t = setInterval(load, REFRESH_MS); const r = setInterval(() => tick((n) => n + 1), 30000);
    return () => { clearInterval(t); clearInterval(r); };
  }, [load]);

  const items = useMemo(() => (data?.items ?? []).filter((i) => filter === 'ALL' || isAiRelated(i.title)), [data, filter]);

  return (
    <section className="panel news">
      <div className="panel-head">
        <h2><span className="idx">01</span>INTEL FEED</h2>
        <div className="tabs">
          {(['ALL', 'AI'] as const).map((f) => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
        <div className="meta">
          {data && <span>SYNC {relativeTime(data.fetchedAt).toUpperCase()} · {items.length} ITEMS</span>}
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'SYNCING…' : '↻ REFRESH'}</button>
        </div>
      </div>
      {loading && <div className="scanbar" />}
      {data?.offline && <div className="alert">OFFLINE — NO FEEDS REACHABLE. {data.items.length ? 'SHOWING CACHED DATA.' : 'RETRY WHEN UPLINK RESTORED.'}</div>}
      {err && <div className="alert">FEED ERROR: {err}</div>}
      {!!data?.errors.length && !data.offline && <div className="warn">{data.errors.length} SOURCE(S) DEGRADED: {data.errors.map((e) => e.source).join(', ')}</div>}
      <ol className="items">
        {!data && loading && Array.from({ length: 10 }).map((_, i) => <li key={i} className="skeleton"><span /></li>)}
        {items.map((it, i) => (
          <li key={it.id} style={{ animationDelay: `${Math.min(i, 30) * 18}ms` }}>
            <div className="item">
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <a className="t" href={it.url} title={it.url} onClick={(e) => { e.preventDefault(); void window.starbase.openExternal(it.url); }}>{it.title}</a>
              <a className="src" href={it.sourceUrl} title={`Open ${it.source}: ${it.sourceUrl}`} onClick={(e) => { e.preventDefault(); void window.starbase.openExternal(it.sourceUrl); }}>{it.source} ↗</a>
              <time className="time" dateTime={new Date(it.published).toISOString()}>{formatDate(it.published)}<em>{relativeTime(it.published)}</em></time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
