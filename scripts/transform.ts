// Convert Ghost posts/pages HTML into Astro Content Collection Markdown(/MDX).
// usage: tsx scripts/transform.ts

import TurndownService from 'turndown';
// `turndown-plugin-gfm` ships ESM via the package's `module` field.
// @ts-expect-error -- no shipped types for turndown-plugin-gfm
import { gfm } from 'turndown-plugin-gfm';
import {
  isMain,
  readJson,
  renderFrontmatter,
  repoPath,
  writeFileIfChanged,
  type YamlValue,
} from './_lib.ts';

/* -------------------------------------------------------------------------- */
/* Types — only the Ghost fields we touch.                                     */
/* -------------------------------------------------------------------------- */

interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
}

interface GhostContentItem {
  id: string;
  title: string;
  slug: string;
  html?: string | null;
  feature_image?: string | null;
  custom_excerpt?: string | null;
  excerpt?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  canonical_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  primary_author?: GhostAuthor | null;
  authors?: GhostAuthor[];
  tags?: GhostTag[];
  visibility?: string;
}

/* -------------------------------------------------------------------------- */
/* Pages we never want to import as content.                                    */
/* -------------------------------------------------------------------------- */

const SKIP_PAGE_SLUGS = new Set([
  'sample-page',
  'pie-register-forgot-password',
  'pie-register-profile',
  'registration',
  'login-post',
  // Reserved for hand-written feature page (see openspec §13).
  'baha-danmu-to-ass',
]);

/* -------------------------------------------------------------------------- */
/* Turndown configuration.                                                      */
/* -------------------------------------------------------------------------- */

function buildTurndown(): { td: TurndownService; getNeedsMdx: () => boolean; resetMdx: () => void } {
  let needsMdx = false;
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    hr: '---',
  });
  td.use(gfm);

  // Strip Ghost reading-time / signup callouts that survive in HTML.
  td.remove(['style', 'script']);

  /** kg-image-card → ![alt](src) [+ *caption* if figcaption present] */
  td.addRule('kg-image-card', {
    filter: (node) =>
      node.nodeName === 'FIGURE' &&
      hasClass(node, 'kg-image-card') &&
      !hasClass(node, 'kg-gallery-card'),
    replacement: (_content, node) => {
      const img = node.querySelector('img');
      if (!img) return '';
      const src = img.getAttribute('src') ?? '';
      const alt = (img.getAttribute('alt') ?? '').replace(/\s+/g, ' ').trim();
      const fig = node.querySelector('figcaption');
      const caption = fig ? fig.textContent?.replace(/\s+/g, ' ').trim() : '';
      const md = `![${alt}](${src})`;
      return caption ? `\n\n${md}\n*${caption}*\n\n` : `\n\n${md}\n\n`;
    },
  });

  /** kg-gallery-card → consecutive ![](src) lines. */
  td.addRule('kg-gallery-card', {
    filter: (node) => node.nodeName === 'FIGURE' && hasClass(node, 'kg-gallery-card'),
    replacement: (_content, node) => {
      const imgs = Array.from(node.querySelectorAll('img'));
      if (imgs.length === 0) return '';
      const lines = imgs.map((img) => {
        const src = img.getAttribute('src') ?? '';
        const alt = (img.getAttribute('alt') ?? '').replace(/\s+/g, ' ').trim();
        return `![${alt}](${src})`;
      });
      return `\n\n${lines.join('\n\n')}\n\n`;
    },
  });

  /** kg-bookmark-card → [**title**](href)\n> description */
  td.addRule('kg-bookmark-card', {
    filter: (node) => node.nodeName === 'FIGURE' && hasClass(node, 'kg-bookmark-card'),
    replacement: (_content, node) => {
      const anchor = node.querySelector('a.kg-bookmark-container, a');
      const href = anchor?.getAttribute('href') ?? '';
      const title =
        node.querySelector('.kg-bookmark-title')?.textContent?.trim() ??
        anchor?.textContent?.trim() ??
        href;
      const desc = node.querySelector('.kg-bookmark-description')?.textContent?.trim() ?? '';
      const titleEsc = title.replace(/[\[\]]/g, '');
      let out = `\n\n[**${titleEsc}**](${href})\n`;
      if (desc) out += `> ${desc}\n`;
      return out + '\n';
    },
  });

  /** kg-embed-card (YouTube / CodePen / etc.) → keep raw <iframe>; mark MDX. */
  td.addRule('kg-embed-card', {
    filter: (node) => node.nodeName === 'FIGURE' && hasClass(node, 'kg-embed-card'),
    replacement: (_content, node) => {
      const iframe = node.querySelector('iframe');
      if (!iframe) return '';
      needsMdx = true;
      // outerHTML is a string in the DOM API exposed by domino.
      const html = (iframe as unknown as { outerHTML: string }).outerHTML;
      return `\n\n${html}\n\n`;
    },
  });

  return {
    td,
    getNeedsMdx: () => needsMdx,
    resetMdx: () => {
      needsMdx = false;
    },
  };
}

function hasClass(node: { getAttribute(name: string): string | null }, cls: string): boolean {
  const v = node.getAttribute('class');
  if (!v) return false;
  return v.split(/\s+/).includes(cls);
}

/* -------------------------------------------------------------------------- */
/* Frontmatter assembly.                                                        */
/* -------------------------------------------------------------------------- */

function buildFrontmatter(item: GhostContentItem): Record<string, YamlValue> {
  const tags = (item.tags ?? []).map((t) => t.slug);
  const author = item.primary_author?.slug ?? item.authors?.[0]?.slug ?? 'unknown';
  const pub = item.published_at ?? item.created_at ?? null;
  if (!pub) {
    throw new Error(`Item ${item.slug} has no published_at/created_at`);
  }
  const fields: Record<string, YamlValue> = {
    title: item.title,
    slug: item.slug,
    pubDate: pub,
    author,
    tags,
  };
  if (item.updated_at) fields.updatedDate = item.updated_at;
  if (item.feature_image) fields.featureImage = item.feature_image;
  const excerpt = item.custom_excerpt ?? item.excerpt ?? '';
  const cleanedExcerpt = excerpt.replace(/\s+/g, ' ').trim();
  if (cleanedExcerpt) fields.excerpt = cleanedExcerpt;
  if (item.canonical_url) fields.canonicalUrl = item.canonical_url;
  if (item.meta_title) fields.metaTitle = item.meta_title;
  if (item.meta_description) fields.metaDescription = item.meta_description;
  return fields;
}

/* -------------------------------------------------------------------------- */
/* File assembly + writing.                                                     */
/* -------------------------------------------------------------------------- */

function transformItem(
  item: GhostContentItem,
  td: TurndownService,
  getNeedsMdx: () => boolean,
  resetMdx: () => void,
): { ext: '.md' | '.mdx'; content: string } {
  resetMdx();
  const html = item.html ?? '';
  const body = td.turndown(html);
  const ext: '.md' | '.mdx' = getNeedsMdx() ? '.mdx' : '.md';
  const fm = renderFrontmatter(buildFrontmatter(item));
  const cleanedBody = body
    .replace(/[ ]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const file = `---\n${fm}\n---\n\n${cleanedBody}\n`;
  return { ext, content: file };
}

interface TransformStats {
  posts: number;
  pages: number;
  skippedPages: number;
  mdxCount: number;
  written: number;
  unchanged: number;
}

export function runTransform(): TransformStats {
  const posts = readJson<GhostContentItem[]>(repoPath('import-cache', 'posts.json'), []);
  const pages = readJson<GhostContentItem[]>(repoPath('import-cache', 'pages.json'), []);
  const { td, getNeedsMdx, resetMdx } = buildTurndown();

  const stats: TransformStats = {
    posts: 0,
    pages: 0,
    skippedPages: 0,
    mdxCount: 0,
    written: 0,
    unchanged: 0,
  };

  for (const post of posts) {
    const { ext, content } = transformItem(post, td, getNeedsMdx, resetMdx);
    if (ext === '.mdx') stats.mdxCount += 1;
    const out = repoPath('src', 'content', 'posts', `${post.slug}${ext}`);
    if (writeFileIfChanged(out, content)) stats.written += 1;
    else stats.unchanged += 1;
    stats.posts += 1;
  }

  for (const page of pages) {
    if (SKIP_PAGE_SLUGS.has(page.slug)) {
      console.log(`[transform] skip page: ${page.slug}`);
      stats.skippedPages += 1;
      continue;
    }
    if (page.slug !== 'about-me') {
      console.log(`[transform] skip page (not in allow-list): ${page.slug}`);
      stats.skippedPages += 1;
      continue;
    }
    const { ext, content } = transformItem(page, td, getNeedsMdx, resetMdx);
    if (ext === '.mdx') stats.mdxCount += 1;
    const out = repoPath('src', 'content', 'pages', `${page.slug}${ext}`);
    if (writeFileIfChanged(out, content)) stats.written += 1;
    else stats.unchanged += 1;
    stats.pages += 1;
  }

  console.log(
    `[transform] posts: ${stats.posts} / pages: ${stats.pages} / skipped pages: ${stats.skippedPages}`,
  );
  console.log(
    `[transform] mdx: ${stats.mdxCount} / written: ${stats.written} / unchanged: ${stats.unchanged}`,
  );
  return stats;
}

if (isMain(import.meta.url)) {
  try {
    runTransform();
  } catch (err) {
    console.error('[transform] failed:', err);
    process.exit(1);
  }
}
