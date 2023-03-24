// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.jestTesting = true;

import { ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { SiweMessage } from 'lit-siwe';
import { PKPWallet } from '../index';

globalThis.location = {
  host: 'localhost:3000',
};

const isClass = (v) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

const ethWallet = new ethers.Wallet(
  'fdb549321001559b6603291e477aaf43bb26597f2a764800a1856451e23307e4'
);
const pkpAddress = '0xb5aaad344ee6c2ee85909b7f4e0ba0fb87512391';
const pkpPubKey =
  '0x04c9b9cba2d50581c92c3aaf6328c19aa7419187d8ad0d1efa50d62c916c8db7649b716afb444e3c0de5036826565214b6a15f70e6afb4902910c5d0a820605165';

describe('PKPWallet', () => {
  it('imported { PKPWallet } is a class', async () => {
    expect(isClass(PKPWallet)).toBe(true);
  });

  // it('should sign a message', async () => {
  //   const litNodeClient = new LitNodeClient({
  //     litNetwork: 'serrano',
  //     debug: false,
  //   });
  //   await litNodeClient.connect();
  //   const authNeededCallback = async ({
  //     chain,
  //     resources,
  //     expiration,
  //     uri,
  //   }) => {
  //     const domain = 'localhost:3000';
  //     const message = new SiweMessage({
  //       domain,
  //       address: ethWallet.address,
  //       statement: 'Sign a session key to use with Lit Protocol',
  //       uri,
  //       version: '1',
  //       chainId: '1',
  //       expirationTime: expiration,
  //       resources,
  //     });
  //     const toSign = message.prepareMessage();
  //     const signature = await ethWallet.signMessage(toSign);
  //     const authSig = {
  //       sig: signature,
  //       derivedVia: 'web3.eth.personal.sign',
  //       signedMessage: toSign,
  //       address: ethWallet.address,
  //     };
  //     const sessionSig = await litNodeClient.signSessionKey({
  //       sessionKey: uri,
  //       pkpPublicKey: pkpPubKey,
  //       authSig: authSig,
  //       authMethods: [
  //         {
  //           authMethodType: 1,
  //           accessToken: ethWallet.address,
  //         },
  //       ],
  //       expiration,
  //       resources,
  //       chainId: 1,
  //       domain: domain,
  //     });
  //     return sessionSig;
  //   };
  //   const sessionSigs = await litNodeClient.getSessionSigs({
  //     resources: ['litAction://*'],
  //     chain: 'ethereum',
  //     authNeededCallback,
  //   });
  //   // Initialize Lit PKP Wallet
  //   const pkp = new PKPWallet({
  //     pkpPubKey: pkpPubKey,
  //     controllerSessionSigs: sessionSigs,
  //     provider: 'https://rpc-mumbai.maticvigil.com',
  //   });
  //   await pkp.init();
  //   // Message to sign
  //   const message = 'Hello world';
  //   const sig = await pkp.signMessage(message);
  //   const recoveredAddr = ethers.utils.verifyMessage(message, sig);
  //   expect(pkpAddress.toLowerCase()).toBe(recoveredAddr.toLowerCase());
  // });
});
