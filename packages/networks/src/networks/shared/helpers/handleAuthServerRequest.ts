import { AuthServerTx, JobStatusResponse } from '@lit-protocol/types';
import { pollResponse } from './pollResponse';
import { getChildLogger } from '@lit-protocol/logger';

const logger = getChildLogger({ name: 'handleAuthServerRequest' });

export const handleAuthServerRequest = async <T>(params: {
  serverUrl: string;
  path: '/pkp/mint';
  body: any;
  jobName: string;
  headers?: Record<string, string>;
}): Promise<AuthServerTx<T>> => {
  logger.info({ params }, 'Initiating auth server request');

  const _body = JSON.stringify(params.body);
  const _url = `${params.serverUrl}${params.path}`;

  const res = await fetch(_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(params.headers || {}),
    },
    body: _body,
  });

  if (res.status === 202) {
    const { jobId, message } = await res.json();
    logger.info({ message }, 'Received response from auth server');

    const statusUrl = `${params.serverUrl}/status/${jobId}`;

    try {
      const completedJobStatus = await pollResponse<JobStatusResponse>({
        url: statusUrl,
        isCompleteCondition: (response) =>
          response.state === 'completed' && response.returnValue != null,
        isErrorCondition: (response) =>
          response.state === 'failed' || response.state === 'error',
        intervalMs: 3000,
        maxRetries: 10,
        errorMessageContext: `${params.jobName} Job ${jobId}`,
      });

      const { returnValue } = completedJobStatus;

      if (!returnValue) {
        throw new Error(
          `${params.jobName} job completed without a return value; please retry or check the auth service logs.`
        );
      }

      return {
        _raw: completedJobStatus,
        txHash: returnValue.hash,
        data: returnValue.data,
      };
    } catch (error: any) {
      logger.error(
        { error },
        `Error during ${params.jobName} polling`
      );
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to ${params.jobName} after polling: ${errMsg}`);
    }
  } else {
    const errorBody = await res.text();
    throw new Error(
      `Failed to initiate ${params.jobName}. Status: ${res.status}, Body: ${errorBody}`
    );
  }
};
