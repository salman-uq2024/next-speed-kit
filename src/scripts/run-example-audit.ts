import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { execa } from 'execa';
import { fs } from '../lib/fs.js';
import { logger } from '../lib/logger.js';
import { formatTimestamp } from '../lib/time.js';
import { updateSummaryMarkdown } from '../reporting/summary.js';

const isDemoMode = process.env.DEMO_MODE === '1';
const demoFlag = isDemoMode ? '--demo' : '';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const exampleDir = path.join(rootDir, 'example');
const cliEntrypoint = path.join(rootDir, 'dist', 'cli', 'index.js');
const reportsDir = path.join(rootDir, 'reports');
const exampleUrl = 'http://localhost:3001';
const timestamp = formatTimestamp();

const run = async () => {
  await fs.ensureDir(reportsDir);

  const cliExists = await fs.pathExists(cliEntrypoint);
  if (!cliExists) {
    logger.info('Building CLI');
    await execa('pnpm', ['build'], { cwd: rootDir, stdio: 'inherit' });
  }

  const exampleNodeModules = path.join(exampleDir, 'node_modules');
  if (!(await fs.pathExists(exampleNodeModules))) {
    logger.info('Installing example dependencies');
    await execa('pnpm', ['install'], { cwd: exampleDir, stdio: 'inherit' });
  }

  logger.info('Building example (baseline)');
  await execa('pnpm', ['run', 'build'], { cwd: exampleDir, stdio: 'inherit' });

  const beforeTag = `example-before-${timestamp}`;
  const afterTag = `example-after-${timestamp}`;

  logger.info('Running baseline Lighthouse audit');
  await runAuditWithServer(beforeTag);

  logger.info('Applying codemods to the example project');
  const codemodArgs = [cliEntrypoint, 'codemods', '--target', exampleDir, '--apply'];
  if (demoFlag) {
    codemodArgs.push(demoFlag);
  }

  await execa('node', codemodArgs, {
    cwd: rootDir,
    stdio: 'inherit',
  });

  logger.info('Rebuilding example after codemods');
  await execa('pnpm', ['run', 'build'], { cwd: exampleDir, stdio: 'inherit' });

  logger.info('Running post-codemod Lighthouse audit');
  await runAuditWithServer(afterTag);

  const { outputPath } = await updateSummaryMarkdown({
    reportsDir,
    beforeTag,
    afterTag,
  });

  logger.success(`Updated summary at ${outputPath}`);
  logger.success('Finished running before/after audits.');
  logger.info('Tip: run `git checkout -- example` to restore the baseline demo after reviewing the changes.');
};

const runAuditWithServer = async (tag: string) => {
  const server = execa('pnpm', ['exec', 'next', 'start', '--port', '3001'], {
    cwd: exampleDir,
    stdio: 'inherit',
  });

  try {
    await waitForServer();
    const auditArgs = [
      cliEntrypoint,
      'audit',
      exampleUrl,
      '--tag',
      tag,
      '--output-dir',
      reportsDir,
      '--desktop',
    ];

    if (demoFlag) {
      auditArgs.push(demoFlag);
    }

    await execa('node', auditArgs, { cwd: rootDir, stdio: 'inherit' });
  } finally {
    server.kill('SIGINT');
    await server.catch(() => undefined);
  }
};

const waitForServer = async () => {
  const started = Date.now();
  const timeoutMs = 60_000;

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(exampleUrl);
      if (response.ok) {
        return;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.info(`Waiting for example server: ${err.message}`);
    }

    await delay(1000);
  }

  throw new Error('Example server did not start within 60s');
};

run().catch((error) => {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(err.message);
  process.exitCode = 1;
});
