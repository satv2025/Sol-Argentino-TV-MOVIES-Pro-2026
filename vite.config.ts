import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Sin hashes: rutas predecibles
        entryFileNames: 'assets/js/app.js',
        chunkFileNames: 'assets/js/chunk-[name].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          if (name.endsWith('.css')) return 'assets/css/app.css';
          return 'assets/[name][extname]';
        },
      },
    },
  },
});
