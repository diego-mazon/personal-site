// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://diego-mazon.github.io/personal-site/
  site: 'https://diego-mazon.github.io',
  base: '/personal-site',
  integrations: [react()]
});