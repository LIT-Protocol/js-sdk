import { AuthSig, LIT_NETWORKS_KEYS } from '@lit-protocol/types';
import {
  uint8arrayFromString,
  uint8ArrayToBase64,
} from '@lit-protocol/uint8arrays';

import {
  LIT_SESSIONSIG_AUTHORIZATION_SCHEMA_PREFIX,
  SERVICE_URL_BY_LIT_NETWORK,
} from './constants';
import { BaseRequestParams, SupportedNetworks } from './types';
import { getPkpAddressFromSessionSig } from '../utils';

function composeAuthHeader(sessionSig: AuthSig) {
  const sessionSigUintArr = uint8arrayFromString(JSON.stringify(sessionSig));

  return `${LIT_SESSIONSIG_AUTHORIZATION_SCHEMA_PREFIX}${uint8ArrayToBase64(
    sessionSigUintArr
  )}`;
}

const supportedNetworks: SupportedNetworks[] = [
  'cayenne',
  'manzano',
  'habanero',
  'datil-dev',
  'datil-test',
];

function isSupportedLitNetwork(
  litNetwork: LIT_NETWORKS_KEYS
): asserts litNetwork is SupportedNetworks {
  // @ts-expect-error - This is an assert function; litNetwork by definition may be an invalid value
  if (!supportedNetworks.includes(litNetwork)) {
    throw new Error(
      `Unsupported LitNetwork! (${supportedNetworks.join('|')}) are supported.`
    );
  }
}

function getServiceUrl({ sessionSig, method, litNetwork }: BaseRequestParams) {
  isSupportedLitNetwork(litNetwork);

  if (method === 'POST') {
    return SERVICE_URL_BY_LIT_NETWORK[litNetwork];
  }

  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);
  return `${SERVICE_URL_BY_LIT_NETWORK[litNetwork]}/${pkpAddress}`;
}

export function getBaseRequestParams(requestParams: BaseRequestParams): {
  initParams: RequestInit;
  url: string;
} {
  const { sessionSig, method, litNetwork } = requestParams;

  // NOTE: Although HTTP conventions use capitalized letters for header names
  // Lambda backend events from API gateway receive all lowercased header keys
  return {
    url: getServiceUrl(requestParams),
    initParams: {
      method,
      headers: {
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

export async function makeRequest<T>({
  url,
  init,
}: {
  url: string;
  init: RequestInit;
}) {
  const response = await fetch(url, { ...init });

  if (!response.ok) {
    const errorMessage = await getResponseErrorMessage(response);
    throw new Error(`Failed to make request for wrapped key: ${errorMessage}`);
  }

  /**
   *
   */
  const result = await getResponseJson<T>(response);

  if (typeof result === 'string') {
    throw new Error(`Unexpected response from wrapped key service: ${result}`);
  }

  return result;
}
