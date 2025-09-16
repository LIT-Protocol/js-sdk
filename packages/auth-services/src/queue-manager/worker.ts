import { initSystemContext } from '../_setup/initSystemContext';
import { bullmqConnectionOptions, mainQueueName } from './src/bullmqSetup';
import { createGenericWorker } from './src/genericWorker';
import { env } from '../env';

interface ParsedRedisConnectionOpts {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
}

export async function startAuthServiceWorker() {
  await initSystemContext({ appName: 'auth-services-worker', rpcUrl: env.LIT_TXSENDER_RPC_URL });
  console.log('------------------------------------------------------');
  console.log(' Attempting to start Generic BullMQ Worker Process... ');
  console.log('------------------------------------------------------');
  console.log(`✅ [WorkerProcess] Main Queue Name: "${mainQueueName}"`);

  // Log connection options safely
  if (
    typeof bullmqConnectionOptions === 'object' &&
    bullmqConnectionOptions !== null
  ) {
    const opts = bullmqConnectionOptions as ParsedRedisConnectionOpts;
    console.log(
      `✅ [WorkerProcess] Parsed Redis Connection Host: ${opts.host || 'N/A'}`
    );
    console.log(
      `✅ [WorkerProcess] Parsed Redis Connection Port: ${opts.port || 'N/A'}`
    );
  } else {
    console.log(
      `❌ [WorkerProcess] BullMQ Connection Options are not in the expected object format (e.g., could be a string if supported).`
    );
  }

  try {
    const workerInstance = createGenericWorker();

    // Verify event listeners are attached (simple check)
    if (workerInstance && workerInstance.listeners('completed').length > 0) {
      console.log(
        `[WorkerProcess] Generic BullMQ Worker instance created and event listeners (e.g., 'completed') are attached.`
      );
    } else {
      console.warn(
        `[WorkerProcess] Generic BullMQ Worker instance might not have event listeners properly attached or workerInstance is null.`
      );
    }
  } catch (error) {
    console.error(
      '[WorkerProcess] CRITICAL: Failed to start or initialize Generic BullMQ Worker:',
      error
    );
    process.exit(1); // Exit if worker setup fails critically
  }
}

(async () => {
  await startAuthServiceWorker();
})().catch((error) => {
  console.error(
    '[WorkerProcess] Unhandled error during worker startup sequence:',
    error
  );
  process.exit(1);
});
