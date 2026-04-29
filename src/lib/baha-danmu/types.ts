// Public types for the Baha danmu → ASS porting library.
// Field names mirror the upstream API (https://api.gamer.com.tw/anime/v1/danmu.php).

/**
 * Raw danmu item as returned by the Bahamut anime danmu API.
 *
 * `time` is expressed in **deciseconds** (1/10 of a second), not centiseconds —
 * the original Ghost-page implementation derives the hour as `time / 36000`,
 * minute as `(time / 600) % 60`, etc. (Note in the upstream brief about
 * "centiseconds" is incorrect; we follow the source code.)
 *
 * `position`:
 *   - `0` → scrolling danmu (uses `\move()`)
 *   - non-zero → pinned/fixed danmu near bottom (uses `\pos()`)
 *
 * `color` is `#RRGGBB` (uppercase hex). White (`#FFFFFF`) is treated specially
 * and routes to the built-in `Main` style.
 */
export interface DanmuItem {
  /** Time of the danmu in deciseconds (1/10 sec). */
  time: number;
  /** The danmu text content. */
  text: string;
  /** 0 = scrolling, 1+ = pinned at the bottom. */
  position: number;
  /** Color as `#RRGGBB`. */
  color: string;
}

/** Shape of the JSON returned by the upstream danmu API. */
export interface DanmuApiResponse {
  data?: {
    danmu?: DanmuItem[];
  };
}

/** Options consumed by parseDanmu / generateAss. */
export interface ParseOptions {
  /** Offset in seconds (can be negative). Applied as `time + offset * danmutime`. */
  offset?: number;
  /** Override the default screen X (PlayResX). */
  screenX?: number;
  /** Override the default screen Y (PlayResY). */
  screenY?: number;
  /** Vertical pixel spacing between stacked danmaku. */
  spaceHeight?: number;
  /** Vertical offset from bottom for pinned/fixed danmu rows. */
  centerOffsetY?: number;
  /** Duration (in seconds appended to event end) for scrolling danmu. */
  danmutime?: number;
  /** Duration for pinned danmu. */
  danmutimeFixed?: number;
  /** Font size used by the dynamically-generated colored Style entries. */
  fontSize?: number;
  /** Optional progress hook ({i, total}). */
  onProgress?: (i: number, total: number) => void;
}

export type GenerateOptions = ParseOptions;

/** Resolved options with defaults filled. */
export interface ResolvedOptions {
  offset: number;
  screenX: number;
  screenY: number;
  spaceHeight: number;
  centerOffsetY: number;
  danmutime: number;
  danmutimeFixed: number;
  fontSize: number;
}

/** Output of parseDanmu — one rendered Dialogue line plus a possible new Style line. */
export interface ParsedDanmu {
  /** The fully formed `Dialogue: ...` line including trailing newline. */
  dialogue: string;
  /** Newly minted `Style: <#color>,...` line (or `null` if no new style). */
  styleLine: string | null;
}
