export const BRAINROT_HOME_URL = 'https://danmu.bgpsekai.club/';

const BAHAMUT_VIDEO_PATH = '/animeVideo.php';

/**
 * Extract an SN only from a plain SN or a Bahamut Anime Crazy video URL.
 * Unlike the legacy parser, this intentionally does not guess from unrelated
 * text because an optional analysis link must never point at the wrong work.
 */
export function extractBrainrotSn(input: string): number | null {
  const value = input.trim();
  if (/^\d+$/.test(value)) {
    const sn = Number.parseInt(value, 10);
    return sn > 0 ? sn : null;
  }

  try {
    const url = new URL(value);
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      url.hostname !== 'ani.gamer.com.tw' ||
      url.pathname !== BAHAMUT_VIDEO_PATH
    ) {
      return null;
    }
    const rawSn = url.searchParams.get('sn');
    if (!rawSn || !/^\d+$/.test(rawSn)) return null;
    const sn = Number.parseInt(rawSn, 10);
    return sn > 0 ? sn : null;
  } catch {
    return null;
  }
}

/** Build the public analysis page for a Bahamut video SN. */
export function buildBrainrotSnUrl(sn: number): string {
  if (!Number.isInteger(sn) || sn <= 0) {
    throw new RangeError(`buildBrainrotSnUrl: invalid sn ${String(sn)}`);
  }
  return `${BRAINROT_HOME_URL}sn/${sn}/`;
}
