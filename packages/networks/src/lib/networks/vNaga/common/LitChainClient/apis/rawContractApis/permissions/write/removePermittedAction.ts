// import { networkContext } from "../../../_config";
import { NagaContext } from "services/lit/LitNetwork/vNaga/types";
import { ipfsCidV0ToHex } from "services/lit/utils/transformers/ipfsCidV0ToHex";
import { toBigInt } from "services/lit/utils/z-transformers";
import { isIpfsCidV0 } from "services/lit/utils/z-validate";
import { logger } from "utils/logger";
import { z } from "zod";
import { LitTxVoid } from "../../../types";
import { callWithAdjustedOverrides } from "../../../utils/callWithAdjustedOverrides";
import { createLitContracts } from "../../../utils/createLitContracts";
import { decodeLogs } from "../../../utils/decodeLogs";

const removePermittedActionSchema = z
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

type RemovePermittedActionRequest = z.input<typeof removePermittedActionSchema>;

/**
 * Removes a permitted action from a PKP token
 * @param request - Object containing tokenId and ipfsId
 * @param networkCtx - Network context for the transaction
 * @returns Promise resolving to transaction details
 */
export async function removePermittedAction(
  request: RemovePermittedActionRequest,
  networkCtx: NagaContext
): Promise<LitTxVoid> {
  const validatedRequest = removePermittedActionSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract, pkpNftContract, publicClient, walletClient } =
    createLitContracts(networkCtx);

  const hash = await callWithAdjustedOverrides(
    pkpPermissionsContract,
    "removePermittedAction",
    [validatedRequest.tokenId, validatedRequest.ipfsId]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(receipt.logs, networkCtx);

  return { hash, receipt, decodedLogs };
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await removePermittedAction(
//     {
//       ipfsId: "QmS4ghgMgPXR6fYW5tP4Y8Q22hF57kFnUJ9y4DgUJz1234",
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//     },
//     networkCtx
//   );

//   console.log("res", res);
// }
