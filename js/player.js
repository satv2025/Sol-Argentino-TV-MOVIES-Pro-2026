/*  Player SATV + miniaturas VTT (Vidstack 1.11.x)  */

import { renderNav, renderAuthButtons, toast, $, escapeHtml } from './ui.js';
import { requireAuthOrRedirect } from './auth.js';
import {
  fetchMovie,
  fetchEpisodes,
  getProgress,
  upsertProgress
} from './api.js';
import { CONFIG } from './config.js';

/* ─ helpers ─ */
const param = name => new URL(location.href).searchParams.get(name);

function buildEpisodes(list, currentId, movieId) {
  const wrap = $('#episodes-wrap');
  const host = $('#episodes');
  if (!wrap || !host) return;

  if (!list.length) {
    wrap.classList.remove('hidden');
    host.innerHTML = '<div class="muted">No hay episodios cargados.</div>';
    return;
  }

  wrap.classList.remove('hidden');
  host.innerHTML = list.map(ep => {
    const active = ep.id === currentId ? 'active' : '';
    const href =
      `/watch.html?movie=${encodeURIComponent(movieId)}&episode=${encodeURIComponent(ep.id)}`;
    return `<a class="ep ${active}" href="${href}">
              <div class="ep-title">
                T${ep.season}E${ep.episode_number} · ${escapeHtml(ep.title || 'Episodio')}
              </div>
            </a>`;
  }).join('');
}

/* ─ main ─ */
async function init() {
  renderNav({ active: 'home' });
  await renderAuthButtons();

  const session = await requireAuthOrRedirect();
  if (!session) return;

  const movieId = param('movie');
  if (!movieId) { toast('Falta ?movie=', 'error'); return; }

  const player = $('#player');
  const titleEl = $('#title');
  const metaEl = $('#meta');
  const descEl = $('#desc');

  /* ─ cargar película ─ */
  let movie;
  try { movie = await fetchMovie(movieId); }
  catch { toast('No se pudo cargar el título.', 'error'); return; }

  titleEl.textContent = movie.title || 'Sin título';
  descEl.textContent = movie.description || '';
  document.title = `${movie.title || 'Sin título'} · SATV+`;

  let src = movie.m3u8_url;
  let vttUrl = movie.vtt_url || null;

  /* ─ episodios ─ */
  let episodes = [], curEp = null, curEpId = null;
  const epIdParam = param('episode');

  if (movie.category === 'series') {
    episodes = await fetchEpisodes(movieId).catch(() => []);
    curEp = epIdParam
      ? episodes.find(e => e.id === epIdParam) || null
      : episodes[0] || null;

    curEpId = curEp?.id || null;

    if (curEp?.m3u8_url) src = curEp.m3u8_url;
    if (curEp?.vtt_url) vttUrl = curEp.vtt_url;

    metaEl.textContent = curEp
      ? `Serie · S${curEp.season}E${curEp.episode_number}`
      : 'Serie';

    buildEpisodes(episodes, curEpId, movieId);
  } else {
    metaEl.textContent = 'Película';
    $('#episodes-wrap')?.classList.add('hidden');
  }

  /* ─ configurar Vidstack ─ */
  player.src = src;

  /* ─ miniaturas VTT ─ */
  if (vttUrl?.startsWith('http')) {
    player.addEventListener('provider-change', () => {
      let thumbnail = player.querySelector('media-slider-thumbnail');

      if (!thumbnail) {
        const obs = new MutationObserver(() => {
          thumbnail = player.querySelector('media-slider-thumbnail');
          if (!thumbnail) return;

          obs.disconnect();
          thumbnail.src = vttUrl;
        });

        obs.observe(player, { childList: true, subtree: true });
      } else {
        thumbnail.src = vttUrl;
      }
    }, { once: true });
  }

  /* ─ REANUDAR PROGRESO ─ */
  const saved = await getProgress({
    userId: session.user.id,
    movieId,
    episodeId: curEpId
  }).catch(() => null);

  const startAt = saved?.progress_seconds || 0;
  console.log("Progreso guardado:", startAt); // Verificamos el progreso guardado

  // Solo reanudar si hay progreso guardado
  if (startAt > 5) {
    player.addEventListener('canplay', () => {
      console.log("Evento canplay disparado"); // Verificamos si canplay se dispara
      // Esperar un micro-delay para que HLS esté totalmente listo
      setTimeout(() => {
        try {
          console.log("Duración del video:", player.duration); // Verificamos la duración
          if (player.duration && startAt < player.duration - 2) {
            player.currentTime = startAt;
            console.log(`Reanudando en: ${startAt}s`); // Verificamos la reanudación
          }
        } catch (err) {
          console.warn('Seek failed:', err);
        }
      }, 150);
    }, { once: true });
  }

  /* ─ GUARDAR PROGRESO ─ */
  let lastSave = 0;
  let lastSecond = -1;

  const save = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastSave < CONFIG.PROGRESS_THROTTLE_MS) return;

    const ct = Math.floor(player.currentTime || 0);
    if (!force && ct === lastSecond) return;

    lastSecond = ct;
    lastSave = now;

    await upsertProgress({
      userId: session.user.id,
      movieId,
      episodeId: curEpId,
      progressSeconds: ct
    }).catch(console.error);
  };

  player.addEventListener('timeupdate', () => save(false));
  player.addEventListener('pause', () => save(true));

  player.addEventListener('ended', async () => {
    await save(true);

    if (movie.category === 'series') {
      const i = episodes.findIndex(e => e.id === curEpId);
      const next = episodes[i + 1];

      if (next) {
        location.href =
          `/watch.html?movie=${encodeURIComponent(movieId)}&episode=${encodeURIComponent(next.id)}`;
      }
    }
  });

  window.addEventListener('beforeunload', () =>
    upsertProgress({
      userId: session.user.id,
      movieId,
      episodeId: curEpId,
      progressSeconds: Math.floor(player.currentTime || 0)
    }).catch(() => { })
  );
}

/* boot */
document.addEventListener('DOMContentLoaded', init);