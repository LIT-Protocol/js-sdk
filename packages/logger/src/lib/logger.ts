import { version, LOG_LEVEL, LOG_LEVEL_VALUES } from '@lit-protocol/constants';
import { hashMessage } from 'ethers/lib/utils';

export { LOG_LEVEL };
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

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function _convertLoggingLevel(level: LOG_LEVEL_VALUES): string {
  if (isBrowser()) {
    // For browsers, return plain text (styling applied separately)
    switch (level) {
      case LOG_LEVEL.INFO:
        return '[INFO]';
      case LOG_LEVEL.DEBUG:
        return '[DEBUG]';
      case LOG_LEVEL.WARN:
        return '[WARN]';
      case LOG_LEVEL.ERROR:
        return '[ERROR]';
      case LOG_LEVEL.FATAL:
        return '[FATAL]';
      case LOG_LEVEL.TIMING_START:
        return '[TIME_START]';
      case LOG_LEVEL.TIMING_END:
        return '[TIME_END]';
      default:
        return '[UNKNOWN]';
    }
  } else {
    // For terminals, use ANSI codes
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
      default:
        return '[UNKNOWN]';
    }
  }
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
  private _config?: Record<string, any>;
  private _customPrefix: string;

  constructor(
    timestamp: string,
    message: string,
    args: any[],
    id: string,
    category: string,
    level: LOG_LEVEL_VALUES,
    config?: Record<string, any>,
    customPrefix?: string
  ) {
    this.timestamp = timestamp;
    this.message = message;
    this.args = args;
    this.id = id;
    this.category = category;
    this.level = level;
    this._config = config;

    // Use the provided prefix exactly as is, only fall back to default if undefined/null
    this._customPrefix =
      customPrefix === undefined || customPrefix === null
        ? `[Lit-JS-SDK v${version}]`
        : customPrefix;

    // // For debugging in browser
    // if (typeof window !== 'undefined' && customPrefix) {
    //   console.log('Debug - Custom prefix set to:', this._customPrefix);
    // }
  }

  toString(): string {
    let fmtStr: string = `${this._customPrefix}`;

    // Add timestamp if configured
    if (this._config?.['includeTimestamp']) {
      fmtStr += `[${this.timestamp}]`;
    }

    fmtStr += `${_convertLoggingLevel(this.level)} [${this.category}] [id: ${
      this.id
    }] ${this.message}`;

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

    // Always add the prefix first
    args.push(this._customPrefix);

    if (this._config?.['includeTimestamp']) {
      args.push(`[${this.timestamp}]`);
    }

    // Handle level formatting differently for browsers
    if (isBrowser()) {
      // For browsers, use %c formatting
      args.push(
        '%c' + _convertLoggingLevel(this.level),
        getLevelStyle(this.level)
      );
    } else {
      // For terminals, use ANSI codes
      args.push(_convertLoggingLevel(this.level));
    }

    args.push(`[${this.category}]`);

    // Add ID if present
    if (this.id) {
      if (isBrowser()) {
        args.push('%c[id: ' + this.id + ']', 'color: cyan;');
      } else {
        args.push(`${colours.fg.cyan}[id: ${this.id}]${colours.reset}`);
      }
    }

    // Add message and args
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
  private _prefix: string = `[Lit-JS-SDK v${version}]`; // Default prefix

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

  /**
   * Sets a custom prefix for log messages
   * @param prefix The custom prefix to use instead of default "[Lit-JS-SDK v{version}]"
   * @param options Optional configuration for prefix behavior
   */
  public setPrefix(
    prefix: string,
    options?: { includeTimestamp?: boolean }
  ): void {
    // console.log('Logger.setPrefix called with:', prefix);
    this._prefix = prefix;

    // Update configuration if options provided
    if (options && typeof options.includeTimestamp !== 'undefined') {
      if (!this._config) {
        this._config = {};
      }
      this._config['includeTimestamp'] = options.includeTimestamp;
    }

    // Propagate to children
    if (this._children) {
      for (const child of this._children.values()) {
        child.setPrefix(prefix, options);
      }
    }
  }

  /**
   * Returns the current prefix for debugging purposes
   * @returns The current prefix
   */
  public getPrefix(): string {
    return this._prefix;
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
      level,
      this._config,
      this._prefix
    );

    if (this._level >= level || level === LogLevel.ERROR) {
      // Skip if condensing logs and this is a duplicate
      if (this._config?.['condenseLogs'] && this._checkHash(log)) {
        return;
      }

      // Special handling for browser environments
      if (isBrowser() && this._consoleHandler) {
        // Format for browser with consistent styling
        const prefix = this._prefix;
        const timestamp = this._config?.['includeTimestamp']
          ? `[${log.timestamp}] `
          : '';
        const category =
          this._category !== 'default' ? `[${this._category}] ` : '';
        const idStr = this._id ? `[id: ${this._id}] ` : '';

        // Choose color based on level
        const style = getLevelStyle(level);

        // Call with explicit styling - keep message separate for proper object handling
        this._consoleHandler(
          `${prefix} ${timestamp}%c${_convertLoggingLevel(
            level
          )}%c ${category}${idStr}`,
          style, // Style for the level
          '', // Reset style
          message,
          ...args
        );
      } else if (this._consoleHandler) {
        // Terminal environment - use existing array method
        const arrayLog = log.toArray();
        this._consoleHandler(...arrayLog);
      }

      // Handle additional logging actions
      if (this._handler) {
        this._handler(log);
      }

      this._addLog(log);
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
  private _defaultPrefix: string = `[Lit-JS-SDK v${version}]`; // Store the default prefix

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

  /**
   * Configure the LogManager with additional options
   * @param config Configuration options:
   * - condenseLogs: When true, identical log messages will be filtered out to reduce noise
   */
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

  /**
   * Sets a custom prefix for all loggers
   * @param prefix The custom prefix to use instead of default "[Lit-JS-SDK v{version}]"
   * @param options Optional configuration for prefix behavior
   */
  public setPrefix(
    prefix: string,
    options?: { includeTimestamp?: boolean }
  ): void {
    // Store the custom prefix for new loggers
    this._defaultPrefix = prefix;

    // Update config if options are provided
    if (options) {
      if (!this._config) {
        this._config = {};
      }
      this._config['includeTimestamp'] = options.includeTimestamp ?? false;
    }

    // Update existing loggers with the new prefix
    for (const logger of this._loggers.values()) {
      // Update the logger's prefix
      logger.setPrefix(prefix, options);

      // Also update all child loggers
      for (const childLogger of logger.Children.values()) {
        childLogger.setPrefix(prefix, options);
      }
    }
  }

  /**
   * Returns the current prefix set on the first logger (for debugging)
   * @returns The current prefix or undefined if no loggers exist
   */
  public getPrefix(): string | undefined {
    if (this._loggers.size === 0) {
      return undefined;
    }

    // Get the first logger
    const firstLogger = this._loggers.values().next().value;
    return firstLogger?.getPrefix();
  }

  public get(category?: string, id?: string): Logger {
    // Use a default category if none provided
    const actualCategory = category || 'default';

    let instance = this._loggers.get(actualCategory);
    if (!instance && !id) {
      // Create a new parent logger
      const logger = Logger.createLogger(
        actualCategory,
        this._level ?? LOG_LEVEL.INFO,
        '',
        true,
        this._config
      );

      // Set the custom prefix on the new logger
      logger.setPrefix(this._defaultPrefix);

      this._loggers.set(actualCategory, logger);
      instance = logger;
      return instance;
    }

    if (id) {
      if (!instance) {
        // Create a new parent logger if it doesn't exist
        const logger = Logger.createLogger(
          actualCategory,
          this._level ?? LOG_LEVEL.INFO,
          '',
          true,
          this._config
        );

        // Set the custom prefix on the new logger
        logger.setPrefix(this._defaultPrefix);

        this._loggers.set(actualCategory, logger);
        instance = logger;
      }

      const children = instance.Children;
      let child = children.get(id);

      if (child) {
        return child;
      }

      // Create a new child logger
      child = Logger.createLogger(
        actualCategory,
        this._level ?? LOG_LEVEL.INFO,
        id ?? '',
        true,
        this._config
      );

      // Set the custom prefix on the new child logger
      child.setPrefix(this._defaultPrefix);

      children.set(id, child);
      return child;
    }

    // Fix here - ensure we never return undefined
    if (!instance) {
      // Create a default logger if somehow we get here without an instance
      const logger = Logger.createLogger(
        actualCategory,
        this._level ?? LOG_LEVEL.INFO,
        '',
        true,
        this._config
      );
      logger.setPrefix(this._defaultPrefix);
      this._loggers.set(actualCategory, logger);
      return logger;
    }

    return instance;
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

function getLevelStyle(level: LOG_LEVEL_VALUES): string {
  switch (level) {
    case LOG_LEVEL.INFO:
      return 'color: green;';
    case LOG_LEVEL.DEBUG:
      return 'color: cyan;';
    case LOG_LEVEL.WARN:
      return 'color: orange;';
    case LOG_LEVEL.ERROR:
      return 'color: red;';
    case LOG_LEVEL.FATAL:
      return 'color: red; font-weight: bold;';
    case LOG_LEVEL.TIMING_START:
      return 'color: blue;';
    case LOG_LEVEL.TIMING_END:
      return 'color: blue; font-style: italic;';
    default:
      return 'color: inherit;';
  }
}
