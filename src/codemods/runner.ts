import path from 'node:path';
import fg from 'fast-glob';
import jscodeshift from 'jscodeshift';
import { fs } from '../lib/fs.js';
import type { CodemodDefinition } from './types.js';

export interface CodemodRunOptions {
  codemod: CodemodDefinition;
  targetDir: string;
  dryRun: boolean;
}

export interface CodemodRunResult {
  codemod: CodemodDefinition;
  changedFiles: string[];
  unchangedFiles: string[];
  errors: Array<{ file: string; error: Error }>;
}

const PRINT_OPTIONS = {
  quote: 'single' as const,
};

export const runCodemod = async (
  options: CodemodRunOptions
): Promise<CodemodRunResult> => {
  const { codemod, targetDir, dryRun } = options;
  const patterns = codemod.filePatterns.length > 0 ? codemod.filePatterns : ['**/*.{js,jsx,ts,tsx}'];
  const matches = await fg(patterns, {
    cwd: targetDir,
    absolute: true,
    suppressErrors: true,
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/coverage/**'],
  });

  const changedFiles: string[] = [];
  const unchangedFiles: string[] = [];
  const errors: Array<{ file: string; error: Error }> = [];

  for (const filePath of matches) {
    try {
      const source = await fs.readFile(filePath, 'utf8');

      const result = codemod.transform(
        { source, path: filePath },
        { j: jscodeshift, jscodeshift, stats: () => {}, report: () => {} },
        { printOptions: PRINT_OPTIONS }
      );

      const output = normaliseResult(result, source);

      if (output === source) {
        unchangedFiles.push(filePath);
        continue;
      }

      if (dryRun) {
        changedFiles.push(filePath);
        continue;
      }

      await fs.writeFile(filePath, output, 'utf8');
      changedFiles.push(filePath);
    } catch (error) {
      const normalisedError = error instanceof Error ? error : new Error(String(error));
      errors.push({ file: filePath, error: normalisedError });
    }
  }

  return { codemod, changedFiles, unchangedFiles, errors };
};

const normaliseResult = (result: unknown, fallback: string): string => {
  if (result == null) {
    return fallback;
  }

  if (typeof result === 'string') {
    return result;
  }

  if (typeof result === 'object' && 'source' in (result as Record<string, unknown>)) {
    const source = (result as Record<string, unknown>).source;
    if (typeof source === 'string') {
      return source;
    }
  }

  return fallback;
};

export const formatFileRelative = (targetDir: string, absolutePath: string): string =>
  path.relative(targetDir, absolutePath) || path.basename(absolutePath);
