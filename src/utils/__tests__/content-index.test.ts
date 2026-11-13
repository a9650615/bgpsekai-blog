import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseFrontmatter, readPostIndex } from '../content-index.mjs';

describe('parseFrontmatter', () => {
  it('reads slug, dates and block-list tags', () => {
    const fm = parseFrontmatter(
      '---\ntitle: "x"\nslug: -e4-b8\npubDate: 2021-06-28T16:21:50.000+08:00\ntags:\n  - prog\n  - "rog"\nupdatedDate: 2021-07-23T17:04:10.000+08:00\n---\nbody\n',
    );
    assert.deepEqual(fm, {
      slug: '-e4-b8',
      pubDate: '2021-06-28T16:21:50.000+08:00',
      updatedDate: '2021-07-23T17:04:10.000+08:00',
      tags: ['prog', 'rog'],
    });
  });
  it('treats `tags: []` as no tags', () => {
    assert.deepEqual(parseFrontmatter('---\nslug: a\ntags: []\n---\n')!.tags, []);
  });
});

describe('readPostIndex', () => {
  it('covers every post in the repo with a valid date', () => {
    const { lastmod, tagCounts } = readPostIndex('src/content/posts');
    assert.ok(lastmod.size > 50);
    for (const iso of lastmod.values()) assert.match(iso, /^\d{4}-\d\d-\d\dT/);
    assert.ok((tagCounts.get('tutorial') ?? 0) > 1);
  });
});
