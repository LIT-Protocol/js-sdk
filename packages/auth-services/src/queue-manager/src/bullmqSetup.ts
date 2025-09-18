import { ConnectionOptions, Queue } from 'bullmq';
import { JSONStringify as BigIntStringify } from 'json-with-bigint';
import { env } from '../../env';
import { parseRedisUrl } from './helper/redisUrlParser';
import { JobName } from './jobRegistry';

export const mainQueueName = 'pkpAuthServiceQueue';

export const bullmqConnectionOptions: ConnectionOptions = parseRedisUrl(
  env.REDIS_URL
);

export const addJob = async (
  jobName: JobName,

  /**
   * Worker expects this structure
   */
  jobData: { requestBody: any }
) => {
  const job = await mainAppQueue.add(jobName, jobData, {
    jobId: crypto.randomUUID(),
  });

  console.log(`[BullMQ] Job ${job.id} added to queue ${mainAppQueue.name}`);

  return job;
};

export const getJobStatus = async (jobId: string) => {
  const job = await mainAppQueue.getJob(jobId);

  if (!job) {
    return new Response(BigIntStringify({ error: 'Job not found.' }), {
      headers: { 'content-type': 'application/json' },
      status: 404,
    });
  }

  const state = await job.getState();

  const responsePayload = {
    jobId: job.id,
    name: job.name,
    state: state,
    progress: job.progress,
    timestamp: job.timestamp, // Creation time
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    returnValue: job.returnvalue, // Contains result if completed (already stringified by handler)
    failedReason: job.failedReason, // Contains error message if failed
  };

  return responsePayload;
};

export const mainAppQueue = new Queue(mainQueueName, {
  connection: bullmqConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 1000,
      age: 3600 * 24 * 7,
    },
    removeOnFail: {
      count: 5000,
      age: 3600 * 24 * 30,
    },
  },
});

mainAppQueue.on('error', (error) => {
  console.error(`BullMQ Queue (${mainQueueName}) Error:`, error);
});

console.log(
  `BullMQ main queue (${mainQueueName}) initialized using Redis options derived from: ${env.REDIS_URL}`
);
