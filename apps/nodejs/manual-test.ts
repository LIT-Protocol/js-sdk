import { LitContracts } from '@lit-protocol/contracts-sdk';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
// import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { SiweMessage } from 'lit-siwe';
import { LIT_EVM_CHAINS } from '@lit-protocol/constants';



// ***********************************************
//          Configuration for this test
// ***********************************************
const TEST_FUNDED_PRIVATE_KEY =
  process.env.LIT_JS_SDK_FUNDED_WALLET_PRIVATE_KEY;

console.log(
  '------------------------------ litNodeClientTest ------------------------------'
);
// globalThis.crypto = require('crypto').webcrypto;
// globalThis.Blob = require('node:buffer').Blob;

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
  // if ('rpcProvider' in contract.signer) {
  //   console.log("It's a PKP Wallet");
  //   const pkpWallet = await setupPKP();

  //   mintCost = await contract.pkpNftContract.read.mintCost();
  //   console.log('mintCost:', mintCost.toString());

  //   tx = await contract.pkpNftContract.write.mintNext(2, {
  //     value: mintCost,
  //   });
  //   console.log('tx:', tx);

  //   const signedTx = await pkpWallet.signTransaction(tx);
  //   console.log('signedTx:', signedTx);

  //   const sentTx = await pkpWallet.sendTransaction(signedTx as any);
  //   console.log('sentTx:', sentTx);

  //   const res = await sentTx.wait();
  //   console.log('res:', res);
  //   return;
  // }

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

  let pkpPubkey;
  try {
    tx = await contract.pkpNftContract.write.mintNext(2, {
      value: mintCost,
    });
    console.log('tx:', tx);

    const res = await tx.wait();
    console.log('res:', res);
    let pkpMintedEvent = res.events.find(event => event.event === "PKPMinted");
    console.log('pkpMintedEvent:', pkpMintedEvent);
    pkpPubkey = pkpMintedEvent.args.pubkey;
  } catch (e: any) {
    console.error('Failed to mintNext:', e.message);
  }
  // wait 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return pkpPubkey;
};

// =============================
//          PKP Setup
// =============================
// const setupPKP = async () => {
//   const pkpWallet = new PKPEthersWallet({
//     pkpPubKey: PKP_PUBKEY,
//     controllerAuthSig: CONTROLLER_AUTHSIG,
//   });

//   await pkpWallet.init();

//   // -- contract call
//   const pkpSigner = pkpWallet;

//   return pkpSigner;
// };

// ===========================================
//          random private key test
// ===========================================
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
//     LIT_EVM_CHAINS['chronicleTestnet'].rpcUrls[0]
//   );
//   const signer = new ethers.Wallet(privateKey, provider);

//   const litContracts = new LitContracts({ signer });
//   await runLogic(litContracts);
// };

const pkpSign = async (client, pkpPubkey, authSig) => {
     // try and sign something
     let sig = await client.pkpSign({
      toSign: [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100], // hello world in Uint8Array
      pubKey: pkpPubkey,
      authSig,
    });

    console.log("sig: ", sig);

    const recoveredPk = ethers.utils.recoverPublicKey("0x" + sig.dataSigned, sig.signature);
    const addr = ethers.utils.computeAddress('0x' + sig.publicKey);
    const recoveredAddr = ethers.utils.computeAddress(recoveredPk);
    const claimedAddr = ethers.utils.computeAddress(pkpPubkey);

    const allGood = addr === recoveredAddr && addr === claimedAddr;

    console.log('all addresses match: ', allGood);
    return allGood;
}

const litActionSign = async(client, pkpPubkey, authSig) => {
    console.log('testing sig with lit actions...');
    // this code will be run on the node
    const litActionCode = `
    const go = async () => {  
      // this requests a signature share from the Lit Node
      // the signature share will be automatically returned in the HTTP response from the node
      // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
      await Lit.Actions.signEcdsa({ toSign, publicKey , sigName });
      await Lit.Actions.signEcdsa({ toSign, publicKey , sigName: 'sig2' });
    };

    go();
    `;

    const signatures = await client.executeJs({
      code: litActionCode,
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams: {
        // this is the string "Hello World" for testing
        toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
        publicKey: pkpPubkey,
        sigName: "sig1",
      },
    });
    console.log("signatures: ", signatures);
    const { sig1, sig2 } = signatures.signatures
    const sigKeys = {
      sig1: {
        recovered: ethers.utils.computeAddress(ethers.utils.recoverPublicKey("0x" + sig1.dataSigned, sig1.signature)),
        reported: ethers.utils.computeAddress('0x' + sig1.publicKey)
      },
      sig2: {
        recovered: ethers.utils.computeAddress(ethers.utils.recoverPublicKey("0x" + sig2.dataSigned, sig2.signature)),
        reported: ethers.utils.computeAddress('0x' + sig2.publicKey)
      },
    }

    console.log(`sigKeys: ${JSON.stringify(sigKeys, null, 2)}`)

    const pkpAddr = ethers.utils.computeAddress(pkpPubkey);
    console.log('pkpAddr:', pkpAddr)


    let allGood = sigKeys.sig1.recovered == sigKeys.sig1.reported && sigKeys.sig2.recovered == sigKeys.sig2.reported && sigKeys.sig1.recovered == sigKeys.sig2.recovered && sigKeys.sig1.recovered == pkpAddr;
    console.log('all addresses match: ', allGood);
    return allGood;
  }

const mintPkpAndSign = async () => {
  let client;
  if (process.env.LIT_JS_SDK_LOCAL_NODE_DEV === "true") {
    // use local node
    client = new LitJsSdk.LitNodeClient({
      litNetwork: 'custom',
      "minNodeCount": 2,
      "bootstrapUrls": [
        "http://localhost:7470",
        "http://localhost:7471",
        "http://localhost:7472",
      ],
      debug: true
    });
  } else {
    // use cayenne
    client = new LitJsSdk.LitNodeClient({
      litNetwork: 'cayenne',
      debug: true
    });
  }

  await client.connect();

    const litContracts = new LitContracts({
      privateKey: TEST_FUNDED_PRIVATE_KEY,
    });
    const pkpPubkey = await runLogic(litContracts);
    console.log('pkpPubkey:', pkpPubkey);

    const privateKey = TEST_FUNDED_PRIVATE_KEY;
    const provider = new ethers.providers.JsonRpcProvider(
      LIT_EVM_CHAINS['chronicleTestnet'].rpcUrls[0]
    );
    const wallet = new ethers.Wallet(privateKey, provider);
    const authSig = await getAuthSig(wallet);
    
    for(let i = 0; i < 100; i++){
      console.log(`testing ${i}`)
      await pkpSign(client, pkpPubkey, authSig);
    }
    
    // await litActionSign(client, pkpPubkey, authSig);
}

const getAuthSig = async (wallet) => {
  const address = wallet.address;

  // Craft the SIWE message
  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';
  const siweMessage = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: 1,
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
  return authSig
}

const testLitActionJsExecution = async () => {
  const client = new LitJsSdk.LitNodeClient({
    litNetwork: 'cayenne',
  });

  await client.connect();

  // generate a random wallet using ethers
  let wallet = ethers.Wallet.createRandom();
  console.log('Wallet Address:', wallet.address);
  const address = wallet.address;
  const authSig = await getAuthSig(wallet);

  const res = await client.executeJs({
    targetNodeRange: 1,
    authSig,
    jsParams: {},
    code: `(async() => {
              console.log("RUN TEST BABY!");
            })();`,
    // ipfsId: 'QmPxtvDXmBb3H5YSG3kJJcoSknfvwp6P6T1aZjNUWcm5Cb',
  });

  console.log('res:', res);
}

// // =========================================================================
// //          Enable/Disable the function you want to test manually
// // =========================================================================
export const manualTest = async () => {
  console.log('Manual Test Here!');
  await mintPkpAndSign();
};
