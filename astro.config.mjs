import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import remarkBasePath from './src/utils/remark-base-path.mjs';
import remarkImageAlt from './src/utils/remark-image-alt.mjs';
import remarkDemoteH1 from './src/utils/remark-demote-h1.mjs';
import { readPostIndex } from './src/utils/content-index.mjs';
import { MIN_POSTS_FOR_INDEXED_TAG } from './src/utils/seo-config.mjs';

// `site` and `base` are env-driven so the same config can target two deploy
// targets without code changes:
//
//   * Cloudflare Pages root (production)         — no env, defaults below
//       SITE_URL  = https://blog.bgpsekai.club
//       BASE_PATH = /
//
//   * A subpath host (e.g. GitHub Pages project site) — set via env
//       SITE_URL  = https://<host>
//       BASE_PATH = /<subpath>/
//
// NOTE: the GH Pages preview workflow that used the subpath form was removed
// 2026-09-26 (it mirrored all 169 pages to github.io with self-referencing
// canonicals — duplicate content). Nothing consumes BASE_PATH != '/' today;
// the machinery stays because url.ts / remark-base-path still cover it.
//
// Astro requires `base` to start with `/`; we additionally normalise the
// trailing slash so `import.meta.env.BASE_URL` and the `url()` helper can rely
// on it. Astro itself also normalises but being explicit avoids surprises in
// the helper unit tests.
const SITE_URL = process.env.SITE_URL || 'https://blog.bgpsekai.club';
let BASE_PATH = process.env.BASE_PATH || '/';
if (!BASE_PATH.startsWith('/')) BASE_PATH = '/' + BASE_PATH;
if (!BASE_PATH.endsWith('/')) BASE_PATH = BASE_PATH + '/';

// Sitemap inputs. `lastmod` tells crawlers which posts changed; single-post
// tag pages are served noindex, so they must not be listed either.
const postIndex = readPostIndex(new URL('./src/content/posts', import.meta.url).pathname);
const pathOf = (pageUrl) => new URL(pageUrl).pathname.slice(BASE_PATH.length - 1);

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => {
        const tag = /^\/tag\/([^/]+)\//.exec(pathOf(page));
        return !tag || (postIndex.tagCounts.get(tag[1]) ?? 0) >= MIN_POSTS_FOR_INDEXED_TAG;
      },
      serialize: (item) => {
        const path = pathOf(item.url);
        const post = /^\/([^/]+)\/$/.exec(path);
        const lastmod = path === '/' || path === '/archive/'
          ? postIndex.newest
          : post && postIndex.lastmod.get(post[1]);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
    mdx(),
    pagefind(),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  markdown: {
    // Rewrite post-to-post `[text](/some-slug/)` links so they get the deploy
    // base prepended on subpath builds (e.g. GH Pages `/bgpsekai-blog/`).
    // Idempotent + only touches site-relative anchor links — see plugin doc.
    // remarkImageAlt: body images with an empty alt get "<post title>（圖 N）".
    // remarkDemoteH1: body `#` headings become h2 (the template owns the h1).
    remarkPlugins: [[remarkBasePath, { base: BASE_PATH }], remarkImageAlt, remarkDemoteH1],
  },
});
