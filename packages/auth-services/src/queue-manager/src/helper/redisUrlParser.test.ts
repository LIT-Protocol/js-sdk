import { parseRedisUrl } from './redisUrlParser';
import { ConnectionOptions } from 'bullmq';

// Define a helper interface for test expectations if ConnectionOptions is too broad
interface ExpectedConnectionOpts {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

describe('parseRedisUrl', () => {
  // Restore console.warn before each test and spy on it
  let consoleWarnSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test('should parse a full Redis URL with user, password, host, port, and db', () => {
    const url = 'redis://user:password@testhost.com:1234/5';
    const expected: ExpectedConnectionOpts = {
      host: 'testhost.com',
      port: 1234,
      password: 'password',
      db: 5,
    };
    expect(parseRedisUrl(url)).toEqual(expected as ConnectionOptions);
  });

  test('should parse a Redis URL without user/password', () => {
    const url = 'redis://testhost.com:6379/0';
    const expected: ExpectedConnectionOpts = {
      host: 'testhost.com',
      port: 6379,
      db: 0,
    };
    expect(parseRedisUrl(url)).toEqual(expected as ConnectionOptions);
  });

  test('should parse a Redis URL with only host and port', () => {
    const url = 'redis://testhost.com:1234';
    const expected: ExpectedConnectionOpts = {
      host: 'testhost.com',
      port: 1234,
    };
    expect(parseRedisUrl(url)).toEqual(expected as ConnectionOptions);
  });

  test('should use default port if not specified', () => {
    const url = 'redis://testhost.com';
    const expected: ExpectedConnectionOpts = {
      host: 'testhost.com',
      port: 6379,
    };
    expect(parseRedisUrl(url)).toEqual(expected as ConnectionOptions);
  });

  test('should handle URL with only host', () => {
    const url = 'redis://testhost';
    const expected: ExpectedConnectionOpts = { host: 'testhost', port: 6379 };
    expect(parseRedisUrl(url)).toEqual(expected as ConnectionOptions);
  });

  test('should handle simple hostname as input, defaulting port', () => {
    const url = 'my-redis-server';
    const expected: ExpectedConnectionOpts = {
      host: 'my-redis-server',
      port: 6379,
    };
    expect(parseRedisUrl(url)).toEqual(expected as ConnectionOptions);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Invalid REDIS_URL ('${url}')`)
    );
  });

  test('should handle localhost as input, defaulting port', () => {
    const url = 'localhost';
    const expected: ExpectedConnectionOpts = { host: 'localhost', port: 6379 };
    expect(parseRedisUrl(url)).toEqual(expected as ConnectionOptions);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Invalid REDIS_URL ('${url}')`)
    );
  });

  test('should return default options for an empty string and log a warning', () => {
    const url = '';
    const expected: ExpectedConnectionOpts = { host: 'localhost', port: 6379 };
    expect(parseRedisUrl(url)).toEqual(expected as ConnectionOptions);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('REDIS_URL is undefined or empty')
    );
  });

  test('should handle Redis URL with no path (no db specified)', () => {
    const url = 'redis://user:password@testhost.com:1234';
    const result = parseRedisUrl(url) as ExpectedConnectionOpts;
    expect(result.host).toBe('testhost.com');
    expect(result.port).toBe(1234);
    expect(result.password).toBe('password');
    expect(result.db).toBeUndefined();
  });

  test('should handle Redis URL with path "/" (no db specified)', () => {
    const url = 'redis://user:password@testhost.com:1234/';
    const result = parseRedisUrl(url) as ExpectedConnectionOpts;
    expect(result.host).toBe('testhost.com');
    expect(result.port).toBe(1234);
    expect(result.password).toBe('password');
    expect(result.db).toBeUndefined();
  });
});
