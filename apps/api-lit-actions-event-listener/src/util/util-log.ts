export class Log {
  static prefix = '';

  static info(message: string, prefix?: string) {
    const timestamp = new Date().toISOString();
    console.log(
      `\x1b[34m[${timestamp}] [INFO]${prefix ?? ''} ${message}\x1b[0m`
    );
  }

  static error(message: string, prefix?: string) {
    const timestamp = new Date().toISOString();
    console.log(
      `\x1b[31m[${timestamp}] [ERROR]${prefix ?? ''} ${message}\x1b[0m`
    );
  }

  static warning(message: string, prefix?: string) {
    const timestamp = new Date().toISOString();
    console.log(
      `\x1b[33m[${timestamp}] [WARNING]${prefix ?? ''} ${message}\x1b[0m`
    );
  }
}

export class Logger {
  prefix: string;

  constructor(prefix = '') {
    this.prefix = prefix;
  }

  info(message: string) {
    Log.info(message, ` ${this.prefix}`);
  }

  error(message: string) {
    Log.error(message, ` ${this.prefix}`);
  }

  warning(message: string) {
    Log.warning(message, ` ${this.prefix}`);
  }
}
