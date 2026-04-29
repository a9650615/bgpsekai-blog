// SN extraction from user input.
// Mirrors the original logic at /baha-danmu-to-ass/:
//   1) try to match /ani\.gamer\.com\.tw\/animeVideo.php\?sn=(\d+)/
//   2) otherwise, take the first run of digits in the input
// Both branches are preserved so existing user habits keep working.

const URL_PATTERN = /ani\.gamer\.com\.tw\/animeVideo\.php\?sn=(\d+)/;
const FALLBACK_DIGITS = /\d+/;

/**
 * Extract the Bahamut video SN (a positive integer) from arbitrary user input.
 *
 * Accepts:
 *   - `12345`
 *   - `https://ani.gamer.com.tw/animeVideo.php?sn=12345`
 *   - `https://ani.gamer.com.tw/animeVideo.php?sn=12345&extra=1`
 *   - any string that contains a run of digits (last-resort fallback)
 *
 * Throws if no integer can be extracted.
 */
export function extractSn(input: string): number {
  if (typeof input !== 'string') {
    throw new TypeError('extractSn: input must be a string');
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error('請輸入網站網址或者 sn ID');
  }

  const urlMatch = trimmed.match(URL_PATTERN);
  if (urlMatch && urlMatch[1]) {
    return Number.parseInt(urlMatch[1], 10);
  }

  const digitMatch = trimmed.match(FALLBACK_DIGITS);
  if (digitMatch && digitMatch[0]) {
    return Number.parseInt(digitMatch[0], 10);
  }

  throw new Error('錯誤, 請輸入正確格式');
}
