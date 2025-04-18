// import { datilDevNetworkContext } from "services/lit/LitNetwork/vDatil/datil-dev/networkContext";
import { DatilContext } from '../../../../../../types';
import { toBigInt } from '../../../../../../../shared/utils/z-transformers';
import { logger } from '@lit-protocol/logger';
import { z } from 'zod';
import { createLitContracts } from '../../../utils/createLitContracts';

const getPermittedAddressesSchema = z.object({
  tokenId: toBigInt,
});

type GetPermittedAddressesRequest = z.input<typeof getPermittedAddressesSchema>;
type ValidatedGetPermittedAddressesRequest = z.output<
  typeof getPermittedAddressesSchema
>;

/**
 * Get permitted addresses for a PKP token
 * @param request - Object containing tokenId
 * @param networkCtx - Network context for contract interactions
 * @returns Array of permitted addresses for the PKP token
 */
export async function getPermittedAddresses(
  request: GetPermittedAddressesRequest,
  networkCtx: DatilContext
): Promise<readonly `0x${string}`[]> {
  const validatedRequest: ValidatedGetPermittedAddressesRequest =
    getPermittedAddressesSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createLitContracts(networkCtx);
  const res = await pkpPermissionsContract.read.getPermittedAddresses([
    validatedRequest.tokenId,
  ]);

  return res;
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = datilDevNetworkContext;

//   const res = await getPermittedAddresses(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//     },
//     networkCtx
//   );
//   console.log("permittedAddresses", res);
// }
