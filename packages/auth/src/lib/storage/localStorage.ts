import type { LitAuthStorageProvider } from './types';
import type { LitAuthData } from '../types';
import { getGlobal } from '@lit-protocol/constants';
import { PKPData } from '@lit-protocol/schemas';

const LOCALSTORAGE_LIT_AUTH_PREFIX = 'lit-auth';
const LOCALSTORAGE_LIT_PKP_PREFIX = 'lit-pkp-tokens';
const LOCALSTORAGE_LIT_PKP_FULL_PREFIX = 'lit-pkp-full';
const LOCALSTORAGE_LIT_PKP_DETAILS_PREFIX = 'lit-pkp-details';
const LOCALSTORAGE_LIT_PKP_ADDRESS_PREFIX = 'lit-pkp-address';

const globalScope = getGlobal();

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

/**
 * Builds a lookup key for PKP token caching based on auth method
 * @param {object} params - The parameters required to build the lookup key.
 * @param {string} params.appName - The name of the application
 * @param {string} params.networkName - The name of the network
 * @param {string} params.authMethodType - The auth method type
 * @param {string} params.authMethodId - The auth method ID
 * @returns {string} The generated lookup key for PKP token cache
 * @private
 */
function buildPKPCacheKey({
  appName,
  networkName,
  authMethodType,
  authMethodId,
}: {
  appName: string;
  networkName: string;
  authMethodType: string;
  authMethodId: string;
}): string {
  return `${LOCALSTORAGE_LIT_PKP_PREFIX}:${appName}:${networkName}:${authMethodType}:${authMethodId}`;
}

/**
 * Builds a lookup key for full PKP data caching based on auth method
 * @param {object} params - The parameters required to build the lookup key.
 * @param {string} params.appName - The name of the application
 * @param {string} params.networkName - The name of the network
 * @param {string} params.authMethodType - The auth method type
 * @param {string} params.authMethodId - The auth method ID
 * @returns {string} The generated lookup key for PKP full data cache
 * @private
 */
function buildPKPFullCacheKey({
  appName,
  networkName,
  authMethodType,
  authMethodId,
}: {
  appName: string;
  networkName: string;
  authMethodType: string;
  authMethodId: string;
}): string {
  return `${LOCALSTORAGE_LIT_PKP_FULL_PREFIX}:${appName}:${networkName}:${authMethodType}:${authMethodId}`;
}

/**
 * Builds a lookup key for granular PKP details caching based on token ID
 * @param {object} params - The parameters required to build the lookup key.
 * @param {string} params.appName - The name of the application
 * @param {string} params.networkName - The name of the network
 * @param {string} params.tokenId - The PKP token ID
 * @returns {string} The generated lookup key for PKP details cache
 * @private
 */
function buildPKPDetailsCacheKey({
  appName,
  networkName,
  tokenId,
}: {
  appName: string;
  networkName: string;
  tokenId: string;
}): string {
  return `${LOCALSTORAGE_LIT_PKP_DETAILS_PREFIX}:${appName}:${networkName}:${tokenId}`;
}

/**
 * Builds a lookup key for PKP token caching based on owner address
 * @param {object} params - The parameters required to build the lookup key.
 * @param {string} params.appName - The name of the application
 * @param {string} params.networkName - The name of the network
 * @param {string} params.ownerAddress - The owner address
 * @returns {string} The generated lookup key for PKP address cache
 * @private
 */
function buildPKPAddressCacheKey({
  appName,
  networkName,
  ownerAddress,
}: {
  appName: string;
  networkName: string;
  ownerAddress: string;
}): string {
  return `${LOCALSTORAGE_LIT_PKP_ADDRESS_PREFIX}:${appName}:${networkName}:${ownerAddress}`;
}

export function localStorage({
  appName,
  networkName,
  localStorage = globalScope.localStorage,
}: LocalStorageConfig): LitAuthStorageProvider {
  assertLocalstorageValid(localStorage);

  return {
    config: { appName, networkName, localStorage },

    /**
     * Cache PKP token IDs for a specific auth method
     */
    async writePKPTokens({
      authMethodType,
      authMethodId,
      tokenIds,
    }): Promise<void> {
      const cacheKey = buildPKPCacheKey({
        appName,
        networkName,
        authMethodType: authMethodType.toString(),
        authMethodId,
      });

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          tokenIds,
          timestamp: Date.now(),
        })
      );
    },

    /**
     * Retrieve cached PKP token IDs for a specific auth method
     */
    async readPKPTokens({
      authMethodType,
      authMethodId,
    }): Promise<string[] | null> {
      const cacheKey = buildPKPCacheKey({
        appName,
        networkName,
        authMethodType: authMethodType.toString(),
        authMethodId,
      });

      const value = localStorage.getItem(cacheKey);

      if (!value) {
        return null;
      }

      try {
        const parsed = JSON.parse(value);
        // Optional: Add cache expiration logic here
        // const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
        // if (isExpired) return null;

        return parsed.tokenIds || null;
      } catch (error) {
        console.warn('Failed to parse cached PKP tokens:', error);
        return null;
      }
    },

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

    /**
     * The authSig that was returned from the signSessionKey endpoint
     */
    async writeInnerDelegationAuthSig({ publicKey, authSig }) {
      localStorage.setItem(
        buildLookupKey({
          appName: `${appName}-inner-delegation`,
          networkName,
          address: publicKey,
        }),
        JSON.stringify(authSig)
      );
    },

    async readInnerDelegationAuthSig({ publicKey }) {
      const value = localStorage.getItem(
        buildLookupKey({
          appName: `${appName}-inner-delegation`,
          networkName,
          address: publicKey,
        })
      );

      if (!value) {
        return null;
      } else {
        return JSON.parse(value);
      }
    },

    /**
     * Cache full PKP information for a specific auth method
     */
    async writePKPs({ authMethodType, authMethodId, pkps }): Promise<void> {
      const cacheKey = buildPKPFullCacheKey({
        appName,
        networkName,
        authMethodType: authMethodType.toString(),
        authMethodId,
      });

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          pkps,
          timestamp: Date.now(),
        })
      );
    },

    /**
     * Retrieve cached full PKP information for a specific auth method
     */
    async readPKPs({
      authMethodType,
      authMethodId,
    }): Promise<PKPData[] | null> {
      const cacheKey = buildPKPFullCacheKey({
        appName,
        networkName,
        authMethodType: authMethodType.toString(),
        authMethodId,
      });

      const value = localStorage.getItem(cacheKey);

      if (!value) {
        return null;
      }

      try {
        const parsed = JSON.parse(value);
        // Optional: Add cache expiration logic here
        // const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
        // if (isExpired) return null;

        return parsed.pkps || null;
      } catch (error) {
        console.warn('Failed to parse cached PKP data:', error);
        return null;
      }
    },

    /**
     * Cache granular PKP details for a specific token ID
     */
    async writePKPDetails({ tokenId, publicKey, ethAddress }): Promise<void> {
      const cacheKey = buildPKPDetailsCacheKey({
        appName,
        networkName,
        tokenId,
      });

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          publicKey,
          ethAddress,
          timestamp: Date.now(),
        })
      );
    },

    /**
     * Retrieve cached granular PKP details for a specific token ID
     */
    async readPKPDetails({
      tokenId,
    }): Promise<{ publicKey: string; ethAddress: string } | null> {
      const cacheKey = buildPKPDetailsCacheKey({
        appName,
        networkName,
        tokenId,
      });

      const value = localStorage.getItem(cacheKey);

      if (!value) {
        return null;
      }

      try {
        const parsed = JSON.parse(value);
        // Optional: Add cache expiration logic here
        // const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
        // if (isExpired) return null;

        if (parsed.publicKey && parsed.ethAddress) {
          return {
            publicKey: parsed.publicKey,
            ethAddress: parsed.ethAddress,
          };
        }
        return null;
      } catch (error) {
        console.warn('Failed to parse cached PKP details:', error);
        return null;
      }
    },

    /**
     * Cache PKP token IDs for a specific owner address
     */
    async writePKPTokensByAddress({ ownerAddress, tokenIds }): Promise<void> {
      const cacheKey = buildPKPAddressCacheKey({
        appName,
        networkName,
        ownerAddress,
      });

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          tokenIds,
          timestamp: Date.now(),
        })
      );
    },

    /**
     * Retrieve cached PKP token IDs for a specific owner address
     */
    async readPKPTokensByAddress({ ownerAddress }): Promise<string[] | null> {
      const cacheKey = buildPKPAddressCacheKey({
        appName,
        networkName,
        ownerAddress,
      });

      const value = localStorage.getItem(cacheKey);

      if (!value) {
        return null;
      }

      try {
        const parsed = JSON.parse(value);
        // Optional: Add cache expiration logic here
        // const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
        // if (isExpired) return null;

        return parsed.tokenIds || null;
      } catch (error) {
        console.warn('Failed to parse cached PKP tokens by address:', error);
        return null;
      }
    },
  };
}
