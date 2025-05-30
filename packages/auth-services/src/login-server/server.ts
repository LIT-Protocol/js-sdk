import { env } from '../env';
import { createLitLoginServer } from './src';

// Create a new server instance
const litLoginServer = createLitLoginServer({
  port: env.LOGIN_SERVER_PORT,
  host: env.LOGIN_SERVER_HOST,
  stateExpirySeconds: env.LOGIN_SERVER_STATE_EXPIRY_SECONDS,

  // Required credentials
  socialProviders: {
    google: {
      clientId: env.LOGIN_SERVER_GOOGLE_CLIENT_ID,
      clientSecret: env.LOGIN_SERVER_GOOGLE_CLIENT_SECRET,
    },
    discord: {
      clientId: env.LOGIN_SERVER_DISCORD_CLIENT_ID,
      clientSecret: env.LOGIN_SERVER_DISCORD_CLIENT_SECRET,
    },
  },
});

// Start the server
litLoginServer.start();
