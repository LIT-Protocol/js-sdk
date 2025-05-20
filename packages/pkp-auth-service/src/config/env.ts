import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    PORT: z
      .string()
      .transform((val: string): number => Number(val))
      .default('3001'),

    // ======= REQUIRED CONFIGURATION =======
    // Network & Chain
    NETWORK: z.enum(['naga-dev', 'naga-test', 'naga']),
    LIT_TXSENDER_RPC_URL: z.string().url(),
    LIT_TXSENDER_PRIVATE_KEY: z.string().min(1),
    LOG_LEVEL: z.enum(['info', 'debug', 'warn', 'error']).default('info'),
    ENABLE_API_KEY_GATE: z
      .string()
      .transform((val: string): boolean => val === 'true')
      .default('true'),

    // ---------- RATE LIMITER ----------
    MAX_REQUESTS_PER_WINDOW: z
      .string()
      .transform((val: string): number => Number(val))
      .default('10')
      .describe('Limit each IP to 10 requests per window'),
    WINDOW_MS: z
      .string()
      .transform((val: string): number => Number(val))
      .default('10000')
      .describe('10 second window'),

    // ---------- Redis ----------
    REDIS_URL: z.string().url().default('redis://localhost:6379'),

    // ---------- WebAuthn ----------
    RP_ID: z.string().default('localhost'),
    WEBAUTHN_RP_NAME: z.string().default('Lit Protocol'),
    WEBAUTHN_TIMEOUT: z
      .string()
      .transform((val: string): number => Number(val))
      .default('6000'),
  },

  clientPrefix: 'PUBLIC_',

  client: {
    // PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
