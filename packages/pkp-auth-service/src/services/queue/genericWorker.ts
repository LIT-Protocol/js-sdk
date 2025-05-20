import { getChildLogger } from '@lit-protocol/logger';
import { Worker } from 'bullmq';
import { bullmqConnectionOptions, mainQueueName } from './bullmqSetup';
import { jobRegistry, JobName } from './jobRegistry';

const logger = getChildLogger({
  name: 'generic-bullmq-worker',
});

export function createGenericWorker() {
  logger.info('Initialising Generic BullMQ Worker...');

  const worker = new Worker(
    mainQueueName,
    async (job) => {
      logger.info(`Picked up job ${job.id} with name ${job.name}`, {
        jobId: job.id,
        jobName: job.name,
      });
      const handler = jobRegistry[job.name as JobName];

      if (handler) {
        try {
          // job.data contains the payload passed when the job was added
          const result = await handler(job.data);
          logger.info(`Job ${job.id} (${job.name}) completed successfully.`, {
            jobId: job.id,
            jobName: job.name,
          });
          return result; // Result is stored by BullMQ
        } catch (error: any) {
          logger.error(
            `Handler for job ${job.id} (${job.name}) failed: ${error.message}`,
            {
              jobId: job.id,
              jobName: job.name,
              errorMessage: error.message,
              stack: error.stack,
              errorObject:
                typeof error === 'object' && error !== null ? error : undefined,
            }
          );
          throw error; // Re-throw to let BullMQ handle failure/retries
        }
      } else {
        const errorMessage = `No handler found for job name: ${job.name}. Job ID: ${job.id}`;
        logger.error(errorMessage, { jobId: job.id, jobName: job.name });
        throw new Error(errorMessage); // Mark job as failed if no handler
      }
    },
    {
      connection: bullmqConnectionOptions, // Use imported connection options
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10), // Allow configuring concurrency
      // Other worker options can be added here, e.g., limiter
    }
  );

  worker.on('completed', (job, result) => {
    if (job) {
      logger.info(`Job ${job.id} (${job.name}) final state: completed.`, {
        jobId: job.id,
        jobName: job.name /* result can be logged if not too large */,
      });
    } else {
      logger.warn(
        'A job completed, but job details are unavailable in the event.'
      );
    }
  });

  worker.on('failed', (job, err) => {
    if (job) {
      logger.error(
        `Job ${job.id} (${job.name}) final state: failed. Error: ${err.message}`,
        {
          jobId: job.id,
          jobName: job.name,
          errorMessage: err.message,
          errorStack: err.stack,
        }
      );
    } else {
      logger.error(
        `A job failed, but job details are unavailable in the event. Error: ${err.message}`,
        { errorMessage: err.message, errorStack: err.stack }
      );
    }
  });

  worker.on('error', (err) => {
    // This is for errors in the worker itself, not necessarily job failures
    logger.error('Generic BullMQ worker instance encountered an error:', {
      errorMessage: err.message,
      errorStack: err.stack,
      errorObject: typeof err === 'object' && err !== null ? err : undefined,
    });
  });

  return worker;
}
