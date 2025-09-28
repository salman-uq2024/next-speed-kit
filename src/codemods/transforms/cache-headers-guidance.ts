import type { Transform } from 'jscodeshift';

const COMMENT = ' next-speed-kit: set Cache-Control headers for static responses ';

const transform: Transform = (file, api) => {
  const filePath = file.path ?? '';
  const isApiRoute = filePath.includes('/pages/api/') || filePath.includes('/app/api/');

  if (!isApiRoute) {
    return file.source;
  }

  if (file.source.includes('next-speed-kit: set Cache-Control headers')) {
    return file.source;
  }

  const j = api.jscodeshift;
  const root = j(file.source);
  const program = root.get().node.program;
  const [firstNode] = program.body;

  if (firstNode) {
    firstNode.comments = firstNode.comments ?? [];
    firstNode.comments.unshift(j.commentBlock(COMMENT));
  } else {
    const emptyStatement = j.emptyStatement();
    emptyStatement.comments = [j.commentBlock(COMMENT)];
    program.body.unshift(emptyStatement);
  }

  return root.toSource({ quote: 'single' });
};

export default transform;
