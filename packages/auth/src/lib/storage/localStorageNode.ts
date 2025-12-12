/**
 * @module localStorageNode
 * @description Provides a storage provider for Node.js environments using 'node-localstorage'.
 * This allows Lit authentication data to be persisted on the server-side or in Node.js scripts.
 * Usage:
 * import { localStorageNode } from '@lit-protocol/auth/storage';
 *
 * const nodeStorage = localStorageNode({
 *   appName: 'my-node-app',
 *   networkName: 'cayenne', // Or your target Lit network
 *   storagePath: './lit-auth-storage' // Path where the storage file will be created
 * });
 *
 * // Use nodeStorage.write(...) and nodeStorage.read(...)
 */

import { PKPData } from '@lit-protocol/schemas';
import type { LitAuthData } from '../types';
import type { LitAuthStorageProvider } from './types';

const LOCALSTORAGE_LIT_AUTH_PREFIX = 'lit-auth';
const LOCALSTORAGE_LIT_PKP_PREFIX = 'lit-pkp-tokens';
const LOCALSTORAGE_LIT_PKP_FULL_PREFIX = 'lit-pkp-full';
const LOCALSTORAGE_LIT_PKP_DETAILS_PREFIX = 'lit-pkp-details';
const LOCALSTORAGE_LIT_PKP_ADDRESS_PREFIX = 'lit-pkp-address';

/**
 * Configuration for the Node.js localStorage provider.
 */
interface LocalStorageNodeConfig {
  /** The name of the application; used to namespace storage. */
  appName: string;
  /** The name of the Lit network (e.g., 'cayenne', 'habanero', 'manzano'). */
  networkName: string;
  /** The file system path where the localStorage data will be persisted. */
  storagePath: string;
}

/**
 * Builds a lookup key for localStorage based on the provided parameters.
 * Ensures that all auth data loaded for a given PKP is for the expected LIT network.
 *
 * @param {object} params - The parameters required to build the lookup key.
 * @param {string} params.appName - The name of the application.
 * @param {string} params.networkName - The name of the network.
 * @param {string} params.address - The LIT PKP address.
 * @returns {string} The generated lookup key for localStorage.
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

const isNodeEnvironment =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

let NodeLocalStorageConstructor: any = null; // To cache the constructor after dynamic import

/**
 * Initializes and returns a node-localstorage instance.
 * Handles dynamic import and constructor caching.
 */
const getNodeStorageInstance = async (storagePath: string): Promise<any> => {
  if (!NodeLocalStorageConstructor) {
    try {
      const moduleName = 'node-localstorage';
      const module = await import(moduleName);
      NodeLocalStorageConstructor = module.LocalStorage;
    } catch (e) {
      console.error(
        "localStorageNode: Failed to dynamically import 'node-localstorage'. " +
          "Ensure it's installed if running in a Node.js environment. Error: ",
        e
      );
      throw new Error(
        "localStorageNode: 'node-localstorage' module unavailable."
      );
    }
  }
  return new NodeLocalStorageConstructor(storagePath);
};

/**
 * Factory function to create a LitAuthStorageProvider for Node.js environments.
 *
 * @param {LocalStorageNodeConfig} config - Configuration for the Node.js storage provider.
 * @returns {LitAuthStorageProvider} An object implementing the LitAuthStorageProvider interface.
 */
export function localStorageNode({
  appName,
  networkName,
  storagePath,
}: LocalStorageNodeConfig): LitAuthStorageProvider {
  if (!isNodeEnvironment) {
    // Return a stub provider for non-Node.js environments
    console.warn(
      'localStorageNode: Detected non-Node.js environment. ' +
        'Returning a non-functional stub. This provider is for Node.js use only.'
    );
    return {
      config: {
        appName,
        networkName,
        storagePath: 'N/A (browser environment)',
      },
      async writePKPTokens({
        authMethodType,
        authMethodId,
        tokenIds,
      }): Promise<void> {
        console.warn(
          'localStorageNode (stub): writePKPTokens called in browser.'
        );
      },
      async readPKPTokens({
        authMethodType,
        authMethodId,
      }): Promise<string[] | null> {
        console.warn(
          'localStorageNode (stub): readPKPTokens called in browser.'
        );
        return null;
      },
      async write({ address, authData }): Promise<void> {
        console.warn('localStorageNode (stub): write called in browser.');
      },
      async read({ address }): Promise<LitAuthData | null> {
        console.warn('localStorageNode (stub): read called in browser.');
        return null;
      },
      async writeInnerDelegationAuthSig({ publicKey, authSig }) {
        console.warn(
          'localStorageNode (stub): writeInnerDelegationAuthSig called in browser.'
        );
      },
      async readInnerDelegationAuthSig({ publicKey }) {
        console.warn(
          'localStorageNode (stub): readInnerDelegationAuthSig called in browser.'
        );
        return null;
      },
      async writePKPs({ authMethodType, authMethodId, pkps }): Promise<void> {
        console.warn('localStorageNode (stub): writePKPs called in browser.');
      },
      async readPKPs({
        authMethodType,
        authMethodId,
      }): Promise<PKPData[] | null> {
        console.warn('localStorageNode (stub): readPKPs called in browser.');
        return null;
      },
      async writePKPDetails({ tokenId, publicKey, ethAddress }): Promise<void> {
        console.warn(
          'localStorageNode (stub): writePKPDetails called in browser.'
        );
      },
      async readPKPDetails({
        tokenId,
      }): Promise<{ publicKey: string; ethAddress: string } | null> {
        console.warn(
          'localStorageNode (stub): readPKPDetails called in browser.'
        );
        return null;
      },
      async writePKPTokensByAddress({ ownerAddress, tokenIds }): Promise<void> {
        console.warn(
          'localStorageNode (stub): writePKPTokensByAddress called in browser.'
        );
      },
      async readPKPTokensByAddress({ ownerAddress }): Promise<string[] | null> {
        console.warn(
          'localStorageNode (stub): readPKPTokensByAddress called in browser.'
        );
        return null;
      },
    };
  }

  // For Node.js environments, return a functional provider
  // The actual 'node-localstorage' instance is created lazily by its methods.
  let _storageInstancePromise: Promise<any> | null = null;

  const getMemoisedStorageInstance = (): Promise<any> => {
    if (!_storageInstancePromise) {
      _storageInstancePromise = getNodeStorageInstance(storagePath);
    }
    return _storageInstancePromise;
  };

  return {
    // Include config for potential debugging or extensions
    config: { appName, networkName, storagePath },

    /**
     * Writes authentication data to the Node.js localStorage.
     * @param {object} params - Parameters for writing data.
     * @param {string} params.address - The PKP address to associate the data with.
     * @param {LitAuthData} params.authData - The authentication data to store.
     * @returns {Promise<void>}
     */
    async write({ address, authData }): Promise<void> {
      const store = await getMemoisedStorageInstance();
      store.setItem(
        buildLookupKey({
          appName,
          networkName,
          address,
        }),
        JSON.stringify(authData)
      );
    },

    /**
     * Reads authentication data from the Node.js localStorage.
     * @param {object} params - Parameters for reading data.
     * @param {string} params.address - The PKP address whose data is to be read.
     * @returns {Promise<LitAuthData | null>} The stored authentication data, or null if not found.
     */
    async read({ address }): Promise<LitAuthData | null> {
      const store = await getMemoisedStorageInstance();
      const value = store.getItem(
        buildLookupKey({
          appName,
          networkName,
          address,
        })
      );

      if (!value) {
        // Handles null or empty string from getItem
        return null;
      } else {
        try {
          // Ensure robust parsing
          return JSON.parse(value) as LitAuthData;
        } catch (error) {
          console.error(
            'localStorageNode: Failed to parse stored auth data:',
            error
          );
          // Optionally clear the corrupted item by re-getting store instance
          // const storeToClear = await getMemoisedStorageInstance();
          // storeToClear.removeItem(buildLookupKey({ appName, networkName, address }));
          return null;
        }
      }
    },

    async writeInnerDelegationAuthSig({ publicKey, authSig }) {
      const store = await getMemoisedStorageInstance();
      store.setItem(
        buildLookupKey({
          appName: `${appName}-inner-delegation`,
          networkName,
          address: publicKey,
        }),
        JSON.stringify(authSig)
      );
    },

    async readInnerDelegationAuthSig({ publicKey }) {
      const store = await getMemoisedStorageInstance();
      const value = store.getItem(
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
     * Cache PKP token IDs for a specific auth method
     */
    async writePKPTokens({
      authMethodType,
      authMethodId,
      tokenIds,
    }): Promise<void> {
      const store = await getMemoisedStorageInstance();
      const cacheKey = buildPKPCacheKey({
        appName,
        networkName,
        authMethodType: authMethodType.toString(),
        authMethodId,
      });

      store.setItem(
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
      const store = await getMemoisedStorageInstance();
      const cacheKey = buildPKPCacheKey({
        appName,
        networkName,
        authMethodType: authMethodType.toString(),
        authMethodId,
      });

      const value = store.getItem(cacheKey);

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
        console.error(
          'localStorageNode: Failed to parse cached PKP tokens:',
          error
        );
        return null;
      }
    },

    /**
     * Cache full PKP information for a specific auth method
     */
    async writePKPs({ authMethodType, authMethodId, pkps }): Promise<void> {
      const store = await getMemoisedStorageInstance();
      const cacheKey = buildPKPFullCacheKey({
        appName,
        networkName,
        authMethodType: authMethodType.toString(),
        authMethodId,
      });

      store.setItem(
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
      const store = await getMemoisedStorageInstance();
      const cacheKey = buildPKPFullCacheKey({
        appName,
        networkName,
        authMethodType: authMethodType.toString(),
        authMethodId,
      });

      const value = store.getItem(cacheKey);

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
        console.error(
          'localStorageNode: Failed to parse cached PKP data:',
          error
        );
        return null;
      }
    },

    /**
     * Cache granular PKP details for a specific token ID
     */
    async writePKPDetails({ tokenId, publicKey, ethAddress }): Promise<void> {
      const store = await getMemoisedStorageInstance();
      const cacheKey = buildPKPDetailsCacheKey({
        appName,
        networkName,
        tokenId,
      });

      store.setItem(
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
      const store = await getMemoisedStorageInstance();
      const cacheKey = buildPKPDetailsCacheKey({
        appName,
        networkName,
        tokenId,
      });

      const value = store.getItem(cacheKey);

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
        console.error(
          'localStorageNode: Failed to parse cached PKP details:',
          error
        );
        return null;
      }
    },

    async writePKPTokensByAddress({ ownerAddress, tokenIds }): Promise<void> {
      const store = await getMemoisedStorageInstance();
      const cacheKey = buildPKPAddressCacheKey({
        appName,
        networkName,
        ownerAddress,
      });

      store.setItem(
        cacheKey,
        JSON.stringify({
          tokenIds,
          timestamp: Date.now(),
        })
      );
    },

    async readPKPTokensByAddress({ ownerAddress }): Promise<string[] | null> {
      const store = await getMemoisedStorageInstance();
      const cacheKey = buildPKPAddressCacheKey({
        appName,
        networkName,
        ownerAddress,
      });

      const value = store.getItem(cacheKey);

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
        console.error(
          'localStorageNode: Failed to parse cached PKP tokens:',
          error
        );
        return null;
      }
    },
  };
}
