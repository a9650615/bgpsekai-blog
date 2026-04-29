// remark plugin: rewrite site-relative markdown link URLs (`[text](/foo/)`)
// so they start with the configured deploy base path. Idempotent — links that
// already begin with the base are left alone, as are external links
// (`http(s)://`, `mailto:`, `tel:`, ...) and fragment-only refs (`#anchor`).
//
// We intentionally skip image nodes (`!\[](/x.png)`) — those resolve through
// Astro's asset pipeline / static rewrites and are not in scope.
//
// At build time the markdown body in `src/content/posts/*.md` is read via the
// content collection; this plugin runs in the unified pipeline before Astro's
// HTML renderer, so the prefix lands inside `<a href>` directly.
import { visit } from 'unist-util-visit';

/**
 * @param {{ base?: string }} [options]
 */
export default function remarkBasePath(options = {}) {
  const base = (options.base || process.env.BASE_PATH || '/').replace(/\/?$/, '/');

  return function transformer(tree) {
    if (base === '/') return; // root deploy: nothing to do
    visit(tree, 'link', (node) => {
      const href = node.url;
      if (!href || typeof href !== 'string') return;
      // Skip externals + protocol-relative + fragment / query-only refs.
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return;
      if (href.startsWith('//')) return;
      if (href.startsWith('#') || href.startsWith('?')) return;
      // Site-relative only.
      if (!href.startsWith('/')) return;
      // Idempotency: already prefixed.
      if (href === base.slice(0, -1) || href.startsWith(base)) return;
      node.url = base.slice(0, -1) + href;
    });
  };
}
