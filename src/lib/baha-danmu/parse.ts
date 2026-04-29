// Translate raw DanmuItem[] → ParsedDanmu[] (one rendered Dialogue line per item).
//
// The arithmetic here is a faithful 1:1 port of the original Ghost-page
// implementation. We deliberately preserve quirks rather than "fix" them, so
// generated ASS output can be byte-diff'd against the legacy tool.
//
// Quirks worth knowing about (NOT bugs we introduced — they exist upstream):
//
//   1) `dan.text.match(/[AZaz09]/g)` matches only the literal characters
//      A, Z, a, z, 0, 9 — not the alphanumeric range. We replicate that.
//   2) The end-time SECONDS field can exceed 59 (because we add `danmutime`
//      to `time[2]` directly without carrying into the minute). Aegisub
//      tolerates this.
//   3) The decisecond ("centisecond") column is a single digit, not two.
//   4) Color stack key is the raw `#hex` string and the matching Style name
//      embeds `#`. Aegisub accepts non-comma names.

import { buildColorStyle, pickStyle } from './style.js';
import type {
  DanmuItem,
  ParsedDanmu,
  ResolvedOptions,
} from './types.js';

const FAKE_ALPHANUM = /[AZaz09]/g;

interface ParseInternalState {
  /** stack count keyed by `floor(time/100)` for scrolling rows */
  subStack: Record<number, number>;
  /** stack count keyed by `floor(time/120)` for pinned rows */
  subStackForCenter: Record<number, number>;
  /** colors we've already emitted a Style for */
  colorStack: Record<string, true>;
}

/**
 * Pure parse function. Returns one ParsedDanmu per input item.
 * The caller is responsible for joining `dialogue` strings and (deduped)
 * `styleLine` strings into the template's placeholders.
 */
export function parseDanmu(
  items: readonly DanmuItem[],
  opts: ResolvedOptions
): ParsedDanmu[] {
  const state: ParseInternalState = {
    subStack: {},
    subStackForCenter: {},
    colorStack: {},
  };
  const out: ParsedDanmu[] = new Array(items.length);
  for (let i = 0; i < items.length; i++) {
    out[i] = parseOne(items[i] as DanmuItem, state, opts);
  }
  return out;
}

function parseOne(
  dan: DanmuItem,
  state: ParseInternalState,
  opts: ResolvedOptions
): ParsedDanmu {
  const { offset, screenX, screenY, spaceHeight, centerOffsetY, danmutime, danmutimeFixed } = opts;

  // 1) Apply offset. NOTE: original uses `offset * danmutime` — keep as-is.
  const danTime = dan.time + offset * danmutime;

  // 2) Magic textOffset: char count * 60 minus (occurrences of A/Z/a/z/0/9) * 30.
  const fakeAlphaCount = (dan.text.match(FAKE_ALPHANUM) || []).length;
  const textOffset = dan.text.length * 60 - fakeAlphaCount * 30;

  // 3) Time tuple [h, m, s, ds]. parseInt-based truncation in the original
  //    means: floor() for non-negative inputs, and **toward-zero** truncation
  //    for negative ones. We mirror parseInt-on-string semantics with trunc.
  const h = Math.trunc(danTime / 36000);
  const m = Math.trunc(danTime / 600) % 60;
  const s = Math.trunc(danTime / 10) % 60;
  const ds = danTime % 10;

  // 4) Vertical position
  let posY = 0;
  if (dan.position === 0) {
    const key = Math.floor(danTime / 100);
    state.subStack[key] = (state.subStack[key] ?? 0) + 1;
    posY = (state.subStack[key]! * spaceHeight) % (screenY - spaceHeight);
  } else {
    const key = Math.floor(danTime / 120);
    state.subStackForCenter[key] = (state.subStackForCenter[key] ?? 0) + 1;
    posY = screenY - centerOffsetY - state.subStackForCenter[key]! * spaceHeight;
  }
  if (posY < spaceHeight) posY = spaceHeight;

  // 5) Color routing.
  let styleLine: string | null = null;
  let styleName: string;
  if (dan.color !== '#FFFFFF') {
    if (!state.colorStack[dan.color]) {
      state.colorStack[dan.color] = true;
      styleLine = buildColorStyle(dan.color, opts);
    }
    styleName = dan.color;
  } else {
    styleName = pickStyle(dan.color); // returns 'Main'
  }

  // 6) Render the Dialogue line.
  // NOTE: the original code does NOT zero-pad minute/second components in the
  // output (it pads via padStart but then immediately strips with parseInt).
  // We replicate that — output minute/second appear as 1- or 2-digit numbers.
  const startTs = `${h}:${m}:${s}.${ds}`;

  let dialogue: string;
  if (dan.position === 0) {
    const endTs = `${h}:${m}:${s + danmutime}.${ds}`;
    dialogue =
      `Dialogue: 0,${startTs},${endTs},${styleName},,0,0,0,,` +
      `{\\move(${screenX + textOffset}, ${posY}, ${textOffset * -1}, ${posY})}` +
      `${dan.text}\n`;
  } else {
    const endTs = `${h}:${m}:${s + danmutimeFixed}.${ds}`;
    dialogue =
      `Dialogue: 0,${startTs},${endTs},${styleName},,0,0,0,,` +
      `{\\pos(960,${posY})}${dan.text}\n`;
  }

  return { dialogue, styleLine };
}
