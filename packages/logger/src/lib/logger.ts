import pinoInstance, { Logger as Pino, LoggerOptions, DestinationStream } from 'pino';

const DEFAULT_LOGGER_OPTIONS = {
  name: 'LitProtocolSDK',
  level: 'info',
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
