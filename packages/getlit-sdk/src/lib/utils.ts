import chalk from 'chalk';
const version = '0.0.1';
const logBuffer: Array<Array<any>> = [];

function log(...args: any[]): void {
  args.unshift(chalk.blue(`[GetLit SDK v${version} INFO]`));
  printLog(args);
}

log.info = log;

log.error = (...args: any[]): void => {
  args.unshift(chalk.red(`[GetLit SDK v${version} ERROR]`));
  printLog(args);
};

log.warning = (...args: any[]): void => {
  args.unshift(chalk.yellow(`[GetLit SDK v${version} WARNING]`));
  printLog(args);
};

log.success = (...args: any[]): void => {
  args.unshift(chalk.green(`[GetLit SDK v${version} SUCCESS]`));
  printLog(args);
};

const printLog = (...args: any[]): void => {
  if (!globalThis) {
    // there is no globalThis, just print the log
    console.log(...args);
    return;
  }

  // check if config is loaded yet
  if (!globalThis?.LitDebug) {
    // config isn't loaded yet, push into buffer
    logBuffer.push(args);
    return;
  }

  if (globalThis?.LitDebug !== true) {
    return;
  }
  // config is loaded, and debug is true

  // if there are logs in buffer, print them first and empty the buffer.
  while (logBuffer.length > 0) {
    const log = logBuffer.shift() ?? '';
    console.log(...log);
  }

  console.log(...args);
};

export { log };
