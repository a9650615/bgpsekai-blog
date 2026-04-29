// Snapshot the Ghost Content + Admin API into `import-cache/`.
// usage: tsx scripts/ghost-export.ts

import { createHmac } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { ensureDirAt, isMain, repoPath, writeFileIfChanged } from './_lib.ts';

interface GhostPagination {
  page: number;
  limit: number | 'all';
  pages: number;
  total: number;
  next: number | null;
  prev: number | null;
}

interface GhostListResponse {
  meta?: { pagination: GhostPagination };
  [extra: string]: unknown;
}

const CACHE_DIR = repoPath('import-cache');

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

/** Hand-rolled HS256 JWT for the Ghost Admin API (no external deps). */
export function makeAdminJwt(adminKey: string, ttlSeconds = 5 * 60): string {
  const [keyId, secretHex] = adminKey.split(':');
  if (!keyId || !secretHex) {
    throw new Error(`GHOST_ADMIN_KEY must be in the form "id:secret_hex"`);
  }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT', kid: keyId };
  const payload = {
    iat: now,
    exp: now + ttlSeconds,
    aud: '/admin/',
  };
  const enc = (obj: unknown): string =>
    Buffer.from(JSON.stringify(obj), 'utf8')
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  const headerB64 = enc(header);
  const payloadB64 = enc(payload);
  const signingInput = `${headerB64}.${payloadB64}`;
  const secret = Buffer.from(secretHex, 'hex');
  const sig = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${signingInput}.${sig}`;
}

interface FetchAllOptions {
  baseUrl: string;
  resource: 'posts' | 'pages' | 'tags' | 'authors';
  contentKey: string;
  /** Extra query params (without `key` and `page`). Already URL-encoded. */
  query?: string;
  /** Page size; Ghost caps at 15 with formats=mobiledoc, allows `all` for tiny lists. */
  limit?: number | 'all';
}

/** Iterate the Content API for a resource, gathering all pages. */
async function fetchAllPages<T = unknown>(opts: FetchAllOptions): Promise<T[]> {
  const { baseUrl, resource, contentKey, query = '', limit = 15 } = opts;
  const out: T[] = [];
  let page = 1;
  while (true) {
    const params = new URLSearchParams();
    params.set('key', contentKey);
    params.set('limit', String(limit));
    if (limit !== 'all') params.set('page', String(page));
    if (query) {
      // Merge raw extra query (no leading ?, may contain `&`).
      for (const piece of query.split('&').filter(Boolean)) {
        const [k, v = ''] = piece.split('=');
        params.set(decodeURIComponent(k), decodeURIComponent(v));
      }
    }
    const url = `${baseUrl}/ghost/api/v4/content/${resource}/?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
    }
    const body = (await res.json()) as GhostListResponse & Record<string, T[]>;
    const items = (body[resource] as T[] | undefined) ?? [];
    out.push(...items);
    const pagination = body.meta?.pagination;
    if (!pagination || pagination.next == null || limit === 'all') break;
    page = pagination.next;
  }
  return out;
}

async function fetchSettings(baseUrl: string, contentKey: string): Promise<unknown> {
  const url = `${baseUrl}/ghost/api/v4/content/settings/?key=${encodeURIComponent(contentKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function fetchRedirectsAdmin(
  baseUrl: string,
  adminKey: string,
): Promise<unknown[]> {
  try {
    const jwt = makeAdminJwt(adminKey);
    const url = `${baseUrl}/ghost/api/v4/admin/redirects/`;
    const res = await fetch(url, {
      headers: { Authorization: `Ghost ${jwt}` },
    });
    if (!res.ok) {
      console.warn(
        `[ghost-export] redirects fetch returned ${res.status} ${res.statusText} — writing []`,
      );
      return [];
    }
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const body = (await res.json()) as unknown;
      if (Array.isArray(body)) return body;
      if (body && typeof body === 'object' && 'redirects' in body) {
        const v = (body as { redirects: unknown }).redirects;
        return Array.isArray(v) ? v : [];
      }
      // Older versions return raw JSON array body.
      return [];
    }
    // Most Ghost installs return application/json with an array.
    return [];
  } catch (err) {
    console.warn(
      `[ghost-export] redirects fetch threw — writing []:`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

interface SnapshotResult {
  posts: number;
  pages: number;
  tags: number;
  authors: number;
  redirects: number;
}

/** Write a JSON file to the cache, logging "skip" if byte-identical. */
function writeCache(name: string, data: unknown): void {
  const filePath = repoPath('import-cache', name);
  const json = JSON.stringify(data, null, 2) + '\n';
  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, 'utf8');
    if (existing === json) {
      console.log(`[ghost-export] ${name}: unchanged (skip)`);
      return;
    }
  }
  const wrote = writeFileIfChanged(filePath, json);
  console.log(`[ghost-export] ${name}: ${wrote ? 'wrote' : 'unchanged'}`);
}

export async function runGhostExport(): Promise<SnapshotResult> {
  const baseUrl = requireEnv('GHOST_URL').replace(/\/+$/, '');
  const contentKey = requireEnv('GHOST_CONTENT_KEY');
  const adminKey = requireEnv('GHOST_ADMIN_KEY');
  ensureDirAt(CACHE_DIR);

  const posts = await fetchAllPages({
    baseUrl,
    resource: 'posts',
    contentKey,
    limit: 15,
    query:
      'include=tags,authors&formats=html,plaintext,mobiledoc&filter=' +
      encodeURIComponent('visibility:public'),
  });
  writeCache('posts.json', posts);

  const pages = await fetchAllPages({
    baseUrl,
    resource: 'pages',
    contentKey,
    limit: 15,
    query: 'include=tags,authors&formats=html,plaintext,mobiledoc',
  });
  writeCache('pages.json', pages);

  const tags = await fetchAllPages({
    baseUrl,
    resource: 'tags',
    contentKey,
    limit: 'all',
    query: 'include=count.posts',
  });
  writeCache('tags.json', tags);

  const authors = await fetchAllPages({
    baseUrl,
    resource: 'authors',
    contentKey,
    limit: 'all',
    query: 'include=count.posts',
  });
  writeCache('authors.json', authors);

  const settings = await fetchSettings(baseUrl, contentKey);
  writeCache('settings.json', settings);

  const redirects = await fetchRedirectsAdmin(baseUrl, adminKey);
  writeCache('redirects-source.json', redirects);

  const summary: SnapshotResult = {
    posts: posts.length,
    pages: pages.length,
    tags: tags.length,
    authors: authors.length,
    redirects: redirects.length,
  };
  console.log(
    `[ghost-export] summary — posts: ${summary.posts} / pages: ${summary.pages} ` +
      `/ tags: ${summary.tags} / authors: ${summary.authors} ` +
      `/ redirects: ${summary.redirects}`,
  );
  return summary;
}

if (isMain(import.meta.url)) {
  runGhostExport().catch((err) => {
    console.error('[ghost-export] failed:', err);
    process.exit(1);
  });
}
