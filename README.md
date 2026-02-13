# Sol Argentino TV MOVIES (SATVMOVIES) (Vite + React TS + SCSS)

Plataforma estilo streaming (dark, sin blur, sin gradients) con:
- Inicio (catálogo) + buscador + filtros
- Modal de detalles
- Reproductor Vidstack (HLS m3u8 / MP4)
- Mi lista (localStorage si invitado, Supabase si hay sesión)
- Login / Registro / Cuenta (tabla `public.app_users`)

Los títulos y streams salen de los JSON adjuntos, copiados a `public/data/*`.
- cardsData.json (títulos, posters, trailers, temporadas) fileciteturn1file0
- streams.json (m3u8) fileciteturn1file16
- vttVidstack.json (thumbs VTT) fileciteturn1file5
- full-info-modal.json (info extendida) fileciteturn1file15

> Nota de performance: no se puede “forzar 12450 FPS” desde una webapp; lo que sí hacemos es evitar filtros/blur/gradients y mantener UI liviana.

## Scripts
```bash
npm i
npm run dev
npm run build
npm run preview
```

## Build sin hashes (assets/css y assets/js)
`vite.config.ts` está configurado para que el build quede con:
- `dist/assets/js/app.js`
- `dist/assets/css/app.css`

## Supabase
La conexión está en `src/lib/supabase.ts` con los valores que pasaste.

Tabla esperada: `public.app_users` (FK a `auth.users`).
