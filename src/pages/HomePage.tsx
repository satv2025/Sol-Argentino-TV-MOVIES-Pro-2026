import { useEffect, useMemo, useState } from 'react';
import { getCatalog, type Content } from '../data/catalog';
import TitleCard from '../components/TitleCard';
import TitleModal from '../components/TitleModal';

export default function HomePage() {
  const [items, setItems] = useState<Content[]>([]);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<'all' | 'movie' | 'series'>('all');
  const [selected, setSelected] = useState<Content | null>(null);

  useEffect(() => {
    getCatalog().then(setItems).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items
      .filter((x) => (kind === 'all' ? true : x.kind === kind))
      .filter((x) => (s ? x.title.toLowerCase().includes(s) : true));
  }, [items, q, kind]);

  return (
    <div className="sb-page">
      <header className="sb-topbar">
        <div className="sb-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar títulos..."
            aria-label="Buscar"
          />
        </div>

        <div className="sb-filters">
          <button className={`sb-chipBtn ${kind === 'all' ? 'active' : ''}`} onClick={() => setKind('all')}>
            Todo
          </button>
          <button className={`sb-chipBtn ${kind === 'movie' ? 'active' : ''}`} onClick={() => setKind('movie')}>
            Películas
          </button>
          <button className={`sb-chipBtn ${kind === 'series' ? 'active' : ''}`} onClick={() => setKind('series')}>
            Series
          </button>
        </div>
      </header>

      <section className="sb-section">
        <div className="sb-sectionHead">
          <div className="sb-h3">Catálogo</div>
          <div className="sb-dim">Mostrando {filtered.length} títulos</div>
        </div>

        <div className="sb-grid" role="list">
          {filtered.map((it) => (
            <TitleCard key={it.id} item={it} onOpen={(id) => setSelected(items.find((x) => x.id === id) ?? null)} />
          ))}
        </div>

        {!filtered.length ? (
          <div className="sb-empty">
            <div className="sb-h3">Sin resultados</div>
            <div className="sb-dim">Probá con otro nombre.</div>
          </div>
        ) : null}
      </section>

      <TitleModal open={!!selected} item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
