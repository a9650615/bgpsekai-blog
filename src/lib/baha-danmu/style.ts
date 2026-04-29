// Color → ASS Style routing.
//
// Original behaviour (from the Ghost-page inline script):
//   if (dan.color != "#FFFFFF") {
//     // emit a brand-new Style line whose name IS the literal hex string
//     // ("Style: #ff0000,...") and reference it by that same name in
//     // `Dialogue: ...`.
//   } else {
//     // use the pre-defined "Main" style.
//   }
//
// We keep that behaviour exactly. Note: ASS technically allows arbitrary
// non-comma names, including "#ff0000". Aegisub renders this fine.

import type { ResolvedOptions } from './types.js';

/**
 * Decide which Style name to use for a given danmu color.
 * Returns `"Main"` for white, otherwise the literal hex string (e.g. `#FF0000`).
 */
export function pickStyle(color: string): string {
  if (color === '#FFFFFF') return 'Main';
  return color;
}

/**
 * Build the dynamically-emitted Style line for a non-white color.
 * Reorders `#RRGGBB` → ASS primary colour `&H00BBGGRR`.
 *
 * Pure function — used by parse.ts when it first sees a new color.
 */
export function buildColorStyle(color: string, opts: ResolvedOptions): string {
  // (Original code used `String.prototype.substr` which is deprecated.
  //  Switch to `slice` — same numeric semantics for these inputs.)
  const rr = color.slice(1, 3);
  const gg = color.slice(3, 5);
  const bb = color.slice(5, 7);
  return (
    `Style: ${color},FZLiBian-S02,${opts.fontSize},` +
    `&H00${bb}${gg}${rr},&H00FFFFFF,&H00000000,&H00000000,` +
    `-1,0,0,0,100,100,2,0,1,2,2,2,60,60,30,1\n`
  );
}
