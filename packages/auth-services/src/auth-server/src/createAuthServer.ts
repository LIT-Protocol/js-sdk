import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import * as stytch from 'stytch'; // Added Stytch import
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from '../../env'; // Adjusted path
import { initSystemContext } from '../../_setup/initSystemContext'; // Adjusted path
import { mainAppQueue } from '../../queue-manager/src/bullmqSetup'; // Adjusted path
import { apiKeyGateAndTracking } from '../middleware/apiKeyGate'; // Adjusted path
import { rateLimiter } from '../middleware/rateLimiter'; // Adjusted path
import { resp } from './response-helpers/response-helpers'; // Adjusted path

import { stytchEmailRoutes } from './routes/auth/stytch/stytch-email';
import { stytchWhatsAppRoutes } from './routes/auth/stytch/stytch-otp';
import { stytchSmsRoutes } from './routes/auth/stytch/stytch-sms';
import { stytchTotpRoutes } from './routes/auth/stytch/stytch-topt-2fa';
import { webAuthnGenerateRegistrationOptionsRoute } from './routes/auth/webauthn/webauthn';
import { mint } from './routes/pkp/mint';
import { statusRoutes } from './routes/status';
export interface LitAuthServerConfig {
  port?: number;
  host?: string;
  network?: string;
  litTxsenderRpcUrl?: string;
  litTxsenderPrivateKey?: string;
  enableApiKeyGate?: boolean;
  appName?: string;
  stytchProjectId?: string;
  stytchSecretKey?: string;
}

export interface LitAuthServer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  getApp: () => Elysia<any>;
}

/**
 * Creates and configures a Lit PKP Auth Server instance.
 *
 * This function sets up an Elysia server with routes for PKP minting, job status checking,
 * and includes middleware for API key gating, rate limiting, and CORS.
 * It manages the server lifecycle and provides methods to start and stop the server,
 * as well as retrieve the underlying Elysia application instance.
 *
 * @param config - Configuration options for the server.
 * @returns An object with methods to control and interact with the server.
 */
export const createLitAuthServer = (
  userConfig: LitAuthServerConfig
): LitAuthServer => {
  // Configuration with defaults from env if not provided in config
  const config = {
    port: userConfig.port ?? env.AUTH_SERVER_PORT ?? 3000,
    host: userConfig.host ?? '0.0.0.0',
    network: userConfig.network ?? env.NETWORK,
    litTxsenderRpcUrl: userConfig.litTxsenderRpcUrl ?? env.LIT_TXSENDER_RPC_URL,
    litTxsenderPrivateKey:
      userConfig.litTxsenderPrivateKey ?? env.LIT_TXSENDER_PRIVATE_KEY,
    enableApiKeyGate: userConfig.enableApiKeyGate ?? env.ENABLE_API_KEY_GATE,
    appName: userConfig.appName ?? 'auth-services',
    stytchProjectId: userConfig.stytchProjectId ?? env.STYTCH_PROJECT_ID,
    stytchSecretKey: userConfig.stytchSecretKey ?? env.STYTCH_SECRET,
  };

  // Create Elysia app
  const app = new Elysia()
    // Add CORS first to handle preflight requests before other middleware
    .use(
      cors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        credentials: true,
      })
    )
    .decorate('config', config) // Make config accessible in routes if needed
    .decorate(
      'stytchClient',
      new stytch.Client({
        // Decorate with Stytch client instance
        project_id: config.stytchProjectId as string,
        secret: config.stytchSecretKey as string,
        // You might want to add env: stytch.envs.live or stytch.envs.test based on your environment
      })
    )
    .onStart(async () => {
      // =============================================================
      //                     Init System Context
      // =============================================================
      // Ensure system context is initialized before server fully starts, using appName from config
      // This was originally at the top level, moved here to use config.appName
      await initSystemContext({ appName: config.appName });
    })
    .get('/', () => ({
      message: 'PKP Auth Service is running. PKP minting is now asynchronous.',
    }))
    .get('/test-rate-limit', () => ({ message: 'OK' }))
    .use(apiKeyGateAndTracking) // This middleware might depend on env vars directly, ensure it's compatible or pass config
    .use(rateLimiter) // This middleware might depend on env vars directly
    // =============================================================
    //                     Swagger Documentation
    // =============================================================
    .use(
      swagger({
        documentation: {
          info: {
            title: 'Lit Protocol Auth Service (with Async PKP Minting)',
            version: '1.0.1',
          },
        },
        path: '/docs',
        exclude: ['/', '/test-rate-limit'],
      })
    )
    .onError(({ error }) => {
      console.error('[API Error]', error);
      const _error = error as unknown as {
        shortMessage: string;
        message?: string;
      };
      return resp.ERROR(
        _error.shortMessage || _error.message || 'An unexpected error occurred.'
      );
    })

    // =============================================================
    //                     Auth Service (/auth)
    // =============================================================
    .group('/auth', (groupApp) => {
      // WebAuthn
      webAuthnGenerateRegistrationOptionsRoute(groupApp);

      // Stytch
      stytchEmailRoutes(groupApp);
      stytchSmsRoutes(groupApp);
      stytchWhatsAppRoutes(groupApp);
      stytchTotpRoutes(groupApp);

      return groupApp;
    })

    // =============================================================
    //                     PKP Auth Service (/pkp)
    // =============================================================
    .group('/pkp', (app) => {
      // Mint PKP
      mint(app);

      return app;
    })
    // =============================================================
    //                     Job Status Routes
    // =============================================================
    .use(statusRoutes);

  let serverInstance: any = null; // To store the running server instance

  return {
    start: async () => {
      if (serverInstance) {
        console.warn('Server is already running.');
        return;
      }
      try {
        // Call initSystemContext explicitly here if not using onStart or if it needs to run before listen
        // await initSystemContext({ appName: config.appName });
        // If initSystemContext is in onStart, it will run when .listen() is called.

        serverInstance = (await app.listen({
          port: config.port,
          hostname: config.host,
        })) as unknown as Elysia<any>;

        console.log('🌐 Network Configuration');
        console.log('   Network: ' + config.network);
        console.log('   RPC URL: ' + config.litTxsenderRpcUrl);
        if (config.litTxsenderPrivateKey) {
          try {
            const serviceAccount = privateKeyToAccount(
              config.litTxsenderPrivateKey as Hex
            );
            console.log('   TX Sender Address: ' + serviceAccount.address);
          } catch (e) {
            console.warn(
              '   Could not derive TX Sender Address from private key.'
            );
          }
        } else {
          console.warn(
            '   LIT_TXSENDER_PRIVATE_KEY not set, cannot display TX Sender Address.'
          );
        }
        console.log('🚀 Lit Protocol Auth Service');
        console.log(`   URL: http://${config.host}:${config.port}`);
        console.log(`   Swagger: http://${config.host}:${config.port}/docs`);
        console.log('   API Key Gate: ' + config.enableApiKeyGate);
        console.log(`   Queue Name: ${mainAppQueue.name}`);
      } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1); // Exit if server fails to start
      }
    },
    stop: async () => {
      if (!serverInstance) {
        console.warn('Server is not running.');
        return;
      }
      await serverInstance.stop(); // Use app.stop() or serverInstance.stop() depending on Elysia version and how listen is handled
      serverInstance = null;
      console.log('🚪 Lit Protocol Auth Service stopped.');
    },
    getApp: () => app as unknown as Elysia<any>,
  };
};
