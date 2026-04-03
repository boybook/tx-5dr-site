import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const base = process.env.VITE_BASE_PATH || '/tx-5dr-site/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
});
