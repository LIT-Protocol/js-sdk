// import { datilDevNetworkContext } from "services/lit/LitNetwork/vDatil/datil-dev/networkContext";
import { DatilContext } from '../../../../../../types';
import { toBigInt } from '../../../../../../../shared/utils/z-transformers';
import { logger } from '@lit-protocol/logger';
import { z } from 'zod';
import { createLitContracts } from '../../../utils/createLitContracts';
import { datilDevNetworkContext } from '../../../../../../datil-dev/networkContext';

const getPermittedAuthMethodsSchema = z.object({
  tokenId: toBigInt,
});

type GetPermittedAuthMethodsRequest = z.input<
  typeof getPermittedAuthMethodsSchema
>;
type ValidatedGetPermittedAuthMethodsRequest = z.output<
  typeof getPermittedAuthMethodsSchema
>;

// Define the auth method return type
export interface AuthMethod {
  authMethodType: bigint;
  id: `0x${string}`;
  userPubkey: `0x${string}`;
}

/**
 * Get permitted authentication methods for a PKP token
 * @param request - Object containing tokenId
 * @param networkCtx - Network context for contract interactions
 * @returns Array of permitted authentication methods for the PKP token
 */
export async function getPermittedAuthMethods(
  request: GetPermittedAuthMethodsRequest,
  networkCtx: DatilContext
): Promise<readonly AuthMethod[]> {
  const validatedRequest: ValidatedGetPermittedAuthMethodsRequest =
    getPermittedAuthMethodsSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createLitContracts(networkCtx);
  const res = await pkpPermissionsContract.read.getPermittedAuthMethods([
    validatedRequest.tokenId,
  ]);

  return res;
}

// // Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = datilDevNetworkContext;

//   const res = await getPermittedAuthMethods(
//     {
//       tokenId:
//         '76136736151863037541847315168980811654782785653773679312890341037699996601290',
//     },
//     networkCtx
//   );
//   console.log('permittedAuthMethods', res);
// }
