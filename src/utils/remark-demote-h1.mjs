// remark plugin: turn `# heading` in a post body into `## heading`.
//
// Why: the page template already renders the post title as the one <h1>. A
// few imported posts use `#` for their sections, which gave those pages four
// to six <h1>s and no usable outline.
import { visit } from 'unist-util-visit';

export default function remarkDemoteH1() {
  return function transformer(tree) {
    visit(tree, 'heading', (node) => {
      if (node.depth === 1) node.depth = 2;
    });
  };
}
