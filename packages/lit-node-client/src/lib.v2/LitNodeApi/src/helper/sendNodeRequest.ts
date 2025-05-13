import { NetworkError } from '@lit-protocol/constants';
import { composeLitUrl } from '@lit-protocol/lit-node-client';
import { LitEndpoint } from '@lit-protocol/types';

const ABORT_TIMEOUT = 20_000; // Abort after 20s

export async function sendNodeRequest<T>(
  // Interface for common request parameters
  params: {
    url: string; // Base URL of the node (e.g., "http://127.0.0.1:7470")
    endpoint: LitEndpoint; // e.g., LIT_ENDPOINT.HANDSHAKE
    data: any; // Request-specific payload
    requestId: string; // Unique ID for logging/tracing,
    epoch: number; // current epoch number
    version: string; // client sdk version
  }
): Promise<T> {
  const _fullUrl = composeLitUrl({
    url: params.url,
    endpoint: params.endpoint,
  });

  const _headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Lit-SDK-Version': params.version,
    'X-Lit-SDK-Type': 'Typescript', // Or determine dynamically
    'X-Request-Id': params.requestId, // Use the passed request ID
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ABORT_TIMEOUT);

  // TODO: maybe epoch can be included in the request data?
  const requestData = { ...params.data, epoch: params.epoch };

  try {
    const response = await fetch(_fullUrl, {
      method: 'POST',
      headers: _headers,
      body: JSON.stringify(requestData),
      signal: controller.signal,
    });

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
            url: params.url,
            requestId: params.requestId,
            reason: 'Request timed out',
          },
          cause: e,
        },
        `Request to ${params.url} aborted after ${ABORT_TIMEOUT}ms`
      );
    }

    throw new NetworkError(
      {
        info: {
          url: params.url,
          request: {
            method: 'POST',
            headers: _headers,
            body: JSON.stringify(requestData),
          },
          requestId: params.requestId,
        },
        cause: e,
      },
      `Network or parsing error during request to ${_fullUrl}: ${
        (e as Error).message
      }`
    );
  } finally {
    clearTimeout(timeout);
  }
}
