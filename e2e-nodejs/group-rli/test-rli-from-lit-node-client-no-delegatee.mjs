// Usage:
// DEBUG=true NETWORK=manzano MINT_NEW=true yarn test:e2e:nodejs --filter=test-rli-from-lit-node-client-no-delegatee.mjs
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';

export async function main() {
  if (process.env.LOAD_ENV === 'false') {
    console.log('❗️ This test cannot be run with LOAD_ENV=false');
    process.exit();
  }

  // NOTE: In this example, there will be no delegatees in the array
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

  // As a dApp owner, I want to mint a Rate Limit Increase NFT so he who owns or delegated to
  // would be able to perform 14400 requests per day
  let contractClient = new LitContracts({
    signer: dAppOwnerWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  // -- mint new Capacity Credits NFT
  const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
    requestsPerDay: 14400, // 10 request per minute
    daysUntilUTCMidnightExpiration: 2,
  });

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
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: dAppOwnerWallet,
      capacityTokenId: capacityTokenIdStr,
    });

  // ====================================================
  // =                  As an end user                  =
  // ====================================================
  const endUserContractClient = new LitContracts({
    signer: dAppOwnerWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await endUserContractClient.connect();

  let endUserPkpMintRes =
    await endUserContractClient.pkpNftContractUtils.write.mint();

  const endUserPkpInfo = endUserPkpMintRes.pkp;

  // We need to setup a generic siwe auth callback that will be called by the lit-node-client
  const endUserControllerAuthNeededCallback = async ({
    resources,
    expiration,
    uri,
  }) => {
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
      address: dAppOwnerWallet.address,
      statement: 'Some custom statement.',
      uri,
      version: '1',
      chainId: '1',
      expirationTime: expiration,
      resources,
    });

    siweMessage = recapObject.addToSiweMessage(siweMessage);

    const messageToSign = siweMessage.prepareMessage();
    const signature = await dAppOwnerWallet.signMessage(messageToSign);

    const authSig = {
      sig: signature.replace('0x', ''),
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: messageToSign,
      address: dAppOwnerWallet.address,
    };

    return authSig;
  };

  // - When generating a session sigs, we need to specify the resourceAbilityRequests, which
  // is a list of resources and abilities that we want to be able to perform.
  // "lit-ratelimitincrease://{tokenId}" that the dApp owner has delegated to us.
  // - We also included the capacityDelegationAuthSig that we created earlier, which would be
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
    capacityDelegationAuthSig,
  });

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
