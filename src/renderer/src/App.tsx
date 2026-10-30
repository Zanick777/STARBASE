import { useEffect, useState } from 'react';
import { Wordmark } from './Wordmark';
import { NewsFeed } from './NewsFeed';
import { QuickLinks } from './QuickLinks';
import { SpotifyLauncher } from './SpotifyLauncher';

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="clock">
      <div><label>LOCAL</label><b>{p(now.getHours())}:{p(now.getMinutes())}</b></div>
      <div><label>DATE</label><b>{now.toISOString().slice(0, 10)}</b></div>
    </div>
  );
}

export function App() {
  const [online, setOnline] = useState(navigator.onLine);
  const [telemetry, setTelemetry] = useState<{ up: number; total: number; hasError: boolean } | null>(null);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener('online', on); addEventListener('offline', off);
    const h = (e: Event) => {
      const d = (e as CustomEvent<any>).detail;
      const up = d?.sources?.filter((s: any) => s.ok).length ?? 0;
      const total = d?.sources?.length ?? 0;
      const hasError = up < total;
      setTelemetry({ up, total, hasError });
    };
    addEventListener('starbase:news', h);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); removeEventListener('starbase:news', h); };
  }, []);
  return (
    <div className="shell">
      <header className="topbar">
        <Wordmark />
        <div className="status"><span className={online ? 'dot ok' : 'dot bad'} />{online ? 'LINK NOMINAL' : 'NO UPLINK'}</div>
        {telemetry && (
          <div className={`telemetry-badge ${telemetry.hasError ? 'error' : ''}`}>
            SOURCES {telemetry.up}/{telemetry.total}
          </div>
        )}
        <Clock />
      </header>
      <main className="grid">
        <NewsFeed />
        <aside className="side">
          <SpotifyLauncher />
          <QuickLinks />
        </aside>
      </main>
    </div>
  );
}
