import { Hex } from 'viem';
import { logger } from '../../../../../../../../../utils/logger';
import { getAuthIdByAuthMethod } from '../../../../../../../LitAuthManager/authUtils';
import { DatilContext } from '../../../../../types';
import { PKPData } from '../../../schemas/shared/PKPDataSchema';
import { mintNextAndAddAuthMethods } from '../../rawContractApis/pkp/write/mintNextAndAddAuthMethods';
import { LitTxRes } from '../../types';
import { MintPKPRequest, MintPKPSchema } from './MintPKPSchema';

/**
 * authMethod
 *  * authMethodType - you should be getting this directly from the authenticator
 *
 * scopes
 *  * no-permissions - This scope allows no permissions
 *  * sign-anything - This scope allows signing any data
 *  * personal-sign - This scope only allows signing messages using the EIP-191 scheme
 * which prefixes "Ethereum Signed Message" to the data to be signed.
 * This prefix prevents creating signatures that can be used for transactions.
 *
 * pubkey
 *  * Only apply to WebAuthn. Otherwise, default to '0x'
 *
 * customAuthMethodId
 *  * This field is usually used by the dApp owner to identify the user - eg. app-id-xxx:user-id-yyy
 *
 * ```ts
 * const customAuthMethod = {
 *   authMethodType: 89989,
 *   authMethodId: 'app-id-xxx:user-id-yyy',
 *   accessToken: 'xxx',
 * };
 * ```
 */
export const mintPKP = async (
  request: MintPKPRequest,
  networkCtx: DatilContext
): Promise<LitTxRes<PKPData>> => {
  const validatedRequest = MintPKPSchema.parse(request);

  logger.debug({ validatedRequest });

  let _authMethodId: Hex;

  if (validatedRequest.customAuthMethodId) {
    _authMethodId = validatedRequest.customAuthMethodId as Hex;
  } else {
    // Generate the authMethodId automatically from the auth method
    const authMethodId = await getAuthIdByAuthMethod(
      validatedRequest.authMethod
    );
    _authMethodId = authMethodId as Hex;
  }

  const tx = await mintNextAndAddAuthMethods(
    {
      keyType: 2,
      permittedAuthMethodTypes: [validatedRequest.authMethod.authMethodType],
      permittedAuthMethodIds: [_authMethodId],
      permittedAuthMethodPubkeys: [validatedRequest.pubkey || '0x'],
      permittedAuthMethodScopes: [validatedRequest.scopes],
      addPkpEthAddressAsPermittedAddress: true,
      sendPkpToItself: true,
    },
    networkCtx
  );

  return tx;
};
