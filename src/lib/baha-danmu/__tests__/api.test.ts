import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchDanmu, buildDanmuUrl } from '../api.ts';
import type { FetchLike } from '../api.ts';
import type { DanmuItem } from '../types.ts';

test('buildDanmuUrl default uses self-hosted CF worker', () => {
  const url = buildDanmuUrl(15577);
  assert.ok(url.includes('baha-cors-proxy'));
  assert.ok(url.includes('15577'));
});

test('buildDanmuUrl proxyIndex=1 uses corsproxy.io', () => {
  const url = buildDanmuUrl(15577, 1);
  assert.ok(url.includes('corsproxy.io'));
  assert.match(url, /videoSn=15577/);
});

test('buildDanmuUrl proxyIndex=2 uses allorigins', () => {
  const url = buildDanmuUrl(15577, 2);
  assert.ok(url.includes('allorigins.win'));
  assert.ok(url.includes('15577'));
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

test('fetchDanmu falls back to second proxy on first failure', async () => {
  const items: DanmuItem[] = [
    { time: 50, text: 'b', position: 0, color: '#FF0000' },
  ];
  let callCount = 0;
  const fakeFetch: FetchLike = async () => {
    callCount++;
    if (callCount === 1) {
      return { ok: false, status: 503, statusText: 'Unavailable', json: async () => ({}) };
    }
    return { ok: true, status: 200, statusText: 'OK', json: async () => ({ data: { danmu: items } }) };
  };
  const got = await fetchDanmu(15577, fakeFetch);
  assert.deepEqual(got, items);
  assert.equal(callCount, 2);
});

test('fetchDanmu throws when all proxies fail', async () => {
  const fakeFetch: FetchLike = async () => ({
    ok: false,
    status: 500,
    statusText: 'Server Error',
    json: async () => ({}),
  });
  await assert.rejects(() => fetchDanmu(123, fakeFetch), /所有 CORS 代理皆失敗/);
});

test('fetchDanmu throws on malformed body from all proxies', async () => {
  const fakeFetch: FetchLike = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ unexpected: 'shape' }),
  });
  await assert.rejects(() => fetchDanmu(123, fakeFetch), /所有 CORS 代理皆失敗/);
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
