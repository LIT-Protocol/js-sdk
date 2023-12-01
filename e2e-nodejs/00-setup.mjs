import { LitNodeClient, uint8arrayFromString } from '@lit-protocol/lit-node-client';
import LITCONFIG from '../lit.config.json' assert { type: 'json' };
import { fail } from '../tools/scripts/utils.mjs';
import {LitContracts} from "@lit-protocol/contracts-sdk";
import {ethers} from "ethers";
import * as siwe from 'siwe';

// ==================== ENV Loading ====================
const network = process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork;
const debug = process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug;
const minNodeCount = LITCONFIG.TEST_ENV.minNodeCount;
const checkSevAttestation = process.env.CHECK_SEV ?? false;

const client = new LitNodeClient({
  litNetwork: network,
  debug: debug,
  minNodeCount: minNodeCount,
  checkNodeAttestation: checkSevAttestation
});
await client.connect();

// ==================== Validation ====================
if (client.ready !== true) {
  fail('client not ready');
}

if (LITCONFIG.CONTROLLER_AUTHSIG === undefined) {
  fail('Controller authSig cannot be empty');
}

// ==================== SIWE Gen ====================
const provider = new ethers.providers.JsonRpcProvider(
  LITCONFIG.CHRONICLE_RPC
);

const wallet = new ethers.Wallet(LITCONFIG.CONTROLLER_PRIVATE_KEY, provider);
const address = ethers.utils.getAddress(await wallet.getAddress());

// Craft the SIWE message
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
  expirationTime: new Date(Date.now() + 1000 * 60).toISOString()
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
console.log("generated siwe for test run: ", authSig);

// ==================== Global Vars ====================
globalThis.LitCI = {};
globalThis.LitCI.network = network;
globalThis.LitCI.debug = debug;
globalThis.LitCI.sevAttestation = checkSevAttestation;
globalThis.LitCI.CONTROLLER_AUTHSIG = authSig;
globalThis.LitCI.CONTROLLER_AUTHSIG_2 = LITCONFIG.CONTROLLER_AUTHSIG_2;


globalThis.LitCI.PKP_INFO = {};
globalThis.LitCI.PKP_INFO.publicKey = LITCONFIG.PKP_PUBKEY;

let contractClient = new LitContracts({
  signer: wallet,
  debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
  network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
});
await contractClient.connect();
  
let res = await contractClient.pkpNftContractUtils.write.mint();
globalThis.LitCI.PKP_INFO = res.pkp;


// ==================== Success ====================
export { client };
