// bun run ./e2e-nodejs/0_manual-tests/test-unified-auth.ts
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  LitNodeClient,
  uint8arrayFromString,
} from '@lit-protocol/lit-node-client';
import { LitContractContext } from '@lit-protocol/types';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import { networkContext } from './customNetwork';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

// NOTE: The only time we create an authSig is to use it to generate session sigs client side.
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

  // -- 2. Get the authSig. Bare in mind that we only use authSig client side to generate session sigs.
  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';

  const address = await wallet.getAddress();
  console.log('address:', address);

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

  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: address,
  };

  // -- 3. craft the authMethod for the authSig
  const authMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(authSig),
  };

  // -- 4. Mint a PKP (could be any other auth method)
  const contractsClient = new LitContracts({
    signer: wallet,
    debug: true,
    rpc: LIT_RPC_URL, // anvil rpc
    customContext: networkContext as unknown as LitContractContext,
  });


  await contractsClient.connect();


  // -- mint with auth
  const res = await contractsClient.mintWithAuth({
    authMethod,
    scopes: [AuthMethodScope.SignAnything],
  });

  const { pkp, tx } = res;

  console.log('pkp:', pkp);

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
