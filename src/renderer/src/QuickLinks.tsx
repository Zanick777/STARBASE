import { useEffect, useState } from 'react';
import type { QuickLink } from '../../shared/types';
import { normalizeUrl } from '../../shared/util';

type Draft = { id?: string; name: string; url: string };

export function QuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => { window.starbase.getLinks().then(setLinks); }, []);
  const persist = async (next: QuickLink[]) => { setLinks(next); setLinks(await window.starbase.saveLinks(next)); };

  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= links.length) return;
    const n = [...links]; [n[i], n[j]] = [n[j], n[i]]; void persist(n);
  };
  const submit = () => {
    if (!draft) return;
    const url = normalizeUrl(draft.url); const name = draft.name.trim();
    if (!name) return setError('NAME REQUIRED'); if (!url) return setError('INVALID URL');
    const next = draft.id ? links.map((l) => (l.id === draft.id ? { ...l, name, url } : l))
      : [...links, { id: Date.now().toString(36), name, url }];
    void persist(next); setDraft(null); setError('');
  };
  const onDrop = (target: string) => {
    if (!dragId || dragId === target) return;
    const n = [...links]; const from = n.findIndex((l) => l.id === dragId); const [x] = n.splice(from, 1);
    n.splice(n.findIndex((l) => l.id === target), 0, x); void persist(n); setDragId(null);
  };
  const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

  return (
    <section className="panel links">
      <div className="panel-head">
        <h2><span className="idx">03</span>QUICK LINKS</h2>
        <div className="meta">
          {edit && <button className="btn" onClick={() => { setDraft({ name: '', url: '' }); setError(''); }}>+ ADD</button>}
          <button className={edit ? 'btn on' : 'btn'} onClick={() => { setEdit(!edit); setDraft(null); }}>{edit ? 'DONE' : 'EDIT'}</button>
        </div>
      </div>
      {draft && (
        <form className="editor" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <input autoFocus placeholder="NAME" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input placeholder="https://…" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          <button className="btn on" type="submit">{draft.id ? 'SAVE' : 'ADD'}</button>
          <button className="btn" type="button" onClick={() => setDraft(null)}>CANCEL</button>
          {error && <span className="err">{error}</span>}
        </form>
      )}
      <div className="tiles">
        {links.map((l, i) => (
          <div key={l.id} className={'tile' + (edit ? ' editing' : '')} draggable={edit}
            onDragStart={() => setDragId(l.id)} onDragOver={(e) => edit && e.preventDefault()} onDrop={() => onDrop(l.id)}
            onClick={() => !edit && window.starbase.openExternal(l.url)} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && !edit && window.starbase.openExternal(l.url)}>
            <span className="mono">{l.name.slice(0, 2).toUpperCase()}</span>
            <span className="name">{l.name}</span>
            <span className="host">{host(l.url)}</span>
            {edit && (
              <span className="tools" onClick={(e) => e.stopPropagation()}>
                <button title="Move left" onClick={() => move(i, -1)}>←</button>
                <button title="Move right" onClick={() => move(i, 1)}>→</button>
                <button title="Edit" onClick={() => setDraft({ id: l.id, name: l.name, url: l.url })}>✎</button>
                <button title="Remove" className="del" onClick={() => persist(links.filter((x) => x.id !== l.id))}>✕</button>
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
