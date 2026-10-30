import { useEffect, useState } from 'react';
import { Wordmark } from './Wordmark';
import { NewsFeed } from './NewsFeed';
import { QuickLinks } from './QuickLinks';
import { SpotifyLauncher } from './SpotifyLauncher';
import { Telemetry } from './Telemetry';

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="clock">
      <div><label>LOCAL</label><b>{p(now.getHours())}:{p(now.getMinutes())}:{p(now.getSeconds())}</b></div>
      <div><label>UTC</label><b>{p(now.getUTCHours())}:{p(now.getUTCMinutes())}</b></div>
      <div><label>DATE</label><b>{now.toISOString().slice(0, 10)}</b></div>
    </div>
  );
}

export function App() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener('online', on); addEventListener('offline', off);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);
  return (
    <div className="shell">
      <header className="topbar">
        <Wordmark />
        <div className="status"><span className={online ? 'dot ok' : 'dot bad'} />{online ? 'LINK NOMINAL' : 'NO UPLINK'}</div>
        <Clock />
      </header>
      <main className="grid">
        <NewsFeed />
        <aside className="side">
          <SpotifyLauncher />
          <QuickLinks />
          <Telemetry />
        </aside>
      </main>
      <footer className="footer"><span>STARBASE // COMMAND CENTER v1.0</span><span>OPERATOR: ZACK</span></footer>
    </div>
  );
}
