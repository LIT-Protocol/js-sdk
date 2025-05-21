import { env } from '../_setup/env';
import { createLitAuthServer } from './src/createAuthServer';

const litAuthServer = createLitAuthServer({
  port: env.PORT,
  network: env.NETWORK,
  litTxsenderRpcUrl: env.LIT_TXSENDER_RPC_URL,
  litTxsenderPrivateKey: env.LIT_TXSENDER_PRIVATE_KEY,
  enableApiKeyGate: env.ENABLE_API_KEY_GATE,
});

litAuthServer.start().catch((err) => {
  console.error('Failed to start Lit Auth Server:', err);
  process.exit(1);
});
