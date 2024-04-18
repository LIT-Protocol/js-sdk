import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import { DevEnv } from 'local-tests/setup/env-setup';
import { getEoaSessionSigsWithCapacityDelegations } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
/**
 * ## Scenario:
 * Delegating capacity credits NFT to Bob (delegatee) for him to execute JS code to sign with his PKP
 * - Given: The capacity credits NFT is minted by the dApp owner
 * - When: The dApp owner creates a capacity delegation authSig
 * - And: The dApp owner delegates the capacity credits NFT to Bob
 * - Then: The delegated (Bob's) wallet can execute JS code to sign with his PKP using the capacity from the capacity credits NFT
 *
 *
 * ## Test Commands:
 * - 🚫 Not supported in Cayenne, but session sigs would still work
 * - ✅ yarn test:local --filter=testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs --network=manzano --version=v0
 * - ✅ yarn test:local --filter=testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs --network=localchain --version=v1
 */
export const testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs = async (
  devEnv: DevEnv
) => {
  const bobsAuthMethodAuthId = await LitAuthClient.getAuthIdByAuthMethod(
    devEnv.bobsWalletAuthMethod
  );

  const scopes =
    await devEnv.bobsContractsClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      devEnv.bobsWalletAuthMethoedOwnedPkp.tokenId,
      AuthMethodType.EthWallet,
      bobsAuthMethodAuthId,
      3
    );

  console.log('scopes:', scopes);

  process.exit();
};
