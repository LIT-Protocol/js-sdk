import { ElysiaInstance } from '../../types/ElysiaInstance.type';
import { addJob } from '../../../../queue-manager/src/bullmqSetup';
import { resp } from '../../response-helpers/response-helpers';
import { mintPkpDoc } from '../../../../queue-manager/src/handlers/pkpMint/pkpMint.doc';
import { AuthServiceMintRequestRaw } from '../../schemas/AuthServiceMintRequestSchema';
import { randomUUID } from 'node:crypto';

export const mint = (app: ElysiaInstance) => {
  app.post(
    '/mint',
    async ({ body }: { body: AuthServiceMintRequestRaw }) => {
      const reqId = randomUUID();
      // console.log('[PKP Mint][INBOUND]', {
      //   reqId,
      //   authMethodType: body.authMethodType,
      //   authMethodId: body.authMethodId,
      //   pubkey_len: body.pubkey?.length ?? 0,
      //   pubkey_is_0x: body.pubkey === '0x',
      //   pubkey_preview: (body.pubkey ?? '').slice(0, 12),
      //   scopes: body.scopes,
      // });

      try {
        const job = await addJob('pkpMint', { requestBody: body });
        return resp.QUEUED(job.id, `PKP mint queued. reqId=${reqId}`);
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
};
