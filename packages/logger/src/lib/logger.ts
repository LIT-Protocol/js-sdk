import { version } from '@lit-protocol/constants';
import { hashMessage } from 'ethers/lib/utils';
import { encode } from 'punycode';
import { toString as uint8arrayToString } from 'uint8arrays';

export enum LogLevel {
  INFO = 0,
  DEBUG = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  TIMING_START = 5,
  TIMING_END = 6,
  OFF = 5,
}

const colours = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    crimson: '\x1b[38m', // Scarlet
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    gray: '\x1b[100m',
    crimson: '\x1b[48m',
  },
};

function _convertLoggingLevel(level: LogLevel): string {
  switch (level) {
    case LogLevel.INFO:
      return `${colours.fg.green}[INFO]${colours.reset}`;
    case LogLevel.DEBUG:
      return `${colours.fg.cyan}[DEBUG]${colours.reset}`;
    case LogLevel.WARN:
      return `${colours.fg.yellow}[WARN]${colours.reset}`;
    case LogLevel.ERROR:
      return `${colours.fg.red}[ERROR]${colours.reset}`;
    case LogLevel.FATAL:
      return `${colours.fg.red}[FATAL]${colours.reset}`;
    case LogLevel.TIMING_START:
      return `${colours.fg.green}[TIME_START]${colours.reset}`;
    case LogLevel.TIMING_END:
      return `${colours.fg.green}[TIME_END]${colours.reset}`;
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
    case LogLevel.TIMING_END:
      return console.timeLog;
    case LogLevel.TIMING_START:
      return console.time;
  }
}

/**
 * Implementation of `JSON.stringify` which removes circular object references
 * @example
 * let circ = {foo: 'bar'};
 * circ.circ = circ; // creates a circular reference
 * _safeStringify(circ) -> {foo: 'bar'}
 * @param obj object to check for circular references
 * @param indent number of indents to include (spaces)
 * @returns obj param without without circular references
 */
function _safeStringify(obj: any, indent = 2) {
  let cache: any[] | null = [];
  const retVal = JSON.stringify(
    obj,
    (_key, value) =>
      typeof value === 'object' && value !== null
        ? cache?.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache?.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
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
    var fmtStr: string = `[Lit-JS-SDK v${version}]${_convertLoggingLevel(
      this.level
    )} [${this.category}] [id: ${this.id}] ${this.message}`;
    for (var i = 0; i < this.args.length; i++) {
      if (typeof this.args[i] === 'object') {
        fmtStr = `${fmtStr} ${_safeStringify(this.args[i])}`;
      } else {
        fmtStr = `${fmtStr} ${this.args[i]}`;
      }
    }
    return fmtStr;
  }

  toArray(): string[] {
    let args = [];
    args.push(`[Lit-JS-SDK v${version}]`);
    args.push(`[${this.timestamp}]`);
    args.push(_convertLoggingLevel(this.level));
    args.push(`[${this.category}]`);

    this.id && args.push(`${colours.fg.cyan}[id: ${this.id}]${colours.reset}`);
    this.message && args.push(this.message);

    for (var i = 0; i < this.args.length; i++) {
      args.push(this.args[i]);
    }

    return args;
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
  private _logs: Log[] = [];
  private _logHashes: Map<string, boolean> = new Map();
  private _config: Record<string, any> | undefined;
  private _isParent: boolean;
  private _children: Map<string, Logger>;

  public static createLogger(
    category: string,
    level: LogLevel,
    id: string,
    isParent: boolean,
    config?: Record<string, any>
  ): Logger {
    return new Logger(category, level, id, isParent, config);
  }

  private constructor(
    category: string,
    level: LogLevel,
    id: string,
    isParent: boolean,
    config?: Record<string, any>
  ) {
    this._category = category;
    this._level = level;
    this._id = id;
    this._consoleHandler = _resolveLoggingHandler(this._level);
    this._config = config;
    this._children = new Map();
    this._isParent = isParent;
  }

  get id(): string {
    return this._id;
  }

  get category(): string {
    return this._category;
  }

  get Logs(): Log[] {
    return this._logs;
  }

  set Config(value: Record<string, any> | undefined) {
    this._config = value;
  }

  get Config(): Record<string, any> | undefined {
    return this._config;
  }

  get Children(): Map<string, Logger> {
    return this._children;
  }

  public setLevel(level: LogLevel): void {
    this._level = level;
  }

  public setHandler(handler: messageHandler) {
    this._handler = handler;
  }

  public info(message: string = '', ...args: any[]): void {
    this._log(LogLevel.INFO, message, ...args);
  }

  public debug(message: string = '', ...args: any[]): void {
    this._log(LogLevel.DEBUG, message, ...args);
  }

  public warn(message: string = '', ...args: any[]): void {
    this._log(LogLevel.WARN, message, args);
  }

  public error(message: string = '', ...args: any[]): void {
    this._log(LogLevel.ERROR, message, ...args);
  }

  public fatal(message: string = '', ...args: any[]): void {
    this._log(LogLevel.FATAL, message, ...args);
  }

  public trace(message: string = '', ...args: any[]): void {
    this._log(LogLevel.FATAL, message, ...args);
  }

  public timeStart(message: string = '', ...args: any[]): void {
    this._log(LogLevel.TIMING_START, message, ...args);
  }

  public timeEnd(message: string = '', ...args: any[]): void {
    this._level < LogLevel.OFF &&
      this._log(LogLevel.TIMING_END, message, ...args);
  }

  private _log(level: LogLevel, message: string = '', ...args: any[]): void {
    const log = new Log(
      new Date().toISOString(),
      message,
      args,
      this._id,
      this._category,
      level
    );

    const arrayLog = log.toArray();
    if (this._config?.['condenseLogs'] && !this._checkHash(log)) {
      (this._level >= level || level === LogLevel.ERROR) &&
        this._consoleHandler(...arrayLog);
      (this._level >= level || level === LogLevel.ERROR) &&
        this._handler &&
        this._handler(log);
      (this._level >= level || level === LogLevel.ERROR) && this._addLog(log);
    } else if (!this._config?.['condenseLogs']) {
      (this._level >= level || level === LogLevel.ERROR) &&
        this._consoleHandler(...arrayLog);
      (this._level >= level || level === LogLevel.ERROR) &&
        this._handler &&
        this._handler(log);
      (this._level >= level || level === LogLevel.ERROR) && this._addLog(log);
    }
  }

  private _checkHash(log: Log): boolean {
    const digest = hashMessage(log.message);
    const hash = digest.toString();
    let item = this._logHashes.get(hash);
    if (item) {
      return true;
    } else {
      this._logHashes.set(hash, true);
      return false;
    }
  }

  private _addLog(log: Log) {
    this._logs.push(log);
    log.id && this._addToLocalStorage(log);
  }

  private _addToLocalStorage(log: Log) {
    if (globalThis.localStorage) {
      let bucket: any = globalThis.localStorage.getItem(log.category);
      if (bucket) {
        bucket = JSON.parse(bucket);
        bucket?.logs.push(log.toString());
        globalThis.localStorage.setItem(log.category, _safeStringify(bucket));
      } else {
        globalThis.localStorage.setItem(
          log.category,
          _safeStringify({
            logs: [log.toString()],
          })
        );
      }
    }
  }
}

export class LogManager {
  private static _instance: LogManager;
  private _loggers: Map<string, Logger>;
  private _level: LogLevel | undefined = LogLevel.DEBUG;
  private _config: Record<string, any> | undefined;

  static get Instance(): LogManager {
    if (!LogManager._instance) {
      LogManager._instance = new LogManager();
    }
    return LogManager._instance;
  }

  static clearInstance() {
    (LogManager._instance as any) = undefined;
  }

  private constructor() {
    this._loggers = new Map();
  }

  public withConfig(config: Record<string, any>) {
    this._config = config;
    for (const logger of this._loggers) {
      logger[1].Config = config;
    }
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

  // if a logger is given an id it will persist logs under its logger instance
  public get(category: string, id?: string): Logger {
    let instance = this._loggers.get(category);
    if (!instance && !id) {
      this._loggers.set(
        category,
        Logger.createLogger(category, this._level ?? LogLevel.INFO, '', true)
      );

      instance = this._loggers.get(category) as Logger;
      instance.Config = this._config;
      return instance;
    }

    this._loggers.set(
      category,
      Logger.createLogger(category, this._level ?? LogLevel.INFO, '', true)
    );

    instance = this._loggers.get(category) as Logger;
    instance.Config = this._config;

    if (id) {
      let children = instance?.Children;
      let child = children?.get(id);
      if (child) {
        return child;
      }
      children?.set(
        id,
        Logger.createLogger(
          category,
          this._level ?? LogLevel.INFO,
          id ?? '',
          true
        )
      );

      child = children?.get(id) as Logger;
      child.Config = this._config;
      return children?.get(id) as Logger;
    }

    return instance as Logger;
  }

  getById(id: string): string[] {
    let logStrs: string[] = [];
    for (const category of this._loggers.entries()) {
      let logger = category[1].Children.get(id);
      if (logger) {
        let logStr = [];
        for (const log of logger.Logs) {
          logStr.push(log.toString());
        }
        logStrs = logStrs.concat(logStr);
      }
    }

    return logStrs;
  }

  public getLogsForId(id: string): string[] {
    let logsForRequest: string[] = this.getById(id);
    if (logsForRequest.length < 1 && globalThis.localStorage) {
      for (const category of this._loggers.keys()) {
        let bucketStr: string | null =
          globalThis.localStorage.getItem(category);
        let bucket: { logs: string[] } = JSON.parse(bucketStr as string);
        const logsForId: string[] = bucket.logs.filter((log: string) =>
          log.includes(id)
        );
        logsForRequest = logsForId.concat(logsForRequest);
      }
    }

    return logsForRequest;
  }
}
