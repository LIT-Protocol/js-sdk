// Usage: DEBUG=true NETWORK=manzano yarn test:e2e:nodejs --filter=test-recap-from-lit
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import fs from 'fs';

export async function main() {
  if (process.env.LOAD_ENV === 'false') {
    console.log('❗️ This test cannot be run with LOAD_ENV=false');
    process.exit();
  }

  // NOTE: In this example, the dApp owner would be both the RLI delegator and the delegatee (end user)
  // for ease of testing.
  // ==================== Setup ====================

  // ====================================================
  // =               dApp Owner's Perspetive            =
  // ====================================================
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );
  globalThis.LitCI.wallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    provider
  );
  const dAppOwnerWallet = globalThis.LitCI.wallet;

  const dAppOwnerWallet_address = globalThis.LitCI.wallet.address;
  const dAppOwnerWallet_authSig = globalThis.LitCI.CONTROLLER_AUTHSIG;
  const dAppOwnerWallet_pkpPublicKey = globalThis.LitCI.PKP_INFO.publicKey;

  console.log('dAppOwnerWallet_authSig:', dAppOwnerWallet_authSig);
  console.log('dAppOwnerWallet_address:', dAppOwnerWallet_address);
  console.log('dAppOwnerWallet_pkpPublicKey:', dAppOwnerWallet_pkpPublicKey);

  const delegatedWalletB = new ethers.Wallet(
    '0xe1090085b352120867ea7b154ceeee30654903a6c37afa1d5c5bcabc63c96676',
    new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
  );

  const delegatedWalletB_address = delegatedWalletB.address;

  // As a dApp owner, I want to mint a Rate Limit Increase NFT so he who owns or delegated to
  // would be able to perform 14400 requests per day
  let contractClient = new LitContracts({
    signer: dAppOwnerWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  // -- mint RLI
  const rliTokenIdStr = '2';
  // const { rliTokenIdStr } = await contractClient.mintRLI({
  //   requestsPerDay: 14400, // 10 request per minute
  //   daysUntilUTCMidnightExpiration: 2,
  // });

  console.log('rliTokenIdStr:', rliTokenIdStr);
  console.log('dAppOwnerWallet:', dAppOwnerWallet);

  const litNodeClient = new LitNodeClient({
    litNetwork: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    minNodeCount: undefined,
    checkNodeAttestation: process.env.CHECK_SEV ?? false,
  });

  await litNodeClient.connect();

  // we will create an delegation auth sig, which internally we will create
  // a recap object, add the resource "lit-ratelimitincrease://{tokenId}" to it, and add it to the siwe
  // message. We will then sign the siwe message with the dApp owner's wallet.
  const { rliDelegationAuthSig, litResource } =
    await litNodeClient.createRliDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: dAppOwnerWallet,
      rliTokenId: rliTokenIdStr,
      addresses: [delegatedWalletB_address.replace('0x', '').toLowerCase()],
    });

  console.log('YY rliDelegationAuthSig:', rliDelegationAuthSig);
  console.log('litResource:', JSON.stringify(litResource));

  // ====================================================
  // =                  As an end user                  =
  // ====================================================
  const endUserContractClient = new LitContracts({
    signer: delegatedWalletB,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await endUserContractClient.connect();

  let endUserPkpMintRes =
    await endUserContractClient.pkpNftContractUtils.write.mint();

  const endUserPkpInfo = endUserPkpMintRes.pkp;

  console.log('endUserPkpInfo:', endUserPkpInfo);

  // We need to setup a generic siwe auth callback that will be called by the lit-node-client
  const endUserControllerAuthNeededCallback = async ({
    resources,
    expiration,
    uri,
  }) => {
    console.log('resources:', resources);
    console.log('expiration:', expiration);

    const litResource = new LitActionResource('*');

    const recapObject =
      await litNodeClient.generateSessionCapabilityObjectWithWildcards([
        litResource,
      ]);

    recapObject.addCapabilityForResource(
      litResource,
      LitAbility.LitActionExecution
    );

    const verified = recapObject.verifyCapabilitiesForResource(
      litResource,
      LitAbility.LitActionExecution
    );

    if (!verified) {
      throw new Error('Failed to verify capabilities for resource');
    }

    console.log('authCallback verified:', verified);

    let siweMessage = new siwe.SiweMessage({
      domain: 'localhost:3000',
      address: delegatedWalletB_address,
      statement: 'Some custom statement.',
      uri,
      version: '1',
      chainId: '1',
      expirationTime: expiration,
      resources,
    });

    siweMessage = recapObject.addToSiweMessage(siweMessage);
    console.log('authCallback siwe:', siweMessage);

    const messageToSign = siweMessage.prepareMessage();
    const signature = await delegatedWalletB.signMessage(messageToSign);

    const authSig = {
      sig: signature.replace('0x', ''),
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: messageToSign,
      // address: delegatedWalletB_address.replace('0x', '').toLowerCase(),
      address: delegatedWalletB_address,
      // algo: null,
    };

    console.log('authCallback authSig:', authSig);

    return authSig;
  };

  // - When generating a session sigs, we need to specify the resourceAbilityRequests, which
  // is a list of resources and abilities that we want to be able to perform.
  // "lit-ratelimitincrease://{tokenId}" that the dApp owner has delegated to us.
  // - We also included the rliDelegationAuthSig that we created earlier, which would be
  // added to the capabilities array in the signing template.
  let sessionSigs = await litNodeClient.getSessionSigs({
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: endUserControllerAuthNeededCallback,
    rliDelegationAuthSig,
  });

  console.log('YY sessionSigs:', sessionSigs);

  // write to current directory sessionSigs.json
  fs.writeFileSync(
    path.join(process.cwd(), 'sessionSigs.json'),
    JSON.stringify(sessionSigs)
  );

  // process.exit();

  // /web/execute
  const res = await litNodeClient.executeJs({
    sessionSigs,
    code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
    authMethods: [],
    jsParams: {
      dataToSign: ethers.utils.arrayify(
        ethers.utils.keccak256([1, 2, 3, 4, 5])
      ),
      publicKey: endUserPkpInfo.publicKey,
    },
  });

  if (res) {
    return success('delegatee able to sign');
  }

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
