import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { getContent, getEpisodeSrc, getEpisodeVtt, getMovieSrc, type Content } from '../data/catalog';
import { useAuth } from '../routes/AuthProvider';
import { useMyList } from '../routes/useMyList';

type RouteParams = {
  id: string;
  season?: string;
  episode?: string;
};

export default function PlayerPage() {
  const { id, season, episode } = useParams<RouteParams>();
  const { user, profile, updateProfile } = useAuth();
  const { has, toggle } = useMyList();

  const [item, setItem] = useState<Content | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [vtt, setVtt] = useState<string | null>(null);

  const seasonN = season ? Number(season) : null;
  const episodeN = episode ? Number(episode) : null;

  useEffect(() => {
    if (!id) return;
    getContent(id).then(setItem).catch(console.error);
  }, [id]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!id) return;

      if (seasonN && episodeN) {
        const epSrc = await getEpisodeSrc(id, seasonN, episodeN);
        const epVtt = await getEpisodeVtt(id, seasonN, episodeN);
        if (!alive) return;
        setSrc(epSrc);
        setVtt(epVtt);
      } else {
        const mSrc = await getMovieSrc(id);
        if (!alive) return;
        setSrc(mSrc);
        setVtt(null);
      }
    }

    run().catch(console.error);
    return () => {
      alive = false;
    };
  }, [id, seasonN, episodeN]);

  // Progreso local + Supabase (si hay sesión)
  const lastSaved = useRef(0);

  const initialTime = useMemo(() => {
    const p = profile?.watch_progress?.[id ?? ''];
    if (!p?.seconds) return 0;
    // Si estás en serie, respeta season/episode
    if (seasonN && episodeN) {
      if (Number(p.season) === seasonN && Number(p.episode) === episodeN) return Number(p.seconds) || 0;
      return 0;
    }
    return Number(p.seconds) || 0;
  }, [profile?.watch_progress, id, seasonN, episodeN]);

  async function saveProgress(seconds: number) {
    if (!user || !id) return;

    const now = Date.now();
    if (now - lastSaved.current < 5000) return; // throttle 5s
    lastSaved.current = now;

    const next = { ...(profile?.watch_progress ?? {}) };
    next[id] = {
      seconds: Math.floor(seconds),
      season: seasonN ?? null,
      episode: episodeN ?? null,
      updatedAt: new Date().toISOString(),
    };

    await updateProfile({ watch_progress: next } as any);
  }

  if (!item) {
    return (
      <div className="sb-page">
        <div className="sb-section">
          <div className="sb-dim">Cargando…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sb-page">
      <header className="sb-topbar">
        <div className="sb-playerHead">
          <Link className="sb-link" to="/">
            ← Volver
          </Link>
          <div style={{ minWidth: 0 }}>
            <div className="sb-h3 sb-ellipsis">{item.title}</div>
            <div className="sb-dim">
              {item.kind === 'movie' ? 'Película' : 'Serie'}
              {seasonN && episodeN ? ` · T${seasonN}E${episodeN}` : ''}
            </div>
          </div>
        </div>

        <div className="sb-row">
          <button className="sb-btn sb-btnGhost" onClick={() => void toggle(item.id)}>
            {has(item.id) ? 'En Mi lista' : 'Agregar a Mi lista'}
          </button>
        </div>
      </header>

      <section className="sb-section">
        {!src ? (
          <div className="sb-empty">
            <div className="sb-h3">Sin fuente</div>
            <div className="sb-dim">
              No encontré el stream para este título/episodio en los JSON adjuntos.
            </div>
          </div>
        ) : (
          <div className="sb-playerWrap">
            <MediaPlayer
              title={item.title}
              src={src}
              crossOrigin
              playsInline
              volume={0.8}
              onTimeUpdate={(detail) => {
                // @vidstack/react emite number en detail.currentTime (segundos)
                const t = (detail as any)?.currentTime;
                if (typeof t === 'number') void saveProgress(t);
              }}
              currentTime={initialTime}
            >
              <MediaProvider />
              {/* Nota: el CSS de Vidstack ya está linkeado en index.html */}
            </MediaPlayer>

            {vtt ? (
              <div className="sb-dim" style={{ marginTop: 10 }}>
                Thumbs VTT: <a className="sb-link" href={vtt} target="_blank" rel="noreferrer">ver</a>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
