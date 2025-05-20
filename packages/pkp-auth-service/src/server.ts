import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { MintRequestRaw } from '@lit-protocol/networks/src/networks/vNaga/LitChainClient/schemas/MintRequestSchema';
import { Elysia } from 'elysia';
import { JSONStringify as BigIntStringify } from 'json-with-bigint';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from './config/env';
import { initSystemContext } from './initSystemContext';
import { apiKeyGateAndTracking } from './middleware/apiKeyGate';
import { rateLimiter } from './middleware/rateLimiter';
import {
  addJob,
  getJobStatus,
  mainAppQueue,
} from './services/queue/bullmqSetup'; // Import the BullMQ queue
import { getStatusDoc } from './services/queue/handlers/getStatus.doc';
import { mintPkpDoc } from './services/queue/handlers/pkpMint.doc';

// Init system context
await initSystemContext({ appName: 'pkp-auth-service' });

export const app = new Elysia()
  .get('/', () => ({
    message: 'PKP Auth Service is running. PKP minting is now asynchronous.',
  }))
  .get('/test-rate-limit', () => ({ message: 'OK' }))
  .use(apiKeyGateAndTracking)
  .use(rateLimiter)
  .use(cors())
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
    return new Response(
      BigIntStringify({
        error:
          _error.shortMessage ||
          _error.message ||
          'An unexpected error occurred.',
      }),
      {
        headers: { 'content-type': 'application/json' },
        status: 500,
      }
    );
  })
  .group('/pkp', (app) => {
    app.post(
      '/mint',
      async ({ body }: { body: MintRequestRaw }) => {
        try {
          const job = await addJob('pkpMint', { requestBody: body });

          return new Response(
            BigIntStringify({
              jobId: job.id,
              message: 'PKP minting request queued successfully.',
            }),
            {
              headers: { 'content-type': 'application/json' },
              status: 202,
            }
          );
        } catch (error: any) {
          console.error(`[API] Failed to add job 'pkpMint' to queue:`, error);
          return new Response(
            BigIntStringify({
              error: 'Failed to queue PKP minting request.',
              details: error.message,
            }),
            {
              headers: { 'content-type': 'application/json' },
              status: 500,
            }
          );
        }
      },
      mintPkpDoc
    );
    return app; // Return app for chaining, if Elysia pattern requires
  })
  .get(
    '/status/:jobId',
    async ({ params }: { params: { jobId: string } }) => {
      const { jobId } = params;
      if (!jobId) {
        return new Response(BigIntStringify({ error: 'Job ID is required.' }), {
          headers: { 'content-type': 'application/json' },
          status: 400,
        });
      }

      try {
        const responsePayload = await getJobStatus(jobId);

        return new Response(BigIntStringify(responsePayload), {
          headers: { 'content-type': 'application/json' },
          status: 200,
        });
      } catch (error: any) {
        console.error(`[API] Failed to get status for job ${jobId}:`, error);
        return new Response(
          BigIntStringify({
            error: 'Failed to retrieve job status.',
            details: error.message,
          }),
          {
            headers: { 'content-type': 'application/json' },
            status: 500,
          }
        );
      }
    },
    getStatusDoc
  );

// .group('/pkp', (app) => {
//   app.post(
//     '/claim',
//     async ({ body }: { body: ClaimRequestRaw }) => {
//       const result =
//         await LitPKPAuthRouter.claimAndMintNextAndAddAuthMethodsWithTypes({
//           body,
//         });
//       return new Response(BigIntStringify(result), {
//         headers: { 'content-type': 'application/json' },
//         status: 200,
//       });
//     },
//     { body: tClaimRequestSchema }
//   );
//   app.post(
//     '/webauthn/generate-registration-options',
//     async ({
//       body,
//       request,
//     }: {
//       body: WebAuthnRequestRaw;
//       request: Request;
//     }) => {
//       logger.info('request:', request);

//       // get origin from request header
//       // we are going to use this to generate the webauthn registration options
//       const url = request.headers.get('origin') || 'http://localhost';

//       const result = await LitPKPAuthRouter.generateRegistrationOptions({
//         body: {
//           url,
//           ...(body.username && { username: body.username }),
//         },
//       });

//       return new Response(BigIntStringify(result), {
//         headers: { 'content-type': 'application/json' },
//         status: 200,
//       });
//     },
//     { body: tWebAuthnRequestSchema }
//   );
//   return app;
// }

// Start server if not imported as a module
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = env.PORT || 3000;
  app.listen(port, () => {
    console.log('\n🌐 Network Configuration');
    console.log('   Network: ' + env.NETWORK);
    console.log('   RPC URL: ' + env.LIT_TXSENDER_RPC_URL);
    if (env.LIT_TXSENDER_PRIVATE_KEY) {
      try {
        const serviceAccount = privateKeyToAccount(
          env.LIT_TXSENDER_PRIVATE_KEY as Hex
        );
        console.log('   TX Sender Address: ' + serviceAccount.address);
      } catch (e) {
        console.warn('   Could not derive TX Sender Address from private key.');
      }
    } else {
      console.warn(
        '   LIT_TXSENDER_PRIVATE_KEY not set, cannot display TX Sender Address.'
      );
    }
    console.log('\n🚀 Lit Protocol Auth Service');
    console.log('   URL: http://localhost:' + port);
    console.log('   Swagger: http://localhost:' + port + '/docs');
    console.log('   API Key Gate: ' + env.ENABLE_API_KEY_GATE);
    console.log(`   Queue Name: ${mainAppQueue.name}`);
  });
}
