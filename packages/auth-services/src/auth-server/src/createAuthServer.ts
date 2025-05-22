import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { MintRequestRaw } from '@lit-protocol/networks/src/networks/vNaga/LitChainClient/schemas/MintRequestSchema';
import {
  generateRegistrationOptions,
  type GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { Elysia } from 'elysia';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from '../../_setup/env'; // Adjusted path
import { initSystemContext } from '../../_setup/initSystemContext'; // Adjusted path
import {
  addJob,
  getJobStatus,
  mainAppQueue,
} from '../../queue-manager/src/bullmqSetup'; // Adjusted path
import { mintPkpDoc } from '../../queue-manager/src/handlers/pkpMint/pkpMint.doc'; // Adjusted path
import { getStatusDoc } from '../../queue-manager/src/handlers/status/getStatus.doc'; // Adjusted path
import { apiKeyGateAndTracking } from '../middleware/apiKeyGate'; // Adjusted path
import { rateLimiter } from '../middleware/rateLimiter'; // Adjusted path
import { resp } from './response-helpers/response-helpers'; // Adjusted path
import { generateAuthenticatorUserInfo } from './webauthn-helpers/generateAuthenticatorUserInfo';
import { getDomainFromUrl } from './webauthn-helpers/getDomainFromUrl';

export interface LitAuthServerConfig {
  port?: number;
  host?: string;
  network?: string;
  litTxsenderRpcUrl?: string;
  litTxsenderPrivateKey?: string;
  enableApiKeyGate?: boolean;
  appName?: string;
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
    port: userConfig.port ?? env.PORT ?? 3000,
    host: userConfig.host ?? '0.0.0.0',
    network: userConfig.network ?? env.NETWORK,
    litTxsenderRpcUrl: userConfig.litTxsenderRpcUrl ?? env.LIT_TXSENDER_RPC_URL,
    litTxsenderPrivateKey:
      userConfig.litTxsenderPrivateKey ?? env.LIT_TXSENDER_PRIVATE_KEY,
    enableApiKeyGate: userConfig.enableApiKeyGate ?? env.ENABLE_API_KEY_GATE,
    appName: userConfig.appName ?? 'auth-services',
  };

  // Create Elysia app
  const app = new Elysia()
    .decorate('config', config) // Make config accessible in routes if needed
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
    .use(cors())
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

    .group('/auth', (groupApp) => {
      groupApp.get(
        '/webauthn/generate-registration-options',
        async ({ query, headers, set }) => {
          const username = query.username as string | undefined;
          const originHeader = headers['origin'] || 'localhost';

          // Determine rpID from Origin header, default to 'localhost'
          let rpID = getDomainFromUrl(originHeader);

          if (originHeader) {
            try {
              rpID = new URL(originHeader).hostname;
            } catch (e) {
              // Log warning if Origin header is present but invalid
              console.warn(
                `[AuthServer] Invalid Origin header: "${originHeader}". Using default rpID "${rpID}".`
              );
            }
          } else {
            // Log warning if Origin header is missing
            console.warn(
              `[AuthServer] Origin header missing. Using default rpID "${rpID}".`
            );
          }

          // Generate a unique username string if not provided.
          // This is used for 'userName' and as input for 'userID' generation.
          const authenticator = generateAuthenticatorUserInfo(username);

          const opts: GenerateRegistrationOptionsOpts = {
            rpName: 'Lit Protocol',
            rpID, // Relying Party ID (your domain)
            userID: authenticator.userId,
            userName: authenticator.username,
            timeout: 60000, // 60 seconds
            attestationType: 'direct', // Consider 'none' for better privacy if direct attestation is not strictly needed
            authenticatorSelection: {
              userVerification: 'required', // Require user verification (e.g., PIN, biometric)
              residentKey: 'required', // Create a client-side discoverable credential
            },
            // Supported public key credential algorithms.
            // -7: ES256 (ECDSA with P-256 curve and SHA-256)
            // -257: RS256 (RSA PKCS#1 v1.5 with SHA-256)
            supportedAlgorithmIDs: [-7, -257],
          };

          const options = generateRegistrationOptions(opts);

          return resp.SUCCESS(options);
        }
      );
      return groupApp;
    })

    // =============================================================
    //                     PKP Auth Service (/pkp)
    // =============================================================
    .group('/pkp', (app) => {
      // =============================================================
      //                     Mint PKP (/pkp/mint)
      // =============================================================
      app.post(
        '/mint',
        async ({ body }: { body: MintRequestRaw }) => {
          try {
            const job = await addJob('pkpMint', { requestBody: body });
            return resp.QUEUED(
              job.id,
              'PKP minting request queued successfully.'
            );
          } catch (error: any) {
            console.error(`[API] Failed to add job 'pkpMint' to queue:`, error);
            return resp.ERROR(
              'Failed to queue PKP minting request.' + error.message
            );
          }
        },
        mintPkpDoc
      );
      return app;
    })
    // =============================================================
    //                     Get Job Status (/pkp/status/:jobId)
    // =============================================================
    .get(
      '/status/:jobId',
      async ({ params }: { params: { jobId: string } }) => {
        const { jobId } = params;
        if (!jobId) {
          return resp.BAD_REQUEST('Job ID is required.');
        }
        try {
          const responsePayload = await getJobStatus(jobId);
          return resp.SUCCESS(responsePayload);
        } catch (error: any) {
          console.error(`[API] Failed to get status for job ${jobId}:`, error);
          return resp.ERROR('Failed to retrieve job status.' + error.message);
        }
      },
      getStatusDoc
    );

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
