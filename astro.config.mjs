import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ilian-aigner.github.io',
  integrations: [sitemap({ filter: page => !page.endsWith('/cv/') })],
  output: 'static'
});
