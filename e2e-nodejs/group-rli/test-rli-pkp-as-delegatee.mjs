// Usage: DEBUG=true NETWORK=habanero MINT_NEW=true yarn test:e2e:nodejs --filter=test-rli-pkp-as-delegatee
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LocalStorage } from 'node-localstorage';
import { LitAbility, LitPKPResource } from '@lit-protocol/auth-helpers';
import { AuthMethodType, AuthMethodScope } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

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

  console.log('TESTING!!!');

  process.exit();

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
  const dAppOwnerWallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
  );

  // -- connect to contract client
  let contractClient = new LitContracts({
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    signer: dAppOwnerWallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
  });

  await contractClient.connect();

  // -- static to test faster
  // const capacityTokenIdStr = '2';

  // -- mint a new Capacity Credits NFT
  const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
    requestsPerDay: 14400, // 10 request per minute
    daysUntilUTCMidnightExpiration: 2,
  });

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

  if (!scopes[1]) {
    return fail('signAnythingScope is not true');
  }

  const secondWalletPKPInfo = {
    tokenId: mintInfo.pkp.tokenId,
    publicKey: `0x${mintInfo.pkp.publicKey}`,
    ethAddress: mintInfo.pkp.ethAddress,
  };

  console.log('secondWalletPKPInfo', secondWalletPKPInfo);

  // ***********************************************************************
  // 3. As a dApp owner, I want to create a Capacity Delegation AuthSig
  // that delegates the Capacity Credits NFT to the PKP NFT so that the
  // PKP NFT can benefit from the Capacity Credits NFT's rate limit increase
  // when signing.
  // ************************************************************************

  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: dAppOwnerWallet,
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [secondWalletPKPInfo.ethAddress],
    });

  console.log('capacityDelegationAuthSig:', capacityDelegationAuthSig);

  // ***************************************************************
  // 4. As a PKP, I want to benefit from the Capacity Credits NFT's
  // rate limit increase when signing.
  // ***************************************************************

  // -- define the resources that you want to access
  const litResource = new LitPKPResource('*');
  const capability = LitAbility.PKPSigning;

  // -- define the authMethod of the delegatee's controller auth sig (second wallet controller auth sig)
  const secondWalletControllerAuthMethod = {
    authMethodType: 1,
    accessToken: JSON.stringify(secondWalletControllerAuthSig),
  };

  const pkpAuthNeededCallback = async (params) => {
    console.log('auth needed callback params: ', params);
    console.log(
      'pkpAuthNeededCallback secondWalletControllerAuthSig:',
      secondWalletControllerAuthSig
    );

    const response = await litNodeClient.signSessionKey({
      statement: 'Some custom statement.',
      authMethods: [secondWalletControllerAuthMethod],
      pkpPublicKey: secondWalletPKPInfo.publicKey,
      expiration: params.expiration,
      resources: params.resources,
      chainId: 1,

      // optional (this would use normal siwe lib, without it, it would use lit-siwe)
      resourceAbilityRequests: params.resourceAbilityRequests,
      litResource,
      capability,
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

  if (res) {
    return success('pkp able to sign as a delegatee');
  }

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
