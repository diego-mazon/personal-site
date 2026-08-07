// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://diego-mazon.github.io/personal-site/
  site: 'https://diego-mazon.github.io',
  base: '/personal-site',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});