// Replace Ghost hex-encoded tag slugs with Pinyin slugs.
// Patches frontmatter tags in src/content/**/*.md(x) and accumulates redirects.
// usage: tsx scripts/clean-tag-slugs.ts

import { readdirSync, readFileSync, type Dirent } from 'node:fs';
import { extname, join } from 'node:path';
import { pinyin } from 'pinyin-pro';
import {
  isMain,
  loadReport,
  readJson,
  repoPath,
  saveReport,
  writeFileIfChanged,
  writeJson,
  type ImportReport,
} from './_lib.ts';

interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  visibility?: string;
}

interface CleanedTag {
  slug: string;
  originalSlug: string;
  name: string;
  description?: string;
}

interface RedirectEntry {
  from: string;
  to: string;
  status: 301 | 410;
}

const HEX_RE = /^([a-f0-9]{2}-)+[a-f0-9]{2}$/;

export function isHexSlug(slug: string): boolean {
  return HEX_RE.test(slug);
}

export function toPinyinSlug(name: string): string {
  const py = pinyin(name, {
    toneType: 'none',
    type: 'string',
    nonZh: 'removed',
  }) as string;
  const cleaned = py.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return cleaned.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

interface CleanResult {
  tags: CleanedTag[];
  /** old slug → new slug, only for tags whose slug changed. */
  rename: Map<string, string>;
  collisions: NonNullable<ImportReport['slug_collisions']>;
}

export function cleanTagSlugs(rawTags: GhostTag[]): CleanResult {
  const used = new Map<string, number>();
  const rename = new Map<string, string>();
  const collisions: NonNullable<ImportReport['slug_collisions']> = [];
  const cleaned: CleanedTag[] = [];

  // First pass: stable order — keep input ordering for deterministic output.
  for (const t of rawTags) {
    let candidate: string;
    if (isHexSlug(t.slug)) {
      const py = toPinyinSlug(t.name);
      candidate = py || t.slug; // fall back to original if pinyin yields nothing
    } else {
      candidate = t.slug;
    }

    let finalSlug = candidate;
    if (used.has(finalSlug)) {
      const original = candidate;
      let n = (used.get(finalSlug) ?? 1) + 1;
      while (used.has(`${candidate}-${n}`)) n += 1;
      finalSlug = `${candidate}-${n}`;
      collisions.push({
        originalSlug: t.slug,
        attempted: original,
        resolved: finalSlug,
      });
    }
    used.set(finalSlug, 1);
    if (finalSlug !== t.slug) rename.set(t.slug, finalSlug);
    const entry: CleanedTag = {
      slug: finalSlug,
      originalSlug: t.slug,
      name: t.name,
    };
    if (t.description) entry.description = t.description;
    cleaned.push(entry);
  }
  return { tags: cleaned, rename, collisions };
}

/* -------------------------------------------------------------------------- */
/* Frontmatter tag patching.                                                    */
/* -------------------------------------------------------------------------- */

interface ParsedFile {
  frontmatter: string;
  body: string;
}

function splitFrontmatter(content: string): ParsedFile | null {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) return null;
  return {
    frontmatter: content.slice(4, end),
    body: content.slice(end + 5),
  };
}

/**
 * Replace tag slugs inside the frontmatter `tags:` block. Operates only on the
 * exact YAML emitter shape produced by `_lib.ts`:
 *
 *     tags:
 *       - foo
 *       - "bar baz"
 */
export function patchFrontmatterTags(
  content: string,
  rename: Map<string, string>,
): string {
  const split = splitFrontmatter(content);
  if (!split) return content;
  const lines = split.frontmatter.split('\n');
  const out: string[] = [];
  let inTags = false;
  for (const line of lines) {
    const stripped = line.replace(/\s+$/, '');
    if (/^tags:\s*$/.test(stripped)) {
      inTags = true;
      out.push(stripped);
      continue;
    }
    if (/^tags:\s*\[\s*\]\s*$/.test(stripped)) {
      // Empty inline array — nothing to rewrite.
      inTags = false;
      out.push(stripped);
      continue;
    }
    if (inTags) {
      const m = /^( {2}- )(.+)$/.exec(line);
      if (m) {
        const prefix = m[1] ?? '  - ';
        const value = (m[2] ?? '').trim();
        // Strip optional double-quotes for matching.
        const unquoted = value.startsWith('"') && value.endsWith('"')
          ? value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
          : value;
        const replacement = rename.get(unquoted);
        if (replacement) {
          out.push(`${prefix}${replacement}`);
          continue;
        }
        out.push(line);
        continue;
      } else if (line.trim() === '' || /^\S/.test(line)) {
        // End of the tags block.
        inTags = false;
      }
    }
    out.push(line);
  }
  return `---\n${out.join('\n')}\n---\n${split.body}`;
}

function listMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true }) as Dirent[];
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listMarkdownFiles(full));
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (ext === '.md' || ext === '.mdx') out.push(full);
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Redirects accumulator.                                                       */
/* -------------------------------------------------------------------------- */

const PENDING_PATH = repoPath('import-cache', 'redirects-pending.json');

function loadPending(): RedirectEntry[] {
  return readJson<RedirectEntry[]>(PENDING_PATH, []);
}

function mergeRedirects(
  existing: RedirectEntry[],
  incoming: RedirectEntry[],
): RedirectEntry[] {
  const seen = new Set<string>();
  const merged: RedirectEntry[] = [];
  for (const r of [...existing, ...incoming]) {
    const key = `${r.from}::${r.to}::${r.status}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }
  return merged;
}

/* -------------------------------------------------------------------------- */
/* Main.                                                                        */
/* -------------------------------------------------------------------------- */

export function runCleanTagSlugs(): {
  tags: number;
  renamed: number;
  patched: number;
  redirects: number;
} {
  const rawTags = readJson<GhostTag[]>(repoPath('import-cache', 'tags.json'), []);
  const { tags, rename, collisions } = cleanTagSlugs(rawTags);

  // Output canonical tag list.
  writeJson(repoPath('src', 'data', 'tags.json'), tags);

  // Patch markdown frontmatter under posts + pages.
  let patched = 0;
  for (const dir of [
    repoPath('src', 'content', 'posts'),
    repoPath('src', 'content', 'pages'),
  ]) {
    for (const file of listMarkdownFiles(dir)) {
      const cur = readFileSync(file, 'utf8');
      const next = patchFrontmatterTags(cur, rename);
      if (next !== cur) {
        if (writeFileIfChanged(file, next)) patched += 1;
      }
    }
  }

  // Accumulate redirects (idempotent — dedupe by tuple).
  const incoming: RedirectEntry[] = [];
  for (const [from, to] of rename.entries()) {
    incoming.push({
      from: `/tag/${from}/`,
      to: `/tag/${to}/`,
      status: 301,
    });
  }
  const merged = mergeRedirects(loadPending(), incoming);
  writeJson(PENDING_PATH, merged);

  // Update import report.
  const report = loadReport();
  if (collisions.length > 0) report.slug_collisions = collisions;
  saveReport(report);

  console.log(
    `[clean-tag-slugs] tags: ${tags.length} / renamed: ${rename.size} ` +
      `/ patched files: ${patched} / pending redirects: ${merged.length}`,
  );
  return {
    tags: tags.length,
    renamed: rename.size,
    patched,
    redirects: merged.length,
  };
}

if (isMain(import.meta.url)) {
  try {
    runCleanTagSlugs();
  } catch (err) {
    console.error('[clean-tag-slugs] failed:', err);
    process.exit(1);
  }
}
