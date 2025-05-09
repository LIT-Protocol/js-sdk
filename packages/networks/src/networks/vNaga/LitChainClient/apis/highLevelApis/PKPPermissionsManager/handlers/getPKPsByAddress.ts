import { getAddress } from 'viem';
import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../contract-manager/createContractsManager';
import { getPubkeyByTokenId } from '../../../rawContractApis/pkp/read/getPubkeyByTokenId';
import { tokenOfOwnerByIndex } from '../../../rawContractApis/pkp/read/tokenOfOwnerByIndex';

// Schema for the request
const getPKPsByAddressSchema = z.object({
  ownerAddress: z.string().startsWith('0x'),
});

type GetPKPsByAddressRequest = z.infer<typeof getPKPsByAddressSchema>;

/**
 * PKP information object
 */
export interface PKPInfo {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
}

/**
//  * Check if an error is an "out of bounds" error
//  * @param error - The error to check
//  * @returns True if it's an out of bounds error, false otherwise
//  */
// function isOutOfBoundsError(error: unknown): boolean {
//   // Check for the specific error message from the contract
//   if (error && typeof error === "object") {
//     // Check for common error structures
//     const errorObj = error as Record<string, any>;

//     // Check direct reason
//     if (
//       errorObj.reason &&
//       typeof errorObj.reason === "string" &&
//       errorObj.reason.includes("out of bounds")
//     ) {
//       return true;
//     }

//     // Check cause
//     if (errorObj.cause && typeof errorObj.cause === "object") {
//       if (
//         errorObj.cause.reason &&
//         typeof errorObj.cause.reason === "string" &&
//         errorObj.cause.reason.includes("out of bounds")
//       ) {
//         return true;
//       }
//     }

//     // Check message
//     if (
//       errorObj.message &&
//       typeof errorObj.message === "string" &&
//       (errorObj.message.includes("out of bounds") ||
//         errorObj.message.includes(
//           "ERC721Enumerable: owner index out of bounds"
//         ))
//     ) {
//       return true;
//     }

//     // Check shortMessage
//     if (
//       errorObj.shortMessage &&
//       typeof errorObj.shortMessage === "string" &&
//       (errorObj.shortMessage.includes("out of bounds") ||
//         errorObj.shortMessage.includes(
//           "ERC721Enumerable: owner index out of bounds"
//         ))
//     ) {
//       return true;
//     }

//     // Special case: empty error object is often returned when out of bounds
//     if (Object.keys(errorObj).length === 0) {
//       return true;
//     }
//   }

//   // Check for string error
//   if (typeof error === "string" && error.includes("out of bounds")) {
//     return true;
//   }

//   return false;
// }

/**
 * Fetch a single PKP's information by index
 * @param ownerAddress - The owner's Ethereum address
 * @param index - The index of the PKP
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to PKP info or null if not found
 */
async function fetchSinglePKP(
  ownerAddress: `0x${string}`,
  index: number,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PKPInfo | null> {
  try {
    // Get the token ID
    const tokenId = await tokenOfOwnerByIndex(
      { ownerAddress, index },
      networkCtx,
      accountOrWalletClient
    );

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

    return {
      tokenId,
      publicKey,
      ethAddress,
    };
  } catch (error) {
    // if (isOutOfBoundsError(error)) {
    //   // Expected when we've gone past the end
    //   return null;
    // }

    // Rethrow other errors
    throw error;
  }
}

/**
 * Retrieves all PKPs owned by a specific Ethereum address
 * @param request - Object containing the owner address
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to an array of PKP information objects
 */
export async function getPKPsByAddress(
  request: GetPKPsByAddressRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PKPInfo[]> {
  const { ownerAddress } = getPKPsByAddressSchema.parse(request);

  logger.debug({ ownerAddress }, 'Fetching PKPs by address');

  // Ensure ownerAddress is properly typed as a hex string
  const typedOwnerAddress = ownerAddress as `0x${string}`;

  try {
    const pkps: PKPInfo[] = [];

    // Constants for optimization
    const BATCH_SIZE = 5; // Number of PKPs to fetch in parallel
    const MAX_BATCHES = 20; // Maximum number of batches to try (100 PKPs total)
    let hasMorePKPs = true;
    let batchIndex = 0;

    while (hasMorePKPs && batchIndex < MAX_BATCHES) {
      const startIndex = batchIndex * BATCH_SIZE;
      const endIndex = startIndex + BATCH_SIZE - 1;

      logger.debug(
        { batchIndex, startIndex, endIndex },
        'Fetching batch of PKPs'
      );

      // Create an array of promises for the current batch
      const batchPromises = Array.from({ length: BATCH_SIZE }, (_, i) => {
        const index = startIndex + i;
        return fetchSinglePKP(
          typedOwnerAddress,
          index,
          networkCtx,
          accountOrWalletClient
        );
      });

      // Wait for all promises to resolve
      const batchResults = await Promise.allSettled(batchPromises);

      // Process the results
      let validPKPsInBatch = 0;

      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value !== null) {
          pkps.push(result.value);
          validPKPsInBatch++;
        }
      }

      // If we didn't get any valid PKPs in this batch, we're done
      if (validPKPsInBatch === 0) {
        hasMorePKPs = false;
        logger.debug(
          { batchIndex },
          'No valid PKPs found in batch, stopping enumeration'
        );
      }

      // Move to the next batch
      batchIndex++;
    }

    if (batchIndex >= MAX_BATCHES) {
      logger.warn(
        { ownerAddress, maxPkps: MAX_BATCHES * BATCH_SIZE },
        'Reached maximum number of PKPs to fetch'
      );
    }

    logger.debug(
      { ownerAddress, count: pkps.length },
      'PKPs fetched successfully'
    );
    return pkps;
  } catch (error) {
    logger.error({ ownerAddress, error }, 'Error in getPKPsByAddress');
    return [];
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
