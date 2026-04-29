import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchDanmu, buildDanmuUrl, DANMU_ENDPOINT_BASE } from '../api.ts';
import type { FetchLike } from '../api.ts';
import type { DanmuItem } from '../types.ts';

test('buildDanmuUrl uses corsproxy.io and the right query', () => {
  const url = buildDanmuUrl(15577);
  assert.equal(url.startsWith('https://corsproxy.io/?'), true);
  assert.ok(url.startsWith(`${DANMU_ENDPOINT_BASE}?`));
  assert.match(url, /videoSn=15577/);
  assert.match(url, /geo=TW%2CHK/);
  assert.match(url, /limit=9999/);
});

test('buildDanmuUrl rejects bogus sn', () => {
  assert.throws(() => buildDanmuUrl(0), /invalid sn/);
  assert.throws(() => buildDanmuUrl(-1), /invalid sn/);
  assert.throws(() => buildDanmuUrl(1.5), /invalid sn/);
});

test('fetchDanmu returns danmu list on 200 OK', async () => {
  const items: DanmuItem[] = [
    { time: 100, text: 'a', position: 0, color: '#FFFFFF' },
  ];
  const fakeFetch: FetchLike = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ data: { danmu: items } }),
  });
  const got = await fetchDanmu(15577, fakeFetch);
  assert.deepEqual(got, items);
});

test('fetchDanmu throws on non-2xx', async () => {
  const fakeFetch: FetchLike = async () => ({
    ok: false,
    status: 500,
    statusText: 'Server Error',
    json: async () => ({}),
  });
  await assert.rejects(() => fetchDanmu(123, fakeFetch), /500/);
});

test('fetchDanmu throws on malformed body', async () => {
  const fakeFetch: FetchLike = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ unexpected: 'shape' }),
  });
  await assert.rejects(() => fetchDanmu(123, fakeFetch), /格式異常/);
});

test('fetchDanmu throws on empty array', async () => {
  const fakeFetch: FetchLike = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ data: { danmu: [] } }),
  });
  await assert.rejects(() => fetchDanmu(123, fakeFetch), /彈幕為空/);
});
