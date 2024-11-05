import { log } from '@lit-protocol/misc';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * NETWORK=datil-dev yarn test:local --filter=testUseEoaSessionSigsClaimAndMint
 * NETWORK=datil-test yarn test:local --filter=testUseEoaSessionSigsClaimAndMint
 * NETWORK=custom yarn test:local --filter=testUseEoaSessionSigsClaimAndMint
 */
export const testUseEoaSessionSigsClaimAndMint = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const { claims } = await devEnv.litNodeClient.executeJs({
    sessionSigs: eoaSessionSigs,
    code: `(async () => {
      Lit.Actions.claimKey({keyId: "keyId"});
    })();`,
  });

  const { signatures, derivedKeyId } = claims.keyId;

  console.log("signatures:", signatures);
  console.log("derivedKeyId:", derivedKeyId);

  const keyType = 2;

  const claimMaterial = {
    keyType: keyType,
    derivedKeyId: derivedKeyId,
    signatures: signatures,
  }

  const authMethodData = {
    keyType: 2,
    permittedIpfsCIDs: [],
    permittedIpfsCIDScopes: [],
    permittedAddresses: [],
    permittedAddressScopes: [],
    permittedAuthMethodTypes: [alice.authMethod.authMethodType],
    permittedAuthMethodIds: [await alice.getAuthMethodId()],
    permittedAuthMethodPubkeys: [`0x${alice.pkp.publicKey}`],
    permittedAuthMethodScopes: [],
    addPkpEthAddressAsPermittedAddress: true,
    addPkpPubkeyAsPermittedAuthMethod: true,
    sendPkpToItself: true,
  }

  const mintCost = await devEnv.contractsClient.pkpNftContract.read.mintCost();

  const tx = await devEnv.contractsClient.pkpHelperContract.write.claimAndMintNextAndAddAuthMethodsWithTypes(
    claimMaterial,
    authMethodData,
    {
      value: mintCost,
    }
  )

  console.log("tx:", tx);

  devEnv.releasePrivateKeyFromUser(alice);

  // Expected output:

  log('✅ testUseEoaSessionSigsClaimAndMint');
};
