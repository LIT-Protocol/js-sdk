// import { datilDevNetworkContext } from "services/lit/LitNetwork/vDatil/datil-dev/networkContext";
import { DatilContext } from '../../../../../../types';
import { toBigInt } from '../../../../../../../shared/utils/z-transformers';
import { logger } from '@lit-protocol/logger';
import { z } from 'zod';
import { createLitContracts } from '../../../utils/createLitContracts';

const getPermittedActionsSchema = z.object({
  tokenId: toBigInt,
});

type GetPermittedActionsRequest = z.input<typeof getPermittedActionsSchema>;
type ValidatedGetPermittedActionsRequest = z.output<
  typeof getPermittedActionsSchema
>;

/**
 * Get permitted actions for a PKP token
 * @param request - Object containing tokenId
 * @param networkCtx - Network context for contract interactions
 * @returns Array of permitted actions for the PKP token
 */
export async function getPermittedActions(
  request: GetPermittedActionsRequest,
  networkCtx: DatilContext
): Promise<readonly `0x${string}`[]> {
  const validatedRequest: ValidatedGetPermittedActionsRequest =
    getPermittedActionsSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createLitContracts(networkCtx);
  const res = await pkpPermissionsContract.read.getPermittedActions([
    validatedRequest.tokenId,
  ]);

  return res;
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = datilDevNetworkContext;

//   const res = await getPermittedActions(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//     },
//     networkCtx
//   );
//   console.log("permittedActions", res);
// }
