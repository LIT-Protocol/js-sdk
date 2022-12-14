import * as LitJsSdk from 'dist/packages/lit-node-client';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPWallet } from '@lit-protocol/pkp-ethers.js';
import '../../../html/style.css';
import { useEffect } from 'react';

const Test1 = () => {
  // ========== zipAndEncryptString ==========
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

  // ========== Contracts SDK ==========
  const contractsSdk = async () => {
    console.warn('========== Contracts SDK ==========');

    // -- prepare pkp wallet
    const PKP_PUBKEY =
      '0x0447972cdf33b1b0329c3ddeea661c023e6b251d8b1aeaa92da881cc6d0d1eff22c2cbd6a5fead8ba860064881cdaabd7176ca2cade0d50829460d729bd13514f3';
    const CONTROLLER_AUTHSIG = {
      sig: '0x694a3ff6e16ab7d7189b7507df9b73ec118d1966abad7f0e3984df19991ddc2d558abca2fcc5b4acfb710d455c63ca2ad538f4d603d64bd93a1f124b119eac031b',
      derivedVia: 'web3.eth.personal.sign',
      signedMessage:
        'demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0x1cD4147AF045AdCADe6eAC4883b9310FD286d95a\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: MrgYgnIW5yHCTKetV\nIssued At: 2022-12-14T02:29:48.420Z\nExpiration Time: 2022-12-21T02:29:48.401Z',
      address: '0x1cd4147af045adcade6eac4883b9310fd286d95a',
    };

    const pkpWallet = new PKPWallet({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: 'https://rpc-mumbai.maticvigil.com',
    });

    await pkpWallet.init();

    // -- pkp signer/provider ready
    const pkpSigner = pkpWallet;
    const pkpProvider = pkpWallet.rpcProvider;

    // --
    console.log('pkp wallet address:', pkpWallet.address);

    // -- prepare contracts sdk
    const litContracts = new LitContracts({ signer: pkpSigner });
    await litContracts.connect();

    // -- test read
    // const mintCost = await litContracts.pkpNftContract.read.mintCost();
    // console.log(mintCost);

    // -- test write
    // const tx = await litContracts.pkpNftContract
  };

  useEffect(() => {
    // contractsSdk();
  });
  return (
    <>
      <h1>(Manual) React Test</h1>
      <button onClick={zipAndEncryptString}>zipAndEncryptString</button>
      <button onClick={contractsSdk}>contractsSdk</button>
    </>
  );
};
export default Test1;
