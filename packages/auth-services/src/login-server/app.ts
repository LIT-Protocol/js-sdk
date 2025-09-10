import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger, requestLogger } from '../auth-server/src/providers/logger';

export const createLoginApp = (origin: string): Express => {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(requestLogger);

  // No static UI; consumer should handle any front-end routing/UI.

  // The OAuth flows remain functionally the same, mapped into Express
  // (You can migrate the Google/Discord handlers here 1:1 from Elysia logic.)

  return app;
};
