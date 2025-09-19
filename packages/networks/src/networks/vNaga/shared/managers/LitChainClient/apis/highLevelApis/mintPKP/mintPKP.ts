import { logger } from '../../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../../shared/interfaces/NetworkContext';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { PKPData } from '../../../schemas/shared/PKPDataSchema';
import { mintNextAndAddAuthMethods } from '../../rawContractApis/pkp/write/mintNextAndAddAuthMethods';
import { LitTxRes } from '../../types';
import { MintPKPRequest, MintPKPRequestSchema } from '@lit-protocol/schemas';

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
  networkConfig: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxRes<PKPData>> => {
  const validatedRequest = await MintPKPRequestSchema.parseAsync(request);

  logger.debug({ validatedRequest });

  // console.log("🔥 [mintPKP] validatedRequest:", validatedRequest);

  const tx = await mintNextAndAddAuthMethods(
    {
      keyType: 2,
      keySetId: 'naga-keyset1',
      permittedAuthMethodTypes: [validatedRequest.authMethodType],
      permittedAuthMethodIds: [validatedRequest.authMethodId],
      permittedAuthMethodPubkeys: [validatedRequest.pubkey],
      permittedAuthMethodScopes: [validatedRequest.scopes],
      addPkpEthAddressAsPermittedAddress: true,
      sendPkpToItself: true,
    },
    networkConfig,
    accountOrWalletClient
  );

  return tx;
};
