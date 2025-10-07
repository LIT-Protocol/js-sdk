import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

let cachedClient: RedisClient | null = null;
let cachedUrl: string | null = null;

export const getRedisClient = async (url: string): Promise<RedisClient> => {
  if (cachedClient && cachedUrl === url) return cachedClient;

  if (cachedClient) {
    try {
      await cachedClient.quit();
    } catch {}
    cachedClient = null;
  }

  const client = createClient({ url });
  client.on('error', (error: Error) => {
    console.error(`Redis Error: ${error}`);
  });
  await client.connect();

  cachedClient = client;
  cachedUrl = url;
  return client;
};

export const getCachedRedisClient = (): RedisClient | null => cachedClient;
