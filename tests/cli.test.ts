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

  it('registers audit command with correct configuration', async () => {
    const { Command } = await import('commander');
    const { registerAuditCommand } = await import('../src/cli/commands/audit.js');

    const program = new Command();
    registerAuditCommand(program);

    const auditCmd = program.commands.find((cmd) => cmd.name() === 'audit');
    expect(auditCmd).toBeDefined();
    expect(auditCmd?.description()).toBe('Run Lighthouse against a URL and capture reports');
    expect(auditCmd?.arguments.length).toBe(1);

    const options = auditCmd?.options || [];
    expect(options.some((opt) => opt.long === '--tag')).toBe(true);
    expect(options.some((opt) => opt.long === '--output-dir')).toBe(true);
    expect(options.some((opt) => opt.long === '--desktop')).toBe(true);
    expect(options.some((opt) => opt.long === '--only-desktop')).toBe(true);
    expect(options.some((opt) => opt.long === '--only-mobile')).toBe(true);
  });
});
