import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAss } from '../generate.ts';
import type { DanmuItem } from '../types.ts';

test('generateAss: produces a complete ASS document', () => {
  const items: DanmuItem[] = [
    { time: 100, text: '你好', position: 0, color: '#FFFFFF' },
    { time: 200, text: '紅色', position: 0, color: '#FF0000' },
    { time: 300, text: '釘住', position: 1, color: '#FFFFFF' },
  ];
  const ass = generateAss(items);

  // sections
  assert.match(ass, /\[Script Info\]/);
  assert.match(ass, /\[V4\+ Styles\]/);
  assert.match(ass, /\[Events\]/);

  // baseline styles always present
  assert.match(ass, /Style: Main,FZLiBian-S02,/);
  assert.match(ass, /Style: Story,FZKai-Z03,/);
  assert.match(ass, /Style: ED_JP,/);

  // dynamic style for #FF0000 emitted exactly once
  const matches = ass.match(/Style: #FF0000,/g);
  assert.equal(matches?.length, 1);

  // 3 dialogue lines
  const dialogues = ass.match(/^Dialogue: 0,/gm);
  assert.equal(dialogues?.length, 3);

  // placeholders should be gone
  assert.ok(!ass.includes('{{style}}'));
  assert.ok(!ass.includes('{{subtitle}}'));
});

test('generateAss: empty items produces a header with empty events', () => {
  const ass = generateAss([]);
  assert.match(ass, /\[Events\]/);
  assert.equal(ass.match(/^Dialogue:/gm), null);
});

test('generateAss: offset shifts time (offset * danmutime)', () => {
  const items: DanmuItem[] = [
    { time: 100, text: 'x', position: 1, color: '#FFFFFF' },
  ];
  const a0 = generateAss(items, { offset: 0 });
  const a5 = generateAss(items, { offset: 5 });
  // offset 5 sec → adds 5*10=50 ds → 100 + 50 = 150 → 0:0:15.0
  assert.match(a5, /,0:0:15\.0,/);
  // baseline 100 ds → 0:0:10.0
  assert.match(a0, /,0:0:10\.0,/);
});
