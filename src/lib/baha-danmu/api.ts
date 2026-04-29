// Fetch danmu via corsproxy.io → Bahamut anime API.
// We require dependency injection of `fetch` so the module is easy to unit-test
// without hitting the network. In the browser, `globalThis.fetch` is available.

import type { DanmuApiResponse, DanmuItem } from './types.js';

export const DANMU_ENDPOINT_BASE =
  'https://corsproxy.io/?https://api.gamer.com.tw/anime/v1/danmu.php';

export type FetchLike = (
  input: string,
  init?: { method?: string; signal?: AbortSignal }
) => Promise<{ ok: boolean; status: number; statusText: string; json: () => Promise<unknown> }>;

/**
 * Build the corsproxy URL used by the tool. Exposed for tests.
 */
export function buildDanmuUrl(sn: number): string {
  if (!Number.isInteger(sn) || sn <= 0) {
    throw new RangeError(`fetchDanmu: invalid sn ${String(sn)}`);
  }
  return `${DANMU_ENDPOINT_BASE}?videoSn=${sn}&geo=TW%2CHK&limit=9999`;
}

/**
 * Fetch danmu from the upstream API.
 *
 * - Throws on non-2xx (with status + statusText).
 * - Throws on malformed response shape.
 * - Throws on empty array (no danmaku to convert).
 *
 * @param sn         Bahamut video SN.
 * @param fetchImpl  Optional fetch implementation. Defaults to `globalThis.fetch`.
 * @param signal     Optional AbortSignal forwarded to fetch.
 */
export async function fetchDanmu(
  sn: number,
  fetchImpl?: FetchLike,
  signal?: AbortSignal
): Promise<DanmuItem[]> {
  const fn = (fetchImpl ?? (globalThis.fetch as unknown as FetchLike | undefined));
  if (typeof fn !== 'function') {
    throw new Error('fetchDanmu: no fetch implementation available');
  }
  const url = buildDanmuUrl(sn);
  const res = await fn(url, { method: 'GET', signal });
  if (!res.ok) {
    throw new Error(`API 回傳錯誤 ${res.status} ${res.statusText}`.trim());
  }
  let body: unknown;
  try {
    body = await res.json();
  } catch (e) {
    throw new Error(`API 回應無法解析為 JSON: ${(e as Error).message}`);
  }

  const typed = body as DanmuApiResponse;
  const list = typed?.data?.danmu;
  if (!Array.isArray(list)) {
    throw new Error('API 回應格式異常 (缺 data.danmu)');
  }
  if (list.length === 0) {
    throw new Error('彈幕為空,無法產生字幕');
  }
  return list;
}
