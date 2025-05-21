import { JobStatusResponse, pollResponse } from './pollResponse';

export type AuthServerTx<T> = {
  _raw: JobStatusResponse;
  txHash: string;
  data: T;
};

export const handleAuthServerRequest = async <T>(params: {
  serverUrl: string;
  path: '/pkp/mint';
  body: any;
  jobName: string;
}): Promise<AuthServerTx<T>> => {
  const _body = JSON.stringify(params.body);
  const _url = `${params.serverUrl}${params.path}`;

  const res = await fetch(_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: _body,
  });

  if (res.status === 202) {
    const { jobId, message } = await res.json();
    console.log('[Server Response] message:', message);

    const statusUrl = `${params.serverUrl}/status/${jobId}`;

    try {
      const completedJobStatus = await pollResponse<JobStatusResponse>({
        url: statusUrl,
        isCompleteCondition: (response) => response.state === 'completed',
        isErrorCondition: (response) =>
          response.state === 'failed' || response.state === 'error',
        intervalMs: 3000,
        maxRetries: 10,
        errorMessageContext: `${params.jobName} Job ${jobId}`,
      });

      return {
        _raw: completedJobStatus,
        txHash: completedJobStatus.returnValue.hash,
        data: completedJobStatus.returnValue.data,
      };
    } catch (error: any) {
      console.error(`Error during ${params.jobName} polling:`, error);
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
