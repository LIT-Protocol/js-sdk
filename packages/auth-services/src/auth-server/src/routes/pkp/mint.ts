import { MintRequestRaw } from '@lit-protocol/networks/src/networks/vNaga/LitChainClient/schemas/MintRequestSchema';
import { ElysiaInstance } from '../../types/ElysiaInstance.type';
import { addJob } from '../../../../queue-manager/src/bullmqSetup';
import { resp } from '../../response-helpers/response-helpers';
import { mintPkpDoc } from '../../../../queue-manager/src/handlers/pkpMint/pkpMint.doc';

export const mint = (app: ElysiaInstance) => {
  app.post(
    '/mint',
    async ({ body }: { body: MintRequestRaw }) => {
      try {
        const job = await addJob('pkpMint', { requestBody: body });
        return resp.QUEUED(job.id, 'PKP minting request queued successfully.');
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
