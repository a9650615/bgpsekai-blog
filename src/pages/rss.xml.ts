// /rss.xml — RSS 2.0 feed of the latest 20 posts.
//
// Spec ref: blog-rendering "RSS feed". The spec text says `/rss/` (Ghost
// convention) but tasks.md §7.7 names this file `rss.xml.ts`, and Astro's
// recommended convention is `/rss.xml`. We reconcile by:
//   * physical file: src/pages/rss.xml.ts → emits dist/rss.xml
//   * compatibility redirect: `/rss/ /rss.xml 301` injected at the top of
//     public/_redirects so subscribers of the old Ghost URL are not broken.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const SITE_ORIGIN_FALLBACK = 'https://blog.bgpsekai.club';

export async function GET(context: APIContext) {
  const all = (await getCollection('posts')).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  const latest = all.slice(0, 20);

  // Origin (no base) for the feed `<link>` element; Astro recommends passing
  // `context.site` through here so it picks up env-driven SITE_URL.
  const origin = (context.site?.toString() ?? SITE_ORIGIN_FALLBACK).replace(/\/$/, '');
  // BASE_URL is injected by Vite at build time; ends with '/'.
  const base = import.meta.env.BASE_URL;

  return rss({
    title: '柏狗屁世界',
    description: '柏狗屁世界 — 雜談與筆記。',
    site: origin,
    items: latest.map((post) => {
      const link = `${origin}${base}${post.slug}/`;
      return {
        title: post.data.title,
        link,
        pubDate: post.data.pubDate,
        description: post.data.excerpt ?? '',
        // guid distinct-ish — using link is RSS-idiomatic for a static site.
        customData: post.data.tags
          .map((t) => `<category>${escapeXml(t)}</category>`)
          .join(''),
      };
    }),
    customData: '<language>zh-Hant</language>',
  });
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
