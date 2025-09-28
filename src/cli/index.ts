#!/usr/bin/env node

import { Command } from 'commander';
import { registerCodemodsCommand } from './commands/codemods.js';
import { registerAuditCommand } from './commands/audit.js';
import { registerAnalyseCommand } from './commands/analyse.js';
import { getPackageVersion } from './utils/meta.js';
import { logger } from '../lib/logger.js';

const program = new Command();

program
  .name('next-speed-kit')
  .description('Toolkit for speeding up Next.js applications and tracking improvements')
  .version(getPackageVersion());

registerCodemodsCommand(program);
registerAuditCommand(program);
registerAnalyseCommand(program);

program
  .configureHelp({
    sortSubcommands: true,
    showGlobalOptions: true
  });

program.parseAsync().catch((error) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
