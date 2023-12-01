import { LitNodeClient } from '@lit-protocol/lit-node-client';
import LITCONFIG from '../lit.config.json' assert { type: 'json' };
import { fail } from '../tools/scripts/utils.mjs';
import {LitContracts} from "@lit-protocol/contracts-sdk";
import {ethers} from "ethers";

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

globalThis.LitCI = {};
globalThis.LitCI.network = network;
globalThis.LitCI.debug = debug;
globalThis.LitCI.sevAttestation = checkSevAttestation;


// todo: fund the wallet with cayenne token contract tokens
// right now we are using a pkp preminted on cayenne
// but for internalDev, the pkp will be JIT created
if (network === 'cayenne') {
  globalThis.LitCI.PKP_INFO = {};
  globalThis.LitCI.PKP_INFO.publicKey = LITCONFIG.PKP_PUBKEY;
  globalThis.LitCI.CONTROLLER_AUTHSIG = LITCONFIG.CONTROLLER_AUTHSIG;
  globalThis.LitCI.CONTROLLER_AUTHSIG_2 = LITCONFIG.CONTROLLER_AUTHSIG_2;
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );
  let contractClient = new LitContracts({
    signer: new ethers.Wallet(LITCONFIG.CONTROLLER_PRIVATE_KEY, provider),
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork, 
  });
  await contractClient.connect();
  let tokenId = await contractClient.pkpPermissionsContract.read.getTokenIdsForAuthMethod(
    1,
    ethers.utils.keccak256(`${globalThis.LitCI.CONTROLLER_AUTHSIG_2.address}:lit`)
  );

  let pubKey = await contractClient.pkpPermissionsContract.read.getPubkey(tokenId);
  globalThis.LitCI.PKP_INFO.publicKey2 = pubKey;
} else if (network === 'internalDev') {
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );
  
  let contractClient = new LitContracts({
    signer: new ethers.Wallet(LITCONFIG.CONTROLLER_PRIVATE_KEY, provider),
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });
  await contractClient.connect();
  
  let res = await contractClient.pkpNftContractUtils.write.mint();
  globalThis.LitCI.PKP_INFO = res.pkp;
  globalThis.LitCI.CONTROLLER_AUTHSIG = LITCONFIG.CONTROLLER_AUTHSIG;
}

// ==================== Success ====================
export { client };
