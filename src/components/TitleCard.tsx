import { useEffect, useRef, useState } from 'react';
import type { Content } from '../data/catalog';
import { useMyList } from '../routes/useMyList';

export default function TitleCard({
  item,
  onOpen,
}: {
  item: Content;
  onOpen: (id: string) => void;
}) {
  const { has, toggle } = useMyList();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
  }, [muted]);

  return (
    <article className="sb-card" onClick={() => onOpen(item.id)} role="button" tabIndex={0}
      onMouseEnter={() => { const v = videoRef.current; if (v) { v.currentTime = 0; void v.play().catch(() => {}); } }}
      onMouseLeave={() => { const v = videoRef.current; if (v) { v.pause(); v.currentTime = 0; } }}
    >
      <div className="sb-cardMedia">
        {item.poster ? (
          <img className="sb-cardImg" src={item.poster} alt={item.title} loading="lazy" />
        ) : (
          <div className="sb-cardFallback" aria-hidden="true" />
        )}

        {item.trailer ? (
          <video
            ref={videoRef}
            className="sb-cardVideo"
            src={item.trailer}
            playsInline
            preload="none"
            loop
            muted
          />
        ) : null}

        {item.trailer ? (
          <button
            className="sb-muteBtn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMuted((x) => !x);
            }}
            aria-label={muted ? 'Activar sonido' : 'Silenciar'}
          >
            {muted ? (<i className="fa-solid fa-volume-xmark" aria-hidden="true"></i>) : (<i className="fa-solid fa-volume-high" aria-hidden="true"></i>)}
          </button>
        ) : null}
      </div>

      <div className="sb-cardBody">
        <div className="sb-cardTitle">{item.title}</div>
        <div className="sb-cardMeta">
          <span className="sb-pill">{item.kind === 'movie' ? 'Película' : 'Serie'}</span>
          {item.year ? <span className="sb-dim">{item.year}</span> : null}
          {item.ageRating ? <span className="sb-dim">{item.ageRating}</span> : null}
        </div>

        <div className="sb-cardActions">
          <button
            type="button"
            className={`sb-iconBtn ${has(item.id) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              void toggle(item.id);
            }}
            aria-label={has(item.id) ? 'Quitar de Mi lista' : 'Agregar a Mi lista'}
            title={has(item.id) ? 'Quitar de Mi lista' : 'Agregar a Mi lista'}
          >
            <i className="fa-solid fa-bookmark" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className="sb-iconBtn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(item.id);
            }}
            aria-label="Ver detalles"
            title="Ver detalles"
          >
            ℹ️
          </button>
        </div>
      </div>
    </article>
  );
}
