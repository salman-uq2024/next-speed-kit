import type {
  ASTPath,
  ImportDeclaration,
  JSXAttribute,
  JSXIdentifier,
  JSXOpeningElement,
  Transform,
} from 'jscodeshift';

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 360;

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const imageAliases = new Set<string>();

  root
    .find<ImportDeclaration>(j.ImportDeclaration, { source: { value: 'next/image' } })
    .forEach((path: ASTPath<ImportDeclaration>) => {
      path.node.specifiers?.forEach((specifier) => {
        if (specifier.type === 'ImportDefaultSpecifier') {
          const localName = specifier.local?.name;
          if (localName) {
            imageAliases.add(localName);
          }
        }
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === 'Image'
        ) {
          imageAliases.add(specifier.local?.name ?? 'Image');
        }
      });
    });

  if (imageAliases.size === 0) {
    return file.source;
  }

  root.find<JSXOpeningElement>(j.JSXOpeningElement).forEach((path: ASTPath<JSXOpeningElement>) => {
    if (path.node.name.type !== 'JSXIdentifier') {
      return;
    }

    const identifier = path.node.name as JSXIdentifier;
    if (!imageAliases.has(identifier.name)) {
      return;
    }

    const attributes = path.node.attributes ?? [];
    const hasFill = attributes.some((attr) => isAttributeNamed(attr, 'fill'));

    if (hasFill) {
      return;
    }

    const hasWidth = attributes.some((attr) => isAttributeNamed(attr, 'width'));
    const hasHeight = attributes.some((attr) => isAttributeNamed(attr, 'height'));

    if (hasWidth && hasHeight) {
      return;
    }

    const newAttributes = [...attributes];

    if (!hasWidth) {
      newAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('width'),
          j.jsxExpressionContainer(j.numericLiteral(DEFAULT_WIDTH))
        )
      );
    }

    if (!hasHeight) {
      newAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('height'),
          j.jsxExpressionContainer(j.numericLiteral(DEFAULT_HEIGHT))
        )
      );
    }

    path.node.attributes = newAttributes;
  });

  return root.toSource({ quote: 'single' });
};

const isAttributeNamed = (attr: JSXAttribute | unknown, name: string): boolean => {
  if (!attr || typeof attr !== 'object') {
    return false;
  }

  const jsxAttr = attr as JSXAttribute;
  return (
    jsxAttr.type === 'JSXAttribute' &&
    jsxAttr.name.type === 'JSXIdentifier' &&
    jsxAttr.name.name === name
  );
};

export default transform;
