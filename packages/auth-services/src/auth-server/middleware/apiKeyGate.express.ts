import { NextFunction, Request, Response } from 'express';
import { getCachedRedisClient, getRedisClient } from '../../_setup/redis';
import { AppConfig } from '../src/providers/env';

export const apiKeyGate =
  (cfg: AppConfig) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') return next();
    if (!cfg.enableApiKeyGate) return next();

    // allow root/health
    if (req.path === '/' || req.path === '/health') return next();

    const apiKey = req.header('x-api-key');
    if (!apiKey) {
      return res.status(401).json({
        error:
          'Missing API key. If you do not have one, please request one at https://forms.gle/osJfmRR2PuZ46Xf98',
      });
    }

    // lazy initialise redis based on cfg.redisUrl
    const url = cfg.redisUrl || process.env['REDIS_URL'];
    if (!url)
      return res
        .status(500)
        .json({
          error:
            'Redis configuration missing. API key tracking requires Redis to be configured.',
        });
    const client = getCachedRedisClient() || (await getRedisClient(url));
    const now = new Date();
    const trackingKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}:${apiKey}`;
    await client.incr(trackingKey);
    return next();
  };
