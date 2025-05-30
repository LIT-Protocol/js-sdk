import { createLitAuthServer } from '@lit-protocol/auth-services';
import { env } from './env';

const litAuthServer = createLitAuthServer({
  // some host look for PORT env var automatically
  port: parseInt(process.env.PORT!) || env.AUTH_SERVER_PORT,
  host: env.AUTH_SERVER_HOST,
  network: env.NETWORK,
  litTxsenderRpcUrl: env.LIT_TXSENDER_RPC_URL,
  litTxsenderPrivateKey: env.LIT_TXSENDER_PRIVATE_KEY,
  enableApiKeyGate: env.ENABLE_API_KEY_GATE,
  stytchProjectId: env.STYTCH_PROJECT_ID,
  stytchSecretKey: env.STYTCH_SECRET,
});

litAuthServer.start().catch((err) => {
  console.error('Failed to start Lit Auth Server:', err);
  process.exit(1);
});
