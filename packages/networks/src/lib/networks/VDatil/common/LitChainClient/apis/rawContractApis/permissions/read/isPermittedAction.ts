// import { datilDevNetworkContext } from "services/lit/LitNetwork/vDatil/datil-dev/networkContext";
import { DatilContext } from '../../../../../../types';
import { ipfsCidV0ToHex } from '../../../../../../../shared/utils/transformers/ipfsCidV0ToHex';
import { toBigInt } from '../../../../../../../shared/utils/z-transformers';
import { isIpfsCidV0 } from '../../../../../../../shared/utils/z-validate';
import { logger } from '@lit-protocol/logger';
import { z } from 'zod';
import { createLitContracts } from '../../../utils/createLitContracts';

const isPermittedActionSchema = z
  .object({
    ipfsId: isIpfsCidV0,
    tokenId: toBigInt,
  })
  .transform((data) => {
    return {
      ...data,
      ipfsId: ipfsCidV0ToHex(data.ipfsId),
    };
  });

type IsPermittedActionRequest = z.input<typeof isPermittedActionSchema>;
type ValidatedIsPermittedActionRequest = z.output<
  typeof isPermittedActionSchema
>;

/**
 * Checks if an action is permitted for a PKP token
 * @param request - Object containing tokenId and ipfsId
 * @param networkCtx - Network context for the transaction
 * @returns Promise resolving to boolean indicating if the action is permitted
 */
export async function isPermittedAction(
  request: IsPermittedActionRequest,
  networkCtx: DatilContext
): Promise<boolean> {
  const validatedRequest: ValidatedIsPermittedActionRequest =
    isPermittedActionSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createLitContracts(networkCtx);

  return pkpPermissionsContract.read.isPermittedAction([
    validatedRequest.tokenId,
    validatedRequest.ipfsId,
  ]);
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = datilDevNetworkContext;

//   const res = await isPermittedAction(
//     {
//       ipfsId: "QmS4ghgMgPXR6fYW5tP4Y8Q22hF57kFnUJ9y4DgUJz1234",
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//     },
//     networkCtx
//   );

//   console.log("Is action permitted:", res);
// }
