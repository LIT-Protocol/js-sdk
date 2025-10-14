import { createServer, Server } from 'node:http';
import type { Express } from 'express';
import { createApp } from './app';
import type { AppConfig } from './providers/env';
import { logger } from './providers/logger';

export type CreateLitAuthServerOptions = {
  port?: number;
  host?: string;
  network?: string;
  litTxsenderRpcUrl?: string;
  litTxsenderPrivateKey?: string;
  litDelegationRootMnemonic?: string;
  enableApiKeyGate?: boolean;
  redisUrl?: string;
  stytchProjectId?: string;
  stytchSecretKey?: string;
  maxRequestsPerWindow?: number;
  windowMs?: number;
};

export interface LitAuthServer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  getApp: () => Express;
}

export const createLitAuthServer = (
  options: CreateLitAuthServerOptions
): LitAuthServer => {
  const appConfig: Partial<AppConfig> = {
    authServerPort: options.port,
    authServerHost: options.host,
    network: options.network,
    litTxsenderRpcUrl: options.litTxsenderRpcUrl,
    litTxsenderPrivateKey: options.litTxsenderPrivateKey,
    litDelegationRootMnemonic: options.litDelegationRootMnemonic,
    enableApiKeyGate: options.enableApiKeyGate ?? false,
    redisUrl: options.redisUrl,
    stytchProjectId: options.stytchProjectId,
    stytchSecretKey: options.stytchSecretKey,
    maxRequestsPerWindow: options.maxRequestsPerWindow,
    windowMs: options.windowMs,
  };

  const app = createApp(appConfig);
  let server: Server | null = null;

  return {
    start: async () => {
      if (server) return;
      const port = appConfig.authServerPort ?? 3000;
      const host = appConfig.authServerHost ?? '0.0.0.0';
      server = createServer(app);
      await new Promise<void>((resolve) => {
        server!.listen(port, host, () => {
          logger.info(
            { port, host, network: appConfig.network },
            `Auth Service listening on http://${host}:${port}`
          );
          resolve();
        });
      });
    },
    stop: async () => {
      if (!server) return;
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => (err ? reject(err) : resolve()));
      });
      server = null;
    },
    getApp: () => app,
  };
};
