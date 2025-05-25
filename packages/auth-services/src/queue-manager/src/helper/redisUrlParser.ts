import { ConnectionOptions } from 'bullmq';

/**
 * Parses a Redis URL string and returns BullMQ ConnectionOptions.
 * @param redisUrlString The Redis URL (e.g., redis://user:pass@host:port/db).
 * @returns ConnectionOptions for BullMQ.
 */
export function parseRedisUrl(redisUrlString: string): ConnectionOptions {
  if (!redisUrlString) {
    console.warn(
      '[RedisParser] REDIS_URL is undefined or empty, using default Redis connection options: localhost:6379'
    );
    return { host: 'localhost', port: 6379 } as ConnectionOptions;
  }
  try {
    const url = new URL(redisUrlString);
    const connectionOpts: any = {
      host: url.hostname || 'localhost',
      port: parseInt(url.port, 10) || 6379,
    };
    if (url.password) {
      connectionOpts.password = url.password;
    }
    // URL.pathname for redis URLs is like '/0' or just '/' if no db is specified.
    // It might be empty if the URL is just redis://host:port
    if (url.pathname && url.pathname !== '/') {
      const dbNumber = parseInt(url.pathname.substring(1), 10);
      if (!isNaN(dbNumber)) {
        connectionOpts.db = dbNumber;
      }
    }
    return connectionOpts as ConnectionOptions;
  } catch (error: any) {
    console.warn(
      `[RedisParser] Invalid REDIS_URL ('${redisUrlString}'), attempting to use as hostname or fallback to default. Error: ${error.message}`
    );
    // Fallback if parsing fails (e.g., if REDIS_URL is just 'localhost' or 'my-redis-host')
    // This regex checks if it looks like a hostname without protocol or port
    const hostnameRegex = /^[a-zA-Z0-9.-]+$/;
    if (hostnameRegex.test(redisUrlString)) {
      console.log(
        `[RedisParser] Assuming '${redisUrlString}' is a hostname, using default port 6379.`
      );
      return { host: redisUrlString, port: 6379 } as ConnectionOptions;
    }
    console.warn(
      '[RedisParser] Falling back to default Redis connection options: localhost:6379 due to parsing error.'
    );
    return { host: 'localhost', port: 6379 } as ConnectionOptions;
  }
}
