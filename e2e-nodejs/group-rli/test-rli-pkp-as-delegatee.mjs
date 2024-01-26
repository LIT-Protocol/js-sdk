// Usage: DEBUG=true NETWORK=habanero MINT_NEW=true yarn test:e2e:nodejs --filter=test-rli-pkp-as-delegatee
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LocalStorage } from 'node-localstorage';
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { AuthMethodType, AuthMethodScope } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

// import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
// import { ethRequestHandler } from '@lit-protocol/pkp-ethers';

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
  const litNodeClient = new LitNodeClient({
    litNetwork: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    minNodeCount: undefined,
    checkNodeAttestation: process.env.CHECK_SEV ?? false,
    storageProvider: {
      provider: new LocalStorage('./storage.test.db'),
    },
  });

  await litNodeClient.connect();

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
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    signer: dAppOwnerWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
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
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    signer: secondWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
  });

  await contractClient2.connect();

  const secondWalletControllerAuthSig = await getAuthSig(
    secondWallet,
    litNodeClient
  );

  // -- scopes
  const authMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(secondWalletControllerAuthSig),
  };

  const mintInfo = await contractClient2.mintWithAuth({
    authMethod: authMethod,
    scopes: [
      // AuthMethodScope.NoPermissions,
      AuthMethodScope.SignAnything,
    ],
  });

  const authId = await LitAuthClient.getAuthIdByAuthMethod(authMethod);

  const scopes =
    await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      mintInfo.pkp.tokenId,
      AuthMethodType.EthWallet,
      authId,
      3
    );

  const signAnythingScope = scopes[1];
  const onlySignMessagesScope = scopes[2];

  const secondWalletPKPInfo = {
    tokenId: mintInfo.pkp.tokenId,
    publicKey: `0x${mintInfo.pkp.publicKey}`,
    ethAddress: mintInfo.pkp.ethAddress,
  };

  console.log('secondWalletPKPInfo', secondWalletPKPInfo);

  // ***************************************************************
  // 3. As a dApp owner, I want to create a Capacity Delegation AuthSig
  //    that delegates the Capacity Credits NFT to the PKP NFT
  // ***************************************************************

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
  const sessionKeyPair = litNodeClient.getSessionKey();
  const pkpAuthNeededCallback = async (params) => {
    console.log('auth needed callback params: ', params);
    //console.log('pkpAuthNeededCallback resources:', resources);
    //console.log('pkpAuthNeededCallback expiration:', expiration);
    //console.log('pkpAuthNeededCallback uri:', uri); // lit:session:xx
    console.log(
      'pkpAuthNeededCallback secondWalletControllerAuthSig:',
      secondWalletControllerAuthSig
    );

    // console.log(
    //   'secondWalletControllerAuthSig:',
    //   secondWalletControllerAuthSig
    // );

    const response = await litNodeClient.signSessionKey({
      statement: 'Some custom statement.',
      authMethods: [
        {
          authMethodType: 1,
          accessToken: JSON.stringify(secondWalletControllerAuthSig),
        },
      ],
      pkpPublicKey: secondWalletPKPInfo.publicKey,
      expiration: params.expiration,
      resources: params.resources,
      chainId: 1,

      // optional (this would use normal siwe lib, without it, it would use lit-siwe)
      litResource: new LitPKPResource('*'),
      capability: LitAbility.PKPSigning,
    });

    console.log('response:', response);

    return response.authSig;
  };

  // ***************************************************************
  // 5. As a PKP, I want to get the session sigs
  // ***************************************************************
  const pkpSessionSigs = await litNodeClient.getSessionSigs({
    pkpPublicKey: secondWalletPKPInfo.publicKey,
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LitAbility.PKPSigning,
      },
    ],
    authNeededCallback: pkpAuthNeededCallback,
    capacityDelegationAuthSig,
  });

  console.log('pkpSessionSigs:', pkpSessionSigs);

  // ***************************************************************
  // 7. Finally sign the message using the PKP's PKP
  // ***************************************************************
  // const pkpsPKPPublicKey = '';

  // -- Mint a PKP using a PKP
  const res = await litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
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
      publicKey: secondWalletPKPInfo.publicKey,
    },
  });

  process.exit();

  if (res) {
    return success('recap works');
  }

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
