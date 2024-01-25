// Usage: DEBUG=true NETWORK=habanero MINT_NEW=true yarn test:e2e:nodejs --filter=test-rli-pkp-as-delegatee
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { AuthMethodType, AuthMethodScope } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethRequestHandler } from '@lit-protocol/pkp-ethers';

async function getAuthSig(wallet, litNodeClient) {
  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';

  const address = await wallet.getAddress();

  const nonce = await litNodeClient.getLatestBlockhash();

  const siweMessage = new siwe.SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: 1,
    nonce,
    expirationTime: new Date(Date.now() + 60_000 * 60).toISOString(),
  });

  const messageToSign = siweMessage.prepareMessage();

  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: address,
  };

  return authSig;
}

// ==================== Story ====================
// - The dApp owner would be the Capacity Credits delegator
// - The PKP would be the delegatee whom the dApp owner has delegated to
export async function main() {
  if (process.env.LOAD_ENV === 'false') {
    console.log('❗️ This test cannot be run with LOAD_ENV=false');
    process.exit();
  }

  // ==================== Setup ====================

  // *********************************************************
  // 1. As a dApp Owner, I want to mint a Capacity Credits NFT
  // *********************************************************

  // -- setup dApp owner wallet
  globalThis.LitCI.wallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
  );

  const dAppOwnerWallet = globalThis.LitCI.wallet;
  const dAppOwnerWallet_address = globalThis.LitCI.wallet.address;
  const dAppOwnerWallet_authSig = globalThis.LitCI.CONTROLLER_AUTHSIG;
  const dAppOwnerWallet_pkpPublicKey = globalThis.LitCI.PKP_INFO.publicKey;

  console.log('dAppOwnerWallet_authSig:', dAppOwnerWallet_authSig);
  console.log('dAppOwnerWallet_address:', dAppOwnerWallet_address);
  console.log('dAppOwnerWallet_pkpPublicKey:', dAppOwnerWallet_pkpPublicKey);

  // -- connect to contract client
  let contractClient = new LitContracts({
    signer: dAppOwnerWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  // -- mint RLI
  // -- static to test faster
  const capacityTokenIdStr = '2';

  // -- mint new RLI
  // const { capacityTokenIdStr } = await contractCl  ient.mintRLI({
  //   requestsPerDay: 14400, // 10 request per minute
  //   daysUntilUTCMidnightExpiration: 2,
  // });

  console.log('capacityTokenIdStr:', capacityTokenIdStr);
  console.log('dAppOwnerWallet:', dAppOwnerWallet);

  // *****************************************************
  // 2. As a second wallet owner, I want to mint a PKP NFT
  // *****************************************************
  const secondWallet = new ethers.Wallet(
    '0xe1090085b352120867ea7b154ceeee30654903a6c37afa1d5c5bcabc63c96676',
    new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
  );

  console.log('secondWallet:', secondWallet.address);

  // -- connect to contract client
  let contractClient2 = new LitContracts({
    signer: secondWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient2.connect();

  // -- get mint cost
  const mintCost = await contractClient2.pkpNftContract.read.mintCost();

  // -- minting a PKP using a PKP
  const mintTx = await contractClient.pkpNftContract.write.mintNext(2, {
    value: mintCost,
  });

  const mintTxReceipt = await mintTx.wait();

  const secondWalletPKPTokenId = mintTxReceipt.events[0].topics[1];

  let secondWalletPKPPublicKey =
    await contractClient.pkpNftContract.read.getPubkey(secondWalletPKPTokenId);

  const secondWalletPKPEthAddress = ethers.utils.computeAddress(
    Buffer.from(secondWalletPKPPublicKey.replace('0x', ''), 'hex')
  );

  // example outoupt:
  // secondWalletPKPInfo {
  //   tokenId: '0xc6ccfa03cd028e950779dbad131e59015d3f7da35e737195d20459a1a9dba706',
  //   publicKey: '0x04f3b0daeb47783281acf0d3adf2473abd422e90efb32129da9655bd2cc9ffa343f81a6e6377b73feb88cc39b4c540b31a23e472b9d9c9a1612e7fc07a24486b75',
  //   ethAddress: '0x2eEca3374e1ea59e8667A995b497a8152a8462a7'
  // }
  const secondWalletPKPInfo = {
    tokenId: secondWalletPKPTokenId,
    publicKey: secondWalletPKPPublicKey,
    ethAddress: secondWalletPKPEthAddress,
  };

  console.log('secondWalletPKPInfo', secondWalletPKPInfo);

  // const authMethod = {
  //   authMethodType: AuthMethodType.EthWallet,
  //   accessToken: JSON.stringify(LITCONFIG.CONTROLLER_AUTHSIG),
  // };

  // ***************************************************************
  // 3. As a dApp owner, I want to create a Capacity Delegation AuthSig
  //    that delegates the Capacity Credits NFT to the PKP NFT
  // ***************************************************************
  const litNodeClient = new LitNodeClient({
    litNetwork: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    minNodeCount: undefined,
    checkNodeAttestation: process.env.CHECK_SEV ?? false,
  });

  await litNodeClient.connect();

  // uri: lit:capability:delegation
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: dAppOwnerWallet,
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [
        // secondWallet.address,
        secondWalletPKPInfo.ethAddress,
      ],
    });

  console.log('capacityDelegationAuthSig:', capacityDelegationAuthSig);

  // ***************************************************************
  // 4. As a PKP, I want to sign the message with recap capabilities
  // ***************************************************************
  const pkpAuthNeededCallback = async ({ resources, expiration, uri }) => {
    console.log('resources:', resources);
    console.log('expiration:', expiration);
    console.log('uri:', uri); // lit:session:xx

    // -- 1. settin up pkp
    const secondWalletControllerAuthSig = await getAuthSig(
      secondWallet,
      litNodeClient
    );

    console.log(
      'secondWalletControllerAuthSig:',
      secondWalletControllerAuthSig
    );

    const sessionKeyPair = litNodeClient.getSessionKey();

    const response = await litNodeClient.signSessionKey({
      sessionKey: sessionKeyPair,
      statement: 'Some custom statement.',
      authMethods: [
        {
          authMethodType: 1,
          accessToken: JSON.stringify(secondWalletControllerAuthSig),
        },
      ],
      pkpPublicKey: secondWalletPKPInfo.publicKey,
      expiration: expiration,
      resources: resources,
      chainId: 1,

      // optional (this would use normal siwe lib, without it, it would use lit-siwe)
      litResource: new LitActionResource('*'),
      capability: LitAbility.LitActionExecution,
    });

    console.log('response:', response);

    return response.authSig;
  };

  // ***************************************************************
  // 5. As a PKP, I want to get the session sigs
  // ***************************************************************
  const pkpSessionSigs = await litNodeClient.getSessionSigs({
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: pkpAuthNeededCallback,
    capacityDelegationAuthSig,
  });

  console.log('pkpSessionSigs:', pkpSessionSigs);

  // ***************************************************************
  // 6. Mint a PKP for the PKP so that it can sign the message
  // ***************************************************************

  // ***************************************************************
  // 7. Finally sign the message using the PKP's PKP
  // ***************************************************************
  // const pkpsPKPPublicKey = '';

  // -- Mint a PKP using a PKP
  // const res = await litNodeClient.executeJs({
  //   sessionSigs: pkpSessionSigs,
  //   code: `(async () => {
  //     const sigShare = await LitActions.signEcdsa({
  //       toSign: dataToSign,
  //       publicKey,
  //       sigName: "sig",
  //     });
  //   })();`,
  //   authMethods: [],
  //   jsParams: {
  //     dataToSign: ethers.utils.arrayify(
  //       ethers.utils.keccak256([1, 2, 3, 4, 5])
  //     ),
  //     publicKey: pkpsPKPPublicKey
  //   },
  // });

  process.exit();

  if (res) {
    return success('recap works');
  }

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
