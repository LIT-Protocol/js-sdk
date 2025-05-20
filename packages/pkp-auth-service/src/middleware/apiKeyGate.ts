import { Elysia } from 'elysia';
import { env } from '../config/env';
import { redisClient } from '../services/redis/redis';

export const apiKeyGateAndTracking = new Elysia().onRequest(
  async ({ request, set }) => {
    if (!env.ENABLE_API_KEY_GATE) {
      return;
    }

    if (
      // request.url.includes("/index.html") ||
      // request.url.includes("/admin.html") ||
      request.url.includes('/') ||
      request.url.includes('/swagger')
    ) {
      return;
    }

    const API_KEY = request.headers.get('x-api-key');

    if (!API_KEY) {
      set.status = 401;
      return new Response(
        JSON.stringify({
          error:
            'Missing API key. If you do not have one, please request one at https://forms.gle/osJfmRR2PuZ46Xf98',
        }),
        {
          headers: { 'content-type': 'application/json' },
          status: 401,
        }
      );
    }

    // Track API usage by date
    const now = new Date();
    const trackingKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}:${API_KEY}`;
    await redisClient.incr(trackingKey);
  }
);
