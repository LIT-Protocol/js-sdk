import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createLitContracts } from '../../../../createLitContracts';

// Schema for the request
const tokenOfOwnerByIndexSchema = z.object({
  ownerAddress: z.string().startsWith('0x'),
  index: z.number().int().nonnegative(),
});

type TokenOfOwnerByIndexRequest = z.infer<typeof tokenOfOwnerByIndexSchema>;

/**
 * Retrieves a PKP token ID owned by a specific address at a given index
 * @param request - Object containing owner address and index
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to the token ID as a string
 */
export async function tokenOfOwnerByIndex(
  request: TokenOfOwnerByIndexRequest,
  networkCtx: DefaultNetworkConfig
): Promise<string> {
  const { ownerAddress, index } = tokenOfOwnerByIndexSchema.parse(request);

  logger.debug({ ownerAddress, index }, 'Fetching token of owner by index');

  // Create contract instances
  const { pkpNftContract } = createLitContracts(networkCtx);
  // Convert index to bigint for contract call
  const indexBigInt = BigInt(index);

  pkpNftContract.read;

  // Ensure ownerAddress is properly typed as a hex string
  const typedOwnerAddress = ownerAddress as `0x${string}`;
  // Call the contract to get the token ID
  try {
    const result = await pkpNftContract.read.tokenOfOwnerByIndex([
      typedOwnerAddress,
      indexBigInt,
    ]);
    // Convert the result to a string
    const tokenId = result.toString();

    logger.debug(
      { ownerAddress, index, tokenId },
      'Token of owner by index fetched'
    );

    return tokenId;
  } catch (e) {
    throw new Error('Error fetching token of owner by index');
  }
}

// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const tokenId = await tokenOfOwnerByIndex(
//     {
//       ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//       index: 0,
//     },
//     networkCtx
//   );

//   console.log(tokenId);
// }
