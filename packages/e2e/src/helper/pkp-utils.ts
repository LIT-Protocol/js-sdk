import type { AuthData, PKPData } from '@lit-protocol/schemas';
import type { PrivateKeyAccount } from 'viem/accounts';
import { LitClientInstance } from '../types';

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
  litClient: LitClientInstance,
  authData: AuthData,
  account: PrivateKeyAccount
): Promise<PKPData> => {
  // Check for existing PKPs
  const { pkps } = await litClient.viewPKPsByAuthData({
    authData,
    pagination: {
      limit: PAGINATION_LIMIT,
    },
  });

  // If PKP exists, return it
  if (pkps && pkps[0]) {
    return pkps[0];
  }

  // Otherwise mint new PKP
  try {
    await litClient.mintWithAuth({
      authData,
      account,
      scopes: PKP_SCOPES,
    });
  } catch (e) {
    throw new Error(`❌ Error minting PKP: ${e}`);
  }

  // Query again to get the newly minted PKP in the expected format
  const { pkps: newPkps } = await litClient.viewPKPsByAuthData({
    authData,
    pagination: {
      limit: PAGINATION_LIMIT,
    },
  });

  return newPkps[0];
};
