// import { datilDevNetworkContext } from "services/lit/LitNetwork/vDatil/datil-dev/networkContext";
import { DatilContext } from '../../../../../../types';
import { toBigInt } from '../../../../../../../shared/utils/z-transformers';
import { logger } from '@lit-protocol/logger';
import { z } from 'zod';
import { createLitContracts } from '../../../utils/createLitContracts';

const isPermittedAddressSchema = z.object({
  tokenId: toBigInt,
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .transform((val): `0x${string}` => val as `0x${string}`),
});

type IsPermittedAddressRequest = z.input<typeof isPermittedAddressSchema>;
type ValidatedIsPermittedAddressRequest = z.output<
  typeof isPermittedAddressSchema
>;

/**
 * Checks if an address is permitted for a PKP token
 * @param request - Object containing tokenId and address
 * @param networkCtx - Network context for the transaction
 * @returns Promise resolving to boolean indicating if the address is permitted
 */
export async function isPermittedAddress(
  request: IsPermittedAddressRequest,
  networkCtx: DatilContext
): Promise<boolean> {
  const validatedRequest: ValidatedIsPermittedAddressRequest =
    isPermittedAddressSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createLitContracts(networkCtx);

  return pkpPermissionsContract.read.isPermittedAddress([
    validatedRequest.tokenId,
    validatedRequest.address,
  ]);
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = datilDevNetworkContext;

//   const res = await isPermittedAddress(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       address: "0x1234567890123456789012345678901234567890",
//     },
//     networkCtx
//   );

//   console.log("Is address permitted:", res);
// }
