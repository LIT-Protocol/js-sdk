import {
  AuthMethodScope,
  AuthMethodType,
  LIT_ENDPOINT_VERSION,
} from '@lit-protocol/constants';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { LitAbility } from '@lit-protocol/types';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { LIT_NETWORK } from 'local-tests/setup/tinny-config';

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
 * - ❌ Not supported in Cayenne
 * - ✅ NETWORK=manzano yarn test:local --filter=testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs
 * - ✅ NETWORK=localchain yarn test:local --filter=testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs
 */
export const testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const bob = await devEnv.createRandomPerson();

  // Checking the scopes of the PKP owned by Bob
  const bobsAuthMethodAuthId = await LitAuthClient.getAuthIdByAuthMethod(
    bob.authMethod
  );

  const scopes =
    await bob.contractsClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      bob.authMethodOwnedPkp.tokenId,
      AuthMethodType.EthWallet,
      bobsAuthMethodAuthId,
      3
    );

  if (!scopes[AuthMethodScope.SignAnything]) {
    throw new Error('Bob does not have the "SignAnything" scope on his PKP');
  }

  // As a dApp owner, create a capacity delegation authSig for Bob's PKP wallet
  const capacityDelegationAuthSig = await alice.createCapacityDelegationAuthSig(
    [bob.pkp.ethAddress]
  );

  // As a dApp owner, delegate the capacity credits NFT to Bob
  const bobPkpSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
    pkpPublicKey: bob.authMethodOwnedPkp.publicKey,
    authMethods: [bob.authMethod],
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ],
    capabilityAuthSigs: [capacityDelegationAuthSig],
  });

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: bobPkpSessionSigs,
    code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
    jsParams: {
      dataToSign: alice.loveLetter,
      publicKey: bob.authMethodOwnedPkp.publicKey,
    },
  });

  console.log('✅ res:', res);

  // -- Expected output:
  // {
  //   claims: {},
  //   signatures: {
  //     sig: {
  //       r: "00fdf6f2fc3f13410393939bb678c8ec26c0eb46bfc39dbecdcf58540b7f9237",
  //       s: "480b578c78137150db2420669c47b220001b42a0bb4e92194ce7b76f6fd78ddc",
  //       recid: 0,
  //       signature: "0x00fdf6f2fc3f13410393939bb678c8ec26c0eb46bfc39dbecdcf58540b7f9237480b578c78137150db2420669c47b220001b42a0bb4e92194ce7b76f6fd78ddc1b",
  //       publicKey: "0465BFEE5CCFF60C0AF1D9B9481B680C2E34894A88F68F44CC094BA27501FD062A3C4AC61FA850BFA22D81D41AF72CBF983909501440FE51187F5FB3D1BC55C44E",
  //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  //     },
  //   },
  //   decryptions: [],
  //   response: undefined,
  //   logs: "",
  // }

  // -- assertions
  if (!res.signatures.sig.r) {
    throw new Error(`Expected "r" in res.signatures.sig`);
  }
  if (!res.signatures.sig.s) {
    throw new Error(`Expected "s" in res.signatures.sig`);
  }

  if (!res.signatures.sig.dataSigned) {
    throw new Error(`Expected "dataSigned" in res.signatures.sig`);
  }

  if (!res.signatures.sig.publicKey) {
    throw new Error(`Expected "publicKey" in res.signatures.sig`);
  }

  // -- signatures.sig.signature must start with 0x
  if (!res.signatures.sig.signature.startsWith('0x')) {
    throw new Error(`Expected "signature" to start with 0x`);
  }
};
