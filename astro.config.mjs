// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://dmazon.github.io/personal-site/
  site: 'https://dmazon.github.io',
  base: '/personal-site',
  integrations: [react()]
});