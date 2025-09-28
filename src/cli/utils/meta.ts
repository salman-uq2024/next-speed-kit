import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fs } from '../../lib/fs.js';

const VERSION_FALLBACK = '0.0.0-development';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(currentDir, '../../../package.json');

export const getPackageVersion = (): string => {
  try {
    const contents = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(contents) as { version?: string };
    return pkg.version ?? VERSION_FALLBACK;
  } catch (error) {
    return VERSION_FALLBACK;
  }
};
