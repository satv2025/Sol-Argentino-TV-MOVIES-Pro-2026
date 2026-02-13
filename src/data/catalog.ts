export type ContentKind = 'movie' | 'series';

export type Episode = {
  number: number;
  title: string;
  description?: string;
  duration?: string;
  thumb?: string;
  src?: string;
  vtt?: string;
};

export type Season = {
  id?: string;
  name?: string;
  episodes: Episode[];
};

export type Content = {
  id: string;
  title: string;
  kind: ContentKind;
  typeLabel?: string;
  year?: string;
  duration?: string;
  genres?: string[];
  poster?: string;
  trailer?: string;
  synopsis?: string;
  curiosity?: string;
  cast?: string[];
  thisTitleIs?: string[];
  ageRating?: string;
  seasons?: Season[];
};

// JSON “tal cual” de los adjuntos
export type CardsData = Record<string, any>;
export type StreamsData = any;
export type VttData = any;

let cache: {
  cards?: CardsData;
  streams?: StreamsData;
  vtt?: VttData;
} = {};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return (await res.json()) as T;
}

export async function loadData() {
  if (!cache.cards) cache.cards = await fetchJson<CardsData>('./data/cardsData.json');
  if (!cache.streams) cache.streams = await fetchJson<StreamsData>('./data/streams.json');
  if (!cache.vtt) cache.vtt = await fetchJson<VttData>('./data/vttVidstack.json');
  return cache as Required<typeof cache>;
}

export async function getCatalog(): Promise<Content[]> {
  const { cards } = await loadData();
  return Object.values(cards).map((x: any) => ({
    id: x.id,
    title: x.title,
    kind: x.seasons ? 'series' : 'movie',
    typeLabel: x.type,
    year: x.year,
    duration: x.duration,
    genres: x.genres,
    poster: x.poster,
    trailer: x.video, // en los adjuntos “video” es trailer
    synopsis: x.synopsis,
    curiosity: x.curiosity,
    cast: x.cast,
    thisTitleIs: x.thisTitleIs,
    ageRating: x.ageRating,
    seasons: x.seasons,
  }));
}

export async function getContent(id: string): Promise<Content | null> {
  const { cards } = await loadData();
  const x = (cards as any)[id];
  if (!x) return null;
  return {
    id: x.id,
    title: x.title,
    kind: x.seasons ? 'series' : 'movie',
    typeLabel: x.type,
    year: x.year,
    duration: x.duration,
    genres: x.genres,
    poster: x.poster,
    trailer: x.video,
    synopsis: x.synopsis,
    curiosity: x.curiosity,
    cast: x.cast,
    thisTitleIs: x.thisTitleIs,
    ageRating: x.ageRating,
    seasons: x.seasons,
  };
}

export async function getMovieSrc(movieId: string): Promise<string | null> {
  const { streams } = await loadData();
  const entry = streams?.movies?.[slugFromId(movieId)];
  return entry?.src ?? null;
}

/**
 * Para series:
 * - Primero intenta streams.json (si existe)
 * - Si no, usa src del mismo cardsData.json (app tiene src por episodio)
 */
export async function getEpisodeSrc(seriesId: string, season: number, episode: number): Promise<string | null> {
  const { streams, cards } = await loadData();

  const sEntry = streams?.series?.[slugFromId(seriesId)]?.seasons?.[String(season)];
  if (Array.isArray(sEntry)) {
    const ep = sEntry.find((x: any) => Number(x.episode) === Number(episode));
    if (ep?.src) return ep.src;
  }

  const c = (cards as any)[seriesId];
  const seasonObj = c?.seasons?.find((x: any) => String(x.id ?? '') === String(season) || String(season) === String((c?.seasons?.indexOf(x) ?? 0) + 1));
  const epObj = seasonObj?.episodes?.find((x: any) => Number(x.number) === Number(episode));
  return epObj?.src ?? null;
}

export async function getEpisodeVtt(seriesId: string, season: number, episode: number): Promise<string | null> {
  const { vtt } = await loadData();
  const entry = vtt?.[seriesId];
  if (!entry?.seasons) return null;

  const seasonObj = entry.seasons.find((s: any) => String(s.id) === String(season));
  const epObj = seasonObj?.episodes?.find((e: any) => Number(e.number) === Number(episode));
  return epObj?.vtt ?? null;
}

/**
 * Mapea IDs cortos a los slugs usados en streams.json.
 * (Los adjuntos están consistentes: mpp, cp1, cpeadc, mpa, mpa2, f2fnh, app, nivelx, reite)
 */
function slugFromId(id: string) {
  const map: Record<string, string> = {
    mpp: 'matias-ponce-2022',
    f2fnh: 'fears-to-fathom-norwood-2025',
    mpa2: 'mi-pobre-angelito-2-1992',
    mpa: 'mi-pobre-angelito-1990',
    cp1: '100-lucha-2008',
    cpeadc: '100-lucha-clones-2009',
    app: 'asesinato-para-principiantes-2024',
    nivelx: 'nivel-x-2009',
    reite: 'reite666',
  };
  return map[id] ?? id;
}
