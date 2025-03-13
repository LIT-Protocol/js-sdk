import { Writable } from 'stream';

import { logger, setLoggerOptions, getChildLogger } from './logger';

class TestStream extends Writable {
  public data = '';

  override _write(
    chunk: { toString: () => string },
    encoding: string,
    callback: () => void
  ) {
    this.data += chunk.toString();
    callback();
  }
}

describe('logger', () => {
  it('should have default level "info"', () => {
    expect(logger.level).toBe('info');
  });

  it('setLoggerOptions should update logger options', () => {
    const testLogger = setLoggerOptions({ level: 'debug', name: 'TestLogger' });
    expect(testLogger.level).toBe('debug');
  });

  it('getChildLogger should create a child logger', () => {
    const childLogger = getChildLogger({ module: 'childTest' });
    expect(typeof childLogger.child).toBe('function');
    expect(() => childLogger.info('Child logger test message')).not.toThrow();
  });

  it('should log messages correctly on the parent logger', (done) => {
    // Override the global logger with a test logger using our own destination stream:
    const testStream = new TestStream();
    const testLogger = setLoggerOptions(
      { level: 'info', name: 'ParentTestLogger' },
      testStream
    );
    testLogger.info('Parent message');

    // Give a small amount time for the stream to process the log
    setTimeout(() => {
      expect(testStream.data).toMatch(/Parent message/);
      done();
    }, 50);
  });

  it('should log messages on a child logger using the parent transport but adding its bindings', (done) => {
    // Override the global logger for consistency in our test:
    const testStream = new TestStream();
    setLoggerOptions({ level: 'info', name: 'ParentTestLogger' }, testStream);
    const childLogger = getChildLogger({ module: 'ChildModule' });
    childLogger.info('Child message');

    setTimeout(() => {
      try {
        expect(testStream.data).toMatch('"name":"ParentTestLogger"');
        expect(testStream.data).toMatch('"msg":"Child message"');
        expect(testStream.data).toMatch('"module":"ChildModule"');
        done();
      } catch (error) {
        done(error);
      }
    }, 50);
  });
});
