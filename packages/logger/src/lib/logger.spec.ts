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

  describe('JSON output format', () => {
    let originalConsoleLog: any;
    let consoleOutput: string[] = [];

    beforeEach(() => {
      originalConsoleLog = console.log;
      console.log = jest.fn((output: string) => {
        consoleOutput.push(output);
      });
      consoleOutput = [];
    });

    afterEach(() => {
      console.log = originalConsoleLog;
    });

    it('should output JSON format when configured', () => {
      lm.setLogFormat('json');
      const logger = lm.get('json-test', 'test-id');
      logger.setLevel(LOG_LEVEL.DEBUG);

      logger.info('Test message', { extra: 'data' });

      expect(consoleOutput.length).toBe(1);
      const jsonLog = JSON.parse(consoleOutput[0]);
      expect(jsonLog.message).toBe('Test message');
      expect(jsonLog.level).toBe('INFO');
      expect(jsonLog.category).toBe('json-test');
      expect(jsonLog.id).toBe('test-id');
      expect(jsonLog.args).toEqual([{ extra: 'data' }]);
    });

    it('should output DataDog format when configured', () => {
      lm.setLogFormat('datadog');
      const logger = lm.get('datadog-test', 'dd-id');
      logger.setLevel(LOG_LEVEL.DEBUG);

      logger.error('Error occurred', { code: 500 });

      expect(consoleOutput.length).toBe(1);
      const jsonLog = JSON.parse(consoleOutput[0]);
      expect(jsonLog.message).toBe('Error occurred');
      expect(jsonLog.level).toBe('error');
      expect(jsonLog.service).toBe('lit-sdk');
      expect(jsonLog.category).toBe('datadog-test');
      expect(jsonLog.id).toBe('dd-id');
      expect(jsonLog.metadata.args).toEqual([{ code: 500 }]);
    });

    it('should map log levels correctly for DataDog', () => {
      lm.setLogFormat('datadog');
      const logger = lm.get('level-test');
      logger.setLevel(LOG_LEVEL.DEBUG);

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      logger.fatal('fatal message');

      expect(consoleOutput.length).toBe(5);

      expect(JSON.parse(consoleOutput[0]).level).toBe('debug');
      expect(JSON.parse(consoleOutput[1]).level).toBe('info');
      expect(JSON.parse(consoleOutput[2]).level).toBe('warning');
      expect(JSON.parse(consoleOutput[3]).level).toBe('error');
      expect(JSON.parse(consoleOutput[4]).level).toBe('critical');
    });

    it('should default to text format when not configured', () => {
      const logger = lm.get('text-test');
      logger.setLevel(LOG_LEVEL.INFO);

      const originalConsoleInfo = console.info;
      console.info = jest.fn();

      logger.info('Text format message');

      expect(console.info).toHaveBeenCalled();
      expect(consoleOutput.length).toBe(0); // No JSON output

      console.info = originalConsoleInfo;
    });

    it('should use custom service name in DataDog format', () => {
      lm.setLogFormat('datadog');
      lm.setServiceName('my-custom-service');
      const logger = lm.get('service-test', 'service-id');
      logger.setLevel(LOG_LEVEL.DEBUG);

      logger.info('Custom service test', { data: 'test' });

      expect(consoleOutput.length).toBe(1);
      const jsonLog = JSON.parse(consoleOutput[0]);
      expect(jsonLog.service).toBe('my-custom-service');
      expect(jsonLog.message).toBe('Custom service test');
      expect(jsonLog.category).toBe('service-test');
      expect(jsonLog.id).toBe('service-id');
    });

    it('should default to "lit-sdk" service name when not specified', () => {
      lm.setLogFormat('datadog');
      const logger = lm.get('default-service-test');
      logger.setLevel(LOG_LEVEL.DEBUG);

      logger.warn('Default service name test');

      expect(consoleOutput.length).toBe(1);
      const jsonLog = JSON.parse(consoleOutput[0]);
      expect(jsonLog.service).toBe('lit-sdk');
      expect(jsonLog.level).toBe('warning');
    });
  });
});
