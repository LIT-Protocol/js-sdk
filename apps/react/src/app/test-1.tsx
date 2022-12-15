import * as LitJsSdk from 'dist/packages/lit-node-client';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPWallet } from '@lit-protocol/pkp-ethers.js';
import { ethers } from 'ethers';

// ***********************************************
//          Configuration for this test
// ***********************************************
const TEST_FUNDED_PRIVATE_KEY =
  '3dfb4f70b15b6fccc786347aaea445f439a7f10fd10c55dd50cafc3d5a0abac1';
const PKP_PUBKEY =
  '0x0447972cdf33b1b0329c3ddeea661c023e6b251d8b1aeaa92da881cc6d0d1eff22c2cbd6a5fead8ba860064881cdaabd7176ca2cade0d50829460d729bd13514f3';
const CONTROLLER_AUTHSIG = {
  sig: '0x694a3ff6e16ab7d7189b7507df9b73ec118d1966abad7f0e3984df19991ddc2d558abca2fcc5b4acfb710d455c63ca2ad538f4d603d64bd93a1f124b119eac031b',
  derivedVia: 'web3.eth.personal.sign',
  signedMessage:
    'demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0x1cD4147AF045AdCADe6eAC4883b9310FD286d95a\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: MrgYgnIW5yHCTKetV\nIssued At: 2022-12-14T02:29:48.420Z\nExpiration Time: 2022-12-21T02:29:48.401Z',
  address: '0x1cd4147af045adcade6eac4883b9310fd286d95a',
};

const Test1 = () => {
  // =======================================
  //          zipAndEncryptString
  // =======================================
  const zipAndEncryptString = async () => {
    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'serrano',
    });
    await litNodeClient.connect();

    const sessionSigs = await litNodeClient.getSessionSigs({
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      chain: 'ethereum',
      resources: [`litEncryptionCondition://*`],
      switchChain: false,
    });
    console.log('sessionSigs before saving encryption key: ', sessionSigs);

    const { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptString(
      'this is a secret message'
    );

    console.log('encryptedZip:', encryptedZip);
    console.log('symmetricKey:', symmetricKey);
  };
  0x86062b7a01b8b2e22619dbe0c15cbe3f7ebd0e92;

  // =============================
  //          PKP Setup
  // =============================
  const setupPKP = async () => {
    const pkpWallet = new PKPWallet({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: 'https://rpc-mumbai.maticvigil.com',
    });

    await pkpWallet.init();

    // -- contract call
    const pkpSigner = pkpWallet;

    return pkpSigner;
  };

  // ==================================
  //          Business Logic
  // ==================================
  const runLogic = async (contract: LitContracts) => {
    let mintCost;
    let tx;

    await contract.connect();

    // ------------------------------------------------------
    //          only run this if it's a pkp wallet
    // ------------------------------------------------------
    if ('rpcProvider' in contract.signer) {
      console.log("It's a PKP Wallet");
      const pkpWallet = await setupPKP();

      mintCost = await contract.pkpNftContract.read.mintCost();
      console.log('mintCost:', mintCost.toString());

      tx = await contract.pkpNftContract.write.populateTransaction.mintNext(2, {
        value: mintCost,
      });
      console.log('tx:', tx);

      const signedTx = await pkpWallet.signTransaction(tx);
      console.log('signedTx:', signedTx);

      const sentTx = await pkpWallet.sendTransaction(
        signedTx as ethers.providers.TransactionRequest
      );
      console.log('sentTx:', sentTx);

      const res = await sentTx.wait();
      console.log('res:', res);
      return;
    }

    // -------------------------------------------
    //          regular minting process
    // -------------------------------------------
    try {
      mintCost = await contract.pkpNftContract.read.mintCost();
      console.log('mintCost:', mintCost.toString());
    } catch (e) {
      console.error('Failed to get mint cost');
      console.log(e);
    }
    try {
      tx = await contract.pkpNftContract.write.mintNext(2, {
        value: mintCost,
      });
      console.log('tx:', tx);

      const res = await tx.wait();
      console.log('res:', res);
    } catch (e: any) {
      console.error('Failed to mintNext:', e.message);
    }
    // wait 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // ===========================================
  //          random private key test
  // ===========================================
  const useRandomPrivateKey = async () => {
    console.warn('\n\n1. Testing random private key\n\n\n');
    const litContracts = new LitContracts({ randomPrivatekey: true });
    await runLogic(litContracts);
  };

  // ===========================================
  //          random private key test
  // ===========================================
  const useRandomPrivateKeyAndStoreInLocalStorage = async () => {
    console.warn(
      '\n\n2. Testing random private key and store it in local storage\n\n\n'
    );
    localStorage.clear();
    const litContracts = new LitContracts({
      randomPrivatekey: true,
      options: {
        storeOrUseStorageKey: true,
      },
    });
    await runLogic(litContracts);

    const keyInStorage = localStorage.getItem('lit-contracts-sdk-private-key');
    console.log('Private key in storage:', keyInStorage);
  };

  // ======================================================
  //          use private key from local storage
  // ======================================================
  const usePrivateKeyFromLocalStorage = async () => {
    console.warn('\n\n3. Use Private key from local storage\n\n\n');
    const litContracts = new LitContracts({
      options: {
        storeOrUseStorageKey: true,
      },
    });
    // localStorage.clear();
    await runLogic(litContracts);
  };

  // ==========================================
  //          use custom private key
  // ==========================================
  const useCustomPrivateKey = async () => {
    console.warn('\n\n4. Use custom Private key\n\n\n');
    const litContracts = new LitContracts({
      privateKey: TEST_FUNDED_PRIVATE_KEY,
    });
    await runLogic(litContracts);
  };

  // ===========================================
  //          provide a custom signer
  // ===========================================
  const useCustomSigner = async () => {
    console.warn('\n\n5. Use Custom Signer\n\n\n');

    const privateKey = TEST_FUNDED_PRIVATE_KEY;
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const signer = new ethers.Wallet(privateKey, provider);

    const litContracts = new LitContracts({ signer });
    await runLogic(litContracts);
  };

  // =======================================
  //          PKPWallet as Signer
  // =======================================
  const mintWithPKPWallet = async () => {
    console.warn('\n\n6. PKPWallet as Signer\n\n\n');

    const pkpWallet = await setupPKP();

    const litContracts = new LitContracts({ signer: pkpWallet });
    console.log("It's a PKP Wallet");

    await litContracts.connect();

    let mintCost;
    let tx;
    let contract = litContracts;

    mintCost = await contract.pkpNftContract.read.mintCost();
    console.log('mintCost:', mintCost.toString());

    tx = await contract.pkpNftContract.write.populateTransaction.mintNext(2, {
      value: mintCost,
    });
    console.log('tx:', tx);

    const signedTx = await pkpWallet.signTransaction(tx);
    console.log('signedTx:', signedTx);

    const sentTx = await pkpWallet.sendTransaction(
      signedTx as ethers.providers.TransactionRequest
    );
    console.log('sentTx:', sentTx);

    const res = await sentTx.wait();
    console.log('res:', res);
  };

  // =======================================
  //          PKPWallet as Signer With Util
  // =======================================
  const mintWithPKPWalletUtil = async () => {
    console.warn('\n\nPKPWallet as Signer\n\n\n');

    const pkpWallet = await setupPKP();

    const litContracts = new LitContracts({ signer: pkpWallet });
    console.log("It's a PKP Wallet");

    await litContracts.connect();

    const tokenId = await litContracts.pkpNftContractUtil.write.mint();

    console.log('tokenId:', tokenId);
  };

  // --------------------------------------------
  //          Mint with regular wallet
  // --------------------------------------------
  const mintWithRegularWallet = async () => {
    const litContracts = new LitContracts();
    await litContracts.connect();

    const tokenId = await litContracts.pkpNftContractUtil.write.mint();
    console.log('tokenId:', tokenId);
  };

  const getUtilStuff = async () => {
    const pkpWallet = await setupPKP();

    const litContracts = new LitContracts({ signer: pkpWallet });
    await litContracts.connect();

    const tokens = await litContracts.pkpNftContractUtil.read.getTokens(5);
    console.log('tokens:', tokens);
  };

  // *****************************
  //          HTML AREA
  // *****************************
  return (
    <>
      <h1>(Manual) React Test</h1>
      <button onClick={zipAndEncryptString}>zipAndEncryptString</button>
      ---
      <button onClick={mintWithRegularWallet}>mint with regular wallet</button>
      <button onClick={useRandomPrivateKey}>use Random Private Key</button>
      <button onClick={useRandomPrivateKeyAndStoreInLocalStorage}>
        use random private key and store in local storage
      </button>
      <button onClick={usePrivateKeyFromLocalStorage}>
        use private key from local storage
      </button>
      <button onClick={useCustomPrivateKey}>use custom private key</button>
      <button onClick={useCustomSigner}>use custom signer</button>
      ---
      <button onClick={getUtilStuff}>get util stuff</button>
      --- PKP ---
      <button onClick={mintWithPKPWallet}>mint with pkp wallet</button>
      <button onClick={mintWithPKPWalletUtil}>
        mint with pkp wallet(util)
      </button>
    </>
  );
};
export default Test1;
