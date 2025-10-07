import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { registerStatusRoutes } from './routes/status.express';
import { registerPkpRoutes } from './routes/pkp.express';
import { registerPaymentRoutes } from './routes/payment.express';
import { registerStytchRoutes } from './routes/auth/stytch.express';
import { registerWebAuthnRoutes } from './routes/auth/webauthn.express';
import { apiKeyGate } from '../middleware/apiKeyGate.express';
import { logger, requestLogger } from './providers/logger';
import { env, AppConfig } from './providers/env';
import { createStytchClient } from './providers/stytch';

export const createApp = (config?: Partial<AppConfig>): Express => {
  const cfg: AppConfig = {
    authServerPort: config?.authServerPort ?? env.AUTH_SERVER_PORT,
    authServerHost: config?.authServerHost ?? env.AUTH_SERVER_HOST,
    network: config?.network ?? env.NETWORK,
    litTxsenderRpcUrl: config?.litTxsenderRpcUrl ?? env.LIT_TXSENDER_RPC_URL,
    litTxsenderPrivateKey:
      config?.litTxsenderPrivateKey ?? env.LIT_TXSENDER_PRIVATE_KEY,
    litDelegationRootMnemonic:
      config?.litDelegationRootMnemonic ?? env.LIT_DELEGATION_ROOT_MNEMONIC,
    enableApiKeyGate: config?.enableApiKeyGate ?? env.ENABLE_API_KEY_GATE,
    redisUrl: config?.redisUrl ?? env.REDIS_URL,
    stytchProjectId: config?.stytchProjectId ?? env.STYTCH_PROJECT_ID,
    stytchSecretKey: config?.stytchSecretKey ?? env.STYTCH_SECRET,
    maxRequestsPerWindow:
      config?.maxRequestsPerWindow ?? env.MAX_REQUESTS_PER_WINDOW,
    windowMs: config?.windowMs ?? env.WINDOW_MS,
  };

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: false }));
  app.use(requestLogger);

  // global rate limiter
  app.use(
    rateLimit({
      windowMs: Number(cfg.windowMs),
      max: Number(cfg.maxRequestsPerWindow),
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/', (_req, res) => {
    res.json({ message: 'PKP Auth Service (Express) running.' });
  });

  // optional x-api-key gate
  app.use(apiKeyGate(cfg));

  // routes
  registerStatusRoutes(app);
  registerPkpRoutes(app);
  registerPaymentRoutes(app, cfg);
  registerStytchRoutes(app, createStytchClient(cfg));
  registerWebAuthnRoutes(app);

  // error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'An unexpected error occurred.' });
  });

  return app;
};
