import { initSystemContext } from '../_setup/initSystemContext';
import { mainQueueName, setBullmqRedisUrl } from './src/bullmqSetup';
import { createGenericWorker } from './src/genericWorker';
import { env } from '../env';

export async function startAuthServiceWorker(params?: {
  litTxsenderRpcUrl?: string;
  redisUrl?: string;
}) {
  await initSystemContext({
    appName: 'auth-services-worker',
    rpcUrl: params?.litTxsenderRpcUrl ?? env.LIT_TXSENDER_RPC_URL,
  });
  if (params?.redisUrl) {
    setBullmqRedisUrl(params.redisUrl);
  }
  console.log('------------------------------------------------------');
  console.log(' Attempting to start Generic BullMQ Worker Process... ');
  console.log('------------------------------------------------------');
  console.log(`✅ [WorkerProcess] Main Queue Name: "${mainQueueName}"`);

  // Connection options are internalised; skipping detailed logs

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
