// Shared helpers for the migration import pipeline.
// usage: import { ... } from './_lib.ts'

import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repo root, derived from this file's location (`<root>/scripts/_lib.ts`). */
export const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

/** Resolve a path against the repo root. */
export function repoPath(...parts: string[]): string {
  return resolve(REPO_ROOT, ...parts);
}

/** Make sure the directory of the given file path exists. */
export function ensureDir(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
}

/** Make sure the given directory exists (treats arg as a directory). */
export function ensureDirAt(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

/** Read a JSON file. Returns `fallback` when the file is missing. */
export function readJson<T = unknown>(filePath: string, fallback?: T): T {
  if (!existsSync(filePath)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`File not found: ${filePath}`);
  }
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

/**
 * Write JSON to a file, idempotently. Returns `true` if the file was written
 * (changed or new), `false` if the existing content is byte-identical.
 */
export function writeJson(filePath: string, data: unknown): boolean {
  const json = JSON.stringify(data, null, 2) + '\n';
  return writeFileIfChanged(filePath, json);
}

/**
 * Write text content to a file, idempotently. Returns `true` if the file was
 * actually written, `false` if the existing content is byte-identical.
 */
export function writeFileIfChanged(filePath: string, content: string | Buffer): boolean {
  ensureDir(filePath);
  const buf = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
  if (existsSync(filePath)) {
    try {
      const existing = readFileSync(filePath);
      if (existing.equals(buf)) return false;
    } catch {
      /* fall through and overwrite */
    }
  }
  writeFileSync(filePath, buf);
  return true;
}

/** True if a file exists with non-zero size. */
export function fileExistsNonEmpty(filePath: string): boolean {
  if (!existsSync(filePath)) return false;
  try {
    return statSync(filePath).size > 0;
  } catch {
    return false;
  }
}

/** True if `import.meta.url` corresponds to the script being executed. */
export function isMain(metaUrl: string): boolean {
  if (!process.argv[1]) return false;
  return metaUrl === `file://${process.argv[1]}`;
}

/** Sleep for `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* -------------------------------------------------------------------------- */
/* Minimal YAML emitter (frontmatter only — strings, arrays, null, dates).     */
/* -------------------------------------------------------------------------- */

const YAML_SAFE = /^[A-Za-z0-9_./:\-+@][A-Za-z0-9 _./:\-+@]*$/;
const RESERVED = new Set([
  'true',
  'false',
  'null',
  'yes',
  'no',
  'on',
  'off',
  '~',
  '',
]);

/** Quote a YAML scalar string when needed (double-quoted with JSON-like escapes). */
export function yamlString(s: string): string {
  if (s === '') return '""';
  // Always quote if it has characters that would confuse the YAML parser,
  // looks like a number, looks like a reserved word, starts with whitespace, etc.
  const trimmed = s.trim();
  const reservedHit = RESERVED.has(trimmed.toLowerCase());
  const looksNumeric = /^-?\d+(\.\d+)?$/.test(trimmed);
  if (
    !reservedHit &&
    !looksNumeric &&
    YAML_SAFE.test(s) &&
    !s.startsWith(' ') &&
    !s.endsWith(' ')
  ) {
    return s;
  }
  // Double-quote with escapes for backslash, double-quote, control chars.
  const escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `"${escaped}"`;
}

export type YamlScalar = string | number | boolean | null | Date;
export type YamlValue = YamlScalar | YamlScalar[] | undefined;

/** Render a top-level frontmatter object to YAML. Skips undefined values. */
export function renderFrontmatter(data: Record<string, YamlValue>): string {
  const lines: string[] = [];
  for (const [key, raw] of Object.entries(data)) {
    if (raw === undefined) continue;
    if (raw === null) {
      lines.push(`${key}: null`);
      continue;
    }
    if (Array.isArray(raw)) {
      if (raw.length === 0) {
        lines.push(`${key}: []`);
        continue;
      }
      lines.push(`${key}:`);
      for (const item of raw) {
        lines.push(`  - ${renderScalar(item)}`);
      }
      continue;
    }
    lines.push(`${key}: ${renderScalar(raw)}`);
  }
  return lines.join('\n');
}

function renderScalar(v: YamlScalar): string {
  if (v === null) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'null';
  if (v instanceof Date) return v.toISOString();
  return yamlString(String(v));
}

/* -------------------------------------------------------------------------- */
/* Import-report helpers.                                                      */
/* -------------------------------------------------------------------------- */

export interface ImportReport {
  slug_collisions?: Array<{ originalSlug: string; attempted: string; resolved: string }>;
  failed_assets?: Array<{ url: string; error: string }>;
  unmapped_refs?: Array<{ file: string; url: string }>;
  notes?: string[];
}

const REPORT_PATH = repoPath('import-cache', 'import-report.json');

export function loadReport(): ImportReport {
  return readJson<ImportReport>(REPORT_PATH, {});
}

export function saveReport(report: ImportReport): void {
  writeJson(REPORT_PATH, report);
}

/** Merge a partial update into the report file (per-key arrays are replaced). */
export function patchReport(patch: Partial<ImportReport>): void {
  const cur = loadReport();
  saveReport({ ...cur, ...patch });
}
