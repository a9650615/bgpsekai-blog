import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractSn } from '../url.ts';

test('extractSn: pure number', () => {
  assert.equal(extractSn('15577'), 15577);
});

test('extractSn: full URL', () => {
  assert.equal(
    extractSn('https://ani.gamer.com.tw/animeVideo.php?sn=15577'),
    15577
  );
});

test('extractSn: URL with extra query params', () => {
  assert.equal(
    extractSn('https://ani.gamer.com.tw/animeVideo.php?sn=42&utm_source=foo'),
    42
  );
});

test('extractSn: surrounded by whitespace', () => {
  assert.equal(extractSn('   12345   '), 12345);
});

test('extractSn: noise around digits falls through to digit run', () => {
  assert.equal(extractSn('abc 9999 zzz'), 9999);
});

test('extractSn: empty string throws', () => {
  assert.throws(() => extractSn(''), /請輸入/);
});

test('extractSn: no digits throws', () => {
  assert.throws(() => extractSn('hello world'), /錯誤, 請輸入正確格式/);
});
