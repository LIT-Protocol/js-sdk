import * as stytch from 'stytch';
import { AppConfig } from './env';

export const createStytchClient = (cfg: AppConfig) =>
  new stytch.Client({
    project_id: cfg.stytchProjectId as string,
    secret: cfg.stytchSecretKey as string,
  });

export type StytchClient = ReturnType<typeof createStytchClient>;
