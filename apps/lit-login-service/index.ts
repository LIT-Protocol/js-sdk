import { createLitLoginServer } from '@lit-protocol/auth-services';

const litLoginServer = createLitLoginServer({
  port: Number(process.env['LOGIN_SERVER_PORT']),
  host: process.env['LOGIN_SERVER_HOST'],
  stateExpirySeconds: 30,
  socialProviders: {
    google: {
      clientId: process.env['LOGIN_SERVER_GOOGLE_CLIENT_ID'] as string,
      clientSecret: process.env['LOGIN_SERVER_GOOGLE_CLIENT_SECRET'] as string,
    },
    discord: {
      clientId: process.env['LOGIN_SERVER_DISCORD_CLIENT_ID'] as string,
      clientSecret: process.env['LOGIN_SERVER_DISCORD_CLIENT_SECRET'] as string,
    },
  },
});

await litLoginServer.start();
