// Compose the final ASS file from the parsed Dialogue lines and dynamically
// generated Style lines, using the boilerplate template.

import { parseDanmu } from './parse.js';
import { buildTemplate, resolveOptions } from './template.js';
import type {
  DanmuItem,
  GenerateOptions,
  ParsedDanmu,
  ResolvedOptions,
} from './types.js';

/**
 * Stitch parsed danmu into a complete ASS string. Pure function.
 */
export function buildAssFromParsed(
  parsed: readonly ParsedDanmu[],
  opts: ResolvedOptions
): string {
  const subtitle = parsed.map((p) => p.dialogue).join('');
  const styleLines: string[] = [];
  for (const p of parsed) {
    if (p.styleLine !== null) styleLines.push(p.styleLine);
  }
  return buildTemplate(opts)
    .replace('{{subtitle}}', subtitle)
    .replace('{{style}}', styleLines.join(''));
}

/**
 * Convenience: parse + build in one go.
 */
export function generateAss(
  items: readonly DanmuItem[],
  opts: GenerateOptions = {}
): string {
  const resolved = resolveOptions(opts);
  const parsed = parseDanmu(items, resolved);
  return buildAssFromParsed(parsed, resolved);
}
