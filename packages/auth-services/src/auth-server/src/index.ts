import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from './app';
import { env } from './providers/env';
import { logger } from './providers/logger';
import { deriveTxSenderAddress } from './providers/txSender';

const cfg = {
  authServerPort: env.AUTH_SERVER_PORT,
  authServerHost: env.AUTH_SERVER_HOST,
  network: env.NETWORK,
  litTxsenderRpcUrl: env.LIT_TXSENDER_RPC_URL,
  litTxsenderPrivateKey: env.LIT_TXSENDER_PRIVATE_KEY,
  litDelegationRootMnemonic: env.LIT_DELEGATION_ROOT_MNEMONIC,
  enableApiKeyGate: env.ENABLE_API_KEY_GATE,
  redisUrl: env.REDIS_URL,
  stytchProjectId: env.STYTCH_PROJECT_ID,
  stytchSecretKey: env.STYTCH_SECRET,
  maxRequestsPerWindow: env.MAX_REQUESTS_PER_WINDOW,
  windowMs: env.WINDOW_MS,
};
const app = createApp(cfg);
const server = createServer(app);

server.listen(cfg.authServerPort, cfg.authServerHost, async () => {
  await deriveTxSenderAddress(cfg);
  const { address, port } = server.address() as AddressInfo;
  logger.info(
    {
      network: cfg.network,
      litTxsenderRpcUrl: cfg.litTxsenderRpcUrl,
      apiKeyGate: cfg.enableApiKeyGate,
    },
    `Auth Service listening on http://${address}:${port}`
  );
});

const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutting down');
  server.close(() => process.exit(0));
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
