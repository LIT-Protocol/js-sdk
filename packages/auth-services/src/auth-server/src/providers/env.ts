import 'dotenv/config';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    AUTH_SERVER_PORT: z.coerce.number().int().positive().default(3000),
    AUTH_SERVER_HOST: z.string().min(1).default('0.0.0.0'),
    NETWORK: z.string().min(1).optional(),
    LIT_TXSENDER_RPC_URL: z.string().url().optional(),
    LIT_TXSENDER_PRIVATE_KEY: z.string().min(1).optional(),
    ENABLE_API_KEY_GATE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    REDIS_URL: z.string().url().optional(),
    STYTCH_PROJECT_ID: z.string().min(1).optional(),
    STYTCH_SECRET: z.string().min(1).optional(),
    MAX_REQUESTS_PER_WINDOW: z.coerce.number().int().positive().default(60),
    WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  },
  clientPrefix: 'PUBLIC_',
  client: {},
  runtimeEnv: process.env,
});

export type AppConfig = {
  authServerPort: number;
  authServerHost: string;
  network?: string;
  litTxsenderRpcUrl?: string;
  litTxsenderPrivateKey?: string;
  enableApiKeyGate: boolean;
  redisUrl?: string;
  stytchProjectId?: string;
  stytchSecretKey?: string;
  maxRequestsPerWindow: number;
  windowMs: number;
};
