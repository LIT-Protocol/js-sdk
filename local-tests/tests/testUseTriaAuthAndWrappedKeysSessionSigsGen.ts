import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { log } from '@lit-protocol/misc';
import { LitAbility } from '@lit-protocol/types';
import {
  getLitActionSessionSigs,
  getLitActionSessionSigsUsingIpfsId,
} from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api, utils } from '@lit-protocol/wrapped-keys';

import Hash from "typestub-ipfs-only-hash";
import { AuthMethodScope } from '@lit-protocol/constants';

const { triaBatchGeneratePrivateKeys, exportPrivateKey } = api;
/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseTriaAuthAndWrappedKeysSessionSigsGen
 * ✅ NETWORK=datil-test yarn test:local --filter=testUseTriaAuthAndWrappedKeysSessionSigsGen
 * ✅ NETWORK=datil yarn test:local --filter=testUseTriaAuthAndWrappedKeysSessionSigsGen
 */
export const testUseTriaAuthAndWrappedKeysSessionSigsGen = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  // -- Start

  // -- mint a pkp
  console.log(`🔄 Minting new PKP...`);
  const pkpMintRes =
    await devEnv.contractsClient.pkpNftContractUtils.write.mint();
  const pkp = pkpMintRes.pkp;
  console.log(`   ✅ PKP minted:`);
  console.log(`     - Token ID: ${pkp.tokenId}`);
  console.log(`     - Public Key: ${pkp.publicKey}`);
  console.log(`     - ETH Address: ${pkp.ethAddress}`);

  // -- mint capacity token
  console.log(`🔄 Minting Capacity Credits NFT...`);
  const capacityTokenId = (
    await devEnv.contractsClient.mintCapacityCreditsNFT({
      requestsPerKilosecond: 10,
      daysUntilUTCMidnightExpiration: 1,
    })
  ).capacityTokenIdStr;
  console.log(`   ✅ Capacity Credits NFT minted:`);

  // -- create capacity delegation auth sig
  console.log(`🔄 Creating Capacity Delegation AuthSig...`);
  const authSigResponse =
    await devEnv.litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: alice.wallet,
      capacityTokenId,
      delegateeAddresses: [pkp.ethAddress],
      uses: '1',
    });
  const capacityDelegationAuthSig = authSigResponse.capacityDelegationAuthSig;
  console.log(`   ✅ Capacity Delegation AuthSig created:`);
  console.log(`     - AuthSig: ${JSON.stringify(capacityDelegationAuthSig)}`);
  console.log(`     - Uses: 1`);
  console.log(`     - Delegatee Address: ${pkp.ethAddress}`);
  console.log(`     - Capacity Token ID: ${capacityTokenId}`);

  // -- Get the lit action code..
  const { litActionCode, litActionIpfsCid } = utils.getLitActionCodeOrCidCommon(
    'tria_batchGenerateEncryptedKeys'
  );

  // -- detect which one we got
  const hashOfLitActionCode = litActionCode
    ? await Hash.of(Buffer.from(litActionCode))
    : litActionIpfsCid;
  console.log(`   ✅ Lit Action Code IPFS CID: ${hashOfLitActionCode}`);

  console.log(`🔄 Adding permitted action...`);
  const permitTx = await devEnv.contractsClient.addPermittedAction({
    ipfsId: hashOfLitActionCode,
    pkpTokenId: pkp.tokenId,
    authMethodScopes: [AuthMethodScope.SignAnything]
  });
  console.log(`   ✅ Permitted action added:`);
  console.log(`     - Transaction Hash: ${permitTx.transactionHash}`);

  const solanaMessageToSign = 'This is a test solana message';
  const evmMessageToSign = 'This is a test evm message';

  const { results } = await triaBatchGeneratePrivateKeys({
    ipfsId: hashOfLitActionCode,
    pkpPublicKey: pkp.publicKey,
    actions: [
      {
        network: 'evm',
        signMessageParams: { messageToSign: evmMessageToSign },
        generateKeyParams: { memo: 'Test evm key' },
      },
      {
        network: 'solana',
        signMessageParams: { messageToSign: solanaMessageToSign },
        generateKeyParams: { memo: 'Test solana key' },
      },
    ],
    litNodeClient: devEnv.litNodeClient,
  });


  process.exit();

  const litActionSessionSigs =
    await devEnv.litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 mins expiry
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
      litActionCode: Buffer.from(
        `
    // Works with an AuthSig AuthMethod
    if (Lit.Auth.authMethodContexts.some(e => e.authMethodType === 1)) {
      LitActions.setResponse({ response: "true" });
    } else {
      LitActions.setResponse({ response: "false" });
    }
    `
      ).toString('base64'),
      jsParams: {
        magicNumber: 42,
      },
      capabilityAuthSigs: [capacityDelegationAuthSig],
    });

  // const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice)

  console.log('litActionSessionSigs:', litActionSessionSigs);
  process.exit();

  // -- Remove below
  // const litActionSessionSigs = await getLitActionSessionSigsUsingIpfsId(
  //   devEnv,
  //   alice,
  //   [
  //     {
  //       resource: new LitPKPResource('*'),
  //       ability: LitAbility.PKPSigning,
  //     },
  //     {
  //       resource: new LitActionResource('*'),
  //       ability: LitAbility.LitActionExecution,
  //     },
  //   ]
  // );

  // const res = await devEnv.litNodeClient.executeJs({
  //   sessionSigs: litActionSessionSigs,
  //   code: `(async () => {
  //     const sigShare = await LitActions.signEcdsa({
  //       toSign: dataToSign,
  //       publicKey,
  //       sigName: "sig",
  //     });
  //   })();`,
  //   jsParams: {
  //     dataToSign: alice.loveLetter,
  //     publicKey: alice.authMethodOwnedPkp.publicKey,
  //   },
  // });
};
