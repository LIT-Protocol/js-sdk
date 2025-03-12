import { NagaContext } from "services/lit/LitNetwork/vNaga/types";
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from "../../../rawContractApis/permissions/utils/resolvePkpTokenId";
import { addPermittedAddress } from "../../../rawContractApis/permissions/write/addPermittedAddress";
import { z } from "zod";
import { LitTxVoid } from "../../../types";
import { ScopeStringSchema } from "../../../../schemas/shared/ScopeSchema";

// Schema for the request
const addPermittedAddressByIdentifierSchema = z.intersection(
  z.object({
    targetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    scopes: z.array(ScopeStringSchema),
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type AddPermittedAddressByIdentifierRequest = z.infer<
  typeof addPermittedAddressByIdentifierSchema
>;

/**
 * Adds a permitted address to a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey, targetAddress, and scopes
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to transaction details
 */
export async function addPermittedAddressByIdentifier(
  request: AddPermittedAddressByIdentifierRequest,
  networkCtx: NagaContext
): Promise<LitTxVoid> {
  const { targetAddress, scopes, ...identifier } = request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx
  );

  return addPermittedAddress(
    {
      tokenId: pkpTokenId.toString(),
      address: targetAddress,
      scopes,
    },
    networkCtx
  );
}

// Example usage
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await addPermittedAddressByIdentifier(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       targetAddress: "0x1234567890123456789012345678901234567890",
//       scopes: ["sign-anything"],
//     },
//     networkCtx
//   );

//   console.log("res", res);
// }
