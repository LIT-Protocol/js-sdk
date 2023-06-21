import * as litNodeClient from '@lit-protocol/lit-node-client';
// import { LitContracts } from '@lit-protocol/contracts-sdk';
// import { ethers } from 'ethers';

// // ***********************************************
// //          Configuration for this test
// // ***********************************************
// const TEST_FUNDED_PRIVATE_KEY =
//   '3dfb4f70b15b6fccc786347aaea445f439a7f10fd10c55dd50cafc3d5a0abac1';
// const PKP_PUBKEY =
//   '0x0447972cdf33b1b0329c3ddeea661c023e6b251d8b1aeaa92da881cc6d0d1eff22c2cbd6a5fead8ba860064881cdaabd7176ca2cade0d50829460d729bd13514f3';
// const CONTROLLER_AUTHSIG = {
//   sig: '0x694a3ff6e16ab7d7189b7507df9b73ec118d1966abad7f0e3984df19991ddc2d558abca2fcc5b4acfb710d455c63ca2ad538f4d603d64bd93a1f124b119eac031b',
//   derivedVia: 'web3.eth.personal.sign',
//   signedMessage:
//     'demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0x1cD4147AF045AdCADe6eAC4883b9310FD286d95a\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: MrgYgnIW5yHCTKetV\nIssued At: 2022-12-14T02:29:48.420Z\nExpiration Time: 2022-12-21T02:29:48.401Z',
//   address: '0x1cd4147af045adcade6eac4883b9310fd286d95a',
// };

// console.log(
//   '------------------------------ litNodeClientTest ------------------------------'
// );
// // globalThis.crypto = require('crypto').webcrypto;
// // globalThis.Blob = require('node:buffer').Blob;

// // ==================================
// //          Business Logic
// // ==================================
// const runLogic = async (contract: LitContracts) => {
//   let mintCost;
//   let tx;

//   await contract.connect();

//   // ------------------------------------------------------
//   //          only run this if it's a pkp wallet
//   // ------------------------------------------------------
//   if ('rpcProvider' in contract.signer) {
//     console.log("It's a PKP Wallet");
//     const pkpWallet = await setupPKP();

//     mintCost = await contract.pkpNftContract.read.mintCost();
//     console.log('mintCost:', mintCost.toString());

//     tx = await contract.pkpNftContract.write.populateTransaction.mintNext(2, {
//       value: mintCost,
//     });
//     console.log('tx:', tx);

//     const signedTx = await pkpWallet.signTransaction(tx);
//     console.log('signedTx:', signedTx);

//     const sentTx = await pkpWallet.sendTransaction(signedTx as any);
//     console.log('sentTx:', sentTx);

//     const res = await sentTx.wait();
//     console.log('res:', res);
//     return;
//   }

//   // -------------------------------------------
//   //          regular minting process
//   // -------------------------------------------
//   try {
//     mintCost = await contract.pkpNftContract.read.mintCost();
//     console.log('mintCost:', mintCost.toString());
//   } catch (e) {
//     console.error('Failed to get mint cost');
//     console.log(e);
//   }
//   try {
//     tx = await contract.pkpNftContract.write.mintNext(2, {
//       value: mintCost,
//     });
//     console.log('tx:', tx);

//     const res = await tx.wait();
//     console.log('res:', res);
//   } catch (e: any) {
//     console.error('Failed to mintNext:', e.message);
//   }
//   // wait 1 second
//   await new Promise((resolve) => setTimeout(resolve, 1000));
// };

// // =============================
// //          PKP Setup
// // =============================
// const setupPKP = async () => {
//   const pkpWallet = new PKPWallet({
//     pkpPubKey: PKP_PUBKEY,
//     controllerAuthSig: CONTROLLER_AUTHSIG,
//     provider: 'https://rpc-mumbai.maticvigil.com',
//   });

//   await pkpWallet.init();

//   // -- contract call
//   const pkpSigner = pkpWallet;

//   return pkpSigner;
// };

// // ===========================================
// //          random private key test
// // ===========================================
// const useRandomPrivateKey = async () => {
//   console.warn('\n\n1. Testing random private key\n\n\n');
//   const litContracts = new LitContracts({ randomPrivatekey: true });
//   await runLogic(litContracts);
// };

// // ==========================================
// //          use custom private key
// // ==========================================
// const useCustomPrivateKey = async () => {
//   console.warn('\n\n4. Use custom Private key\n\n\n');
//   const litContracts = new LitContracts({
//     privateKey: TEST_FUNDED_PRIVATE_KEY,
//   });
//   await runLogic(litContracts);
// };

// // =======================================
// //          PKPWallet as Signer
// // =======================================
// const mintWithPKPWallet = async () => {
//   console.warn('\n\n6. PKPWallet as Signer\n\n\n');

//   const pkpWallet = await setupPKP();

//   const litContracts = new LitContracts({ signer: pkpWallet });
//   console.log("It's a PKP Wallet");

//   await litContracts.connect();

//   let mintCost;
//   let tx;
//   let contract = litContracts;

//   mintCost = await contract.pkpNftContract.read.mintCost();
//   console.log('mintCost:', mintCost.toString());

//   tx = await contract.pkpNftContract.write.populateTransaction.mintNext(2, {
//     value: mintCost,
//   });
//   console.log('tx:', tx);

//   const signedTx = await pkpWallet.signTransaction(tx);
//   console.log('signedTx:', signedTx);

//   const sentTx = await pkpWallet.sendTransaction(signedTx as any);
//   console.log('sentTx:', sentTx);

//   const res = await sentTx.wait();
//   console.log('res:', res);
// };

// // =======================================
// //          PKPWallet as Signer With Util
// // =======================================
// const mintWithPKPWalletUtil = async () => {
//   console.warn('\n\nPKPWallet as Signer\n\n\n');

//   const pkpWallet = await setupPKP();

//   const litContracts = new LitContracts({ signer: pkpWallet });
//   console.log("It's a PKP Wallet");

//   await litContracts.connect();

//   const tokenId = await litContracts.pkpNftContractUtil.write.mint();

//   console.log('tokenId:', tokenId);
// };

// // =================================================
// //          PKPWallet as Signer With Util
// // =================================================
// const getUtilStuff = async () => {
//   const pkpWallet = await setupPKP();

//   const litContracts = new LitContracts({ signer: pkpWallet });
//   await litContracts.connect();

//   const tokens = await litContracts.pkpNftContractUtil.read.getTokens(5);
//   console.log('tokens:', tokens);
// };

// // ===========================================
// //          provide a custom signer
// // ===========================================
// const useCustomSigner = async () => {
//   console.warn('\n\n5. Use Custom Signer\n\n\n');

//   const privateKey = TEST_FUNDED_PRIVATE_KEY;
//   const provider = new ethers.providers.JsonRpcProvider(
//     'https://matic-mumbai.chainstacklabs.com'
//   );
//   const signer = new ethers.Wallet(privateKey, provider);

//   const litContracts = new LitContracts({ signer });
//   await runLogic(litContracts);
// };

// // =========================================================================
// //          Enable/Disable the function you want to test manually
// // =========================================================================
export const manualTest = async () => {
  console.log('Manual Test Here!');
  const client = new litNodeClient.LitNodeClient({
    litNetwork: 'serrano',
  });

  await client.connect();

  const res = await client.executeJs({
    targetNodeRange: 1,
    authSig: {
      sig: '0x721a354498677a1024fb48a78e56c68fd11ad705565933dd9ac770501cecad8811e8591453e21ab50d2579c3d2fe7b0dcbcb1b6436c67e9c6263169c182f50bd1b',
      derivedVia: 'web3.eth.personal.sign',
      signedMessage:
        'demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0xEDA4f4A8AbCecB28bf1663df9257Ec6F188B8107\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: hwrDnUCFsiR10S2lX\nIssued At: 2023-01-25T14:26:44.497Z\nExpiration Time: 2023-02-01T14:26:44.480Z',
      address: '0xeda4f4a8abcecb28bf1663df9257ec6f188b8107',
    },

    jsParams: {},
    code: `(async() => {
              console.log("RUN TEST BABY!");
            })();`,
    // ipfsId: 'QmPxtvDXmBb3H5YSG3kJJcoSknfvwp6P6T1aZjNUWcm5Cb',
  });

  console.log('res:', res);
};
