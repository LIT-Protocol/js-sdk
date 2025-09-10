import 'dotenv/config';

export type AppConfig = {
  authServerPort: number;
  authServerHost: string;
  network?: string;
  litTxsenderRpcUrl?: string;
  litTxsenderPrivateKey?: string;
  enableApiKeyGate: boolean;
  redisUrl?: string;
  stytchProjectId?: string;
  stytchSecretKey?: string;
  maxRequestsPerWindow: number;
  windowMs: number;
};

export const loadEnv = (overrides: Partial<AppConfig> = {}): AppConfig => {
  const parsedPort = Number(process.env['AUTH_SERVER_PORT'] || 3000);
  const parsedWindowMs = Number(process.env['WINDOW_MS'] || 60_000);
  const parsedMaxReqs = Number(process.env['MAX_REQUESTS_PER_WINDOW'] || 60);

  return {
    authServerPort: overrides.authServerPort ?? parsedPort,
    authServerHost:
      overrides.authServerHost ??
      (process.env['AUTH_SERVER_HOST'] || '0.0.0.0'),
    network: overrides.network ?? process.env['NETWORK'],
    litTxsenderRpcUrl:
      overrides.litTxsenderRpcUrl ?? process.env['LIT_TXSENDER_RPC_URL'],
    litTxsenderPrivateKey:
      overrides.litTxsenderPrivateKey ??
      process.env['LIT_TXSENDER_PRIVATE_KEY'],
    enableApiKeyGate:
      overrides.enableApiKeyGate ??
      process.env['ENABLE_API_KEY_GATE'] === 'true',
    redisUrl: overrides.redisUrl ?? process.env['REDIS_URL'],
    stytchProjectId:
      overrides.stytchProjectId ?? process.env['STYTCH_PROJECT_ID'],
    stytchSecretKey: overrides.stytchSecretKey ?? process.env['STYTCH_SECRET'],
    maxRequestsPerWindow: overrides.maxRequestsPerWindow ?? parsedMaxReqs,
    windowMs: overrides.windowMs ?? parsedWindowMs,
  };
};
