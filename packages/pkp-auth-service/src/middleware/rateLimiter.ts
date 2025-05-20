import { rateLimit } from 'elysia-rate-limit';
import { env } from '../config/env';

export const rateLimiter = rateLimit({
  max: Number(env.MAX_REQUESTS_PER_WINDOW),
  duration: Number(env.WINDOW_MS),
  headers: true,
  errorResponse: 'Rate limit exceeded',
  skip: (request) => {
    // Skip rate limiting for requests to the /docs path and its subpaths
    return request.url.startsWith('/docs');
  },
});
