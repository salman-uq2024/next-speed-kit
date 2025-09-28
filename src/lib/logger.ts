import chalk from 'chalk';

const prefix = chalk.gray('[next-speed-kit]');

export const logger = {
  info(message: string) {
    console.log(`${prefix} ${message}`);
  },
  success(message: string) {
    console.log(`${prefix} ${chalk.green(message)}`);
  },
  warn(message: string) {
    console.warn(`${prefix} ${chalk.yellow(message)}`);
  },
  error(message: string) {
    console.error(`${prefix} ${chalk.red(message)}`);
  }
};
