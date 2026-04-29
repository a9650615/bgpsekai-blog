// Mirror every image referenced by posts/pages into src/assets/.
// usage: tsx scripts/asset-mirror.ts

import { createHash } from 'node:crypto';
import { existsSync, statSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import {
  ensureDir,
  isMain,
  loadReport,
  readJson,
  repoPath,
  saveReport,
  sleep,
  writeJson,
} from './_lib.ts';

interface GhostContentItem {
  slug: string;
  html?: string | null;
  feature_image?: string | null;
}

const GHOST_HOSTS = new Set(['blog.bgpsekai.club']);

const EXT_BY_CT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'image/bmp': '.bmp',
};

/* -------------------------------------------------------------------------- */
/* URL collection.                                                              */
/* -------------------------------------------------------------------------- */

const HTML_IMG_RE = /<img\b[^>]*\bsrc\s*=\s*("([^"]+)"|'([^']+)')/gi;
const MD_IMG_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** Extract every distinct image URL we should mirror from a list of items. */
export function collectUrls(items: GhostContentItem[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    if (item.feature_image) set.add(item.feature_image);
    const html = item.html ?? '';
    for (const m of html.matchAll(HTML_IMG_RE)) {
      const url = m[2] ?? m[3];
      if (url) set.add(url);
    }
    for (const m of html.matchAll(MD_IMG_RE)) {
      const url = m[1];
      if (url) set.add(url);
    }
  }
  return Array.from(set).filter((u) => /^https?:\/\//i.test(u));
}

/* -------------------------------------------------------------------------- */
/* Path planning.                                                               */
/* -------------------------------------------------------------------------- */

interface AssetTarget {
  /** Absolute filesystem path under src/assets. */
  absPath: string;
  /** Path relative to repo root (used as the asset-map value). */
  repoRelPath: string;
}

export function planTarget(url: string): AssetTarget | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (GHOST_HOSTS.has(parsed.hostname)) {
    // Mirror /content/images/... preserving structure. Decode percent-escapes
    // so CJK filenames are stored as literal Unicode on disk — Astro's image
    // resolver decodeURIComponent's paths before fs lookup, and a literal `%`
    // in the filename would never match the decoded reference.
    let pathname: string;
    try {
      pathname = decodeURIComponent(parsed.pathname);
    } catch {
      pathname = parsed.pathname;
    }
    const path = pathname.replace(/^\/+/, '');
    const rel = `src/assets/blog/${path}`;
    return {
      absPath: repoPath(rel),
      repoRelPath: rel,
    };
  }
  // External: hash the URL, derive ext from URL pathname.
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 12);
  const ext = guessExtFromUrl(parsed.pathname);
  const rel = `src/assets/external/${parsed.hostname}/${hash}${ext || ''}`;
  return { absPath: repoPath(rel), repoRelPath: rel };
}

function guessExtFromUrl(pathname: string): string {
  const ext = extname(pathname).toLowerCase();
  if (
    [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.avif',
      '.bmp',
    ].includes(ext)
  ) {
    return ext === '.jpeg' ? '.jpg' : ext;
  }
  return '';
}

function extFromContentType(ct: string | null): string {
  if (!ct) return '';
  const base = ct.split(';')[0]?.trim().toLowerCase() ?? '';
  return EXT_BY_CT[base] ?? '';
}

/* -------------------------------------------------------------------------- */
/* Download with retry.                                                         */
/* -------------------------------------------------------------------------- */

const USER_AGENT = 'Mozilla/5.0 (compatible; bgpsekai-import/1.0)';
const RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface DownloadResult {
  bytes: Buffer;
  contentType: string | null;
}

async function downloadOnce(url: string): Promise<DownloadResult> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'image/*,*/*;q=0.5' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return { bytes: buf, contentType: res.headers.get('content-type') };
}

async function downloadWithRetry(url: string): Promise<DownloadResult> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      return await downloadOnce(url);
    } catch (err) {
      lastErr = err;
      if (attempt < RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/* -------------------------------------------------------------------------- */
/* Main.                                                                        */
/* -------------------------------------------------------------------------- */

export interface MirrorStats {
  total: number;
  downloaded: number;
  skipped: number;
  failed: number;
}

export async function runAssetMirror(): Promise<MirrorStats> {
  const posts = readJson<GhostContentItem[]>(
    repoPath('import-cache', 'posts.json'),
    [],
  );
  const pages = readJson<GhostContentItem[]>(
    repoPath('import-cache', 'pages.json'),
    [],
  );
  const urls = collectUrls([...posts, ...pages]);

  const map: Record<string, string> = {};
  const failures: Array<{ url: string; error: string }> = [];
  const stats: MirrorStats = {
    total: urls.length,
    downloaded: 0,
    skipped: 0,
    failed: 0,
  };

  for (const url of urls) {
    const plan = planTarget(url);
    if (!plan) {
      failures.push({ url, error: 'Could not plan target path' });
      stats.failed += 1;
      continue;
    }
    if (existsSync(plan.absPath) && statSync(plan.absPath).size > 0) {
      map[url] = plan.repoRelPath;
      stats.skipped += 1;
      continue;
    }
    try {
      const dl = await downloadWithRetry(url);
      let absPath = plan.absPath;
      let repoRel = plan.repoRelPath;
      if (!extname(absPath)) {
        const ext = extFromContentType(dl.contentType);
        if (ext) {
          absPath = `${absPath}${ext}`;
          repoRel = `${repoRel}${ext}`;
        }
      }
      ensureDir(absPath);
      writeFileSync(absPath, dl.bytes);
      map[url] = repoRel;
      stats.downloaded += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failures.push({ url, error: msg });
      stats.failed += 1;
    }
  }

  // Sort the map for deterministic output.
  const sortedMap: Record<string, string> = {};
  for (const k of Object.keys(map).sort()) sortedMap[k] = map[k]!;
  writeJson(repoPath('import-cache', 'asset-map.json'), sortedMap);

  // Patch the import report (failures only — empty array clears the field).
  const report = loadReport();
  if (failures.length > 0) {
    report.failed_assets = failures;
  } else {
    delete report.failed_assets;
  }
  saveReport(report);

  console.log(
    `[asset-mirror] total: ${stats.total} / downloaded: ${stats.downloaded} ` +
      `/ skipped: ${stats.skipped} / failed: ${stats.failed}`,
  );
  return stats;
}

if (isMain(import.meta.url)) {
  runAssetMirror().catch((err) => {
    console.error('[asset-mirror] failed:', err);
    process.exit(1);
  });
}
