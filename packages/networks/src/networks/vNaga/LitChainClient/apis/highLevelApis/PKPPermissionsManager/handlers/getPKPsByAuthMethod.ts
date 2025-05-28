import { getAddress } from 'viem';
import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../contract-manager/createContractsManager';
import { getPubkeyByTokenId } from '../../../rawContractApis/pkp/read/getPubkeyByTokenId';
import { getTokenIdsForAuthMethod } from '../../../rawContractApis/pkp/read/getTokenIdsForAuthMethod';
import type { PKPStorageProvider } from '../../../../../../../storage/types';
import type { PKPInfo } from '@lit-protocol/types';

// Schema for auth data (matching the structure from ViemAccountAuthenticator)
const authDataSchema = z.object({
  authMethodType: z
    .union([z.number(), z.bigint()])
    .transform((val) => BigInt(val)),
  authMethodId: z.string().startsWith('0x'),
  accessToken: z.string().optional(), // Optional since not needed for lookup
});

// Schema for pagination
const paginationSchema = z.object({
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Schema for the request
const getPKPsByAuthDataSchema = z.object({
  authData: authDataSchema,
  pagination: paginationSchema.optional(),
  storageProvider: z.custom<PKPStorageProvider>().optional(),
});

type GetPKPsByAuthDataRequest = z.input<typeof getPKPsByAuthDataSchema>;

/**
 * Paginated response for PKPs
 */
export interface PaginatedPKPsResponse {
  pkps: PKPInfo[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Retrieves all PKPs associated with specific authentication data with pagination support
 * @param request - Object containing authData, optional pagination, and optional storageProvider
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for contract interaction
 * @returns Promise resolving to paginated PKP information
 */
export async function getPKPsByAuthData(
  request: GetPKPsByAuthDataRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PaginatedPKPsResponse> {
  const parsedRequest = getPKPsByAuthDataSchema.parse(request);
  const { authData, pagination = {}, storageProvider } = parsedRequest;
  const { limit, offset } = paginationSchema.parse(pagination);

  logger.debug(
    { authData, pagination: { limit, offset }, hasStorage: !!storageProvider },
    'Fetching PKPs by auth data'
  );

  try {
    // Step 1: Get all token IDs for this auth method (can be cached)
    let allTokenIds: string[];

    if (storageProvider && storageProvider.readPKPTokens) {
      logger.debug('Attempting to fetch token IDs from storage provider');

      try {
        const cachedTokenIds = await storageProvider.readPKPTokens({
          authMethodType: authData.authMethodType,
          authMethodId: authData.authMethodId,
        });

        if (
          cachedTokenIds &&
          Array.isArray(cachedTokenIds) &&
          cachedTokenIds.length > 0
        ) {
          allTokenIds = cachedTokenIds;
          logger.debug(
            { tokenCount: allTokenIds.length },
            'Token IDs fetched from storage provider'
          );
        } else {
          // Storage miss - fetch from contract
          logger.debug('Storage miss - fetching token IDs from contract');
          allTokenIds = await getTokenIdsForAuthMethod(
            {
              authMethodType: authData.authMethodType,
              authMethodId: authData.authMethodId,
            },
            networkCtx,
            accountOrWalletClient
          );

          // Store token IDs in storage
          if (storageProvider.writePKPTokens) {
            logger.debug(
              { tokenCount: allTokenIds.length },
              'Storing token IDs in storage provider'
            );
            await storageProvider.writePKPTokens({
              authMethodType: authData.authMethodType,
              authMethodId: authData.authMethodId,
              tokenIds: allTokenIds,
            });
          }
        }
      } catch (storageError) {
        logger.warn(
          { error: storageError },
          'Token ID storage operation failed - falling back to contract call'
        );
        allTokenIds = await getTokenIdsForAuthMethod(
          {
            authMethodType: authData.authMethodType,
            authMethodId: authData.authMethodId,
          },
          networkCtx,
          accountOrWalletClient
        );
      }
    } else {
      // No storage or no token caching - fetch directly from contract
      logger.debug('No token ID storage - fetching directly from contract');
      allTokenIds = await getTokenIdsForAuthMethod(
        {
          authMethodType: authData.authMethodType,
          authMethodId: authData.authMethodId,
        },
        networkCtx,
        accountOrWalletClient
      );
    }

    const totalCount = allTokenIds.length;

    if (totalCount === 0) {
      logger.debug({ authData }, 'No PKPs found for auth data');
      return {
        pkps: [],
        pagination: {
          limit,
          offset,
          total: 0,
          hasMore: false,
        },
      };
    }

    // Step 2: Apply pagination to token IDs FIRST
    const paginatedTokenIds = allTokenIds.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    logger.debug(
      {
        totalTokens: totalCount,
        paginatedTokenCount: paginatedTokenIds.length,
        offset,
        limit,
        hasMore,
      },
      'Applied pagination to token IDs'
    );

    // Step 3: Fetch PKP details for only the paginated token IDs
    const paginatedPkps = await fetchPKPDetailsForTokenIds(
      paginatedTokenIds,
      networkCtx,
      accountOrWalletClient,
      storageProvider // Pass storage provider for granular caching
    );

    logger.debug(
      {
        authData,
        totalFound: totalCount,
        returnedCount: paginatedPkps.length,
        pagination: { limit, offset, hasMore },
        storageUsed: !!storageProvider,
      },
      'PKPs by auth data fetched successfully'
    );

    return {
      pkps: paginatedPkps,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore,
      },
    };
  } catch (error) {
    logger.error({ authData, error }, 'Error in getPKPsByAuthData');
    throw new Error(`Failed to get PKPs for auth data: ${error}`);
  }
}

/**
 * Helper function to fetch PKP details for given token IDs with granular caching
 * This function checks cache for each token ID individually and only fetches missing data from contracts
 */
async function fetchPKPDetailsForTokenIds(
  tokenIds: string[],
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient,
  storageProvider?: PKPStorageProvider
): Promise<PKPInfo[]> {
  const pkps: PKPInfo[] = [];

  // Create contract manager for address derivation (only if needed)
  let contractsManager: ReturnType<typeof createContractsManager> | null = null;

  const getContractsManager = () => {
    if (!contractsManager) {
      contractsManager = createContractsManager(
        networkCtx,
        accountOrWalletClient
      );
    }
    return contractsManager;
  };

  for (const tokenId of tokenIds) {
    try {
      let publicKey: string;
      let ethAddress: string;

      // Step 1: Try to get PKP details from granular cache first
      if (storageProvider && storageProvider.readPKPDetails) {
        logger.debug({ tokenId }, 'Checking granular cache for PKP details');

        try {
          const cachedDetails = await storageProvider.readPKPDetails({
            tokenId,
          });

          if (
            cachedDetails &&
            cachedDetails.publicKey &&
            cachedDetails.ethAddress
          ) {
            logger.debug({ tokenId }, 'PKP details found in granular cache');
            publicKey = cachedDetails.publicKey;
            ethAddress = cachedDetails.ethAddress;
          } else {
            // Cache miss - fetch from contracts
            logger.debug(
              { tokenId },
              'Cache miss - fetching PKP details from contracts'
            );
            const contractDetails = await fetchPKPDetailsFromContract(
              tokenId,
              getContractsManager(),
              networkCtx,
              accountOrWalletClient
            );
            publicKey = contractDetails.publicKey;
            ethAddress = contractDetails.ethAddress;

            // Store in granular cache
            if (storageProvider.writePKPDetails) {
              logger.debug(
                { tokenId },
                'Storing PKP details in granular cache'
              );
              await storageProvider.writePKPDetails({
                tokenId,
                publicKey,
                ethAddress,
              });
            }
          }
        } catch (cacheError) {
          logger.warn(
            { tokenId, error: cacheError },
            'Granular cache operation failed - falling back to contract call'
          );
          const contractDetails = await fetchPKPDetailsFromContract(
            tokenId,
            getContractsManager(),
            networkCtx,
            accountOrWalletClient
          );
          publicKey = contractDetails.publicKey;
          ethAddress = contractDetails.ethAddress;
        }
      } else {
        // No granular caching - fetch directly from contracts
        logger.debug(
          { tokenId },
          'No granular cache - fetching from contracts'
        );
        const contractDetails = await fetchPKPDetailsFromContract(
          tokenId,
          getContractsManager(),
          networkCtx,
          accountOrWalletClient
        );
        publicKey = contractDetails.publicKey;
        ethAddress = contractDetails.ethAddress;
      }

      pkps.push({
        tokenId,
        publicKey,
        ethAddress,
      });

      logger.debug(
        { tokenId, publicKey, ethAddress },
        'PKP information processed'
      );
    } catch (error) {
      logger.error(
        { tokenId, error },
        'Error fetching PKP information for token ID'
      );
      // Continue with other token IDs even if one fails
    }
  }

  return pkps;
}

/**
 * Helper function to fetch PKP details from contracts for a single token ID
 */
async function fetchPKPDetailsFromContract(
  tokenId: string,
  contractsManager: ReturnType<typeof createContractsManager>,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<{ publicKey: string; ethAddress: string }> {
  const { pubkeyRouterContract } = contractsManager;

  // Get the public key for this token ID
  const publicKey = await getPubkeyByTokenId(
    { tokenId },
    networkCtx,
    accountOrWalletClient
  );

  // Derive the Ethereum address from the public key
  const publicKeyBytes = publicKey.startsWith('0x')
    ? publicKey.slice(2)
    : publicKey;

  const ethAddressRaw =
    await pubkeyRouterContract.read.deriveEthAddressFromPubkey([
      `0x${publicKeyBytes}`,
    ]);

  // Format the address
  const ethAddress = getAddress(ethAddressRaw);

  return { publicKey, ethAddress };
}
