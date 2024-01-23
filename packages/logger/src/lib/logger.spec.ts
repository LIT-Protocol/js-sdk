import { Logger, LogLevel, LogManager } from './logger';

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
    let logger = lm.get('category');
    expect(logger.Config?.['condenseLogs']).toEqual(true);
  });

  it('Hashing enabled should filter non unique logs', () => {
    lm.withConfig({
      condenseLogs: true,
    });
    let logger = lm.get('category', 'bar');
    expect(logger.Config?.['condenseLogs']).toEqual(true);
    logger.info('hello');
    logger.info('hello');
    let logs = lm.getLogsForId('bar');
    expect(logs.length).toEqual(1);
  });

  it('should respect info logging level', () => {
    const logger = lm.get('info-logger', 'foo');
    logger.setLevel(LogLevel.INFO);
    logger.info('logging');
    logger.debug('shouldnt log');
    let logs = lm.getLogsForId('foo');
    expect(logs.length).toEqual(1);
  });

  it('should log error at any level', () => {
    const logger = lm.get('info-logger', 'foo2');
    logger.setLevel(LogLevel.DEBUG);
    logger.debug('logging');
    logger.error('error');
    let logs = lm.getLogsForId('foo2');
    expect(logs.length).toEqual(2);
  });

  it('should safe serialize circular references', () => {
    const logger = lm.get('info-logger', 'foo3');
    logger.setLevel(LogLevel.DEBUG);
    let circ: any = { foo: 'bar' };
    circ.circ = circ;
    logger.debug('circular reference to serialize', circ);
    console.log(lm.getLogsForId('foo3'));
    expect(lm.getLogsForId('foo3').length).toEqual(1);
  });
});
