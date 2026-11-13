// Reads post frontmatter straight from disk for astro.config.mjs, which runs
// before the content collections exist. Only the three fields the sitemap
// needs; the pages themselves keep using `getCollection`.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** @param {string} source  one markdown file's text */
export function parseFrontmatter(source) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!m) return null;
  const fm = m[1];
  const scalar = (key) => {
    const r = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm);
    return r ? r[1].trim().replace(/^["']|["']$/g, '') : undefined;
  };
  const tags = [];
  const block = /^tags:\s*\r?\n((?:[ \t]+-.*\r?\n?)+)/m.exec(fm);
  if (block) {
    for (const line of block[1].split(/\r?\n/)) {
      const t = line.replace(/^[ \t]+-\s*/, '').trim().replace(/^["']|["']$/g, '');
      if (t) tags.push(t);
    }
  }
  return {
    slug: scalar('slug'),
    pubDate: scalar('pubDate'),
    updatedDate: scalar('updatedDate'),
    tags,
  };
}

/**
 * @param {string} dir  src/content/posts
 * @returns {{ lastmod: Map<string, string>, tagCounts: Map<string, number>, newest: string | undefined }}
 */
export function readPostIndex(dir) {
  const lastmod = new Map();
  const tagCounts = new Map();
  let newest;
  for (const name of readdirSync(dir)) {
    if (!/\.mdx?$/.test(name)) continue;
    const fm = parseFrontmatter(readFileSync(join(dir, name), 'utf8'));
    if (!fm) continue;
    const slug = fm.slug ?? name.replace(/\.mdx?$/, '');
    const raw = fm.updatedDate ?? fm.pubDate;
    const date = raw ? new Date(raw) : undefined;
    if (date && !Number.isNaN(date.getTime())) {
      const iso = date.toISOString();
      lastmod.set(slug, iso);
      if (!newest || iso > newest) newest = iso;
    }
    for (const t of fm.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  return { lastmod, tagCounts, newest };
}
