import { LIT_NETWORK_VALUES } from '@lit-protocol/constants';
import { AuthSig } from '@lit-protocol/types';

import {
  LIT_SESSIONSIG_AUTHORIZATION_SCHEMA_PREFIX,
  SERVICE_URL_BY_LIT_NETWORK,
} from './constants';
import { BaseRequestParams, SupportedNetworks } from './types';

function composeAuthHeader(sessionSig: AuthSig) {
  const sessionSigsString = JSON.stringify(sessionSig);

  return `${LIT_SESSIONSIG_AUTHORIZATION_SCHEMA_PREFIX}${Buffer.from(
    sessionSigsString,
    'utf8'
  ).toString('base64')}`;
}

const supportedNetworks: SupportedNetworks[] = ['naga-dev', 'naga-test'];

function isSupportedLitNetwork(
  litNetwork: LIT_NETWORK_VALUES
): asserts litNetwork is SupportedNetworks {
  // @ts-expect-error - This is an assert function; litNetwork by definition may be an invalid value
  if (!supportedNetworks.includes(litNetwork)) {
    throw new Error(
      `Unsupported LIT_NETWORK! (${supportedNetworks.join('|')}) are supported.`
    );
  }
}

function getServiceUrl({ litNetwork }: BaseRequestParams) {
  isSupportedLitNetwork(litNetwork);

  return SERVICE_URL_BY_LIT_NETWORK[litNetwork];
}

export function getBaseRequestParams(requestParams: BaseRequestParams): {
  initParams: RequestInit;
  baseUrl: string;
} {
  const { sessionSig, method, litNetwork } = requestParams;

  // NOTE: Although HTTP conventions use capitalized letters for header names
  // Lambda backend events from API gateway receive all lowercased header keys
  return {
    baseUrl: getServiceUrl(requestParams),
    initParams: {
      method,
      headers: {
        'x-correlation-id': requestParams.requestId,
        'Content-Type': 'application/json',
        'Lit-Network': litNetwork,
        Authorization: composeAuthHeader(sessionSig), // As Base64 string to avoid escaping issues
      },
    },
  };
}

/**
 * This method gives us _either_ the `message` key from the backend error response _or_ the text of the response if
 * it was not JSON formed.
 *
 * Under normal operations, the backend will return errors in JSON format
 *
 * However, because we can't be 100% sure that an error response actually came from our backend code rather than
 * from interim infrastructure, we need to assume that we may be getting a generic error that is plain text.
 *
 * @param {Response} response The response we received from fetch()
 * @returns {string} The error message from the response
 */
async function getResponseErrorMessage(response: Response): Promise<string> {
  try {
    const parsedResponse = await response.json();
    if (parsedResponse.message) {
      return parsedResponse.message as string;
    }
    return JSON.stringify(parsedResponse);
  } catch (e) {
    return response.text();
  }
}

/** This method will give us the JSON parsed response if possible, otherwise the text of the response as a string
 * Responses from the backend API should always be in JSON format
 * However, some mis-behaving infrastructure could return a 200 OK response code, but with a text string in the body
 *
 * @param {Response} response The response we received from fetch()
 * @returns {<T>|string} The error message from the response
 */
async function getResponseJson<T>(response: Response): Promise<T | string> {
  try {
    return (await response.json()) as Promise<T>; // NOTE: `await` here is necessary for errors to be caught by try{}
  } catch (e) {
    return await response.text();
  }
}

export function generateRequestId(): string {
  return Math.random().toString(16).slice(2);
}

export async function makeRequest<T>({
  url,
  init,
  requestId,
}: {
  url: string;
  init: RequestInit;
  requestId: string;
}) {
  try {
    const response = await fetch(url, { ...init });

    if (!response.ok) {
      const errorMessage = await getResponseErrorMessage(response);
      throw new Error(`HTTP(${response.status}): ${errorMessage}`);
    }

    const result = await getResponseJson<T>(response);

    if (typeof result === 'string') {
      throw new Error(`HTTP(${response.status}): ${result}`);
    }

    return result;
  } catch (e: unknown) {
    throw new Error(
      `Request(${requestId}) for wrapped key failed. Error: ${
        (e as Error).message
        // @ts-expect-error Unknown, but `cause` is on `TypeError: fetch failed` errors
      }${e.cause ? ' - ' + e.cause : ''}`
    );
  }
}
