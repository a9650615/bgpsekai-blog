import type { DanmuApiResponse, DanmuItem } from './types.js';

const BAHA_API = 'https://api.gamer.com.tw/anime/v1/danmu.php';

const PROXY_BUILDERS: Array<(target: string) => string> = [
  (t) => `https://corsproxy.io/?${t}`,
  (t) => `https://api.allorigins.win/raw?url=${encodeURIComponent(t)}`,
];

export type FetchLike = (
  input: string,
  init?: { method?: string; signal?: AbortSignal }
) => Promise<{ ok: boolean; status: number; statusText: string; json: () => Promise<unknown> }>;

export function buildDanmuUrl(sn: number, proxyIndex = 0): string {
  if (!Number.isInteger(sn) || sn <= 0) {
    throw new RangeError(`fetchDanmu: invalid sn ${String(sn)}`);
  }
  const target = `${BAHA_API}?videoSn=${sn}&geo=TW%2CHK&limit=9999`;
  if (proxyIndex < PROXY_BUILDERS.length) {
    return PROXY_BUILDERS[proxyIndex](target);
  }
  return target;
}

export async function fetchDanmu(
  sn: number,
  fetchImpl?: FetchLike,
  signal?: AbortSignal
): Promise<DanmuItem[]> {
  const fn = (fetchImpl ?? (globalThis.fetch as unknown as FetchLike | undefined));
  if (typeof fn !== 'function') {
    throw new Error('fetchDanmu: no fetch implementation available');
  }

  const errors: string[] = [];

  for (let i = 0; i < PROXY_BUILDERS.length; i++) {
    const url = buildDanmuUrl(sn, i);
    try {
      const res = await fn(url, { method: 'GET', signal });
      if (!res.ok) {
        errors.push(`proxy ${i}: HTTP ${res.status}`);
        continue;
      }
      let body: unknown;
      try {
        body = await res.json();
      } catch (e) {
        errors.push(`proxy ${i}: JSON parse failed`);
        continue;
      }
      const typed = body as DanmuApiResponse;
      const list = typed?.data?.danmu;
      if (!Array.isArray(list)) {
        errors.push(`proxy ${i}: missing data.danmu`);
        continue;
      }
      if (list.length === 0) {
        throw new Error('彈幕為空,無法產生字幕');
      }
      return list;
    } catch (e) {
      if ((e as Error).message === '彈幕為空,無法產生字幕') throw e;
      if (signal?.aborted) throw e;
      errors.push(`proxy ${i}: ${(e as Error).message}`);
    }
  }

  throw new Error(`所有 CORS 代理皆失敗:\n${errors.join('\n')}`);
}
