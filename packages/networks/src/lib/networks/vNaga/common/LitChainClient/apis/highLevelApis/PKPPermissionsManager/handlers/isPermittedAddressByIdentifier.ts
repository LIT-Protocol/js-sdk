import { logger } from '../../../../../../../shared/logger';
import { NagaContext } from '../../../../../../types';
import { z } from 'zod';
import { isPermittedAddress } from '../../../rawContractApis/permissions/read/isPermittedAddress';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';

// Schema for validating the request parameters
const isPermittedAddressByIdentifierSchema = z.intersection(
  z.object({
    targetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type IsPermittedAddressByIdentifierRequest = z.infer<
  typeof isPermittedAddressByIdentifierSchema
>;

/**
 * Check if an address is permitted for a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey and targetAddress
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to boolean indicating if the address is permitted
 */
export async function isPermittedAddressByIdentifier(
  request: IsPermittedAddressByIdentifierRequest,
  networkCtx: NagaContext
): Promise<boolean> {
  logger.debug({ request });

  const { targetAddress, ...identifier } = request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx
  );

  return isPermittedAddress(
    {
      tokenId: pkpTokenId.toString(),
      address: targetAddress,
    },
    networkCtx
  );
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await isPermittedAddressByIdentifier(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       // pubkey: "0x000",
//       // address: "0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F",
//       targetAddress: "0x1234567890123456789012345678901234567890",
//     },
//     networkCtx
//   );
//   console.log("Is address permitted:", res);
// }
