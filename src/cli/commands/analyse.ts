import path from 'node:path';
import type { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { analyseNextBundle, renderBundleSummary } from '../../analyse/index.js';
import { resolveFromCwd, fs } from '../../lib/fs.js';
import { logger } from '../../lib/logger.js';
import { formatTimestamp } from '../../lib/time.js';
import { checkCliRateLimit } from '../../lib/rate-limit.js';

interface AnalyseCliOptions {
  target?: string;
  build?: boolean;
  buildCmd?: string;
  outputJson?: string;
  limit?: string;
  demo?: boolean;
}

export const registerAnalyseCommand = (program: Command) => {
  program
    .command('analyse')
    .description('Inspect bundle size for a Next.js application (.next directory)')
    .option('--target <path>', 'Path to the Next.js app', process.cwd())
    .option('--build', 'Run the build command before analysing')
    .option('--build-cmd <cmd>', 'Custom build command to run when --build is passed')
    .option('--output-json <file>', 'Optional path to write the JSON summary')
    .option('--limit <n>', 'Number of rows to display for top assets (default 8)')
    .option('--demo', 'Enable demo mode', false)
    .action(async (options: AnalyseCliOptions) => {
      const isDemo = options.demo || process.env.DEMO_MODE === '1';
      if (isDemo) {
        logger.info('Demo mode enabled: enforcing rate limits');
        // Skip private features if API_BASE absent
        if (!process.env.API_BASE) {
          logger.info('Demo mode: skipping private API features');
        }
      }
    
      if (!checkCliRateLimit()) {
        logger.error('Rate limit exceeded for CLI analyse command');
        process.exitCode = 1;
        return;
      }
    
      const targetDir = resolveFromCwd(options.target ?? process.cwd());
      const limit = options.limit ? Number.parseInt(options.limit, 10) : 8;
    
      if (Number.isNaN(limit) || limit <= 0) {
        logger.error('--limit must be a positive integer');
        process.exitCode = 1;
        return;
      }
    
      if (options.build) {
        const spinner = ora('Running build before analysis').start();
        try {
          await runBuildCommand(targetDir, options.buildCmd);
          spinner.succeed('Build completed');
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          spinner.fail('Build failed');
          logger.error(err.message);
          process.exitCode = 1;
          return;
        }
      }
    
      try {
        const analysis = await analyseNextBundle({ projectDir: targetDir, limit });
        const readable = renderBundleSummary(analysis.summary);
    
        logger.info('\n' + readable);
    
        if (options.outputJson) {
          const outputPath = path.isAbsolute(options.outputJson)
            ? options.outputJson
            : path.join(targetDir, options.outputJson.replace('{timestamp}', formatTimestamp()));
    
          const payload = {
            generatedAt: new Date().toISOString(),
            summary: analysis.summary,
            assets: analysis.assets,
          };
    
          await fs.ensureDir(path.dirname(outputPath));
          await fs.writeJson(outputPath, payload, { spaces: 2 });
          logger.success(`Wrote JSON summary to ${chalk.gray(outputPath)}`);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(err.message);
        process.exitCode = 1;
      }
    });
};

const runBuildCommand = async (targetDir: string, customCommand?: string) => {
  if (customCommand) {
    await runSingleCommand(targetDir, parseCommand(customCommand));
    return;
  }

  const pkgPath = path.join(targetDir, 'package.json');
  let pkg: { scripts?: Record<string, string>; packageManager?: string } | undefined;

  if (await fs.pathExists(pkgPath)) {
    pkg = await fs.readJson(pkgPath);
  }

  const detected = detectBuildCommands(targetDir, pkg);

  for (const command of detected) {
    try {
      await runSingleCommand(targetDir, command);
      return;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn(`Build command failed (${command.join(' ')}): ${err.message}`);
    }
  }

  throw new Error(
    'Unable to run a build automatically. Provide --build-cmd "<command>" to specify how to build your app.'
  );
};

const detectBuildCommands = (
  targetDir: string,
  pkg?: { scripts?: Record<string, string>; packageManager?: string }
): string[][] => {
  const commands: string[][] = [];
  const hasPnpm = pkg?.packageManager?.startsWith('pnpm') || fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'));
  const hasYarn = fs.existsSync(path.join(targetDir, 'yarn.lock'));
  const hasNpm = fs.existsSync(path.join(targetDir, 'package-lock.json'));

  if (pkg?.scripts?.build) {
    if (hasPnpm) {
      commands.push(['pnpm', 'run', 'build']);
    }
    if (hasYarn) {
      commands.push(['yarn', 'build']);
    }
    if (hasNpm) {
      commands.push(['npm', 'run', 'build']);
    }
    commands.push(['npm', 'run', 'build']);
  }

  if (hasPnpm) {
    commands.push(['pnpm', 'next', 'build']);
  }

  commands.push(['npx', 'next', 'build']);

  return dedupeCommands(commands);
};

const dedupeCommands = (commands: string[][]): string[][] => {
  const seen = new Set<string>();
  const unique: string[][] = [];

  for (const command of commands) {
    const key = command.join(' ');
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(command);
  }

  return unique;
};

const runSingleCommand = async (cwd: string, command: string[]) => {
  if (command.length === 0) {
    throw new Error('Empty command');
  }

  logger.info(`Running ${chalk.gray(command.join(' '))} in ${chalk.cyan(cwd)}`);
  await execa(command[0], command.slice(1), { cwd, stdio: 'inherit' });
};

const parseCommand = (command: string): string[] => {
  const parts = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
  return parts.map((part) => part.replace(/^['"]|['"]$/g, ''));
};
