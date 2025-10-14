import 'dotenv/config';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

/**
 * Login Server environment (validated via @t3-oss/env-core)
 *
 * Purpose:
 * - Strict validation and defaults for login server.
 * - Single flat `env` object; access like `env.LOGIN_SERVER_PORT`.
 */

export const env = createEnv({
  server: {
    LOGIN_SERVER_PORT: z.coerce.number().int().positive().default(3300),
    LOGIN_SERVER_HOST: z.string().min(1).default('0.0.0.0'),
    ORIGIN: z.string().url().optional(),
    STATE_EXPIRY_SECONDS: z.coerce.number().int().positive().default(30),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    DISCORD_CLIENT_ID: z.string().min(1).optional(),
    DISCORD_CLIENT_SECRET: z.string().min(1).optional(),
  },
  clientPrefix: 'PUBLIC_',
  client: {},
  runtimeEnv: process.env,
});

export type LoginEnv = {
  loginServerPort: number;
  loginServerHost: string;
  origin: string;
  stateExpirySeconds: number;
  socialProviders: {
    google?: { clientId: string; clientSecret: string };
    discord?: { clientId: string; clientSecret: string };
  };
};
