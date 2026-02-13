import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Content } from '../data/catalog';
import { useMyList } from '../routes/useMyList';

export default function TitleModal({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: Content | null;
  onClose: () => void;
}) {
  const { has, toggle } = useMyList();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  const firstSeason = item.seasons?.[0];
  const firstEp = firstSeason?.episodes?.[0];

  const playTo = item.kind === 'movie'
    ? `/ver/${item.id}`
    : firstSeason && firstEp
      ? `/ver/${item.id}/s/${firstSeason.id ?? 1}/e/${firstEp.number}`
      : `/ver/${item.id}`;

  return (
    <div className="sb-modalBackdrop" role="dialog" aria-modal="true" aria-label="Detalles">
      <div className="sb-modal">
        <div className="sb-modalHead">
          <div className="sb-modalTitle">
            <div className="sb-h2">{item.title}</div>
            <div className="sb-dim">
              {item.kind === 'movie' ? 'Película' : 'Serie'}
              {item.year ? ` · ${item.year}` : ''}
              {item.duration ? ` · ${item.duration}` : ''}
            </div>
          </div>

          <button className="sb-iconBtn" type="button" onClick={onClose} aria-label="Cerrar">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div className="sb-modalGrid">
          <div className="sb-modalPoster">
            {item.poster ? <img src={item.poster} alt={item.title} /> : <div className="sb-cardFallback" />}
          </div>

          <div className="sb-modalBody">
            {item.synopsis ? <p className="sb-p">{item.synopsis}</p> : null}

            <div className="sb-metaRow">
              {item.genres?.slice(0, 6).map((g) => (
                <span className="sb-pill" key={g}>
                  {g}
                </span>
              ))}
            </div>

            {item.cast?.length ? (
              <div className="sb-block">
                <div className="sb-k">Reparto</div>
                <div className="sb-v">{item.cast.join(', ')}</div>
              </div>
            ) : null}

            {item.curiosity ? (
              <div className="sb-block">
                <div className="sb-k">Dato</div>
                <div className="sb-v">{item.curiosity}</div>
              </div>
            ) : null}

            <div className="sb-row">
              <Link className="sb-btn sb-btnPrimary" to={playTo} onClick={onClose}>
                ▶ Reproducir
              </Link>

              <button className="sb-btn sb-btnGhost" type="button" onClick={() => void toggle(item.id)}>
                {has(item.id) ? 'Quitar de Mi lista' : 'Agregar a Mi lista'}
              </button>
            </div>

            {item.kind === 'series' && item.seasons?.length ? (
              <div className="sb-block">
                <div className="sb-k">Episodios</div>
                <div className="sb-episodes">
                  {item.seasons.slice(0, 2).map((s, si) => (
                    <div key={s.id ?? si} className="sb-season">
                      <div className="sb-seasonTitle">{s.name ?? `Temporada ${s.id ?? si + 1}`}</div>
                      <div className="sb-epGrid">
                        {s.episodes.slice(0, 12).map((ep) => (
                          <Link
                            key={ep.number}
                            className="sb-ep"
                            to={`/ver/${item.id}/s/${s.id ?? si + 1}/e/${ep.number}`}
                            onClick={onClose}
                          >
                            <span className="sb-epN">E{ep.number}</span>
                            <span className="sb-epT">{ep.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sb-dim" style={{ marginTop: 8 }}>
                  (En el modal muestro una parte para mantenerlo ágil; el reproductor soporta el resto.)
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <button className="sb-modalCloseZone" aria-label="Cerrar" onClick={onClose} />
    </div>
  );
}
