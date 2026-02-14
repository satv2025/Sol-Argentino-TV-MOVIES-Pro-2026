// Inicializa los parámetros
const player = document.querySelector('#player');  // Referencia al reproductor
const session = await requireAuthOrRedirect();  // Obtiene la sesión del usuario
const movieId = param('movie');  // Obtiene el ID de la película desde los parámetros
const curEpId = param('episode');  // Obtiene el ID del episodio si es una serie

// Función para cargar el progreso guardado
async function loadProgress() {
  let savedProgress = null;
  try {
    savedProgress = await getProgress({
      userId: session.user.id,
      movieId,
      episodeId: curEpId
    });
  } catch (err) {
    console.error("Error al obtener el progreso guardado:", err);
  }

  const startAt = savedProgress?.progress_seconds || 0;  // Tiempo guardado, por defecto 0
  console.log("Progreso guardado:", startAt);
  return startAt;
}

// Configura el reproductor con el progreso guardado
async function configurePlayer() {
  const startAt = await loadProgress();
  const provider = player.provider;

  // Espera a que se carguen los metadatos del video
  player.addEventListener('provider-change', () => {
    if (!provider) return;

    const trySeek = () => {
      const duration = provider.duration || 0;
      if (duration > 0 && startAt > 0) {
        provider.currentTime = startAt;  // Reanudar desde el progreso guardado
        console.log(`Reanudado en ${startAt} segundos`);
        provider.removeEventListener('loadedmetadata', trySeek);  // Elimina el listener después de la primera vez
      }
    };

    provider.addEventListener('loadedmetadata', trySeek);
  }, { once: true });
}

// Guardar el progreso del video
function saveProgress(force = false) {
  const now = Date.now();
  if (!force && now - lastSave < CONFIG.PROGRESS_THROTTLE_MS) return;

  const currentTime = Math.floor(player.currentTime || 0);
  if (!force && currentTime === lastSecond) return;

  lastSecond = currentTime;
  lastSave = now;

  if (currentTime > 0) {
    console.log(`Guardando progreso: ${currentTime} segundos`);
    upsertProgress({
      userId: session.user.id,
      movieId,
      episodeId: curEpId,
      progressSeconds: currentTime
    }).catch(err => console.error("Error al guardar el progreso:", err));
  }
}

// Guardar progreso en eventos de pausa y actualización del tiempo
player.addEventListener('timeupdate', () => saveProgress(false));
player.addEventListener('pause', () => saveProgress(true));

// Guardar progreso al terminar el video
player.addEventListener('ended', async () => {
  await saveProgress(true);
  if (movie.category === 'series') {
    const nextEpisode = episodes[episodes.findIndex(ep => ep.id === curEpId) + 1];
    if (nextEpisode) {
      location.href = `/watch.html?movie=${encodeURIComponent(movieId)}&episode=${encodeURIComponent(nextEpisode.id)}`;
    }
  }
});

// Guardar progreso antes de cerrar la página
window.addEventListener('beforeunload', () => saveProgress(true));

// Inicializar el reproductor al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  configurePlayer();
});