import type { LitClientType } from '@lit-protocol/lit-client';
import type { AuthData } from '@lit-protocol/schemas';
import type { PrivateKeyAccount } from 'viem/accounts';

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
  litClient: LitClientType,
  authData: AuthData,
  account: PrivateKeyAccount,
  storagePath: string,
  networkName: string
) => {
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
  const mintResult = await (litClient as any).mintWithAuth({
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
  });

  return newPkps[0];
};
