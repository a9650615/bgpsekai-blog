// SEO helpers shared by the layout and the list pages. Pure functions so the
// rules can be unit-tested without building the site.

export const SITE_NAME = '柏狗屁世界';

export { MIN_POSTS_FOR_INDEXED_TAG } from './seo-config.mjs';

/** `<title>`: every page carries the site name exactly once. */
export function documentTitle(title: string): string {
  const t = title.trim();
  return t.includes(SITE_NAME) ? t : `${t} - ${SITE_NAME}`;
}

/**
 * Meta description from an excerpt. The imported Ghost excerpts run to 500
 * characters, contain line breaks and `[https://…]` link residue; search
 * engines cut at ~155, usually mid-sentence. Cut on a sentence or word
 * boundary instead.
 */
export function metaDescription(text: string | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const clean = text
    .replace(/\[(https?:\/\/[^\]]*)\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return undefined;
  if (clean.length <= max) return clean;
  const head = clean.slice(0, max);
  // Prefer the last sentence end, then the last clause/word break, as long as
  // it keeps at least 60% of the budget.
  const floor = Math.floor(max * 0.6);
  const sentence = Math.max(...['。', '！', '？', '. ', '! ', '? '].map((p) => head.lastIndexOf(p)));
  if (sentence >= floor) return head.slice(0, sentence + 1).trim();
  const clause = Math.max(...['，', '、', '；', ' ', ','].map((p) => head.lastIndexOf(p)));
  const cut = clause >= floor ? head.slice(0, clause) : head.slice(0, max - 1);
  return `${cut.trim()}…`;
}

interface PostLike {
  slug: string;
  data: { tags: string[]; author: string; pubDate: Date };
}

/**
 * Posts to link from the bottom of a post: most shared tags first (a tag used
 * by few posts counts for more than a catch-all one), then same author, then
 * newest. Always returns up to `limit` posts so every post links sideways,
 * not only to its two date neighbours.
 */
export function relatedPosts<T extends PostLike>(current: T, all: T[], limit = 4): T[] {
  const tagUse = new Map<string, number>();
  for (const p of all) for (const t of p.data.tags) tagUse.set(t, (tagUse.get(t) ?? 0) + 1);
  const mine = new Set(current.data.tags);
  return all
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = 0;
      for (const t of p.data.tags) if (mine.has(t)) score += 1 + 1 / (tagUse.get(t) ?? 1);
      if (p.data.author === current.data.author) score += 0.25;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.getTime() - a.p.data.pubDate.getTime())
    .slice(0, limit)
    .map((x) => x.p);
}
