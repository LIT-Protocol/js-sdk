import { getAddress } from 'viem';
import { z } from 'zod';
import type { PKPStorageProvider } from '../../../../../../../../../storage/types';
import { logger } from '../../../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../../contract-manager/createContractsManager';
import { getPubkeyByTokenId } from '../../../rawContractApis/pkp/read/getPubkeyByTokenId';
import { tokenOfOwnerByIndex } from '../../../rawContractApis/pkp/read/tokenOfOwnerByIndex';
import { PaginatedPKPsResponse } from './getPKPsByAuthMethod';
import { PKPData } from '@lit-protocol/schemas';

// Schema for pagination
const paginationSchema = z.object({
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
});

// Schema for the request
const getPKPsByAddressSchema = z.object({
  ownerAddress: z.string().startsWith('0x'),
  pagination: paginationSchema.optional(),
  storageProvider: z.any().optional(), // PKPStorageProvider type
});

type GetPKPsByAddressRequest = z.infer<typeof getPKPsByAddressSchema>;

/**
 * Get all token IDs for a specific owner address
 */
async function getTokenIdsForOwnerAddress(
  ownerAddress: string,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<string[]> {
  const typedOwnerAddress = ownerAddress as `0x${string}`;
  const tokenIds: string[] = [];

  // Constants for optimization
  const BATCH_SIZE = 5; // Number of PKPs to fetch in parallel
  const MAX_BATCHES = 20; // Maximum number of batches to try (100 PKPs total)
  let hasMorePKPs = true;
  let batchIndex = 0;

  while (hasMorePKPs && batchIndex < MAX_BATCHES) {
    const startIndex = batchIndex * BATCH_SIZE;

    logger.debug(
      { batchIndex, startIndex, ownerAddress },
      'Fetching batch of token IDs'
    );

    // Create an array of promises for the current batch
    const batchPromises = Array.from({ length: BATCH_SIZE }, (_, i) => {
      const index = startIndex + i;
      return tokenOfOwnerByIndex(
        { ownerAddress: typedOwnerAddress, index },
        networkCtx,
        accountOrWalletClient
      );
    });

    // Wait for all promises to settle
    const batchResults = await Promise.allSettled(batchPromises);

    // Process the results
    let validTokensInBatch = 0;

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        tokenIds.push(result.value);
        validTokensInBatch++;
      }
      // If rejected, we've likely hit the end of available tokens
    }

    // If we didn't get any valid tokens in this batch, we're done
    if (validTokensInBatch === 0) {
      hasMorePKPs = false;
      logger.debug(
        { batchIndex, ownerAddress },
        'No valid tokens found in batch, stopping enumeration'
      );
    }

    batchIndex++;
  }

  if (batchIndex >= MAX_BATCHES) {
    logger.warn(
      { ownerAddress, maxTokens: MAX_BATCHES * BATCH_SIZE },
      'Reached maximum number of tokens to fetch'
    );
  }

  logger.debug(
    { ownerAddress, tokenCount: tokenIds.length },
    'Token IDs enumerated successfully'
  );

  return tokenIds;
}

/**
 * Fetch PKP details for a list of token IDs with granular caching
 */
async function fetchPKPDetailsForTokenIds(
  tokenIds: string[],
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient,
  storageProvider?: PKPStorageProvider
): Promise<PKPData[]> {
  const pkps: PKPData[] = [];

  for (const tokenId of tokenIds) {
    try {
      let publicKey: string;
      let ethAddress: string;

      // Try to get from granular cache first
      if (storageProvider && storageProvider.readPKPDetails) {
        try {
          const cachedDetails = await storageProvider.readPKPDetails({
            tokenId,
          });

          if (cachedDetails) {
            publicKey = cachedDetails.publicKey;
            ethAddress = cachedDetails.ethAddress;
            logger.debug(
              { tokenId },
              'PKP details retrieved from granular cache'
            );
          } else {
            // Cache miss - fetch from contract
            const contractDetails = await fetchPKPDetailsFromContract(
              tokenId,
              networkCtx,
              accountOrWalletClient
            );
            publicKey = contractDetails.publicKey;
            ethAddress = contractDetails.ethAddress;

            // Store in granular cache
            if (storageProvider.writePKPDetails) {
              await storageProvider.writePKPDetails({
                tokenId,
                publicKey,
                ethAddress,
              });
              logger.debug({ tokenId }, 'PKP details stored in granular cache');
            }
          }
        } catch (storageError) {
          logger.warn(
            { tokenId, error: storageError },
            'Granular storage operation failed - falling back to contract call'
          );
          // Fallback to contract call
          const contractDetails = await fetchPKPDetailsFromContract(
            tokenId,
            networkCtx,
            accountOrWalletClient
          );
          publicKey = contractDetails.publicKey;
          ethAddress = contractDetails.ethAddress;
        }
      } else {
        // No granular caching - fetch directly from contract
        const contractDetails = await fetchPKPDetailsFromContract(
          tokenId,
          networkCtx,
          accountOrWalletClient
        );
        publicKey = contractDetails.publicKey;
        ethAddress = contractDetails.ethAddress;
      }

      pkps.push({
        tokenId: BigInt(tokenId),
        pubkey: publicKey,
        ethAddress,
      });
    } catch (error) {
      logger.warn(
        { tokenId, error },
        'Failed to fetch PKP details for token ID'
      );
      // Continue with other tokens
    }
  }

  return pkps;
}

/**
 * Fetch PKP details from contract for a single token
 */
async function fetchPKPDetailsFromContract(
  tokenId: string,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<{ publicKey: string; ethAddress: string }> {
  // Get the public key
  const publicKey = await getPubkeyByTokenId(
    { tokenId },
    networkCtx,
    accountOrWalletClient
  );

  // Compute the Ethereum address from the public key
  const { pubkeyRouterContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  // Remove '0x' prefix if present for the contract call
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

/**
 * Retrieves all PKPs owned by a specific Ethereum address with pagination and caching support
 * @param request - Object containing the owner address, pagination, and storage provider
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to a paginated response of PKP information objects
 */
export async function getPKPsByAddress(
  request: GetPKPsByAddressRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PaginatedPKPsResponse> {
  const parsedRequest = getPKPsByAddressSchema.parse(request);
  const { ownerAddress, pagination = {}, storageProvider } = parsedRequest;
  const { limit, offset } = paginationSchema.parse(pagination);

  logger.debug(
    {
      ownerAddress,
      pagination: { limit, offset },
      hasStorage: !!storageProvider,
    },
    'Fetching PKPs by address'
  );

  try {
    // Step 1: Get all token IDs for this owner address (can be cached)
    let allTokenIds: string[];

    if (storageProvider && storageProvider.readPKPTokensByAddress) {
      logger.debug('Attempting to fetch token IDs from storage provider');

      try {
        const cachedTokenIds = await storageProvider.readPKPTokensByAddress({
          ownerAddress,
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
          allTokenIds = await getTokenIdsForOwnerAddress(
            ownerAddress,
            networkCtx,
            accountOrWalletClient
          );

          // Store token IDs in storage
          if (storageProvider.writePKPTokensByAddress) {
            logger.debug(
              { tokenCount: allTokenIds.length },
              'Storing token IDs in storage provider'
            );
            await storageProvider.writePKPTokensByAddress({
              ownerAddress,
              tokenIds: allTokenIds,
            });
          }
        }
      } catch (storageError) {
        logger.warn(
          { error: storageError },
          'Token ID storage operation failed - falling back to contract call'
        );
        allTokenIds = await getTokenIdsForOwnerAddress(
          ownerAddress,
          networkCtx,
          accountOrWalletClient
        );
      }
    } else {
      // No storage or no token caching - fetch directly from contract
      logger.debug('No token ID storage - fetching directly from contract');
      allTokenIds = await getTokenIdsForOwnerAddress(
        ownerAddress,
        networkCtx,
        accountOrWalletClient
      );
    }

    const totalCount = allTokenIds.length;

    if (totalCount === 0) {
      logger.debug({ ownerAddress }, 'No PKPs found for address');
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
        ownerAddress,
        totalFound: totalCount,
        returnedCount: paginatedPkps.length,
        pagination: { limit, offset, hasMore },
        storageUsed: !!storageProvider,
      },
      'PKPs by address fetched successfully'
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
    logger.error({ ownerAddress, error }, 'Error in getPKPsByAddress');
    throw new Error(`Failed to get PKPs for address: ${error}`);
  }
}

// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const pkps = await getPKPsByAddress(
//     {
//       ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//     },
//     networkCtx
//   );

//   console.log(pkps);
// }
