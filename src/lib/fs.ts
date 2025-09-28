import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'fs-extra';

export const ensureDir = async (dir: string) => {
  await fs.ensureDir(dir);
};

export const ensureFile = async (filePath: string) => {
  await fs.ensureFile(filePath);
};

export const resolveFromCwd = (maybeRelative: string): string => {
  if (!maybeRelative) {
    return process.cwd();
  }

  if (path.isAbsolute(maybeRelative)) {
    return maybeRelative;
  }

  return path.resolve(process.cwd(), maybeRelative);
};

export const toFileUrl = (fsPath: string) => pathToFileURL(fsPath).href;

export { fs };
