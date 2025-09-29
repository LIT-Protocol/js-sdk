import { createLitAuthServer } from '@lit-protocol/auth-services';
import { startAuthServiceWorker } from '@lit-protocol/auth-services';

const litAuthServer = createLitAuthServer({
  port: Number(process.env['AUTH_SERVER_PORT']) || 3000,
  host: process.env['AUTH_SERVER_HOST'],
  network: process.env['NETWORK'],
  litTxsenderRpcUrl: process.env['LIT_TXSENDER_RPC_URL'] as string,
  litTxsenderPrivateKey: process.env['LIT_TXSENDER_PRIVATE_KEY'],
  enableApiKeyGate: process.env['ENABLE_API_KEY_GATE'] === 'true',
  stytchProjectId: process.env['STYTCH_PROJECT_ID'],
  stytchSecretKey: process.env['STYTCH_SECRET'],
  maxRequestsPerWindow: Number(process.env['MAX_REQUESTS_PER_WINDOW']),
  windowMs: Number(process.env['WINDOW_MS']),
  redisUrl: process.env['REDIS_URL'] as string,
});

async function main() {
  await litAuthServer.start();
  await startAuthServiceWorker();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
