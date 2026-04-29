import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTemplate, resolveOptions, DEFAULT_OPTIONS } from '../template.ts';

test('resolveOptions: defaults applied', () => {
  const r = resolveOptions();
  assert.equal(r.screenX, 1920);
  assert.equal(r.screenY, 1080);
  assert.equal(r.fontSize, 40);
  assert.equal(r.danmutime, 10);
  assert.equal(r.danmutimeFixed, 5);
  assert.equal(r.spaceHeight, 50);
  assert.equal(r.centerOffsetY, 140);
  assert.equal(r.offset, 0);
});

test('resolveOptions: overrides take effect', () => {
  const r = resolveOptions({ screenX: 1280, fontSize: 30 });
  assert.equal(r.screenX, 1280);
  assert.equal(r.fontSize, 30);
  assert.equal(r.screenY, 1080); // others retained
});

test('buildTemplate: contains required sections and placeholders', () => {
  const t = buildTemplate(DEFAULT_OPTIONS);
  assert.match(t, /\[Script Info\]/);
  assert.match(t, /\[V4\+ Styles\]/);
  assert.match(t, /\[Events\]/);
  assert.ok(t.includes('{{style}}'), 'should keep {{style}} placeholder');
  assert.ok(t.includes('{{subtitle}}'), 'should keep {{subtitle}} placeholder');
  assert.match(t, /PlayResX: 1920/);
  assert.match(t, /PlayResY: 1080/);
});

test('buildTemplate: trailing-space header lines preserved', () => {
  const t = buildTemplate(DEFAULT_OPTIONS);
  // "Title: " (literal trailing space) is part of the legacy template.
  assert.ok(t.includes('Title: \n'), 'Title: trailing space preserved');
  assert.ok(t.includes('Original Script: \n'), 'Original Script: trailing space preserved');
});

test('buildTemplate: PlayRes parameterizes', () => {
  const t = buildTemplate(resolveOptions({ screenX: 1280, screenY: 720 }));
  assert.match(t, /PlayResX: 1280/);
  assert.match(t, /PlayResY: 720/);
});
