import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from './app';
import { loadEnv } from './providers/env';
import { logger } from './providers/logger';
import { deriveTxSenderAddress } from './providers/txSender';

const cfg = loadEnv();
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
