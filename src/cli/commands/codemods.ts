import type { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { CODEMODS, getCodemod } from '../../codemods/index.js';
import { runCodemod, formatFileRelative } from '../../codemods/runner.js';
import { resolveFromCwd } from '../../lib/fs.js';
import { logger } from '../../lib/logger.js';
import { checkCliRateLimit } from '../../lib/rate-limit.js';

const collectTransforms = (value: string, previous: string[]): string[] => {
  if (previous.includes(value)) {
    return previous;
  }

  return [...previous, value];
};

export const registerCodemodsCommand = (program: Command) => {
  program
    .command('codemods')
    .description('Apply code transformations that typically improve Next.js performance')
    .option('--target <path>', 'Directory of the Next.js project', process.cwd())
    .option('--list', 'List available codemods')
    .option('--transform <name>', 'Only run a specific codemod (can be repeated)', collectTransforms, [])
    .option('--dry-run', 'Preview the changes without writing files')
    .option('--apply', 'Apply changes to disk (overrides --dry-run)')
    .action(async (options) => {
      const isDemo = options.demo || process.env.DEMO_MODE === '1';
      if (isDemo) {
        logger.info('Demo mode enabled: enforcing rate limits');
        // Skip private features if API_BASE absent
        if (!process.env.API_BASE) {
          logger.info('Demo mode: skipping private API features');
        }
      }
    
      if (!checkCliRateLimit()) {
        logger.error('Rate limit exceeded for CLI codemods command');
        process.exitCode = 1;
        return;
      }
    
      const targetDir = resolveFromCwd(options.target ?? process.cwd());
    
      if (options.list) {
        logger.info('Available codemods:');
        CODEMODS.forEach((mod) => {
          logger.info(`- ${chalk.cyan(mod.name)}: ${mod.summary}`);
        });
        return;
      }
    
      const transforms: string[] = options.transform ?? [];
      const selected = transforms.length
        ? transforms.map((name) => {
            const mod = getCodemod(name);
            if (!mod) {
              throw new Error(`Unknown codemod: ${name}`);
            }
            return mod;
          })
        : CODEMODS;
    
      const dryRun = determineDryRun(options);
    
      logger.info(
        `${dryRun ? 'Previewing' : 'Applying'} ${selected.length} codemod${
          selected.length === 1 ? '' : 's'
        } in ${chalk.green(targetDir)}`
      );
    
      const aggregatedChanged: string[] = [];
      const aggregatedErrors: Array<{ file: string; error: Error; codemod: string }> = [];

      for (const mod of selected) {
        const spinner = ora(`Running ${mod.name}`).start();
        try {
          const result = await runCodemod({ codemod: mod, targetDir, dryRun });
          aggregatedChanged.push(...result.changedFiles);

          if (result.errors.length > 0) {
            result.errors.forEach((item) =>
              aggregatedErrors.push({ ...item, codemod: mod.name })
            );
            spinner.warn(
              `${mod.name}: ${result.changedFiles.length} files ${dryRun ? 'would be' : 'were'} changed, ${result.errors.length} errors`
            );
          } else if (result.changedFiles.length > 0) {
            spinner.succeed(
              `${mod.name}: ${result.changedFiles.length} file${
                result.changedFiles.length === 1 ? '' : 's'
              } ${dryRun ? 'would be updated' : 'updated'}`
            );
          } else {
            spinner.info(`${mod.name}: no changes needed`);
          }

          if (result.changedFiles.length > 0) {
            result.changedFiles
              .slice(0, 5)
              .forEach((file) =>
                logger.info(
                  `  • ${formatFileRelative(targetDir, file)}${
                    dryRun ? ' (dry-run)' : ''
                  }`
                )
              );
            if (result.changedFiles.length > 5) {
              logger.info(
                `  • ...and ${result.changedFiles.length - 5} more ${
                  dryRun ? 'would change' : 'changed'
                }`
              );
            }
          }
        } catch (error) {
          spinner.fail(`${mod.name}: failed`);
          const err = error instanceof Error ? error : new Error(String(error));
          aggregatedErrors.push({ file: targetDir, error: err, codemod: mod.name });
          logger.error(err.message);
        }
      }

      if (aggregatedErrors.length > 0) {
        logger.error('Some codemods failed:');
        aggregatedErrors.forEach(({ file, error, codemod }) => {
          logger.error(`- ${chalk.cyan(codemod)} on ${file}: ${error.message}`);
        });
        process.exitCode = 1;
      } else if (dryRun) {
        logger.success(
          aggregatedChanged.length
            ? `Dry-run complete. ${aggregatedChanged.length} files would change.`
            : 'Dry-run complete. No changes needed.'
        );
      } else {
        logger.success(
          aggregatedChanged.length
            ? `Codemods applied to ${aggregatedChanged.length} file${
                aggregatedChanged.length === 1 ? '' : 's'
              }.`
            : 'No files required changes.'
        );
      }
    });
};

const determineDryRun = (options: { dryRun?: boolean; apply?: boolean }): boolean => {
  if (options.apply) {
    return false;
  }

  if (options.dryRun !== undefined) {
    return Boolean(options.dryRun);
  }

  return true;
};
