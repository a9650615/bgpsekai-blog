import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { documentTitle, metaDescription, relatedPosts } from '../seo.ts';

describe('documentTitle', () => {
  it('appends the site name once', () => {
    assert.equal(documentTitle('[心得]ROG Chakram'), '[心得]ROG Chakram - 柏狗屁世界');
    assert.equal(documentTitle('標籤:開箱 - 柏狗屁世界'), '標籤:開箱 - 柏狗屁世界');
  });
});

describe('metaDescription', () => {
  it('keeps short text and collapses whitespace', () => {
    assert.equal(metaDescription('前端愛好者\n\nemail'), '前端愛好者 email');
  });
  it('drops bracketed link residue from the Ghost import', () => {
    assert.equal(metaDescription('Github [https://github.com/x] 你好'), 'Github 你好');
  });
  it('cuts long text at a sentence end within the limit', () => {
    const text = `${'一'.repeat(100)}。${'二'.repeat(100)}`;
    assert.equal(metaDescription(text), `${'一'.repeat(100)}。`);
  });
  it('falls back to an ellipsis when there is no boundary', () => {
    const out = metaDescription('三'.repeat(400))!;
    assert.equal(out.length, 155);
    assert.ok(out.endsWith('…'));
  });
  it('returns undefined for empty input', () => {
    assert.equal(metaDescription('  \n '), undefined);
    assert.equal(metaDescription(undefined), undefined);
  });
});

describe('relatedPosts', () => {
  const post = (slug: string, tags: string[], day: number, author = 'a') => ({
    slug,
    data: { tags, author, pubDate: new Date(2020, 0, day) },
  });
  const all = [
    post('cur', ['mouse', 'tutorial'], 1),
    post('same-rare-tag', ['mouse'], 2),
    post('same-common-tag', ['tutorial'], 9),
    post('common-2', ['tutorial'], 3),
    post('unrelated-new', [], 20, 'b'),
    post('unrelated-old', [], 4, 'b'),
  ];
  it('ranks a rarely used shared tag above a catch-all one, never itself', () => {
    const got = relatedPosts(all[0]!, all, 3).map((p) => p.slug);
    assert.deepEqual(got, ['same-rare-tag', 'same-common-tag', 'common-2']);
  });
  it('fills up with the newest posts when tags run out', () => {
    const got = relatedPosts(all[0]!, all, 5).map((p) => p.slug);
    assert.deepEqual(got.slice(3), ['unrelated-new', 'unrelated-old']);
  });
});
