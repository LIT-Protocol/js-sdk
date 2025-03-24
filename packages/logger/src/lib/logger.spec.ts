import { LOG_LEVEL, LogLevel, LogManager } from './logger';

describe('logger', () => {
  let lm: LogManager;
  beforeEach(() => {
    LogManager.clearInstance();
    lm = LogManager.Instance;
  });

  it('Log Manager singleton should be defined', () => {
    expect(typeof lm).toEqual('object');
  });

  it('should make logger with category', () => {
    const logger = lm.get('category');
    expect(logger.category).toEqual('category');
  });

  it('should make logger with id and category', () => {
    const logger = lm.get('category', 'foo');
    expect(logger.id).toEqual('foo');
  });

  it('Log Manager should pass config to loggers', () => {
    lm.withConfig({
      condenseLogs: true,
    });
    const logger = lm.get('category');
    expect(logger.Config?.['condenseLogs']).toEqual(true);
  });

  it('Hashing enabled should filter non unique logs', () => {
    lm.withConfig({
      condenseLogs: true,
    });
    const logger = lm.get('category', 'bar');
    logger.setLevel(LOG_LEVEL.INFO);
    expect(logger.Config?.['condenseLogs']).toEqual(true);
    logger.info('hello');
    logger.info('hello');
    const logs = lm.getLogsForId('bar');
    expect(logs.length).toEqual(1);
  });

  it('should respect info logging level', () => {
    const logger = lm.get('info-logger', 'foo');
    logger.setLevel(LOG_LEVEL.INFO);
    logger.info('logging');
    logger.debug('shouldnt log');
    const logs = lm.getLogsForId('foo');
    expect(logs.length).toEqual(1);
  });

  it('should log error at any level', () => {
    const logger = lm.get('info-logger', 'foo2');
    logger.setLevel(LOG_LEVEL.DEBUG);
    logger.debug('logging');
    logger.error('error');
    const logs = lm.getLogsForId('foo2');
    expect(logs.length).toEqual(2);
  });

  it('should safe serialize circular references', () => {
    const logger = lm.get('info-logger', 'foo3');
    logger.setLevel(LOG_LEVEL.DEBUG);
    const circ: any = { foo: 'bar' };
    circ.circ = circ;
    logger.debug('circular reference to serialize', circ);
    console.log(lm.getLogsForId('foo3'));
    expect(lm.getLogsForId('foo3').length).toEqual(1);
  });

  it('should trace logs through multiple categories', () => {
    const logger = lm.get('info-logger', 'foo4');
    logger.setLevel(LOG_LEVEL.DEBUG);
    const logger2 = lm.get('debug-logger', 'foo4');
    logger2.setLevel(LOG_LEVEL.DEBUG);
    logger2.debug('foo');
    logger.debug('bar');
    expect(lm.getLogsForId('foo4').length).toEqual(2);
  });

  it('should not persist logs if level set to OFF', () => {
    const count = 1_000;
    for (let i = 0; i < count; i++) {
      const logger = lm.get('' + i, 'foo5');
      logger.setLevel(LOG_LEVEL.OFF);
      logger.debug(i + '');
    }

    expect(lm.getLogsForId('foo5').length).toEqual(0);
  });

  it('should persist logs across categories', async () => {
    const count = 10_000;
    for (let i = 0; i < count; i++) {
      const logger = lm.get('' + i, 'foo6');
      logger.setLevel(LOG_LEVEL.DEBUG);
      logger.debug(i + '');
    }

    expect(lm.getLogsForId('foo6').length).toEqual(count);
  });

  it('should retain logger keys and return from LogManager', () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const logger = lm.get('' + i, 'foo7');
      logger.setLevel(LogLevel.DEBUG);
      logger.debug(i + '');
    }

    expect(lm.getLogsForId('foo7').length).toEqual(count);
    expect(lm.LoggerIds.length).toEqual(10);
  });

  it('should order logs based on logger creation timestamp', async () => {
    const loggerA = lm.get('a', '1');
    await new Promise((res) => setTimeout(res, 100));
    const loggerB = lm.get('b', '2');

    const requestIds = lm.LoggerIds;

    expect(requestIds.length).toBe(2);
    expect(loggerA.timestamp).toBeLessThan(loggerB.timestamp);
    expect(requestIds[0]).toBe('1');
    expect(requestIds[1]).toBe('2');
  });
});

describe('Logger Prefix Tests', () => {
  beforeEach(() => {
    // Clear the LogManager instance before each test
    LogManager.clearInstance();
    // Spy on console.log to verify output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should use default prefix when no custom prefix is set', () => {
    // Get a logger without setting a custom prefix
    const logger = LogManager.Instance.get('test-category');

    // Call a logging method
    logger.debug('Test message');

    // Verify the first argument to console.debug contains the default prefix
    expect(console.debug).toHaveBeenCalled();
    const firstArg = (console.debug as jest.Mock).mock.calls[0][0];
    expect(firstArg).toMatch(/\[Lit-JS-SDK v[0-9.]+\]/);
  });

  it('should apply custom prefix to existing loggers', () => {
    // Create a logger first
    const logger = LogManager.Instance.get('test-category');

    // Then set a custom prefix
    LogManager.Instance.setPrefix('[MyApp]');

    // Verify the prefix was set
    expect(logger.getPrefix()).toBe('[MyApp]');

    // Verify log output has the custom prefix
    logger.debug('Test message');
    expect(console.debug).toHaveBeenCalled();
    const firstArg = (console.debug as jest.Mock).mock.calls[0][0];
    expect(firstArg).toBe('[MyApp]');
  });

  it('should apply custom prefix to new loggers', () => {
    // Set a custom prefix first
    LogManager.Instance.setPrefix('[MyApp]');

    // Then create a logger
    const logger = LogManager.Instance.get('test-category');

    // Verify the prefix was applied
    expect(logger.getPrefix()).toBe('[MyApp]');

    // Verify log output has the custom prefix
    logger.debug('Test message');
    expect(console.debug).toHaveBeenCalled();
    const firstArg = (console.debug as jest.Mock).mock.calls[0][0];
    expect(firstArg).toBe('[MyApp]');
  });

  it('should apply custom prefix to child loggers', () => {
    // Set a custom prefix
    LogManager.Instance.setPrefix('[MyApp]');

    // Create a parent logger
    const parentLogger = LogManager.Instance.get('parent-category');

    // Create a child logger
    const childLogger = LogManager.Instance.get('parent-category', 'child-id');

    // Verify both loggers have the custom prefix
    expect(parentLogger.getPrefix()).toBe('[MyApp]');
    expect(childLogger.getPrefix()).toBe('[MyApp]');

    // Verify log output from child has the custom prefix
    childLogger.debug('Test message');
    expect(console.debug).toHaveBeenCalled();
    const firstArg = (console.debug as jest.Mock).mock.calls[0][0];
    expect(firstArg).toBe('[MyApp]');
  });

  it('should update all loggers when prefix is changed', () => {
    // Create multiple loggers
    const logger1 = LogManager.Instance.get('category1');
    const logger2 = LogManager.Instance.get('category2');
    const childLogger = LogManager.Instance.get('category1', 'child-id');

    // Set a custom prefix
    LogManager.Instance.setPrefix('[FirstPrefix]');

    // Verify all loggers have the first prefix
    expect(logger1.getPrefix()).toBe('[FirstPrefix]');
    expect(logger2.getPrefix()).toBe('[FirstPrefix]');
    expect(childLogger.getPrefix()).toBe('[FirstPrefix]');

    // Change the prefix
    LogManager.Instance.setPrefix('[SecondPrefix]');

    // Verify all loggers have the updated prefix
    expect(logger1.getPrefix()).toBe('[SecondPrefix]');
    expect(logger2.getPrefix()).toBe('[SecondPrefix]');
    expect(childLogger.getPrefix()).toBe('[SecondPrefix]');

    // Create a new logger after changing prefix
    const logger3 = LogManager.Instance.get('category3');

    // Verify new logger has the updated prefix
    expect(logger3.getPrefix()).toBe('[SecondPrefix]');
  });

  it('should correctly format logs with the custom prefix', () => {
    // Set a custom prefix
    LogManager.Instance.setPrefix('[TestPrefix]');

    // Create a logger
    const logger = LogManager.Instance.get('test-category');

    // Log a message
    logger.info('Test message with custom prefix');

    // Verify console.info was called with the correct prefix
    expect(console.info).toHaveBeenCalled();
    const args = (console.info as jest.Mock).mock.calls[0];
    expect(args[0]).toBe('[TestPrefix]');
  });

  it('should handle empty prefix correctly', () => {
    // Set an empty prefix
    LogManager.Instance.setPrefix('');

    // Create a logger
    const logger = LogManager.Instance.get('test-category');

    // Verify the prefix is empty
    expect(logger.getPrefix()).toBe('');

    // Log a message
    logger.info('Test message with empty prefix');

    // Verify console.info was called with empty prefix
    expect(console.info).toHaveBeenCalled();
    const args = (console.info as jest.Mock).mock.calls[0];
    expect(args[0]).toBe('');
  });

  it('should handle special characters in prefix', () => {
    // Set a prefix with special characters
    const specialPrefix = '[🔥 Special-Prefix! 🔥]';
    LogManager.Instance.setPrefix(specialPrefix);

    // Create a logger
    const logger = LogManager.Instance.get('test-category');

    // Verify the prefix contains the special characters
    expect(logger.getPrefix()).toBe(specialPrefix);

    // Log a message
    logger.info('Test message with special prefix');

    // Verify console.info was called with the special prefix
    expect(console.info).toHaveBeenCalled();
    const args = (console.info as jest.Mock).mock.calls[0];
    expect(args[0]).toBe(specialPrefix);
  });
});
