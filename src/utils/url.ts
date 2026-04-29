/**
 * Build a base-aware in-site URL.
 *
 * Why: when the site is deployed to a project subpath (e.g. GitHub Pages
 * `/bgpsekai-blog/`), every internal `<a href>`, `<link rel>` and SSR-emitted
 * URL must be prefixed with that base. Astro injects the base into automatic
 * routes (so `entry.slug` and `Astro.url.pathname` already include it during
 * SSR), but hand-written hrefs do not — that's what this helper is for.
 *
 * `import.meta.env.BASE_URL` is provided by Astro/Vite and is always
 * normalised to start AND end with a `/` (`/` for root, `/foo/` for a
 * subpath). We rely on that invariant so `url('/x/')` → `${BASE_URL}x/`.
 *
 * Behaviour:
 *   * `url('/foo/')` with BASE_URL `/`              → `/foo/`
 *   * `url('/foo/')` with BASE_URL `/bgpsekai-blog/` → `/bgpsekai-blog/foo/`
 *   * `url('foo/')`  (no leading slash)             → `${BASE_URL}foo/`
 *   * `url('')`                                     → `BASE_URL` itself
 *
 * The helper is intentionally idempotent-friendly for the empty case and
 * leading-slash stripping; it does NOT detect already-prefixed input (callers
 * pass site-relative paths only).
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL; // always ends with '/'
  let p = path;
  if (p.startsWith('/')) p = p.slice(1);
  return base + p;
}
