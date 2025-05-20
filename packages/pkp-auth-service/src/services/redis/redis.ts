import { createClient } from 'redis';
import { env } from '../../config/env';

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (error: Error) => {
  console.error(`Redis Error: ${error}`);
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();
