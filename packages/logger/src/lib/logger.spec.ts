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

  it('should allow custom log prefix', () => {
    const customPrefix = '[CustomApp]';
    lm.withConfig({
      logPrefix: customPrefix,
    });
    const logger = lm.get('custom-prefix-category', 'custom-prefix-id');
    logger.setLevel(LOG_LEVEL.INFO);
    logger.info('test message');
    const logs = lm.getLogsForId('custom-prefix-id');
    expect(logs.length).toEqual(1);
    expect(logs[0].startsWith(customPrefix)).toBeTruthy();
  });
});
