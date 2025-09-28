import path from 'node:path';
import type { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { runLighthouseAudit, type AuditFormFactor } from '../../audit/index.js';
import { resolveFromCwd } from '../../lib/fs.js';
import { formatTimestamp } from '../../lib/time.js';
import { logger } from '../../lib/logger.js';

interface AuditCliOptions {
  tag?: string;
  outputDir?: string;
  desktop?: boolean;
  onlyDesktop?: boolean;
  onlyMobile?: boolean;
}

export const registerAuditCommand = (program: Command) => {
  program
    .command('audit')
    .description('Run Lighthouse against a URL and capture reports')
    .argument('<urls...>', 'One or more URLs to audit')
    .option('--tag <name>', 'Optional label to include in the report filenames')
    .option('--output-dir <path>', 'Directory to store Lighthouse reports', 'reports')
    .option('--desktop', 'Include a desktop run in addition to mobile')
    .option('--only-desktop', 'Run only the desktop profile')
    .option('--only-mobile', 'Run only the mobile profile')
    .action(async (urls: string[], cliOptions: AuditCliOptions) => {
      if (!Array.isArray(urls) || urls.length === 0) {
        logger.error('Please provide at least one URL to audit.');
        process.exitCode = 1;
        return;
      }

      const timestamp = formatTimestamp();
      const formFactors = resolveFormFactors(cliOptions);
      const outputDir = resolveFromCwd(cliOptions.outputDir ?? 'reports');
      const tag = cliOptions.tag;

      logger.info(
        `Starting Lighthouse audit for ${urls.length} URL${urls.length === 1 ? '' : 's'} (${formFactors.join(
          ', '
        )})`
      );

      const results = [] as Awaited<ReturnType<typeof runLighthouseAudit>>[];

      for (const url of urls) {
        for (const formFactor of formFactors) {
          const spinner = ora(`Auditing ${url} [${formFactor}]`).start();
          const result = await runLighthouseAudit({
            url,
            outputDir,
            tag,
            formFactor,
            timestamp,
          });

          results.push(result);

          if (result.success) {
            spinner.succeed(
              `${url} [${formFactor}] complete → ${relativeToCwd(result.htmlPath)}`
            );
          } else {
            spinner.warn(
              `${url} [${formFactor}] failed (${result.error ?? 'unknown error'})`
            );
          }
        }
      }

      const successCount = results.filter((result) => result.success).length;
      const failureCount = results.length - successCount;

      logger.info('Reports written:');
      results.forEach((result) => {
        logger.info(
          `- ${result.formFactor.toUpperCase()} ${chalk.cyan(result.url)} → ${chalk.gray(
            relativeToCwd(result.htmlPath)
          )}`
        );
      });

      if (failureCount > 0) {
        logger.warn(
          `${failureCount} audit run${failureCount === 1 ? '' : 's'} failed. Check the stub reports above for details.`
        );
        process.exitCode = 1;
      } else {
        logger.success(
          `All ${successCount} audit run${successCount === 1 ? '' : 's'} completed successfully.`
        );
      }
    });
};

const resolveFormFactors = (options: AuditCliOptions): AuditFormFactor[] => {
  if (options.onlyDesktop && options.onlyMobile) {
    return ['mobile', 'desktop'];
  }

  if (options.onlyDesktop) {
    return ['desktop'];
  }

  if (options.onlyMobile) {
    return ['mobile'];
  }

  if (options.desktop) {
    return ['mobile', 'desktop'];
  }

  return ['mobile'];
};

const relativeToCwd = (absolutePath: string): string =>
  path.relative(process.cwd(), absolutePath) || absolutePath;
