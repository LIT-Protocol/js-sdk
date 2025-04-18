// import { datilDevNetworkContext } from "services/lit/LitNetwork/vDatil/datil-dev/networkContext";
import { DatilContext } from '../../../../../../types';
import { isIpfsCidV0 } from '../../../../../../../shared/utils/z-validate';
import { z } from 'zod';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { removePermittedAction } from '../../../rawContractApis/permissions/write/removePermittedAction';
import { LitTxVoid } from '../../../types';

// Schema for the request
const removePermittedActionByIdentifierSchema = z.intersection(
  z.object({
    ipfsId: isIpfsCidV0,
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type RemovePermittedActionByIdentifierRequest = z.infer<
  typeof removePermittedActionByIdentifierSchema
>;

/**
 * Removes a permitted action from a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey and ipfsId
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to transaction details
 */
export async function removePermittedActionByIdentifier(
  request: RemovePermittedActionByIdentifierRequest,
  networkCtx: DatilContext
): Promise<LitTxVoid> {
  const { ipfsId, ...identifier } = request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx
  );

  return removePermittedAction(
    {
      tokenId: pkpTokenId.toString(),
      ipfsId,
    },
    networkCtx
  );
}

// Example usage
// if (import.meta.main) {
//   const networkCtx = datilDevNetworkContext;

//   const res = await removePermittedActionByIdentifier(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       ipfsId: "QmS4ghgMgPXR6fYW5tP4Y8Q22hF57kFnUJ9y4DgUJz1234",
//     },
//     networkCtx
//   );

//   console.log("res", res);
// }
