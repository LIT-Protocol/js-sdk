import { Express } from 'express';
import { getJobStatus } from '../../../queue-manager/src/bullmqSetup';

export const registerStatusRoutes = (app: Express) => {
  app.get('/status/:jobId', async (req, res) => {
    const { jobId } = req.params;
    if (!jobId) return res.status(400).json({ error: 'Job ID is required.' });

    try {
      const payload = await getJobStatus(jobId);
      return res.status(200).json(payload);
    } catch (err: any) {
      console.error(`[API] Failed to get status for job ${jobId}:`, err);
      return res
        .status(500)
        .json({ error: `Failed to retrieve job status.${err.message ?? ''}` });
    }
  });
};
