import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import remarkDemoteH1 from '../remark-demote-h1.mjs';

describe('remarkDemoteH1', () => {
  it('demotes h1 only', () => {
    const tree = {
      type: 'root',
      children: [1, 2, 3].map((depth) => ({ type: 'heading', depth, children: [] })),
    };
    remarkDemoteH1()(tree);
    assert.deepEqual(tree.children.map((c) => c.depth), [2, 2, 3]);
  });
});
