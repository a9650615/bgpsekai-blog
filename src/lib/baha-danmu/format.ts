// Time formatting helper.
// The upstream `dan.time` field is in **deciseconds** (1/10 sec) — see
// types.ts for the math. Faithfully ported from the original Ghost page:
//
//   hour   = floor(t / 36000)
//   minute = floor(t / 600) % 60
//   second = floor(t / 10)  % 60
//   ds     = t % 10               // single decisecond digit
//
// The output is rendered as `H:MM:SS.D` where the trailing `.D` is one digit
// (the original code outputs only one digit after the decimal point).
// Aegisub accepts this since the format is `H:MM:SS.cs` with cs being treated
// numerically.

/**
 * Format a deciseconds count to ASS-style `H:MM:SS.D`.
 * NOTE: `seconds + danmutime` overflow (> 59) is intentionally **not** carried
 *       over to the minute, matching the original implementation.
 */
export function formatTimeDs(deciseconds: number): string {
  const t = Math.max(0, Math.floor(deciseconds));
  const h = Math.floor(t / 36000);
  const m = Math.floor(t / 600) % 60;
  const s = Math.floor(t / 10) % 60;
  const d = t % 10;
  return `${h}:${pad2(m)}:${pad2(s)}.${d}`;
}

/**
 * Same as formatTimeDs but lets the seconds component go past 59 — used by
 * the original code when it builds end-time as `time[2] + danmutime`.
 * Returns `H:MM:SS.D` with SS possibly >= 60.
 */
export function formatTimeDsRaw(
  hour: number,
  minute: number,
  rawSecond: number,
  ds: number
): string {
  return `${hour}:${pad2(minute)}:${pad2(rawSecond)}.${ds}`;
}

/** Backwards-compat alias. The original brief talked about "centiseconds" but
 *  in fact `dan.time` is deciseconds. We keep this alias so callers can use
 *  whichever naming they prefer. */
export const formatTimeCs = formatTimeDs;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
