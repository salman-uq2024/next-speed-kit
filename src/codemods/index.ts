import nextImageDimensions from './transforms/next-image-width-height.js';
import dynamicImportsHeavy from './transforms/dynamic-imports-heavy.js';
import fontPreconnect from './transforms/font-preconnect.js';
import cacheHeadersGuidance from './transforms/cache-headers-guidance.js';
import type { CodemodDefinition, CodemodName } from './types.js';

export const CODEMODS: CodemodDefinition[] = [
  {
    name: 'next-image-dimensions',
    summary: 'Adds width/height to next/image usage when missing (avoids layout shifts).',
    description:
      'Ensures that default Image components from next/image explicitly declare width and height unless they rely on fill.',
    tags: ['lcp', 'best-practices'],
    filePatterns: ['**/*.{js,jsx,ts,tsx}'],
    transform: nextImageDimensions,
  },
  {
    name: 'dynamic-heavy-modules',
    summary: 'Converts heavy component imports (chart.js, react-player, etc.) to next/dynamic.',
    description:
      'Wraps selected heavy modules in next/dynamic with ssr disabled so they only load on the client when necessary.',
    tags: ['code-splitting'],
    filePatterns: ['**/*.{js,jsx,ts,tsx}'],
    transform: dynamicImportsHeavy,
  },
  {
    name: 'head-font-preconnect',
    summary: 'Adds <link rel="preconnect" href="https://fonts.gstatic.com" /> to Head blocks.',
    description:
      'Ensures fonts.gstatic.com preconnect is present for pages importing next/head to unblock font loading.',
    tags: ['rendering', 'fonts'],
    filePatterns: ['**/*.{js,jsx,ts,tsx}'],
    transform: fontPreconnect,
  },
  {
    name: 'api-cache-guidance',
    summary: 'Drops a reminder comment in API routes to set Cache-Control headers.',
    description:
      'Adds a single guidance comment to Next.js API route files encouraging long-lived caching for static responses.',
    tags: ['caching'],
    filePatterns: ['pages/api/**/*.{js,ts}', 'app/api/**/*.{js,ts}'],
    transform: cacheHeadersGuidance,
  },
];

export const getCodemod = (name: string): CodemodDefinition | undefined =>
  CODEMODS.find((mod) => mod.name === name);

export const isValidCodemodName = (name: string): name is CodemodName =>
  CODEMODS.some((mod) => mod.name === name);
