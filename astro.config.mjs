import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://blog.bgpsekai.club',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap(), mdx(), pagefind()],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
