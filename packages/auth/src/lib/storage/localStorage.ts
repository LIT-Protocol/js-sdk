import type { LitAuthStorageProvider } from './types';
import type { LitAuthData } from '../types';

const LOCALSTORAGE_LIT_AUTH_PREFIX = 'lit-auth';

interface LocalStorageConfig {
  appName: string;
  localStorage?: WindowLocalStorage['localStorage'];
  networkName: string;
}

function assertLocalstorageValid(
  localStorage: unknown
): asserts localStorage is WindowLocalStorage['localStorage'] {
  if (!localStorage) {
    throw new Error('localStorage is not available in this environment');
  }

  if (typeof localStorage !== 'object') {
    throw new Error('localStorage is not an object');
  }

  if (
    !('getItem' in localStorage) ||
    typeof localStorage.getItem !== 'function'
  ) {
    throw new Error('localStorage does not have `getItem` method');
  }

  if (
    !('setItem' in localStorage) ||
    typeof localStorage.setItem !== 'function'
  ) {
    throw new Error('localStorage does not have `setItem` method');
  }
}

/**
 * Builds a lookup key for localStorage based on the provided parameters.
 * Ensures that all auth data loaded for a given PKP is for the expected LIT network
 * in cases where the same environment may be used to communicate w/ multiple networks
 *
 * @param {object} params - The parameters required to build the lookup key.
 * @param {string} params.appName - The name of the application; used to store different auth material for the same PKP on the same domain
 * @param {string} params.networkName - The name of the network; used to store different auth material per LIT network
 * @param {string} params.address - ETH Address (could be PKP address or EOA address)
 *
 * @returns {string} The generated lookup key for localStorage.
 *
 * @private
 */
function buildLookupKey({
  appName,
  networkName,
  address,
}: {
  appName: string;
  networkName: string;
  address: string;
}): string {
  return `${LOCALSTORAGE_LIT_AUTH_PREFIX}:${appName}:${networkName}:${address}`;
}

export function localStorage({
  appName,
  networkName,
  localStorage = globalThis.localStorage,
}: LocalStorageConfig): LitAuthStorageProvider {
  assertLocalstorageValid(localStorage);

  return {
    config: { appName, networkName, localStorage },

    async write({ address, authData }) {
      localStorage.setItem(
        buildLookupKey({
          appName,
          networkName,
          address,
        }),
        JSON.stringify(authData)
      );
    },

    async read({ address }): Promise<LitAuthData | null> {
      const value = localStorage.getItem(
        buildLookupKey({
          appName,
          networkName,
          address,
        })
      );

      if (!value) {
        // Empty string will be converted to null
        return null;
      } else {
        return JSON.parse(value);
      }
    },
  };
}
