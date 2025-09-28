import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('next-speed-kit CLI', () => {
  it('prints help output listing commands', async () => {
    const result = await execa('node', ['dist/cli/index.js', '--help'], {
      cwd: rootDir,
    });

    expect(result.stdout).toContain('next-speed-kit');
    expect(result.stdout).toContain('codemods');
    expect(result.stdout).toContain('audit');
    expect(result.stdout).toContain('analyse');
  });
});
