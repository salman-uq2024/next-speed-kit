import type {
  ASTPath,
  ImportDeclaration,
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  JSXOpeningElement,
  JSXSpreadAttribute,
  Transform,
} from 'jscodeshift';

const FONT_HOST = 'https://fonts.gstatic.com';

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const headAliases = new Set<string>();

  root
    .find<ImportDeclaration>(j.ImportDeclaration, { source: { value: 'next/head' } })
    .forEach((path: ASTPath<ImportDeclaration>) => {
      path.node.specifiers?.forEach((specifier) => {
        if (specifier.type === 'ImportDefaultSpecifier') {
          const localName = specifier.local?.name;
          if (localName) {
            headAliases.add(localName);
          }
        }
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === 'Head'
        ) {
          headAliases.add(specifier.local?.name ?? 'Head');
        }
      });
    });

  if (headAliases.size === 0) {
    return file.source;
  }

  let didUpdate = false;

  root.find<JSXElement>(j.JSXElement).forEach((path: ASTPath<JSXElement>) => {
    const opening = path.node.openingElement;
    if (opening.name.type !== 'JSXIdentifier') {
      return;
    }

    const identifier = opening.name as JSXIdentifier;
    if (!headAliases.has(identifier.name)) {
      return;
    }

    const existing = (path.node.children ?? []).some((child) => {
      if (!child || child.type !== 'JSXElement') {
        return false;
      }

      const childOpening = child.openingElement as JSXOpeningElement;
      if (childOpening.name.type !== 'JSXIdentifier') {
        return false;
      }

      if (childOpening.name.name !== 'link') {
        return false;
      }

      const relAttr = findAttribute(childOpening.attributes ?? [], 'rel');
      if (!relAttr || getLiteralAttributeValue(relAttr) !== 'preconnect') {
        return false;
      }

      const hrefAttr = findAttribute(childOpening.attributes ?? [], 'href');
      return getLiteralAttributeValue(hrefAttr) === FONT_HOST;
    });

    if (existing) {
      return;
    }

    const attributes = [
      j.jsxAttribute(j.jsxIdentifier('rel'), j.stringLiteral('preconnect')),
      j.jsxAttribute(j.jsxIdentifier('href'), j.stringLiteral(FONT_HOST)),
      j.jsxAttribute(j.jsxIdentifier('crossOrigin'), j.stringLiteral('anonymous')),
    ];

    const openingElement = j.jsxOpeningElement(j.jsxIdentifier('link'), attributes, true);
    const linkElement = j.jsxElement(openingElement, null, []);

    path.node.children = [linkElement, ...(path.node.children ?? [])];
    didUpdate = true;
  });

  if (!didUpdate) {
    return file.source;
  }

  return root.toSource({ quote: 'single' });
};

const findAttribute = (
  attributes: (JSXAttribute | JSXSpreadAttribute | null | undefined)[],
  name: string
) =>
  attributes.find((attr) => isNamedAttribute(attr, name)) ?? null;

const isNamedAttribute = (
  attr: JSXAttribute | JSXSpreadAttribute | null | undefined,
  name: string
): boolean => {
  if (!attr) {
    return false;
  }

  if (attr.type !== 'JSXAttribute') {
    return false;
  }

  return (
    attr.name.type === 'JSXIdentifier' &&
    attr.name.name === name
  );
};

const getLiteralAttributeValue = (
  attr: JSXAttribute | JSXSpreadAttribute | null
): string | undefined => {
  if (!attr || attr.type !== 'JSXAttribute') {
    return undefined;
  }

  if (attr.value?.type !== 'StringLiteral') {
    return undefined;
  }

  return attr.value.value;
};

export default transform;
