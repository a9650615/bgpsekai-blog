import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import remarkBasePath from './src/utils/remark-base-path.mjs';

// `site` and `base` are env-driven so the same config can target two deploy
// targets without code changes:
//
//   * Cloudflare Pages root (production)         — no env, defaults below
//       SITE_URL  = https://blog.bgpsekai.club
//       BASE_PATH = /
//
//   * GitHub Pages preview at a project subpath  — set in workflow
//       SITE_URL  = https://a9650615.github.io
//       BASE_PATH = /bgpsekai-blog/
//
// Astro requires `base` to start with `/`; we additionally normalise the
// trailing slash so `import.meta.env.BASE_URL` and the `url()` helper can rely
// on it. Astro itself also normalises but being explicit avoids surprises in
// the helper unit tests.
const SITE_URL = process.env.SITE_URL || 'https://blog.bgpsekai.club';
let BASE_PATH = process.env.BASE_PATH || '/';
if (!BASE_PATH.startsWith('/')) BASE_PATH = '/' + BASE_PATH;
if (!BASE_PATH.endsWith('/')) BASE_PATH = BASE_PATH + '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap(), mdx(), pagefind()],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  markdown: {
    // Rewrite post-to-post `[text](/some-slug/)` links so they get the deploy
    // base prepended on subpath builds (e.g. GH Pages `/bgpsekai-blog/`).
    // Idempotent + only touches site-relative anchor links — see plugin doc.
    remarkPlugins: [[remarkBasePath, { base: BASE_PATH }]],
  },
});
