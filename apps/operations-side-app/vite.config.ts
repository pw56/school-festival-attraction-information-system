import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    svgr()
  ]
});
