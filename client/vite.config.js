import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// One version for the whole project, kept in the root package.json (see scripts/bump.mjs).
const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  server: {
    host: true,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
