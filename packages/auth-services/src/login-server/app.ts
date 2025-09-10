import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import path from 'node:path';
import { logger, requestLogger } from '../auth-server/src/providers/logger';

export const createLoginApp = (origin: string): Express => {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(requestLogger);

  // app.use(
  //   express.static(
  //     path.join(process.cwd(), 'packages/auth-services/src/login-server/public')
  //   )
  // );

  // app.get('/', (_req, res) => res.redirect('/index.html'));
  // app.get('/error', (_req, res) => res.redirect('/error.html'));

  // The OAuth flows remain functionally the same, mapped into Express
  // (You can migrate the Google/Discord handlers here 1:1 from Elysia logic.)

  return app;
};
