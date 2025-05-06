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

import type { LitAuthStorageProvider } from './types';
import type { LitAuthData } from '../types';
import { LocalStorage } from 'node-localstorage'; // Use node-localstorage

const LOCALSTORAGE_LIT_AUTH_PREFIX = 'lit-auth';

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
  // Initialize node-localstorage
  const localStorage = new LocalStorage(storagePath);

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
      localStorage.setItem(
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
      const value = localStorage.getItem(
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
          console.error('Failed to parse stored auth data:', error);
          // Optionally clear the corrupted item
          // localStorage.removeItem(buildLookupKey({ appName, networkName, address }));
          return null;
        }
      }
    },
  };
}
