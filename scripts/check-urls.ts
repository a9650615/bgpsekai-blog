/**
 * scripts/check-urls.ts — §10.4 Redirect / URL dry-run.
 *
 * Verifies that:
 *  - every URL the migrated site is supposed to serve at status 200 has a
 *    matching `dist/<path>/index.html` (or `dist/<file>`) on disk;
 *  - every URL we want to redirect (301) or kill (410) has a matching rule
 *    in `public/_redirects` with the expected target / status, simulated by a
 *    Cloudflare-Pages-compatible splat matcher (no live server needed).
 *
 * Source URL set:
 *  - `/` and paginated `/page/N/` discovered from `dist/page/*`.
 *  - 69 post URLs derived from `import-cache/posts.json` slugs.
 *  - 1 page URL (`/about-me/`) and 1 feature page URL (`/baha-danmu-to-ass/`).
 *  - All tag URLs from `src/data/tags.json` (every entry has ≥1 post).
 *  - 3 author URLs (`a7612626`, `a9650615`, `sheepdragon`).
 *  - Feed / sitemap / 404.
 *  - 16 hex tag → pinyin tag 301s from `import-cache/redirects-pending.json`.
 *  - 5 WordPress residue 301s + 1 RSS alias 301.
 *  - 4 Ghost-only splat 410s (sample paths).
 *
 * Exit code: 0 if everything green; 1 otherwise.
 *
 * Output: streams [OK] / [FAIL] per check to stdout, prints a summary table,
 * and writes a JSON report to `import-cache/url-check-report.json`.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isMain, readJson, repoPath, writeJson } from './_lib.ts';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Expected =
  | { kind: 'static'; url: string; label: string }
  | { kind: 'redirect'; url: string; target: string; status: 301 | 302; label: string }
  | { kind: 'gone'; url: string; label: string };

interface Rule {
  from: string;
  to: string;
  status: number;
  raw: string;
  /** True if the `from` ends with a `*` splat. */
  splat: boolean;
  /** Pre-built regex anchored to start; the splat (if any) is captured. */
  regex: RegExp;
}

interface CheckResult {
  label: string;
  url: string;
  expected: string;
  actual: string;
  ok: boolean;
}

/* -------------------------------------------------------------------------- */
/* _redirects parsing + matching                                              */
/* -------------------------------------------------------------------------- */

function parseRedirects(text: string): Rule[] {
  const rules: Rule[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;
    const [from, to, statusStr] = parts;
    const status = Number(statusStr);
    if (!Number.isFinite(status)) continue;
    const splat = from.endsWith('*');
    // Build a regex: escape everything, then turn `\*` (escaped *) back into
    // `(.*)` capture group.  Anchored to start and end.
    const escaped = from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '(.*)');
    const regex = new RegExp(`^${escaped}$`);
    rules.push({ from, to, status, raw: line, splat, regex });
  }
  return rules;
}

interface MatchResult {
  rule: Rule;
  resolvedTarget: string;
}

function matchRule(url: string, rules: Rule[]): MatchResult | null {
  for (const rule of rules) {
    const m = rule.regex.exec(url);
    if (!m) continue;
    let resolvedTarget = rule.to;
    if (rule.splat && m[1] !== undefined) {
      resolvedTarget = resolvedTarget.replace(/:splat/g, m[1]);
    }
    return { rule, resolvedTarget };
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Static (200) existence check                                               */
/* -------------------------------------------------------------------------- */

const DIST = repoPath('dist');

/**
 * Map a URL path to a candidate file inside `dist/`.
 *  - `/`           → `dist/index.html`
 *  - `/foo/`       → `dist/foo/index.html`
 *  - `/foo`        → `dist/foo/index.html` (Astro emits trailing-slash dirs)
 *  - `/foo.xml`    → `dist/foo.xml`
 *  - `/404.html`   → `dist/404.html`
 */
function distFileFor(url: string): string[] {
  if (url === '/') return [`${DIST}/index.html`];
  // file with extension, e.g. /rss.xml or /sitemap-0.xml
  if (/\.[a-z0-9]+$/i.test(url)) {
    return [`${DIST}${url}`];
  }
  const trimmed = url.endsWith('/') ? url.slice(0, -1) : url;
  return [`${DIST}${trimmed}/index.html`, `${DIST}${trimmed}.html`];
}

function staticExists(url: string): { ok: boolean; resolved: string | null } {
  for (const path of distFileFor(url)) {
    if (existsSync(path)) return { ok: true, resolved: path };
  }
  return { ok: false, resolved: null };
}

/* -------------------------------------------------------------------------- */
/* Build the expected URL set                                                 */
/* -------------------------------------------------------------------------- */

interface TagShape {
  slug: string;
}
interface PendingRedirect {
  from: string;
  to: string;
  status: number;
}

function discoverPaginationPages(): string[] {
  // dist/page/2, dist/page/3, ... — return /page/N/
  const out: string[] = [];
  const baseDir = repoPath('dist', 'page');
  if (!existsSync(baseDir)) return out;
  for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
    if (entry.isDirectory() && /^\d+$/.test(entry.name)) {
      out.push(`/page/${entry.name}/`);
    }
  }
  out.sort((a, b) => Number(a.match(/(\d+)/)![1]) - Number(b.match(/(\d+)/)![1]));
  return out;
}

function buildExpected(): Expected[] {
  const expected: Expected[] = [];

  // Home + paginated index.
  expected.push({ kind: 'static', url: '/', label: 'home' });
  for (const url of discoverPaginationPages()) {
    expected.push({ kind: 'static', url, label: `pagination ${url}` });
  }

  // 69 posts.  Authoritative slug = `slug:` line in each post's frontmatter
  // (Astro routes by frontmatter slug, which may differ from filename — e.g.
  // 7 React/Laravel posts whose filename strips a leading "-" but whose
  // frontmatter retains it, mirroring Ghost's original URL).
  const contentDir = repoPath('src', 'content', 'posts');
  const postFiles = readdirSync(contentDir).filter(
    (f) => f.endsWith('.md') || f.endsWith('.mdx'),
  );
  for (const file of postFiles) {
    const text = readFileSync(`${contentDir}/${file}`, 'utf8');
    const m = /^slug:\s*(.+?)\s*$/m.exec(text);
    if (!m) {
      throw new Error(`No slug in frontmatter: ${file}`);
    }
    const slug = m[1].replace(/^["']|["']$/g, '');
    expected.push({ kind: 'static', url: `/${slug}/`, label: `post ${slug}` });
  }

  // Pages.
  expected.push({ kind: 'static', url: '/about-me/', label: 'page about-me' });
  expected.push({
    kind: 'static',
    url: '/baha-danmu-to-ass/',
    label: 'feature baha-danmu-to-ass',
  });

  // Tags (every entry in src/data/tags.json has ≥1 post).
  const tags = readJson<TagShape[]>(repoPath('src', 'data', 'tags.json'));
  for (const t of tags) {
    expected.push({ kind: 'static', url: `/tag/${t.slug}/`, label: `tag ${t.slug}` });
  }

  // Authors.
  for (const a of ['a7612626', 'a9650615', 'sheepdragon']) {
    expected.push({ kind: 'static', url: `/author/${a}/`, label: `author ${a}` });
  }

  // Feeds & sitemap.
  expected.push({ kind: 'static', url: '/rss.xml', label: 'rss feed' });
  expected.push({ kind: 'static', url: '/sitemap-index.xml', label: 'sitemap index' });
  expected.push({ kind: 'static', url: '/sitemap-0.xml', label: 'sitemap 0' });
  expected.push({ kind: 'static', url: '/404.html', label: '404 page' });

  // 16 hex → pinyin tag 301s.
  const pending = readJson<PendingRedirect[]>(repoPath('import-cache', 'redirects-pending.json'));
  for (const r of pending) {
    expected.push({
      kind: 'redirect',
      url: r.from,
      target: r.to,
      status: 301,
      label: `tag rename ${r.from}`,
    });
  }

  // 5 WP residue 301s.
  for (const url of [
    '/sample-page/',
    '/pie-register-forgot-password/',
    '/pie-register-profile/',
    '/registration/',
    '/login-post/',
  ]) {
    expected.push({ kind: 'redirect', url, target: '/', status: 301, label: `wp residue ${url}` });
  }

  // 1 RSS alias.
  expected.push({
    kind: 'redirect',
    url: '/rss/',
    target: '/rss.xml',
    status: 301,
    label: 'rss alias',
  });

  // 4 Ghost-only splat 410 samples.
  for (const url of ['/ghost/', '/p/abc/', '/email/abc/', '/members/abc/']) {
    expected.push({ kind: 'gone', url, label: `ghost-only ${url}` });
  }

  return expected;
}

/* -------------------------------------------------------------------------- */
/* Per-URL evaluation                                                         */
/* -------------------------------------------------------------------------- */

function checkOne(e: Expected, rules: Rule[]): CheckResult {
  if (e.kind === 'static') {
    const { ok, resolved } = staticExists(e.url);
    return {
      label: e.label,
      url: e.url,
      expected: '200 (file present)',
      actual: ok ? `200 (${resolved})` : 'missing dist file',
      ok,
    };
  }
  if (e.kind === 'redirect') {
    const m = matchRule(e.url, rules);
    if (!m) {
      return {
        label: e.label,
        url: e.url,
        expected: `${e.status} → ${e.target}`,
        actual: 'no rule matched',
        ok: false,
      };
    }
    const ok = m.rule.status === e.status && m.resolvedTarget === e.target;
    return {
      label: e.label,
      url: e.url,
      expected: `${e.status} → ${e.target}`,
      actual: `${m.rule.status} → ${m.resolvedTarget}`,
      ok,
    };
  }
  // gone
  const m = matchRule(e.url, rules);
  if (!m) {
    return {
      label: e.label,
      url: e.url,
      expected: '410',
      actual: 'no rule matched',
      ok: false,
    };
  }
  const ok = m.rule.status === 410;
  return {
    label: e.label,
    url: e.url,
    expected: '410',
    actual: `${m.rule.status} (matched ${m.rule.from})`,
    ok,
  };
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

interface ReportShape {
  generatedAt: string;
  totals: {
    total: number;
    ok: number;
    fail: number;
    byKind: Record<string, { total: number; ok: number; fail: number }>;
  };
  failures: CheckResult[];
}

async function main(): Promise<void> {
  if (!existsSync(DIST)) {
    console.error('[check-urls] dist/ does not exist — run `npm run build` first.');
    process.exit(2);
  }
  const redirectsPath = repoPath('public', '_redirects');
  if (!existsSync(redirectsPath)) {
    console.error('[check-urls] public/_redirects missing — run scripts/emit-redirects.ts');
    process.exit(2);
  }
  const rules = parseRedirects(readFileSync(redirectsPath, 'utf8'));
  console.log(`[check-urls] parsed ${rules.length} redirect rules from public/_redirects`);

  const expected = buildExpected();
  console.log(`[check-urls] checking ${expected.length} URLs...\n`);

  const results: CheckResult[] = [];
  const totals: ReportShape['totals'] = {
    total: expected.length,
    ok: 0,
    fail: 0,
    byKind: {
      static: { total: 0, ok: 0, fail: 0 },
      redirect: { total: 0, ok: 0, fail: 0 },
      gone: { total: 0, ok: 0, fail: 0 },
    },
  };

  for (let i = 0; i < expected.length; i++) {
    const e = expected[i];
    const r = checkOne(e, rules);
    results.push(r);
    const tag = r.ok ? '[OK]  ' : '[FAIL]';
    const line = `${tag} ${e.kind.padEnd(8)} ${e.url}  →  ${r.actual}`;
    console.log(line);
    totals.byKind[e.kind].total += 1;
    if (r.ok) {
      totals.ok += 1;
      totals.byKind[e.kind].ok += 1;
    } else {
      totals.fail += 1;
      totals.byKind[e.kind].fail += 1;
    }
  }

  console.log('\n[check-urls] Summary');
  console.log(`  total:    ${totals.total}`);
  console.log(`  ok:       ${totals.ok}`);
  console.log(`  fail:     ${totals.fail}`);
  for (const kind of Object.keys(totals.byKind)) {
    const k = totals.byKind[kind];
    console.log(`  ${kind.padEnd(8)} ${k.ok}/${k.total} ok`);
  }

  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    console.log('\n[check-urls] FAILURES:');
    for (const f of failures) {
      console.log(`  - ${f.label} (${f.url}) — expected ${f.expected}, got ${f.actual}`);
    }
  }

  const report: ReportShape = {
    generatedAt: new Date().toISOString(),
    totals,
    failures,
  };
  writeJson(repoPath('import-cache', 'url-check-report.json'), report);
  console.log(`\n[check-urls] report → import-cache/url-check-report.json`);

  process.exit(totals.fail === 0 ? 0 : 1);
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    console.error('[check-urls] fatal:', err);
    process.exit(2);
  });
}
