import { useEffect, useMemo, useState } from 'react';
import { getCatalog, type Content } from '../data/catalog';
import { useMyList } from '../routes/useMyList';
import TitleCard from '../components/TitleCard';
import TitleModal from '../components/TitleModal';

export default function MyListPage() {
  const { list } = useMyList();
  const [items, setItems] = useState<Content[]>([]);
  const [selected, setSelected] = useState<Content | null>(null);

  useEffect(() => {
    getCatalog().then(setItems).catch(console.error);
  }, []);

  const mine = useMemo(() => {
    const set = new Set(list);
    return items.filter((x) => set.has(x.id));
  }, [items, list]);

  return (
    <div className="sb-page">
      <header className="sb-topbar">
        <div className="sb-h2">Mi lista</div>
        <div className="sb-dim">{mine.length} guardados</div>
      </header>

      <section className="sb-section">
        {mine.length ? (
          <div className="sb-grid">
            {mine.map((it) => (
              <TitleCard key={it.id} item={it} onOpen={(id) => setSelected(items.find((x) => x.id === id) ?? null)} />
            ))}
          </div>
        ) : (
          <div className="sb-empty">
            <div className="sb-h3">Todavía no guardaste nada</div>
            <div className="sb-dim">Agregá títulos desde Inicio.</div>
          </div>
        )}
      </section>

      <TitleModal open={!!selected} item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
