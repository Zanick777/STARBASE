import { useEffect, useState } from 'react';
import type { FeedResult } from '../../shared/types';
import { relativeTime } from '../../shared/util';

export function Telemetry() {
  const [d, setD] = useState<FeedResult | null>(null);
  useEffect(() => {
    const h = (e: Event) => setD((e as CustomEvent<FeedResult>).detail);
    addEventListener('starbase:news', h); return () => removeEventListener('starbase:news', h);
  }, []);
  const up = d?.sources.filter((s) => s.ok).length ?? 0;
  const max = Math.max(1, ...(d?.sources.map((s) => s.count) ?? [1]));
  return (
    <section className="panel telemetry">
      <div className="panel-head"><h2><span className="idx">04</span>UPLINK TELEMETRY</h2>
        <div className="meta">{d ? `${up}/${d.sources.length} ONLINE` : 'ACQUIRING…'}</div></div>
      <ul>
        {d?.sources.map((s) => (
          <li key={s.name} title={s.error ?? ''}>
            <span className={s.ok ? 'dot ok' : 'dot bad'} />
            <span className="nm">{s.name}</span>
            <span className="bar"><i style={{ width: `${(s.count / max) * 100}%` }} /></span>
            <span className="ct">{s.ok ? String(s.count).padStart(2, '0') : 'ERR'}</span>
            <span className="ms">{s.ms}ms</span>
          </li>
        ))}
      </ul>
      {d && <div className="next">LAST SYNC {relativeTime(d.fetchedAt).toUpperCase()} · AUTO-REFRESH 15 MIN</div>}
    </section>
  );
}
