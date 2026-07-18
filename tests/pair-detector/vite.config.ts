import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/school-festival-attraction-information-system/pair-detector/dist/',
  plugins: [
    tailwindcss(),
  ]
});
