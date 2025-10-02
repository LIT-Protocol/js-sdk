import { Express } from 'express';
import { addJob } from '../../../queue-manager/src/bullmqSetup';
import { randomUUID } from 'node:crypto';
import { getChildLogger } from '@lit-protocol/logger';

const logger = getChildLogger({ name: 'registerPkpRoutes' });

export const registerPkpRoutes = (app: Express) => {
  app.post('/pkp/mint', async (req, res) => {
    const reqId = randomUUID();
    try {
      logger.info({ reqId, body: req.body }, `[API] pkp/mint incoming request`);

      const job = await addJob('pkpMint', { requestBody: req.body });
      return res
        .status(202)
        .json({ jobId: job.id, message: `PKP mint queued. reqId=${reqId}` });
    } catch (err: any) {
      console.error(`[API] Failed to add job 'pkpMint' to queue:`, err);
      return res.status(500).json({
        error: `Failed to queue PKP minting request.${err.message ?? ''}`,
      });
    }
  });
};
