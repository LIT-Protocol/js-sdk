// import { networkContext } from "../../../_config";
import { NagaContext } from "services/lit/LitNetwork/vNaga/types";
import { toBigInt } from "services/lit/utils/z-transformers";
import { logger } from "utils/logger";
import { z } from "zod";
import { createLitContracts } from "../../../utils/createLitContracts";

const getPermittedAddressesSchema = z.object({
  tokenId: toBigInt,
});

type GetPermittedAddressesRequest = z.input<typeof getPermittedAddressesSchema>;

/**
 * Get permitted addresses for a PKP token
 * @param request - Object containing tokenId
 * @param networkCtx - Network context for contract interactions
 * @returns Array of permitted addresses for the PKP token
 */
export async function getPermittedAddresses(
  request: GetPermittedAddressesRequest,
  networkCtx: NagaContext
): Promise<readonly `0x${string}`[]> {
  const validatedRequest = getPermittedAddressesSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createLitContracts(networkCtx);
  const res = await pkpPermissionsContract.read.getPermittedAddresses([
    validatedRequest.tokenId,
  ]);

  return res;
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await getPermittedAddresses(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//     },
//     networkCtx
//   );
//   console.log("permittedAddresses", res);
// }
