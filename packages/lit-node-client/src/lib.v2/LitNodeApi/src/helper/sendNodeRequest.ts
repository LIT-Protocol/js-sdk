import { NetworkError } from '@lit-protocol/constants';
import { composeLitUrl } from '@lit-protocol/lit-node-client';
import { LitEndpoint } from '@lit-protocol/types';

const ABORT_TIMEOUT = 20_000; // Abort after 20s

export async function sendNodeRequest<T>(
  // Interface for common request parameters
  params: {
    // url?: string; // Base URL of the node (e.g., "http://127.0.0.1:7470")
    // endpoint?: LitEndpoint; // e.g., LIT_ENDPOINT.HANDSHAKE
    fullPath: string; // "https://148.113.162.28:7470/web/pkp/sign/v2",
    data: any; // Request-specific payload
    requestId: string; // Unique ID for logging/tracing,
    epoch: number; // current epoch number
    version: string; // client sdk version
  }
): Promise<T> {
  const _fullUrl = params.fullPath;

  const _headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Lit-SDK-Version': params.version,
    'X-Lit-SDK-Type': 'Typescript', // Or determine dynamically
    'X-Request-Id': `lit_${params.requestId}`, // Use the passed request ID
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ABORT_TIMEOUT);

  // TODO: maybe epoch can be included in the request data?
  const requestData = { ...params.data, epoch: params.epoch };

  try {
    const req = {
      method: 'POST',
      headers: _headers,
      body: JSON.stringify(requestData),
      // signal: controller.signal,
    };

    // if (_fullUrl.includes('pkp/sign/v2')) {
    //   console.log('🔄 req', req);
    //   process.exit();
    // }

    const response = await fetch(_fullUrl, req);

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');

    clearTimeout(timeout);

    const responseBody = isJson ? await response.json() : null;

    if (!response.ok) {
      const error = responseBody || response.status;
      return Promise.reject(error);
    }

    return responseBody;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new NetworkError(
        {
          info: {
            fullPath: params.fullPath,
            requestId: params.requestId,
            reason: 'Request timed out',
          },
          cause: e,
        },
        `Request to ${params.fullPath} aborted after ${ABORT_TIMEOUT}ms`
      );
    }

    throw new NetworkError(
      {
        info: {
          fullPath: params.fullPath,
          request: {
            method: 'POST',
            headers: _headers,
            body: JSON.stringify(requestData),
          },
          requestId: params.requestId,
        },
        cause: e,
      },
      `Network or parsing error during request to ${params.fullPath}: ${
        (e as Error).message
      }`
    );
  } finally {
    clearTimeout(timeout);
  }
}
