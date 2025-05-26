import pinoInstance, {
  Logger as Pino,
  LoggerOptions,
  DestinationStream,
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
  }else{
    // @ts-ignore
    logLevel = globalThis['LOG_LEVEL'] || 'silent';
  }

  console.log('✅ logLevel', logLevel);
  return logLevel;
};

const DEFAULT_LOGGER_OPTIONS = {
  name: 'LitProtocolSDK',
  level: getDefaultLevel(),
};

type Logger = Pino<string, boolean>;
let logger: Logger = pinoInstance(DEFAULT_LOGGER_OPTIONS);

function setLoggerOptions(
  loggerOptions: LoggerOptions<string, false>,
  destination?: DestinationStream
): Logger {
  logger = pinoInstance(
    {
      ...DEFAULT_LOGGER_OPTIONS,
      ...loggerOptions,
    },
    destination
  );

  return logger;
}

function getChildLogger(
  ...childParams: Parameters<typeof logger.child>
): Logger {
  return logger.child(...childParams);
}

export { Logger, logger, setLoggerOptions, getChildLogger };
