import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTimeDs, formatTimeCs, formatTimeDsRaw } from '../format.ts';

test('formatTimeDs: zero', () => {
  assert.equal(formatTimeDs(0), '0:00:00.0');
});

test('formatTimeDs: 1 second = 10 deciseconds', () => {
  assert.equal(formatTimeDs(10), '0:00:01.0');
});

test('formatTimeDs: 1.5 seconds = 15 deciseconds', () => {
  assert.equal(formatTimeDs(15), '0:00:01.5');
});

test('formatTimeDs: 1 minute', () => {
  assert.equal(formatTimeDs(600), '0:01:00.0');
});

test('formatTimeDs: 1 hour 2 min 3 sec .4ds', () => {
  assert.equal(formatTimeDs(36000 + 1200 + 30 + 4), '1:02:03.4');
});

test('formatTimeCs is alias of formatTimeDs', () => {
  assert.equal(formatTimeCs, formatTimeDs);
});

test('formatTimeDsRaw allows >=60 seconds (no carry)', () => {
  assert.equal(formatTimeDsRaw(0, 1, 65, 3), '0:01:65.3');
});
