import { ConnectionOptions, Queue } from 'bullmq';
import { env } from '../../env';
import { parseRedisUrl } from './helper/redisUrlParser';
import { JobName } from './jobRegistry';
import { getChildLogger } from '@lit-protocol/logger';

const logger = getChildLogger({ name: 'BullMQ' });

const queueSuffix = env.NETWORK ? `-${env.NETWORK}` : '';
export const mainQueueName = `pkpAuthServiceQueue${queueSuffix}`;

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
    logger.info(
      {
        queue: mainQueueName,
        network: env.NETWORK,
        redis: bullmqConnectionOptions,
      },
      'Initialising BullMQ Queue...'
    );
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

  logger.info(
    {
      queue: mainQueueName,
      network: env.NETWORK,
    },
    'Reusing existing BullMQ Queue instance'
  );
  return mainAppQueueInstance;
};

export const addJob = async (
  jobName: JobName,

  /**
   * Worker expects this structure
   */
  jobData: { requestBody: any }
) => {
  logger.info(
    {
      queue: mainQueueName,
      network: env.NETWORK,
      jobName,
    },
    'Adding job to BullMQ queue'
  );
  const job = await getMainAppQueue().add(jobName, jobData, {
    jobId: crypto.randomUUID(),
  });

  logger.info(
    {
      queue: mainQueueName,
      network: env.NETWORK,
      jobName,
      jobId: job.id,
    },
    'Job added to BullMQ queue'
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

  let returnValue: unknown = undefined;

  if (state === 'completed') {
    returnValue = job.returnvalue;

    if (returnValue == null) {
      try {
        const { returnvalue: rawReturnValue } = job.asJSON();
        returnValue =
          typeof rawReturnValue === 'string' && rawReturnValue.length > 0
            ? JSON.parse(rawReturnValue)
            : rawReturnValue;
      } catch (err) {
        console.warn(
          `[BullMQ] Unable to read return value for completed job ${job.id}:`,
          err
        );
      }
    }
  }

  const responsePayload = {
    jobId: job.id,
    name: job.name,
    state: state,
    progress: job.progress,
    timestamp: job.timestamp, // Creation time
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    returnValue,
    failedReason: job.failedReason, // Contains error message if failed
  };

  return responsePayload;
};
