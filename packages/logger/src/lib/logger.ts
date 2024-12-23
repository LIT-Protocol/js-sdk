import { version, LOG_LEVEL, LOG_LEVEL_VALUES } from '@lit-protocol/constants';
import { hashMessage } from 'ethers/lib/utils';

export enum LogLevel {
  OFF = -1,
  ERROR = 0,
  INFO = 1,
  DEBUG = 2,
  WARN = 3,
  FATAL = 4,
  TIMING_START = 5,
  TIMING_END = 6,
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

function _convertLoggingLevel(level: LOG_LEVEL_VALUES): string {
  switch (level) {
    case LOG_LEVEL.INFO:
      return `${colours.fg.green}[INFO]${colours.reset}`;
    case LOG_LEVEL.DEBUG:
      return `${colours.fg.cyan}[DEBUG]${colours.reset}`;
    case LOG_LEVEL.WARN:
      return `${colours.fg.yellow}[WARN]${colours.reset}`;
    case LOG_LEVEL.ERROR:
      return `${colours.fg.red}[ERROR]${colours.reset}`;
    case LOG_LEVEL.FATAL:
      return `${colours.fg.red}[FATAL]${colours.reset}`;
    case LOG_LEVEL.TIMING_START:
      return `${colours.fg.green}[TIME_START]${colours.reset}`;
    case LOG_LEVEL.TIMING_END:
      return `${colours.fg.green}[TIME_END]${colours.reset}`;
  }

  return '[UNKNOWN]';
}

function _resolveLoggingHandler(level: LOG_LEVEL_VALUES): any {
  switch (level) {
    case LOG_LEVEL.DEBUG:
      return console.debug;
    case LOG_LEVEL.INFO:
      return console.info;
    case LOG_LEVEL.ERROR:
      return console.error;
    case LOG_LEVEL.WARN:
      return console.warn;
    case LOG_LEVEL.FATAL:
      return console.error;
    case LOG_LEVEL.TIMING_END:
      return console.timeLog;
    case LOG_LEVEL.TIMING_START:
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
  level: LOG_LEVEL_VALUES;
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
  level: LOG_LEVEL_VALUES;
  error?: any;

  constructor(
    timestamp: string,
    message: string,
    args: any[],
    id: string,
    category: string,
    level: LOG_LEVEL_VALUES
  ) {
    this.timestamp = timestamp;
    this.message = message;
    this.args = args;
    this.id = id;
    this.category = category;
    this.level = level;
  }

  toString(): string {
    let fmtStr: string = `[Lit-JS-SDK v${version}]${_convertLoggingLevel(
      this.level
    )} [${this.category}] [id: ${this.id}] ${this.message}`;
    for (let i = 0; i < this.args.length; i++) {
      if (typeof this.args[i] === 'object') {
        fmtStr = `${fmtStr} ${_safeStringify(this.args[i])}`;
      } else {
        fmtStr = `${fmtStr} ${this.args[i]}`;
      }
    }
    return fmtStr;
  }

  toArray(): string[] {
    const args = [];
    args.push(`[Lit-JS-SDK v${version}]`);
    args.push(`[${this.timestamp}]`);
    args.push(_convertLoggingLevel(this.level));
    args.push(`[${this.category}]`);

    this.id && args.push(`${colours.fg.cyan}[id: ${this.id}]${colours.reset}`);
    this.message && args.push(this.message);

    for (let i = 0; i < this.args.length; i++) {
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
  private _level: LOG_LEVEL_VALUES;
  private _id: string;
  private _handler: messageHandler | undefined;
  private _consoleHandler: any;
  private _logs: Log[] = [];
  private _logHashes: Map<string, boolean> = new Map<string, boolean>();
  private _config: Record<string, any> | undefined;
  private _isParent: boolean;
  private _children: Map<string, Logger>;
  private _timestamp: number;

  public static createLogger(
    category: string,
    level: LOG_LEVEL_VALUES,
    id: string,
    isParent: boolean,
    config?: Record<string, any>
  ): Logger {
    return new Logger(category, level, id, isParent, config);
  }

  private constructor(
    category: string,
    level: LOG_LEVEL_VALUES,
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
    this._timestamp = Date.now();
  }

  get id(): string {
    return this._id;
  }

  get category(): string {
    return this._category;
  }

  get timestamp(): number {
    return this._timestamp;
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

  public setLevel(level: LOG_LEVEL_VALUES): void {
    this._level = level;
  }

  public setHandler(handler: messageHandler) {
    this._handler = handler;
  }

  public info(message: string = '', ...args: any[]): void {
    this._log(LOG_LEVEL.INFO, message, ...args);
  }

  public debug(message: string = '', ...args: any[]): void {
    this._log(LOG_LEVEL.DEBUG, message, ...args);
  }

  public warn(message: string = '', ...args: any[]): void {
    this._log(LOG_LEVEL.WARN, message, args);
  }

  public error(message: string = '', ...args: any[]): void {
    this._log(LOG_LEVEL.ERROR, message, ...args);
  }

  public fatal(message: string = '', ...args: any[]): void {
    this._log(LOG_LEVEL.FATAL, message, ...args);
  }

  public trace(message: string = '', ...args: any[]): void {
    this._log(LOG_LEVEL.FATAL, message, ...args);
  }

  public timeStart(message: string = '', ...args: any[]): void {
    this._log(LOG_LEVEL.TIMING_START, message, ...args);
  }

  public timeEnd(message: string = '', ...args: any[]): void {
    this._level < LOG_LEVEL.OFF &&
      this._log(LOG_LEVEL.TIMING_END, message, ...args);
  }

  private _log(
    level: LOG_LEVEL_VALUES,
    message: string = '',
    ...args: any[]
  ): void {
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
        this._consoleHandler &&
        this._consoleHandler(...arrayLog);
      (this._level >= level || level === LOG_LEVEL.ERROR) &&
        this._handler &&
        this._handler(log);

      (this._level >= level || level === LogLevel.ERROR) && this._addLog(log);
    } else if (!this._config?.['condenseLogs']) {
      (this._level >= level || level === LogLevel.ERROR) &&
        this._consoleHandler &&
        this._consoleHandler(...arrayLog);
      (this._level >= level || level === LOG_LEVEL.ERROR) &&
        this._handler &&
        this._handler(log);
      (this._level >= level || level === LOG_LEVEL.ERROR) && this._addLog(log);
    }
  }

  private _checkHash(log: Log): boolean {
    const strippedMessage = this._cleanString(log.message);
    const digest = hashMessage(strippedMessage);
    const hash = digest.toString();
    const item = this._logHashes.get(hash);
    if (item) {
      return true;
    } else {
      this._logHashes.set(hash, true);
      return false;
    }
  }

  private _addLog(log: Log) {
    this._logs.push(log);
    // TODO: currently we are not deleting old request id's which over time will fill local storage as the maximum storage size is 10mb
    // we should be deleting keys from the front of the collection of `Object.keys(category)` such that the first keys entered are deleted when we reach a pre defined key threshold
    // this implementation assumes that serialization / deserialization from `localStorage` keeps the same key ordering in each `category` object as we will asssume the array produced from `Object.keys` will always be the same ordering.
    // which then allows us to start at the front of the array and do `delete` operation on each key we wish to delete from the object.
    //log.id && this._addToLocalStorage(log);
  }

  private _addToLocalStorage(log: Log) {
    if (globalThis.localStorage) {
      let bucket: Record<string, string[]> | string | null =
        globalThis.localStorage.getItem(log.category);
      if (bucket) {
        bucket = JSON.parse(bucket) as Record<string, string[]>;
        if (!bucket[log.id]) {
          bucket[log.id] = [];
        }
        bucket[log.id].push(log.toString());
        globalThis.localStorage.setItem(log.category, _safeStringify(bucket));
      } else {
        const bucket: Record<string, string[]> = {};
        bucket[log.id] = [log.toString()];
        globalThis.localStorage.setItem(log.category, _safeStringify(bucket));
      }
    }
  }

  /**
   *
   * @param input string which will be cleaned of non utf-8 characters
   * @returns {string} input cleaned of non utf-8 characters
   */
  private _cleanString(input: string): string {
    let output = '';
    for (let i = 0; i < input.length; i++) {
      if (input.charCodeAt(i) <= 127) {
        output += input.charAt(i);
      }
    }
    return output;
  }
}

export class LogManager {
  private static _instance: LogManager;
  private _loggers: Map<string, Logger>;
  private _level: LOG_LEVEL_VALUES | undefined = LOG_LEVEL.DEBUG;
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

  public setLevel(level: LOG_LEVEL_VALUES) {
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

  get LoggerIds(): string[] {
    const keys: [string, number][] = [];
    for (const category of this._loggers.entries()) {
      for (const child of category[1].Children) {
        keys.push([child[0], child[1].timestamp]);
      }
    }

    return keys
      .sort((a: [string, number], b: [string, number]) => {
        return a[1] - b[1];
      })
      .map((value: [string, number]) => {
        return value[0];
      });
  }

  // if a logger is given an id it will persist logs under its logger instance
  public get(category: string, id?: string): Logger {
    let instance = this._loggers.get(category);
    if (!instance && !id) {
      this._loggers.set(
        category,
        Logger.createLogger(category, this._level ?? LOG_LEVEL.INFO, '', true)
      );

      instance = this._loggers.get(category) as Logger;
      instance.Config = this._config;
      return instance;
    }

    if (id) {
      if (!instance) {
        this._loggers.set(
          category,
          Logger.createLogger(category, this._level ?? LOG_LEVEL.INFO, '', true)
        );

        instance = this._loggers.get(category) as Logger;
        instance.Config = this._config;
      }
      const children = instance?.Children;
      let child = children?.get(id);
      if (child) {
        return child;
      }
      children?.set(
        id,
        Logger.createLogger(
          category,
          this._level ?? LOG_LEVEL.INFO,
          id ?? '',
          true
        )
      );

      child = children?.get(id) as Logger;
      child.Config = this._config;
      return children?.get(id) as Logger;
      // fall through condition for if there is no id for the logger and the category is not yet created.
      // ex: LogManager.Instance.get('foo');
    } else if (!instance) {
      this._loggers.set(
        category,
        Logger.createLogger(category, this._level ?? LOG_LEVEL.INFO, '', true)
      );

      instance = this._loggers.get(category) as Logger;
      instance.Config = this._config;
    }

    return instance as Logger;
  }

  getById(id: string): string[] {
    let logStrs: string[] = [];
    for (const category of this._loggers.entries()) {
      const logger = category[1].Children.get(id);
      if (logger) {
        const logStr = [];
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
        const bucketStr: string | null =
          globalThis.localStorage.getItem(category);
        const bucket: Record<string, string[]> = JSON.parse(
          bucketStr as string
        );
        if (bucket && bucket[id]) {
          const logsForId: string[] = bucket[id].filter((log: string) =>
            log.includes(id)
          );
          logsForRequest = logsForId.concat(logsForRequest);
        }
      }
    }

    return logsForRequest;
  }
}
