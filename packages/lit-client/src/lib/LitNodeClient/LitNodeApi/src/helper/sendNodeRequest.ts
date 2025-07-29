import { NetworkError } from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';

const _logger = getChildLogger({
  module: 'sendNodeRequest',
});

const ABORT_TIMEOUT = 20_000; // Abort after 20s

/**
 * Generates a CURL command string from request parameters for debugging purposes
 */
function generateCurlCommand(url: string, req: any): string {
  const headers = Object.entries(req.headers)
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ');

  const body = req.body ? `--data '${req.body}'` : '';

  return `curl -X ${req.method} ${headers} ${body} "${url}"`.trim();
}

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

    _logger.info('🔄 _fullUrl', _fullUrl);
    _logger.info('🔄 req', req);

    // Generate and log CURL command
    const curlCommand = generateCurlCommand(_fullUrl, req);
    _logger.info('🔄 CURL command:', curlCommand);

    // if (_fullUrl.includes('sign_session_key')) {
    //   console.log("Curl command: ", curlCommand);
    //   process.exit();
    // }

    const response = await fetch(_fullUrl, req);

    // Only log response details when DEBUG_HTTP is enabled
    // Safely check for DEBUG_HTTP environment variable in both Node.js and browser
    let isDebugMode = false;
    try {
      isDebugMode = typeof process !== 'undefined' && 
                   typeof process.env === 'object' && 
                   process.env['DEBUG_HTTP'] === 'true';
    } catch (e) {
      // Ignore any errors - ensures browser compatibility
      isDebugMode = false;
    }
    
    if (isDebugMode) {
      const timestamp = new Date().toISOString();
      console.log(`🔄 response at ${timestamp}`, response);
    }

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
