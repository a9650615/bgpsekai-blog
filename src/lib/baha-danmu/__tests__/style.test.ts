import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickStyle, buildColorStyle } from '../style.ts';
import { resolveOptions } from '../template.ts';

test('pickStyle returns Main for white', () => {
  assert.equal(pickStyle('#FFFFFF'), 'Main');
});

test('pickStyle returns the literal color for non-white', () => {
  assert.equal(pickStyle('#FF0000'), '#FF0000');
});

test('buildColorStyle reorders #RRGGBB → &H00BBGGRR', () => {
  const opts = resolveOptions({ fontSize: 40 });
  const line = buildColorStyle('#FF0000', opts);
  // primary colour for red should appear as &H000000FF
  assert.match(line, /&H000000FF,/);
  // includes the hex name verbatim (with #) and the font size
  assert.match(line, /^Style: #FF0000,FZLiBian-S02,40,/);
  // the line ends with a newline
  assert.equal(line.endsWith('\n'), true);
});

test('buildColorStyle reorders for blue', () => {
  const opts = resolveOptions();
  const line = buildColorStyle('#0000FF', opts);
  assert.match(line, /&H00FF0000,/);
});
