import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAINROT_HOME_URL,
  buildBrainrotSnUrl,
  extractBrainrotSn,
} from '../brainrot.ts';

test('brainrot links use the public home page for the generic CTA', () => {
  assert.equal(BRAINROT_HOME_URL, 'https://danmu.bgpsekai.club/');
});

test('brainrot links use the confirmed SN deep-link route', () => {
  assert.equal(
    buildBrainrotSnUrl(50499),
    'https://danmu.bgpsekai.club/sn/50499/'
  );
});

test('brainrot links reject invalid SN values', () => {
  assert.throws(() => buildBrainrotSnUrl(0), /invalid sn/);
  assert.throws(() => buildBrainrotSnUrl(-1), /invalid sn/);
  assert.throws(() => buildBrainrotSnUrl(1.5), /invalid sn/);
});

test('brainrot CTA extracts a pure SN', () => {
  assert.equal(extractBrainrotSn('50499'), 50499);
});

test('brainrot CTA extracts SN from an Anime Crazy URL', () => {
  assert.equal(
    extractBrainrotSn(
      'https://ani.gamer.com.tw/animeVideo.php?foo=bar&sn=50499'
    ),
    50499
  );
});

test('brainrot CTA hides itself for empty, malformed, or embedded digits', () => {
  assert.equal(extractBrainrotSn(''), null);
  assert.equal(extractBrainrotSn('watch episode 50499'), null);
  assert.equal(extractBrainrotSn('https://example.com/?sn=50499'), null);
  assert.equal(extractBrainrotSn('https://ani.gamer.com.tw/animeVideo.php?sn=0'), null);
});
