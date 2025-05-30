import { env } from '../env';
import { createLitAuthServer } from './src/createAuthServer';

const litAuthServer = createLitAuthServer({
  port: env.AUTH_SERVER_PORT,
  host: env.AUTH_SERVER_HOST,
  network: env.NETWORK,
  litTxsenderRpcUrl: env.LIT_TXSENDER_RPC_URL,
  litTxsenderPrivateKey: env.LIT_TXSENDER_PRIVATE_KEY,
  enableApiKeyGate: env.ENABLE_API_KEY_GATE,
});

litAuthServer.start().catch((err) => {
  console.error('Failed to start Lit Auth Server:', err);
  process.exit(1);
});
