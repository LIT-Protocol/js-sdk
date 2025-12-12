import pinoInstance, {
  DestinationStream,
  LoggerOptions,
  Logger as Pino,
} from 'pino';

export type LogLevel =
  | 'silent'
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'debug2'
  | 'trace';

export interface LogEntry {
  level: LogLevel;
  time: number;
  msg?: string;
  data?: unknown;
  bindings: Record<string, unknown>;
  args: unknown[];
}

export type LogTransport = (entry: LogEntry) => void | Promise<void>;

const LEVEL_RANK: Record<LogLevel, number> = {
  silent: 100,
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  debug2: 15,
  trace: 10,
};

const isNodeEnvironment = () =>
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export const getDefaultLevel = (): LogLevel => {
  let logLevel: string | undefined;

  if (isNodeEnvironment()) {
    logLevel = process.env['LOG_LEVEL'];
  } else {
    // @ts-ignore - globalThis is available in browsers
    logLevel = globalThis['LOG_LEVEL'];
  }

  return (logLevel as LogLevel) || 'silent';
};

const DEFAULT_LOGGER_OPTIONS: LoggerOptions<string, false> = {
  name: 'LitProtocolSDK',
  level: getDefaultLevel(),
};

type LoggerImpl = {
  level?: string;
  fatal: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  trace: (...args: any[]) => void;
  child?: (bindings: Record<string, unknown>) => LoggerImpl;
  isLevelEnabled?: (level: string) => boolean;
};

type Logger = Pino<string, boolean> & LoggerImpl;

interface InternalConfig {
  level: LogLevel;
  name: string;
  bindings: Record<string, unknown>;
  transports: LogTransport[];
  useDefaultTransports: boolean;
  impl: LoggerImpl;
}

const normalizeLevelForPino = (level: LogLevel): string =>
  level === 'debug2' ? 'debug' : level;

const createConsoleLogger = (name: string): LoggerImpl => {
  const baseLogger: LoggerImpl = {
    level: 'debug',
    fatal: (...args) => console.error(`[${name}] FATAL:`, ...args),
    error: (...args) => console.error(`[${name}] ERROR:`, ...args),
    warn: (...args) => console.warn(`[${name}] WARN:`, ...args),
    info: (...args) => console.info(`[${name}] INFO:`, ...args),
    debug: (...args) => console.log(`[${name}] DEBUG:`, ...args),
    trace: (...args) => console.log(`[${name}] TRACE:`, ...args),
    child: (bindings) => {
      const moduleName = bindings['module'];
      const childName =
        typeof moduleName === 'string' ? `${name}:${moduleName}` : name;
      return createConsoleLogger(childName);
    },
    isLevelEnabled: () => true,
  };

  // @ts-expect-error - debug2 is not part of LoggerImpl, but we keep it for compatibility.
  baseLogger.debug2 = (...args: any[]) =>
    console.log(`[${name}] DEBUG2:`, ...args);

  return baseLogger;
};

const createDefaultImpl = (
  options: LoggerOptions<string, false>,
  destination?: DestinationStream
): LoggerImpl => {
  const effectiveLevel = normalizeLevelForPino(
    (options.level as LogLevel) || getDefaultLevel()
  );

  if (options.level === 'debug2') {
    return createConsoleLogger(options.name || DEFAULT_LOGGER_OPTIONS.name!);
  }

  const pinoOptions: LoggerOptions<string, false> = {
    ...DEFAULT_LOGGER_OPTIONS,
    ...options,
    level: effectiveLevel,
  };

  if (!isNodeEnvironment()) {
    pinoOptions.browser = {
      asObject: true,
      ...(pinoOptions.browser || {}),
    };
  }

  return pinoInstance(pinoOptions, destination) as unknown as LoggerImpl;
};

const config: InternalConfig = {
  level: getDefaultLevel(),
  name: DEFAULT_LOGGER_OPTIONS.name!,
  bindings: {},
  transports: [],
  useDefaultTransports: true,
  impl: createDefaultImpl(DEFAULT_LOGGER_OPTIONS),
};

const shouldLog = (level: LogLevel): boolean => {
  if (config.level === 'silent') return false;
  return LEVEL_RANK[level] >= LEVEL_RANK[config.level];
};

const extractMsgAndData = (args: unknown[]): Pick<LogEntry, 'msg' | 'data'> => {
  if (args.length === 0) return {};
  const [first, second] = args;

  if (typeof first === 'string') {
    if (second && typeof second === 'object') {
      return { msg: first, data: second };
    }
    return { msg: first };
  }

  if (first instanceof Error) {
    if (typeof second === 'string') {
      return { msg: second, data: { err: first } };
    }
    return { msg: first.message, data: { err: first } };
  }

  if (first && typeof first === 'object') {
    const msg =
      typeof second === 'string'
        ? second
        : typeof (first as any).msg === 'string'
          ? (first as any).msg
          : undefined;
    return { msg, data: first };
  }

  return { msg: String(first) };
};

const emitToTransports = (entry: LogEntry) => {
  for (const transport of config.transports) {
    try {
      void transport(entry);
    } catch {
      // ignore transport errors
    }
  }
};

const logWithLevel = (
  level: LogLevel,
  getImpl: () => LoggerImpl,
  bindings: Record<string, unknown>,
  args: unknown[]
) => {
  if (!shouldLog(level)) return;

  const impl = getImpl();
  const implLevel = normalizeLevelForPino(level);
  const mergedBindings = {
    name: config.name,
    ...config.bindings,
    ...bindings,
  };
  const implMethod =
    // @ts-ignore - dynamic level access
    (impl as any)[level] || (level === 'debug2' ? impl.debug : undefined);

  if (
    config.useDefaultTransports &&
    typeof implMethod === 'function' &&
    (!impl.isLevelEnabled || impl.isLevelEnabled(implLevel))
  ) {
    implMethod.apply(impl, args as any);
  }

  if (config.transports.length > 0) {
    const { msg, data } = extractMsgAndData(args);
    emitToTransports({
      level,
      time: Date.now(),
      msg,
      data,
      bindings: mergedBindings,
      args,
    });
  }
};

const createLoggerWrapper = (
  getImpl: () => LoggerImpl,
  bindings: Record<string, unknown>
): LoggerImpl => {
  const wrapper: LoggerImpl = {
    get level() {
      return config.level;
    },
    fatal: (...args) => logWithLevel('fatal', getImpl, bindings, args),
    error: (...args) => logWithLevel('error', getImpl, bindings, args),
    warn: (...args) => logWithLevel('warn', getImpl, bindings, args),
    info: (...args) => logWithLevel('info', getImpl, bindings, args),
    debug: (...args) => logWithLevel('debug', getImpl, bindings, args),
    trace: (...args) => logWithLevel('trace', getImpl, bindings, args),
    // @ts-expect-error - debug2 is custom but supported.
    debug2: (...args: any[]) => logWithLevel('debug2', getImpl, bindings, args),
    child: (childBindings) => {
      const mergedBindings = { ...bindings, ...childBindings };
      return createLoggerWrapper(
        () => {
          const impl = getImpl();
          return impl.child ? impl.child(childBindings) : impl;
        },
        mergedBindings
      );
    },
  };

  return wrapper;
};

const rootLogger = createLoggerWrapper(() => config.impl, {
  name: config.name,
});

type ExtraLoggerOptions = {
  transports?: LogTransport[];
  useDefaultTransports?: boolean;
  impl?: LoggerImpl;
  bindings?: Record<string, unknown>;
};

function setLoggerOptions(
  loggerOptions: LoggerOptions<string, false> & ExtraLoggerOptions,
  destination?: DestinationStream
): Logger {
  const {
    transports,
    useDefaultTransports,
    impl,
    bindings,
    ...pinoOptions
  } = loggerOptions || {};

  if (bindings) {
    config.bindings = { ...config.bindings, ...bindings };
  }

  if (typeof useDefaultTransports === 'boolean') {
    config.useDefaultTransports = useDefaultTransports;
  }

  if (transports) {
    config.transports = transports;
  }

  const level = (loggerOptions.level as LogLevel) || getDefaultLevel();
  config.level = level;

  const name = (loggerOptions.name as string) || DEFAULT_LOGGER_OPTIONS.name!;
  config.name = name;

  if (impl) {
    config.impl = impl;
  } else {
    if (level === 'debug2') {
      config.impl = createConsoleLogger(name);
    } else {
      const effectivePinoOptions: LoggerOptions<string, false> = {
        ...DEFAULT_LOGGER_OPTIONS,
        ...pinoOptions,
        level: normalizeLevelForPino(level),
        name,
        base: { ...(pinoOptions.base || {}), ...config.bindings },
      };

      config.impl = createDefaultImpl(effectivePinoOptions, destination);
    }
  }

  return rootLogger as unknown as Logger;
}

function getChildLogger(
  ...childParams: Parameters<NonNullable<LoggerImpl['child']>>
): Logger {
  // Root logger always has child()
  // @ts-ignore
  return (rootLogger.child as any)(...childParams) as Logger;
}

export { getChildLogger, rootLogger as logger, setLoggerOptions };
export type { Logger };
