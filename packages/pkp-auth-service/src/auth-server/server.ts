import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { MintRequestRaw } from '@lit-protocol/networks/src/networks/vNaga/LitChainClient/schemas/MintRequestSchema';
import { Elysia } from 'elysia';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from '../_setup/env';
import { initSystemContext } from '../_setup/initSystemContext';
import {
  addJob,
  getJobStatus,
  mainAppQueue,
} from '../queue-manager/src/bullmqSetup'; // Import the BullMQ queue

import { mintPkpDoc } from '../queue-manager/src/handlers/pkpMint/pkpMint.doc';
import { getStatusDoc } from '../queue-manager/src/handlers/status/getStatus.doc';
import { apiKeyGateAndTracking } from './middleware/apiKeyGate';
import { rateLimiter } from './middleware/rateLimiter';
import { resp } from './src/response-helpers/response-helpers';

// =============================================================
//                     Init System Context
// =============================================================
await initSystemContext({ appName: 'pkp-auth-service' });

// =============================================================
//                     Create Elysia App
// =============================================================
export const app = new Elysia()
  .get('/', () => ({
    message: 'PKP Auth Service is running. PKP minting is now asynchronous.',
  }))
  .get('/test-rate-limit', () => ({ message: 'OK' }))
  .use(apiKeyGateAndTracking)
  .use(rateLimiter)
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

// =============================================================
//                     Start Server
// =============================================================
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
