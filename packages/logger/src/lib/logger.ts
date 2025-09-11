import pinoInstance, {
  DestinationStream,
  LoggerOptions,
  Logger as Pino,
} from 'pino';

const isNode = () => {
  let isNode = false;
  // @ts-ignore
  if (typeof process === 'object') {
    // @ts-ignore
    if (typeof process.versions === 'object') {
      // @ts-ignore
      if (typeof process.versions.node !== 'undefined') {
        isNode = true;
      }
    }
  }
  return isNode;
};

export const getDefaultLevel = () => {
  let logLevel = 'silent';

  if (isNode()) {
    logLevel = process.env['LOG_LEVEL'] || 'silent';
  } else {
    // @ts-ignore
    logLevel = globalThis['LOG_LEVEL'] || 'silent';
  }

  // console.log('✅ logLevel', logLevel);
  return logLevel;
};

const DEFAULT_LOGGER_OPTIONS = {
  name: 'LitProtocolSDK',
  level: getDefaultLevel() === 'debug2' ? 'debug' : getDefaultLevel(),
};

// Custom logger wrapper for debug2 level
const createConsoleLogger = (name: string): any => {
  const baseLogger = {
    level: 'debug', // Use standard level to avoid pino errors

    // Standard log levels that delegate to console
    fatal: (...args: any[]) => console.error(`[${name}] FATAL:`, ...args),
    error: (...args: any[]) => console.error(`[${name}] ERROR:`, ...args),
    warn: (...args: any[]) => console.warn(`[${name}] WARN:`, ...args),
    info: (...args: any[]) => console.info(`[${name}] INFO:`, ...args),
    debug: (...args: any[]) => console.log(`[${name}] DEBUG:`, ...args),
    trace: (...args: any[]) => console.log(`[${name}] TRACE:`, ...args),

    // Custom debug2 level using console.log
    debug2: (...args: any[]) => console.log(`[${name}] DEBUG2:`, ...args),

    // Child logger creation
    child: (bindings: any) => {
      const childName = bindings.module ? `${name}:${bindings.module}` : name;
      return createConsoleLogger(childName);
    },

    // Silent method (no-op)
    silent: () => {},

    // Add stub methods for pino compatibility
    on: () => baseLogger,
    addLevel: () => {},
    isLevelEnabled: () => true,
    levelVal: 30,
    version: '1.0.0',
  };

  return baseLogger;
};

type Logger = Pino<string, boolean>;
let logger: Logger = (
  getDefaultLevel() === 'debug2'
    ? createConsoleLogger(DEFAULT_LOGGER_OPTIONS.name)
    : pinoInstance(DEFAULT_LOGGER_OPTIONS)
) as Logger;

function setLoggerOptions(
  loggerOptions: LoggerOptions<string, false>,
  destination?: DestinationStream
): Logger {
  const finalOptions = {
    ...DEFAULT_LOGGER_OPTIONS,
    ...loggerOptions,
  };

  // Use console logger for debug2 level
  if (finalOptions.level === 'debug2') {
    logger = createConsoleLogger(
      finalOptions.name || 'LitProtocolSDK'
    ) as Logger;
  } else {
    // Ensure we don't pass debug2 to pino - convert to debug instead
    const pinoOptions = {
      ...finalOptions,
      level: finalOptions.level === 'debug2' ? 'debug' : finalOptions.level,
    };
    logger = pinoInstance(pinoOptions, destination);
  }

  return logger;
}

function getChildLogger(
  ...childParams: Parameters<typeof logger.child>
): Logger {
  return logger.child(...childParams);
}

export { getChildLogger, logger, setLoggerOptions };
export type { Logger };
