// remark plugin: give markdown images that have no alt text (`![](x.jpg)`) a
// fallback alt derived from the post title — "<title>（圖 N）".
//
// Why: the Ghost import left most body images with an empty alt, which gives
// image search nothing to index and screen readers nothing to read. A
// hand-written alt always wins; this only fills the blanks, so writing a real
// alt in the markdown is still the better fix for any individual image.
import { visit } from 'unist-util-visit';

export default function remarkImageAlt() {
  return function transformer(tree, file) {
    const title = file?.data?.astro?.frontmatter?.title;
    if (typeof title !== 'string' || !title.trim()) return;
    let n = 0;
    visit(tree, 'image', (node) => {
      n += 1;
      if (typeof node.alt === 'string' && node.alt.trim()) return;
      node.alt = `${title.trim()}（圖 ${n}）`;
    });
  };
}
