/**
 * PKP Utilities
 * 
 * This module provides utility functions for managing Programmable Key Pairs (PKPs)
 * in the Lit Protocol ecosystem. It handles the common pattern of checking for 
 * existing PKPs and creating new ones when necessary.
 * 
 * Usage:
 *   import { getOrCreatePkp } from './helper/pkp-utils';
 *   const pkp = await getOrCreatePkp(litClient, authData, account, storagePath, networkName);
 */

import { storagePlugins } from '@lit-protocol/auth';

// Configuration constants
const PAGINATION_LIMIT = 5;
const APP_NAME = 'my-app';
const PKP_SCOPES = ['sign-anything'];

/**
 * Gets an existing PKP or creates a new one if none exists
 * 
 * @param litClient - The Lit Protocol client instance
 * @param authData - Authentication data for the account
 * @param account - The account to associate with the PKP
 * @param storagePath - Local storage path for PKP tokens
 * @param networkName - Name of the network being used
 * @returns Promise<PKP> - The existing or newly created PKP
 */
export const getOrCreatePkp = async (
  litClient: any,
  authData: any,
  account: any,
  storagePath: string,
  networkName: string
) => {
  // Check for existing PKPs
  const { pkps } = await litClient.viewPKPsByAuthData({
    authData,
    pagination: {
      limit: PAGINATION_LIMIT,
    },
    storageProvider: storagePlugins.localStorageNode({
      appName: APP_NAME,
      networkName,
      storagePath,
    }),
  });

  // If PKP exists, return it
  if (pkps && pkps[0]) {
    return pkps[0];
  }

  // Otherwise mint new PKP
  const mintResult = await litClient.mintWithAuth({
    authData,
    account,
    scopes: PKP_SCOPES,
  });

  // Query again to get the newly minted PKP in the expected format
  const { pkps: newPkps } = await litClient.viewPKPsByAuthData({
    authData,
    pagination: {
      limit: PAGINATION_LIMIT,
    },
    storageProvider: storagePlugins.localStorageNode({
      appName: APP_NAME,
      networkName,
      storagePath,
    }),
  });

  return newPkps[0];
}; 