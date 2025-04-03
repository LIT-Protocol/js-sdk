import { NagaContext } from '../../../../../../types';
import { isIpfsCidV0 } from '../../../../../../../shared/utils/z-validate';
import { z } from 'zod';
import { ScopeStringSchema } from '../../../../schemas/shared/ScopeSchema';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { addPermittedAction } from '../../../rawContractApis/permissions/write/addPermittedAction';
import { LitTxVoid } from '../../../types';

// Schema for the request
const addPermittedActionByIdentifierSchema = z.intersection(
  z.object({
    ipfsId: isIpfsCidV0,
    scopes: z.array(ScopeStringSchema),
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type AddPermittedActionByIdentifierRequest = z.infer<
  typeof addPermittedActionByIdentifierSchema
>;

/**
 * Adds a permitted action to a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey, ipfsId, and scopes
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to transaction details
 */
export async function addPermittedActionByIdentifier(
  request: AddPermittedActionByIdentifierRequest,
  networkCtx: NagaContext
): Promise<LitTxVoid> {
  const { ipfsId, scopes, ...identifier } = request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx
  );

  return addPermittedAction(
    {
      tokenId: pkpTokenId.toString(),
      ipfsId,
      scopes,
    },
    networkCtx
  );
}

// Example usage
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await addPermittedActionByIdentifier(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       ipfsId: "QmS4ghgMgPXR6fYW5tP4Y8Q22hF57kFnUJ9y4DgUJz1234",
//       scopes: ["sign-anything"],
//     },
//     networkCtx
//   );

//   console.log("res", res);
// }
