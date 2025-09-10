import { getChildLogger } from '@lit-protocol/logger';
import { Worker } from 'bullmq';
import { getBullmqConnectionOptions, mainQueueName } from './bullmqSetup';
import { JobName, jobRegistry } from './jobRegistry';

const logger = getChildLogger({
  name: 'generic-bullmq-worker',
});

export function createGenericWorker() {
  logger.info('Initialising Generic BullMQ Worker...');

  const worker = new Worker(
    mainQueueName,
    async (job) => {
      logger.info(
        {
          jobId: job.id,
          jobName: job.name,
        },
        `Picked up job ${job.id} with name ${job.name}`
      );
      const handler = jobRegistry[job.name as JobName];

      if (handler) {
        try {
          const result = await handler(job.data);
          logger.info(
            {
              jobId: job.id,
              jobName: job.name,
            },
            `Job ${job.id} (${job.name}) completed successfully.`
          );
          return result; // Result is stored by BullMQ
        } catch (error: any) {
          logger.error(
            {
              jobId: job.id,
              jobName: job.name,
              errorMessage: error.message,
              stack: error.stack,
              errorObject:
                typeof error === 'object' && error !== null ? error : undefined,
            },
            `Handler for job ${job.id} (${job.name}) failed: ${error.message}`
          );
          throw error;
        }
      } else {
        const errorMessage = `No handler found for job name: ${job.name}. Job ID: ${job.id}`;
        logger.error({ jobId: job.id, jobName: job.name }, errorMessage);
        throw new Error(errorMessage); // Mark job as failed if no handler
      }
    },
    {
      connection: getBullmqConnectionOptions(),
      concurrency: parseInt(process.env['WORKER_CONCURRENCY'] || '5', 10),
    }
  );

  worker.on('completed', (job, result) => {
    if (job) {
      logger.info(
        {
          jobId: job.id,
          jobName: job.name,
        },
        `Job ${job.id} (${job.name}) final state: completed.`
      );
    } else {
      logger.warn(
        'A job completed, but job details are unavailable in the event.'
      );
    }
  });

  worker.on('failed', (job, err) => {
    if (job) {
      logger.error(
        {
          jobId: job.id,
          jobName: job.name,
          errorMessage: err.message,
          errorStack: err.stack,
        },
        `Job ${job.id} (${job.name}) final state: failed. Error: ${err.message}`
      );
    } else {
      logger.error(
        { errorMessage: err.message, errorStack: err.stack },
        `A job failed, but job details are unavailable in the event. Error: ${err.message}`
      );
    }
  });

  worker.on('error', (err) => {
    // This is for errors in the worker itself, not necessarily job failures
    logger.error(
      {
        errorMessage: err.message,
        errorStack: err.stack,
        errorObject: typeof err === 'object' && err !== null ? err : undefined,
      },
      'Generic BullMQ worker instance encountered an error:'
    );
  });

  return worker;
}
