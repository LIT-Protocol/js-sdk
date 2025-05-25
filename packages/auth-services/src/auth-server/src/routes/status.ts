/**
 * Job Status routes
 * Handles status checking for queued jobs
 */
import { getJobStatus } from '../../../queue-manager/src/bullmqSetup'; // Adjusted path
import { getStatusDoc } from '../../../queue-manager/src/handlers/status/getStatus.doc'; // Adjusted path
import { resp } from '../response-helpers/response-helpers';
import { ElysiaInstance } from '../types/ElysiaInstance.type';

export const statusRoutes = (app: ElysiaInstance): ElysiaInstance => {
  // =============================================================
  //                     Get Job Status (/status/:jobId)
  // =============================================================
  app.get(
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

  return app;
};
