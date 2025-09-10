import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { registerStatusRoutes } from './routes/status.express';
import { registerPkpRoutes } from './routes/pkp.express';
import { registerStytchRoutes } from './routes/auth/stytch.express';
import { registerWebAuthnRoutes } from './routes/auth/webauthn.express';
import { apiKeyGate } from '../middleware/apiKeyGate.express';
import { logger, requestLogger } from './providers/logger';
import { loadEnv, AppConfig } from './providers/env';
import { createStytchClient } from './providers/stytch';

export const createApp = (config?: Partial<AppConfig>): Express => {
  const cfg = loadEnv(config);

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
