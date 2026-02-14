import { renderNav, renderAuthButtons, toast, $, escapeHtml } from "./ui.js";
import { requireAuthOrRedirect } from "./auth.js";
import { createMovie, createEpisode, fetchByCategory } from "./api.js";
import { CONFIG } from "./config.js";

function isAdmin(email) {
  if (!CONFIG.ADMIN_EMAILS || !CONFIG.ADMIN_EMAILS.length) return true;
  return CONFIG.ADMIN_EMAILS.map(x => String(x).toLowerCase())
    .includes(String(email || "").toLowerCase());
}

async function loadSeriesSelect() {
  const series = await fetchByCategory("series", 500);
  const sel = $("#ep-series");
  sel.innerHTML = `<option value="">Seleccioná una serie…</option>` + series
    .map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.title)}</option>`)
    .join("");
}

function moviePayload() {
  return {
    category: $("#m-category").value,
    title: $("#m-title").value.trim(),
    description: $("#m-desc").value.trim(),
    thumbnail_url: $("#m-thumb").value.trim(),
    banner_url: $("#m-banner").value.trim(),
    m3u8_url: $("#m-m3u8").value.trim(),
    vtt_url: $("#m-vtt").value.trim() || null, // 🔥 NUEVO
  };
}

function validateMovie(m) {
  if (!m.category || !["movie", "series"].includes(m.category))
    return "Categoría inválida";
  if (!m.title) return "Falta título";
  if (!m.m3u8_url) return "Falta m3u8_url";
  return null;
}

function episodePayload() {
  return {
    series_id: $("#ep-series").value,
    season: Number($("#ep-season").value),
    episode_number: Number($("#ep-number").value),
    title: $("#ep-title").value.trim(),
    m3u8_url: $("#ep-m3u8").value.trim(),
    vtt_url: $("#ep-vtt").value.trim() || null, // 🔥 NUEVO
  };
}

function validateEpisode(e) {
  if (!e.series_id) return "Elegí una serie";
  if (!Number.isFinite(e.season) || e.season < 1)
    return "Temporada inválida";
  if (!Number.isFinite(e.episode_number) || e.episode_number < 1)
    return "Episodio inválido";
  if (!e.m3u8_url) return "Falta m3u8_url episodio";
  return null;
}

async function init() {
  renderNav({ active: "upload" });
  await renderAuthButtons();

  const session = await requireAuthOrRedirect();
  if (!session) return;

  const email = session.user.email || "";
  if (!isAdmin(email)) {
    $("#upload-root").innerHTML = `
      <div class="panel">
        <h2>Acceso denegado</h2>
        <p class="muted">Esta sección es solo para admins.</p>
      </div>
    `;
    return;
  }

  try {
    await loadSeriesSelect();
  } catch (e) {
    console.error(e);
    toast("No se pudieron cargar series.", "error");
  }

  $("#movie-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const m = moviePayload();
    const err = validateMovie(m);
    if (err) return toast(err, "error");

    try {
      const created = await createMovie(m);
      toast(`Creado: ${m.category} (${created.id})`, "success");
      ev.target.reset();
      await loadSeriesSelect();
    } catch (e) {
      console.error(e);
      toast(e.message || "Error creando título", "error");
    }
  });

  $("#episode-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const ep = episodePayload();
    const err = validateEpisode(ep);
    if (err) return toast(err, "error");

    try {
      const created = await createEpisode(ep);
      toast(`Episodio creado (${created.id})`, "success");
      ev.target.reset();
    } catch (e) {
      console.error(e);
      toast(e.message || "Error creando episodio", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", init);