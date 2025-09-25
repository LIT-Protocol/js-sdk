import { ConnectionOptions, Queue } from 'bullmq';
import { env } from '../../env';
import { parseRedisUrl } from './helper/redisUrlParser';
import { JobName } from './jobRegistry';

export const mainQueueName = 'pkpAuthServiceQueue';

let bullmqConnectionOptions: ConnectionOptions = parseRedisUrl(env.REDIS_URL);

export const setBullmqRedisUrl = (redisUrl: string) => {
  bullmqConnectionOptions = parseRedisUrl(redisUrl);
  if (mainAppQueueInstance) {
    console.warn(
      '[BullMQ] Redis URL changed after queue initialisation; new connections will use the updated URL. Existing queue instance not re-created.'
    );
  }
};

export const getBullmqConnectionOptions = (): ConnectionOptions =>
  bullmqConnectionOptions;

let mainAppQueueInstance: Queue | null = null;

export const getMainAppQueue = (): Queue => {
  if (!mainAppQueueInstance) {
    mainAppQueueInstance = new Queue(mainQueueName, {
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

    mainAppQueueInstance.on('error', (error) => {
      console.error(`BullMQ Queue (${mainQueueName}) Error:`, error);
    });

    console.log(
      `BullMQ main queue (${mainQueueName}) initialized using Redis options derived from: ${JSON.stringify(
        bullmqConnectionOptions
      )}`
    );
  }
  return mainAppQueueInstance;
};

export const addJob = async (
  jobName: JobName,

  /**
   * Worker expects this structure
   */
  jobData: { requestBody: any }
) => {
  const job = await getMainAppQueue().add(jobName, jobData, {
    jobId: crypto.randomUUID(),
  });

  console.log(
    `[BullMQ] Job ${job.id} added to queue ${getMainAppQueue().name}`
  );

  return job;
};

export type JobStatusPayload =
  | { error: string }
  | {
      jobId: string | number;
      name: string;
      state: string;
      progress: unknown;
      timestamp: number;
      processedOn: number | null | undefined;
      finishedOn: number | null | undefined;
      returnValue: unknown;
      failedReason: string | null | undefined;
    };

export const getJobStatus = async (
  jobId: string
): Promise<JobStatusPayload> => {
  const job = await getMainAppQueue().getJob(jobId);

  if (!job || !job.id) {
    return { error: 'Job not found.' };
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
