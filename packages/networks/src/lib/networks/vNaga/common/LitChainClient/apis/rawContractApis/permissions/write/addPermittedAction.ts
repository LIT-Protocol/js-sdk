// import { networkContext } from "../../../_config";
import { z } from 'zod';
import { logger } from '../../../../../../../shared/logger';
import { ipfsCidV0ToHex } from '../../../../../../../shared/utils/transformers/ipfsCidV0ToHex';
import { toBigInt } from '../../../../../../../shared/utils/z-transformers';
import { isIpfsCidV0 } from '../../../../../../../shared/utils/z-validate';
import { NagaContext } from '../../../../../../types';
import { ScopeSchemaRaw } from '../../../../schemas/shared/ScopeSchema';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { createLitContracts } from '../../../utils/createLitContracts';
import { decodeLogs } from '../../../utils/decodeLogs';

const addPermittedActionSchema = z
  .object({
    ipfsId: isIpfsCidV0,
    tokenId: toBigInt,
    scopes: z.array(ScopeSchemaRaw),
  })
  .transform((data) => {
    return {
      ...data,
      ipfsId: ipfsCidV0ToHex(data.ipfsId),
    };
  });

type AddPermittedActionRequest = z.input<typeof addPermittedActionSchema>;

export async function addPermittedAction(
  request: AddPermittedActionRequest,
  networkCtx: NagaContext
): Promise<LitTxVoid> {
  const validatedRequest = addPermittedActionSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract, pkpNftContract, publicClient, walletClient } =
    createLitContracts(networkCtx);

  const hash = await callWithAdjustedOverrides(
    pkpPermissionsContract,
    'addPermittedAction',
    [validatedRequest.tokenId, validatedRequest.ipfsId, validatedRequest.scopes]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(receipt.logs, networkCtx);

  return { hash, receipt, decodedLogs };
}

// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await addPermittedAction(
//     {
//       ipfsId: "QmS4ghgMgPXR6fYW5tP4Y8Q22hF57kFnUJ9y4DgUJz1234",
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       scopes: ["sign-anything"],
//     },
//     networkCtx
//   );

//   console.log(res);
// }
