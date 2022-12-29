export class Log {
  static info(message: string) {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[34m[${timestamp}] [INFO] ${message}\x1b[0m`);
  }

  static error(message: string) {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[31m[${timestamp}] [ERROR] ${message}\x1b[0m`);
  }

  static warning(message: string) {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[33m[${timestamp}] [WARNING] ${message}\x1b[0m`);
  }
}
