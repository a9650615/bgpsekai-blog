// Plain .mjs so both astro.config.mjs (sitemap filter) and the pages (robots
// meta) read the same number.

/**
 * A tag page that lists fewer posts than this is a near-copy of the post it
 * lists, so it is served `noindex,follow` and left out of the sitemap. The
 * page itself stays reachable: old Ghost tag URLs keep working for readers.
 */
export const MIN_POSTS_FOR_INDEXED_TAG = 2;
