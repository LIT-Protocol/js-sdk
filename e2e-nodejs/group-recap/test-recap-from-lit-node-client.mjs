// Usage: DEBUG=true NETWORK=manzano yarn test:e2e:nodejs --filter=test-recap-from-lit
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  LitAbility,
  LitRLIResource,
  LitActionResource,
} from '@lit-protocol/auth-helpers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';

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

  const delegatedWalletB = new ethers.Wallet.createRandom();
  const delegatedWalletB_address = delegatedWalletB.address;

  // As a dApp owner, I want to mint a Rate Limit Increase NFT so he who owns or delegated to
  // would be able to perform 14400 requests per day
  let contractClient = new LitContracts({
    signer: dAppOwnerWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

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
      uses: '0',
      dAppOwnerWallet: dAppOwnerWallet,
      rliTokenId: rliTokenIdStr,
      addresses: [
        dAppOwnerWallet_address.replace('0x', '').toLowerCase(),
        delegatedWalletB_address.replace('0x', '').toLowerCase(),
      ],
    });

  console.log('YY rliDelegationAuthSig:', rliDelegationAuthSig);
  console.log('litResource:', JSON.stringify(litResource));

  // ====================================================
  // =                  As an end user                  =
  // ====================================================
  // const sessionKey = litNodeClient.getSessionKey();
  // const sessionKeyUri = litNodeClient.getSessionKeyUri(sessionKey.publicKey);
  // console.log('XXX sessionKey:', sessionKey);
  // console.log('xxx sessionKeyUri:', sessionKeyUri);

  // We need to setup a generic siwe auth callback that will be called by the lit-node-client
  const authNeededCallback = async ({ resources, expiration, uri }) => {
    console.log('XX resources:', resources);
    console.log('XX expiration:', expiration);

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
      address: dAppOwnerWallet_address,
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
    const signature = await dAppOwnerWallet.signMessage(messageToSign);

    const authSig = {
      sig: signature.replace('0x', ''),
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: messageToSign,
      address: dAppOwnerWallet_address.replace('0x', '').toLowerCase(),
      // address: dAppOwnerWallet_address,
      algo: null,
    };

    console.log('authCallback authSig:', authSig);

    return authSig;
  };

  // 1. When generating a session sigs, we need to specify the resourceAbilityRequests, which
  // is a list of resources and abilities that we want to be able to perform. In this case,
  // we want to be able to perform the ability "rate-limit-increase-auth" on the resource
  // "lit-ratelimitincrease://{tokenId}" that the dApp owner has delegated to us.
  // 2. We also included the rliDelegationAuthSig that we created earlier, which would be
  // added to the capabilities array in the signing template.
  let sessionSigs = await litNodeClient.getSessionSigs({
    // sessionKey,
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        // resource: new LitRLIResource('*'), this delegation wallet holds like 30+ RLIs.
        // resource: new LitRLIResource(rliTokenIdStr),
        // ability: LitAbility.RateLimitIncreaseAuth,
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
        // ability: LitAbility.PKPSigning,
      },
    ],
    authNeededCallback,
    rliDelegationAuthSig,
  });

  console.log('XX sessionSigs:', sessionSigs);

  // -- now try to run lit action
  // errConstructorFunc {
  //   message: 'Wallet Signature not in JSON format',
  //   errorCode: 'NodeWalletSignatureJSONError',
  //   errorKind: 'Parser',
  //   status: 502,
  //   details: [
  //     'parser error: Signed session key does not match the one we verified above',
  //     'Signed session key does not match the one we verified above'
  //   ]
  // }

  // Finally, we use the session sigs that includes the RLI delegation auth sig to sign

  //  /web/pkp/sign
  // const res = await litNodeClient.pkpSign({
  //   toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
  //   pubKey: dAppOwnerWallet_pkpPublicKey,
  //   sessionSigs,
  // });

  // /web/execute
  const res2 = await litNodeClient.executeJs({
    // authSig: regularAuthSig,
    // authSig: sessionSigs['https://64.131.85.108:443'],
    sessionSigs, // lit:session:xxx or lit:capability:delegation doesn't URI which is not accepted.
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
      publicKey: dAppOwnerWallet_pkpPublicKey,
    },
  });

  // console.log('res:', res);
  console.log('res2:', res2);

  process.exit();

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
