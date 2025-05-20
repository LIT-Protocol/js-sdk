import { createLitLoginServer } from './src';

// Create a new server instance
const litLoginServer = createLitLoginServer({
  // Optional configuration
  port: 3300,
  host: '0.0.0.0',
  stateExpirySeconds: 30,

  // Required credentials
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
});

// Start the server
litLoginServer.start();
