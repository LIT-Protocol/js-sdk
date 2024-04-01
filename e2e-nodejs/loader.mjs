import LITCONFIG from '../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { uint8arrayFromString } from '@lit-protocol/uint8arrays';
import { BigNumber, ethers } from 'ethers';
import * as siwe from 'siwe';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import fs from 'fs';

// ==================== ENV Loading ====================
const network = process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork;
const debug = process.env.DEBUG === 'true' ? true : false;
const checkSevAttestation = process.env.CHECK_SEV === 'true' ?? false;
const mintNew = process.env.MINT_NEW === 'true' ? true : false;
const useCache = process.env.E2E_CACHE === 'true' ? true : false;
const loadEnv = process.env.LOAD_ENV === 'true' ? false : true; // default to true

if (loadEnv) {
  if (mintNew && useCache) {
    console.log('cannot mint new and use cache at the same time');
    process.exit();
  }

  // ==================== SIWE Gen ====================
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );

  const wallet = new ethers.Wallet(LITCONFIG.CONTROLLER_PRIVATE_KEY, provider);
  const address = ethers.utils.getAddress(await wallet.getAddress());

  // Craft the SIWE message
  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: network,
    debug,
  });

  await litNodeClient.connect();

  let nonce = litNodeClient.getLatestBlockhash();
  console.log('GENERATED NONCE: ', nonce);

  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
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

  // ==================== Global Vars ====================
  if (useCache) {
    globalThis.LitCI = LITCONFIG.CACHE;
  } else {
    globalThis.LitCI = {};
    globalThis.LitCI.wallet = wallet;
    globalThis.LitCI.network = network;
    globalThis.LitCI.debug = debug;
    globalThis.LitCI.sevAttestation = checkSevAttestation;
    globalThis.LitCI.CONTROLLER_AUTHSIG = authSig;
    globalThis.LitCI.CONTROLLER_WALLET = wallet;

    globalThis.LitCI.PKP_INFO = {};
    globalThis.LitCI.PKP_INFO.publicKey = LITCONFIG.PKP_PUBKEY;
  }

  if (mintNew) {
    let contractClient = new LitContracts({
      signer: wallet,
      debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
      network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    });

    await contractClient.connect();

    // -- mint a new Capacity Credits NFT
    // we only need to do this because if the pkp controller has the capactiy
    // credits NFT, then we should be able to use it without delegating it
    // to the pkp
    const ccNFT = await contractClient.mintCapacityCreditsNFT({
      requestsPerDay: 14400,
      daysUntilUTCMidnightExpiration: 2,
    });

    console.log('ccNFT:', ccNFT);

    let res = await contractClient.pkpNftContractUtils.write.mint();

    globalThis.LitCI.PKP_INFO = res.pkp;

    const mintCost = await contractClient.pkpNftContract.read.mintCost();
    let authMethodId = ethers.utils.keccak256(
      uint8arrayFromString(`${authSig.address}:lit`)
    );
    res =
      await contractClient.pkpHelperContract.write.mintNextAndAddAuthMethods(
        2,
        [1],
        [authMethodId],
        [BigNumber.from(0)],
        [[BigNumber.from(1)]],
        true,
        true,
        {
          value: mintCost,
        }
      );

    let tx = await res.wait();
    let tokenId = tx.events ? tx.events[0].topics[1] : tx.logs[0].topics[1];
    let pubkeyWithAuthMethod =
      await contractClient.pkpNftContract.read.getPubkey(tokenId);
    let ethAddr = ethers.utils.computeAddress(pubkeyWithAuthMethod);

    globalThis.LitCI.AUTH_METHOD_PKP_INFO = {};
    globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey =
      pubkeyWithAuthMethod.slice(2);
    globalThis.LitCI.AUTH_METHOD_PKP_INFO.ethAddress = ethAddr;
    globalThis.LitCI.AUTH_METHOD_PKP_INFO.authMethod = {
      authMethodId,
      authMethodType: 1,
    };
  }

  console.log('environment Arguments');
  console.log(globalThis.LitCI);

  // -- write to lit.config.json
  if (!useCache) {
    let litConfigJson;

    try {
      const file = 'lit.config.json';
      litConfigJson = JSON.parse(fs.readFileSync(file, 'utf8'));
      litConfigJson.CACHE = globalThis.LitCI;
      delete litConfigJson.CACHE.wallet;
      fs.writeFileSync(file, JSON.stringify(litConfigJson, null, 2), 'utf8');
    } catch (e) {
      console.log('could not parse or write to lit.config.json');
      console.log(e);
    }
  }
}
