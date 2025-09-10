import 'dotenv/config';

/**
 * Login Server environment loader
 *
 * Purpose:
 * - Provide configuration strictly for the login server without coupling to the auth server env.
 * - Avoid consumers needing unrelated env vars when they only use the login server or auth server.
 *
 * Usage:
 * - Programmatic: const cfg = loadLoginEnv();
 * - With overrides: const cfg = loadLoginEnv({ loginServerPort: 4400 });
 */

// Configurable defaults (constants placed at the top by convention)
const DEFAULT_LOGIN_PORT = 3300;
const DEFAULT_LOGIN_HOST = '0.0.0.0';
const DEFAULT_STATE_EXPIRY_SECONDS = 30;

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

/**
 * Load login server environment values with sensible defaults.
 */
export const loadLoginEnv = (overrides: Partial<LoginEnv> = {}): LoginEnv => {
  const port =
    overrides.loginServerPort ??
    (process.env['LOGIN_SERVER_PORT']
      ? Number(process.env['LOGIN_SERVER_PORT'])
      : DEFAULT_LOGIN_PORT);

  const host =
    overrides.loginServerHost ??
    process.env['LOGIN_SERVER_HOST'] ??
    DEFAULT_LOGIN_HOST;

  const origin =
    overrides.origin ?? process.env['ORIGIN'] ?? `http://localhost:${port}`;

  const stateExpirySeconds =
    overrides.stateExpirySeconds ??
    (process.env['STATE_EXPIRY_SECONDS']
      ? Number(process.env['STATE_EXPIRY_SECONDS'])
      : DEFAULT_STATE_EXPIRY_SECONDS);

  const socialProviders = overrides.socialProviders ?? {
    google:
      process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']
        ? {
            clientId: process.env['GOOGLE_CLIENT_ID'] as string,
            clientSecret: process.env['GOOGLE_CLIENT_SECRET'] as string,
          }
        : undefined,
    discord:
      process.env['DISCORD_CLIENT_ID'] && process.env['DISCORD_CLIENT_SECRET']
        ? {
            clientId: process.env['DISCORD_CLIENT_ID'] as string,
            clientSecret: process.env['DISCORD_CLIENT_SECRET'] as string,
          }
        : undefined,
  };

  return {
    loginServerPort: port,
    loginServerHost: host,
    origin,
    stateExpirySeconds,
    socialProviders,
  };
};
