import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDanmu } from '../parse.ts';
import { resolveOptions } from '../template.ts';
import type { DanmuItem } from '../types.ts';

const opts = resolveOptions();

test('parseDanmu: scrolling white-text danmu uses \\move and Main style', () => {
  const items: DanmuItem[] = [
    { time: 100, text: '你好', position: 0, color: '#FFFFFF' },
  ];
  const out = parseDanmu(items, opts);
  assert.equal(out.length, 1);
  const line = out[0]!.dialogue;
  assert.match(line, /^Dialogue: 0,/);
  assert.match(line, /,Main,/);
  assert.match(line, /\\move\(/);
  assert.equal(out[0]!.styleLine, null);
});

test('parseDanmu: pinned danmu uses \\pos(960,...)', () => {
  const items: DanmuItem[] = [
    { time: 200, text: '釘住', position: 1, color: '#FFFFFF' },
  ];
  const out = parseDanmu(items, opts);
  assert.match(out[0]!.dialogue, /\\pos\(960,/);
});

test('parseDanmu: non-white color emits a Style line on first sighting only', () => {
  const items: DanmuItem[] = [
    { time: 100, text: 'A', position: 0, color: '#FF0000' },
    { time: 200, text: 'B', position: 0, color: '#FF0000' },
    { time: 300, text: 'C', position: 0, color: '#00FF00' },
  ];
  const out = parseDanmu(items, opts);
  assert.notEqual(out[0]!.styleLine, null);
  assert.equal(out[1]!.styleLine, null); // dedup
  assert.notEqual(out[2]!.styleLine, null);
  // dialogue references the hex name
  assert.match(out[0]!.dialogue, /,#FF0000,/);
  assert.match(out[2]!.dialogue, /,#00FF00,/);
});

test('parseDanmu: timestamps reflect deciseconds → H:M:S.D format', () => {
  const items: DanmuItem[] = [
    { time: 36000 + 600 + 35, text: 'x', position: 1, color: '#FFFFFF' },
    // 36000ds = 1h, 600ds = 1min, 30ds = 3s, 5ds remainder
  ];
  const out = parseDanmu(items, opts);
  // start time
  assert.match(out[0]!.dialogue, /Dialogue: 0,1:1:3\.5,/);
});

test('parseDanmu: end-second exceeds 60 (legacy behaviour, no carry)', () => {
  const items: DanmuItem[] = [
    { time: 580, text: 'edge', position: 0, color: '#FFFFFF' },
    // 580 ds = 58s. End second = 58 + danmutime(10) = 68
  ];
  const out = parseDanmu(items, opts);
  assert.match(out[0]!.dialogue, /,0:0:58\.0,0:0:68\.0,/);
});

test('parseDanmu: minute and second NOT zero-padded (legacy parseInt behaviour)', () => {
  const items: DanmuItem[] = [
    { time: 50, text: 'y', position: 1, color: '#FFFFFF' },
    // 50 ds = 5s, output should be `0:0:5.0` not `0:00:05.0`
  ];
  const out = parseDanmu(items, opts);
  assert.match(out[0]!.dialogue, /,0:0:5\.0,/);
});

test('parseDanmu: posY clamped to spaceHeight floor', () => {
  // many pinned in same key -> posY computation could go negative; check clamp
  const items: DanmuItem[] = Array.from({ length: 25 }, (_, i) => ({
    time: 0 + i, // all in same key bucket for Math.floor(t/120) = 0
    text: `t${i}`,
    position: 1,
    color: '#FFFFFF',
  }));
  const out = parseDanmu(items, opts);
  for (const o of out) {
    const m = o.dialogue.match(/\\pos\(960,(-?\d+)\)/);
    assert.ok(m, 'pos extraction failed');
    const y = Number(m![1]);
    assert.ok(y >= opts.spaceHeight, `posY ${y} should be >= spaceHeight ${opts.spaceHeight}`);
  }
});

test('parseDanmu: textOffset uses literal char class /[AZaz09]/ (not a range)', () => {
  // The original code uses /[AZaz09]/g which is a literal *character* class
  // matching only the six chars: A, Z, a, z, 0, 9 — NOT alphanumerics.
  //
  //   "AZaz09" → length 6, all 6 match → 6*60 - 6*30 = 180 → x = 1920 + 180 = 2100
  //   "bcd"    → length 3, 0 match     → 3*60 - 0     = 180 → x = 1920 + 180 = 2100
  //   "5"      → length 1, 0 match     → 1*60 - 0     =  60 → x = 1920 + 60  = 1980
  //   "9"      → length 1, 1 matches   → 1*60 - 1*30  =  30 → x = 1920 + 30  = 1950
  const items: DanmuItem[] = [
    { time: 0, text: 'AZaz09', position: 0, color: '#FFFFFF' },
    { time: 0, text: 'bcd', position: 0, color: '#FFFFFF' },
    { time: 0, text: '5', position: 0, color: '#FFFFFF' },
    { time: 0, text: '9', position: 0, color: '#FFFFFF' },
  ];
  const out = parseDanmu(items, opts);
  assert.match(out[0]!.dialogue, /\\move\(2100, /);
  assert.match(out[1]!.dialogue, /\\move\(2100, /);
  assert.match(out[2]!.dialogue, /\\move\(1980, /);
  assert.match(out[3]!.dialogue, /\\move\(1950, /);
});
