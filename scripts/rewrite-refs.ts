// Rewrite image URLs in src/content/**/*.md(x) to local relative asset paths.
// usage: tsx scripts/rewrite-refs.ts

import { readdirSync, readFileSync, type Dirent } from 'node:fs';
import { extname, join, relative, dirname } from 'node:path';
import {
  isMain,
  loadReport,
  readJson,
  repoPath,
  saveReport,
  writeFileIfChanged,
} from './_lib.ts';

const MD_IMG_RE = /(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;
const FRONT_FEATURE_RE = /^(featureImage:\s*)(.+?)\s*$/m;

interface RewriteStats {
  files: number;
  rewritten: number;
  unchanged: number;
  unmappedRefs: number;
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

/** Resolve an absolute repo-relative asset path to a path relative to the markdown file. */
function toRelative(fileAbs: string, repoRelTarget: string): string {
  const targetAbs = repoPath(repoRelTarget);
  let rel = relative(dirname(fileAbs), targetAbs);
  if (!rel.startsWith('.')) rel = `./${rel}`;
  // Normalise to forward slashes for portability.
  return rel.split(/[\\/]+/).join('/');
}

function unquoteFrontmatterValue(raw: string): string {
  const trimmed = raw.trim();
  if (
    trimmed.length >= 2 &&
    trimmed.startsWith('"') &&
    trimmed.endsWith('"')
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  if (
    trimmed.length >= 2 &&
    trimmed.startsWith("'") &&
    trimmed.endsWith("'")
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function runRewriteRefs(): RewriteStats {
  const map = readJson<Record<string, string>>(
    repoPath('import-cache', 'asset-map.json'),
    {},
  );
  const stats: RewriteStats = {
    files: 0,
    rewritten: 0,
    unchanged: 0,
    unmappedRefs: 0,
  };
  const unmapped: Array<{ file: string; url: string }> = [];

  for (const dir of [
    repoPath('src', 'content', 'posts'),
    repoPath('src', 'content', 'pages'),
  ]) {
    for (const file of listMarkdownFiles(dir)) {
      stats.files += 1;
      const original = readFileSync(file, 'utf8');
      let updated = original;

      // Body markdown images.
      updated = updated.replace(MD_IMG_RE, (whole, prefix: string, url: string, suffix: string) => {
        if (!/^https?:\/\//i.test(url)) return whole;
        const rel = map[url];
        if (!rel) {
          unmapped.push({ file: relative(repoPath(), file), url });
          return whole;
        }
        const mdRel = toRelative(file, rel);
        return `${prefix}${mdRel}${suffix}`;
      });

      // Frontmatter featureImage (first match in head).
      const split = splitFrontmatter(updated);
      if (split) {
        const fmMatch = FRONT_FEATURE_RE.exec(split.frontmatter);
        if (fmMatch) {
          const rawValue = unquoteFrontmatterValue(fmMatch[2] ?? '');
          if (/^https?:\/\//i.test(rawValue)) {
            const mappedTarget = map[rawValue];
            if (mappedTarget) {
              const mdRel = toRelative(file, mappedTarget);
              const newFm = split.frontmatter.replace(
                FRONT_FEATURE_RE,
                `$1${mdRel}`,
              );
              updated = `---\n${newFm}\n---\n${split.body}`;
            } else {
              unmapped.push({ file: relative(repoPath(), file), url: rawValue });
            }
          }
        }
      }

      if (updated === original) {
        stats.unchanged += 1;
      } else if (writeFileIfChanged(file, updated)) {
        stats.rewritten += 1;
      } else {
        stats.unchanged += 1;
      }
    }
  }

  stats.unmappedRefs = unmapped.length;
  const report = loadReport();
  if (unmapped.length > 0) {
    report.unmapped_refs = unmapped;
  } else {
    delete report.unmapped_refs;
  }
  saveReport(report);

  console.log(
    `[rewrite-refs] files: ${stats.files} / rewritten: ${stats.rewritten} ` +
      `/ unchanged: ${stats.unchanged} / unmapped refs: ${stats.unmappedRefs}`,
  );
  return stats;
}

function splitFrontmatter(content: string): { frontmatter: string; body: string } | null {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) return null;
  return {
    frontmatter: content.slice(4, end),
    body: content.slice(end + 5),
  };
}

if (isMain(import.meta.url)) {
  try {
    runRewriteRefs();
  } catch (err) {
    console.error('[rewrite-refs] failed:', err);
    process.exit(1);
  }
}
