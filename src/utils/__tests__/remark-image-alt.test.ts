import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import remarkImageAlt from '../remark-image-alt.mjs';

const img = (alt: string | null) => ({ type: 'image', url: 'x.jpg', alt });
const run = (children: unknown[], title?: unknown) => {
  const tree = { type: 'root', children: [{ type: 'paragraph', children }] };
  remarkImageAlt()(tree, { data: { astro: { frontmatter: { title } } } });
  return (tree.children[0]!.children as { alt: string | null }[]).map((c) => c.alt);
};

describe('remarkImageAlt', () => {
  it('fills empty alts with the post title and image position', () => {
    assert.deepEqual(run([img(''), img(null)], '開箱'), ['開箱（圖 1）', '開箱（圖 2）']);
  });
  it('keeps hand-written alts and still counts them', () => {
    assert.deepEqual(run([img('主機板'), img('')], '開箱'), ['主機板', '開箱（圖 2）']);
  });
  it('does nothing without a title', () => {
    assert.deepEqual(run([img('')], undefined), ['']);
  });
});
