import type { Express } from 'express';
import { createServer, Server } from 'node:http';
import { createLoginApp, LoginAppConfig } from './app';

export interface LitLoginServerConfig {
  port?: number;
  host?: string;
  origin?: string;
  stateExpirySeconds?: number;
  socialProviders: {
    google?: { clientId: string; clientSecret: string };
    discord?: { clientId: string; clientSecret: string };
  };
}

export interface LitLoginServer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  getOrigin: () => string;
  getApp: () => Express;
}

export const createLitLoginServer = (
  config: LitLoginServerConfig
): LitLoginServer => {
  let port = 3300;
  if (config.port !== undefined && !isNaN(config.port)) port = config.port;
  else if (process.env['PORT'] && !isNaN(Number(process.env['PORT'])))
    port = Number(process.env['PORT']);
  const host = config.host || process.env['HOST'] || '0.0.0.0';
  const origin =
    config.origin || process.env['ORIGIN'] || `http://localhost:${port}`;
  const stateExpirySeconds = config.stateExpirySeconds || 30;

  const app = createLoginApp({
    origin,
    stateExpirySeconds,
    socialProviders: config.socialProviders,
  } satisfies LoginAppConfig);

  let server: Server | null = null;
  return {
    start: async () => {
      if (server) return;
      server = createServer(app);
      await new Promise<void>((resolve) => {
        server!.listen(port, host, () => resolve());
      });
      console.log(`🔥 Login Server listening on ${origin}`);
    },
    stop: async () => {
      if (!server) return;
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => (err ? reject(err) : resolve()));
      });
      server = null;
    },
    getOrigin: () => origin,
    getApp: () => app,
  };
};
