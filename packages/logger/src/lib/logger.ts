import { version } from '@lit-protocol/constants';

export enum LogLevel {
  INFO = 0,
  DEBUG = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  OFF = 5,
}

const colours = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  fg: {
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
      gray: "\x1b[90m",
      crimson: "\x1b[38m" // Scarlet
  },
  bg: {
      black: "\x1b[40m",
      red: "\x1b[41m",
      green: "\x1b[42m",
      yellow: "\x1b[43m",
      blue: "\x1b[44m",
      magenta: "\x1b[45m",
      cyan: "\x1b[46m",
      white: "\x1b[47m",
      gray: "\x1b[100m",
      crimson: "\x1b[48m"
  }
};

function _convertLoggingLevel(level: LogLevel): string {
  switch (level) {
    case LogLevel.INFO:
      return `${colours.fg.cyan}[INFO]`;
    case LogLevel.DEBUG:
      return `${colours.fg.cyan}[DEBUG]`;
    case LogLevel.WARN:
      return `${colours.fg.yellow}[WARN]`;
    case LogLevel.ERROR:
      return `${colours.fg.red}[ERROR]`;
    case LogLevel.FATAL:
      return `${colours.fg.crimson}[FATAL]`;
  }

  return '[UNKNOWN]';
}

function _resolveLoggingHandler(level: LogLevel): any {
  switch (level) {
    case LogLevel.DEBUG:
      return console.debug;
    case LogLevel.INFO:
      return console.info;
    case LogLevel.ERROR:
      return console.error;
    case LogLevel.WARN:
      return console.warn;
    case LogLevel.FATAL:
      return console.error;
  }
}

function replacer(key: string, value: any) {
  // Filtering out properties
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
}

interface ILog {
  timestamp: string;
  message: string;
  args: any[];
  id: string;
  category: string;
  level: LogLevel;
  error?: any;
  toString(): string;
  toJSON(): Record<string, unknown>;
}

class Log implements ILog {
  timestamp: string;
  message: string;
  args: any[];
  id: string;
  category: string;
  level: LogLevel;
  error?: any;

  constructor(
    timestamp: string,
    message: string,
    args: any[],
    id: string,
    category: string,
    level: LogLevel
  ) {
    this.timestamp = timestamp;
    this.message = message;
    this.args = args;
    this.id = id;
    this.category = category;
    this.level = level;
  }

  toString(): string {
    var fmtStr: string = `[Lit-JS-SDK v${version}]${_convertLoggingLevel(this.level)}[${
      this.timestamp
    }]${this.category}[id: ${this.id}] ${this.message}`;
    for (var i = 0; i < this.args.length; i++) {
      if (typeof this.args[i] === 'object') {
        fmtStr = `${fmtStr} ${JSON.stringify(this.args[i], replacer)}`;
      } else {
        fmtStr = `${fmtStr} ${this.args[i]}`;
      }
    }
    return fmtStr;
  }

  toArray(): string[] {
    
  }

  toJSON(): Record<string, unknown> {
    return {
      timestamp: this.timestamp,
      message: this.message,
      args: this.args,
      id: this.id,
      category: this.category,
      level: this.level,
    };
  }
}

export type messageHandler = (log: Log) => void;

export class Logger {
  private _category: string;
  private _level: LogLevel;
  private _id: string;
  private _handler: messageHandler | undefined;
  private _consoleHandler: any;

  public static createLogger(
    category: string,
    level: LogLevel,
    id: string
  ): Logger {
    return new Logger(category, level, id);
  }

  private constructor(category: string, level: LogLevel, id: string) {
    this._category = `[${category}]`;
    this._level = level;
    this._id = id;
    this._consoleHandler = _resolveLoggingHandler(this._level);
  }

  public setLevel(level: LogLevel): void {
    this._level = level;
  }

  public setHandler(handler: messageHandler) {
    this._handler = handler;
  }

  public info(message: string = "", ...args: any[]): void {
    this._log(LogLevel.INFO, message, args);
  }

  public debug(message: string = "", ...args: any[]): void {
    this._log(LogLevel.DEBUG, message, args);
  }

  public warn(message: string = "", ...args: any[]): void {
    this._log(LogLevel.WARN, message, args);
  }

  public error(message: string = "", ...args: any[]): void {
    this._log(LogLevel.ERROR, message, args);
  }

  public fatal(message: string = "", ...args: any[]): void {
    this._log(LogLevel.FATAL, message, args);
  }

  public trace(message: string = "", ...args: any[]): void {
    this._log(LogLevel.FATAL, message, args);
  }

  public timeStart(message: string = ""): void {
    this._level < LogLevel.OFF && console.time(`${this._category} ${message}`);
  }

  public timeEnd(message: string = ""): void {
    this._level < LogLevel.OFF &&
      console.timeEnd(`${this._category} ${message}`);
  }

  private _log(level: LogLevel, message: string = "", ...args: any[]): void {
    const log = new Log(
      new Date().toISOString(),
      message,
      args,
      this._id,
      this._category,
      level
    );
    this._level <= level && this._consoleHandler(log.toString());
    this._level <= level && this._handler && this._handler(log);
  }
}

export class LogManager {
  private static _instance: LogManager;
  private _loggers: Map<string, Logger>;
  private _level: LogLevel | undefined;

  static get Instance(): LogManager {
    if (!LogManager._instance) {
      LogManager._instance = new LogManager();
    }
    return LogManager._instance;
  }

  private constructor() {
    this._loggers = new Map();
  }

  public setLevel(level: LogLevel) {
    this._level = level;
    for (const logger of this._loggers) {
      logger[1].setLevel(level);
    }
  }

  public setHandler(handler: messageHandler) {
    for (const logger of this._loggers) {
      logger[1].setHandler(handler);
    }
  }

  public get(category: string, id?: string): Logger {
    if (this._loggers.get(category) !== undefined) {
      return this._loggers.get(category) as Logger;
    }
    const logger = Logger.createLogger(
      category,
      this._level ?? LogLevel.INFO,
      id ?? ''
    );
    this._loggers.set(category, logger);
    return logger;
  }
}
