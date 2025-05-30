import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // ===============================================
    //            LOGIN SERVER CONFIGURATION
    // ===============================================
    LOGIN_SERVER_PORT: z
      .string()
      .transform((val: string): number => Number(val))
      .default('3300'),
    LOGIN_SERVER_HOST: z.string().default('0.0.0.0'),
    LOGIN_SERVER_STATE_EXPIRY_SECONDS: z
      .string()
      .transform((val: string): number => Number(val))
      .default('30'),

    LOGIN_SERVER_GOOGLE_CLIENT_ID: z.string().min(1),
    LOGIN_SERVER_GOOGLE_CLIENT_SECRET: z.string().min(1),
    LOGIN_SERVER_DISCORD_CLIENT_ID: z.string().min(1),
    LOGIN_SERVER_DISCORD_CLIENT_SECRET: z.string().min(1),

    // ===============================================
    //            AUTH SERVER CONFIGURATION
    // ===============================================
    AUTH_SERVER_PORT: z
      .string()
      .transform((val: string): number => Number(val))
      .default('3001'),
    AUTH_SERVER_HOST: z.string().default('0.0.0.0'),
    // Network & Chain
    NETWORK: z.enum(['naga-dev', 'naga-test', 'naga']),
    LIT_TXSENDER_RPC_URL: z.string().url(),
    LIT_TXSENDER_PRIVATE_KEY: z.string().min(1),
    LOG_LEVEL: z.enum(['info', 'debug', 'warn', 'error']).default('info'),
    ENABLE_API_KEY_GATE: z
      .string()
      .transform((val: string): boolean => val === 'true')
      .default('true'),
    STYTCH_PROJECT_ID: z.string().min(1),
    STYTCH_SECRET: z.string().min(1),

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
