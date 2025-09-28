import type {
  ASTPath,
  ImportDeclaration,
  Transform,
  VariableDeclarator,
} from 'jscodeshift';

const HEAVY_MODULES = [
  'chart.js',
  'react-markdown',
  'react-player',
  'react-syntax-highlighter',
  'highlight.js',
];

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const heavyModules = new Set(HEAVY_MODULES);
  const replacements: Array<{
    local: string;
    source: string;
    path: ASTPath<ImportDeclaration>;
  }> = [];

  root
    .find<VariableDeclarator>(j.VariableDeclarator)
    .forEach((path: ASTPath<VariableDeclarator>) => {
      if (path.node.id.type !== 'Identifier') {
        return;
      }

      const init = path.node.init;
      if (init?.type !== 'CallExpression') {
        return;
      }

      if (init.callee.type !== 'Identifier' || init.callee.name !== 'dynamic') {
        return;
      }

      const firstArg = init.arguments[0];
      if (!firstArg || firstArg.type !== 'ArrowFunctionExpression') {
        return;
      }

      const body = firstArg.body;
      if (body.type !== 'CallExpression') {
        return;
      }

      if (body.callee.type !== 'Identifier' || body.callee.name !== 'import') {
        return;
      }

      const arg = body.arguments[0];
      if (!arg || arg.type !== 'StringLiteral') {
        return;
      }

      heavyModules.delete(arg.value);
    });

  root.find<ImportDeclaration>(j.ImportDeclaration).forEach((path: ASTPath<ImportDeclaration>) => {
    const source = path.node.source.value;
    if (typeof source !== 'string') {
      return;
    }

    if (!heavyModules.has(source)) {
      return;
    }

    const specifiers = path.node.specifiers ?? [];
    if (specifiers.length !== 1) {
      return;
    }

    const [specifier] = specifiers;
    if (specifier.type !== 'ImportDefaultSpecifier') {
      return;
    }

    const localName = specifier.local?.name;
    if (!localName) {
      return;
    }

    replacements.push({ local: localName, source, path });
  });

  if (replacements.length === 0) {
    return file.source;
  }

  const hasDynamicImport = root
    .find<ImportDeclaration>(j.ImportDeclaration, { source: { value: 'next/dynamic' } })
    .size() > 0;

  const firstImport = root.find<ImportDeclaration>(j.ImportDeclaration).at(0);

  if (!hasDynamicImport) {
    const dynamicImport = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier('dynamic'))],
      j.stringLiteral('next/dynamic')
    );

    if (firstImport.size() > 0) {
      firstImport.insertBefore(dynamicImport);
    } else {
      const program = root.get().node.program;
      program.body.unshift(dynamicImport);
    }
  }

  replacements.forEach(({ local, source, path: importPath }) => {
    const declaration = j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(local),
        j.callExpression(j.identifier('dynamic'), [
          j.arrowFunctionExpression(
            [],
            j.callExpression(j.identifier('import'), [j.stringLiteral(source)])
          ),
          j.objectExpression([
            j.objectProperty(j.identifier('ssr'), j.booleanLiteral(false)),
          ]),
        ])
      ),
    ]);

    j(importPath).replaceWith(declaration);
  });

  return root.toSource({ quote: 'single' });
};

export default transform;
