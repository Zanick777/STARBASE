import { useState } from 'react';
export function SpotifyLauncher() {
  const [msg, setMsg] = useState('');
  const go = async () => {
    setMsg('LAUNCHING…');
    try { const r = await window.starbase.launchSpotify(); setMsg(r === 'app' ? 'HANDOFF → SPOTIFY APP' : 'APP NOT FOUND → WEB PLAYER'); }
    catch { setMsg('LAUNCH FAILED'); }
    setTimeout(() => setMsg(''), 4000);
  };
  return (
    <section className="panel spotify">
      <div className="panel-head"><h2><span className="idx">02</span>AUDIO</h2></div>
      <button className="launch" onClick={go}>
        <span className="label">LAUNCH SPOTIFY</span>
        <span className="arrow">→</span>
      </button>
      {msg && <div className="hint">{msg}</div>}
    </section>
  );
}
