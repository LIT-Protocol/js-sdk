// This file is a WIP test demo for auth unification. In this change, the only time we will create an authSig is to use it to generate session sigs
// client side. Anything server side, we will no longer accpet authSig.

// bun run ./e2e-nodejs/0_manual-tests/test-unified-auth.ts
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  LitNodeClient,
  uint8arrayFromString,
} from '@lit-protocol/lit-node-client';
import { JsonSignSessionKeyRequest, LitContractContext } from '@lit-protocol/types';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import { networkContext } from './customNetwork';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { getAuthSig } from './utils/get-authsig';
import { getSessionSigs } from './utils/get-sessionsigs';
import { VALID_SESSION_SIG_LIT_ACTION_CODE } from './utils/constants';

const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const LIT_RPC_URL = 'http://127.0.0.1:8545';

(async () => {
  // -- connect to the local network
  const litNodeClient = new LitNodeClient({
    litNetwork: 'custom',
    bootstrapUrls: [
      'http://127.0.0.1:7470',
      'http://127.0.0.1:7471',
      'http://127.0.0.1:7472',
    ],
    debug: true,
    checkNodeAttestation: false,  // disable node attestation check for local testing
    contractContext: networkContext as unknown as LitContractContext,
  });

  await litNodeClient.connect();

  // -- 1. EOA Wallet
  const provider = new ethers.providers.JsonRpcProvider(LIT_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  //   details: [ "Address in SIWE message f39fd6e51aad88f6f4ce6ab8827279cfffb92266 does not match PKP ETH address 6b409e762364526cf2d6341f54c6ab2d214b9e26",
  //   "Address in SIWE message f39fd6e51aad88f6f4ce6ab8827279cfffb92266 does not match PKP ETH address 6b409e762364526cf2d6341f54c6ab2d214b9e26"
  // ],

  console.log(`wallet address: ${await wallet.getAddress()}`);
  // process.exit();

  // -- 2. Get the authSig. Bare in mind that we only use authSig client side to generate session sigs.
  const authSig = await getAuthSig(wallet, litNodeClient);
  console.log("authSig:", authSig);

  // -- 3. craft the authMethod for the authSig
  const authMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(authSig),
  };

  // -- 4. Init & connect the contracts sdk
  const contractsClient = new LitContracts({
    signer: wallet,
    debug: true,
    rpc: LIT_RPC_URL, // anvil rpc
    customContext: networkContext as unknown as LitContractContext,
  });

  await contractsClient.connect();

  // -- 5. Mint a PKP (could be any other auth method). In this case, we are using 
  // eth hot wallet
  const res = await contractsClient.mintWithAuth({
    authMethod,
    scopes: [AuthMethodScope.SignAnything],
  });

  const { pkp, tx } = res;

  console.log('pkp:', pkp);

  // -- generate a siwe message
  const ethAddress = await wallet.getAddress();
  const sessionKey = litNodeClient.getSessionKey();
  const sessionKeyUri = litNodeClient.getSessionKeyUri(sessionKey.publicKey);
  const latestBlockhash = await litNodeClient.getLatestBlockhash();

  console.log('ethAddress:', ethAddress);
  console.log('sessionKey:', sessionKey);
  console.log('sessionKeyUri:', sessionKeyUri);
  console.log('latestBlockhash:', latestBlockhash);

  const now = new Date();
  const siweIssuedAt = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  const siweExpirationTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  let siweMessage = new siwe.SiweMessage({
    domain: 'localhost:3000',
    address: pkp.ethAddress,
    statement: `Some custom statement. I further authorize the stated URI to perform the following actions on my behalf: (1) '*': '*' for 'lit-accesscontrolcondition://*'. (2) '*': '*' for 'lit-litaction://*'.`,
    uri: sessionKeyUri,
    version: '1',
    chainId: 1,
    nonce: latestBlockhash,
    issuedAt: siweIssuedAt.toISOString(),
    expirationTime: siweExpirationTime.toISOString(),
    resources: [],
  });

  // const messageToSign = siweMessage.prepareMessage();
  // const signature = await wallet.signMessage(messageToSign);

  // console.log('SIWE Message:', siweMessage);

  // base 64 encode this
  const code = Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString('base64');

  const signingRequest: JsonSignSessionKeyRequest = {
    sessionKey: sessionKeyUri, // Adjust based on how you handle session keys in TS
    authMethods: [authMethod],
    pkpPublicKey: pkp.publicKey,
    siweMessage: siweMessage.toMessage(),
    code,
    // litActionIpfsId: '',
    jsParams: {
      publicKey: pkp.publicKey,
      sigName: 'unified-auth-sig',
    },
  };

  // const jsonBody = JSON.stringify(signingRequest);

  // const handshakesRes = await litNodeClient.handshakeWithNode({
  //   params: {}
  // });

  // const SESSION_KEY_SIGN_ENDPOINT = '/web/sign_session_key';

  // for (const url of litNodeClient.config.bootstrapUrls) {
  //   const heRes = await litNodeClient.sendCommandToNode({
  //     url: `${url}${SESSION_KEY_SIGN_ENDPOINT}`,
  //     data: signingRequest,
  //     requestId
  //   });

  //   console.log("heRes:", heRes);

  // }

  const requestId = litNodeClient.getRequestId();

  // --- test
  // const url1 = litNodeClient.config.bootstrapUrls[1];

  // const challenge1 = litNodeClient.getRandomHexString(64);

  // const testRes1 = await litNodeClient.handshakeWithNode({
  //   url: url1,
  //   challenge: challenge1,
  //   path: '/web/sign_session_key',
  //   data: signingRequest,
  // }, requestId);

  // console.log("testRes1:", testRes1);

  // --- and test
  const handshakePromises = litNodeClient.config.bootstrapUrls.map(async (url) => {
    const challenge = await litNodeClient.getRandomHexString(64);
    // Removed await here to not wait for handshakeWithNode to complete before continuing the loop
    return litNodeClient.handshakeWithNode({
      url,
      challenge,
      path: '/web/sign_session_key',
      data: signingRequest,
    }, requestId);
  });

  const handshakeResponses = await Promise.all(handshakePromises);

  // Log the responses
  handshakeResponses.forEach(hsRes => {
    console.log('hsRes:', hsRes);
  });
  // for (const url of litNodeClient.config.bootstrapUrls) {
  //   const challenge = await litNodeClient.getRandomHexString(64);

  //   const hsRes = await litNodeClient.handshakeWithNode({
  //     url,
  //     challenge,
  //     path: '/web/sign_session_key',
  //     data: signingRequest,
  //   }, requestId);

  //   console.log('hsRes:', hsRes);
  // }

  // const sessionSigs = await getSessionSigs({
  //   code: VALID_SESSION_SIG_LIT_ACTION_CODE,
  //   authSig,
  //   pubKey: pkp.publicKey,
  //   latestBlockhash: litNodeClient.getLatestBlockhash()
  // });

  // console.log("sessionSigs:", sessionSigs);


  process.exit();

  // -- mint new Capacity Credits NFT
  const { capacityTokenIdStr } = await contractsClient.mintCapacityCreditsNFT({
    requestsPerDay: 20000,
    daysUntilUTCMidnightExpiration: 2,
  });

  console.log('capacityTokenIdStr:', capacityTokenIdStr);

  const rateLimit = await contractsClient.rateLimitNftContract.read.capacity(
    capacityTokenIdStr
  );

  console.log('rateLimit:', rateLimit.toString());

  const { capacityDelegationAuthSig, litResource } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: wallet,
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [wallet.address],
    });

  console.log('capacityDelegationAuthSig:', capacityDelegationAuthSig);
  console.log('litResource:', JSON.stringify(litResource));

  const laRes = await litNodeClient.executeJs({
    debug: true,
    authSig,
    code: `
    (async() => {
      console.log("hello world")
    })();
    `,
    jsParams: {}
  });

  console.log('laRes:', laRes);

  // get mint cost
  // const mintCost = await contractsClient.pkpNftContract.read.mintCost();
  // console.log('mintCost:', mintCost.toString());

  // // get auth id
  // const authId = await LitAuthClient.getAuthIdByAuthMethod(authMethod);
  // console.log('authId:', authId);

  // // mint and add auth methods
  // const res = await contractsClient.pkpNftContract.write.mintNext(2, {
  //   value: mintCost,
  // });

  // console.log('res:', res);

  // try {
  //   const tx = await res.wait();
  //   console.log('tx:', tx);
  // } catch (e) {
  //   throw new Error(e);
  // }

  // mint pkp
  // const mint = await contractsClient.pkpNftContract.write.mintNext(2, {
  //   value: mintCost,
  //   gasLimit: 100000, // manually set gas limit
  // })

  // console.log("mint:", mint);

  // const receipt = await mint.wait();
  // console.log("receipt:", receipt);

  // -- mint a PKP and return auth method
  // const authMethod = {
  //   authMethodType: AuthMethodType.EthWallet,
  //   accessToken: JSON.stringify(globalThis.LitCI.CONTROLLER_AUTHSIG),
  // };

  // console.log("authMethod:", authMethod)

  // -- Ends the session
  process.exit();
})();
