// This file is a WIP test demo for auth unification. In this change, the only time we will create an authSig is to use it to generate session sigs
// client side. Anything server side, we will no longer accpet authSig.

import { LitContractContext } from "@lit-protocol/types";
import { networkContext } from "./network-context";
import {
  LitNodeClient,
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/lit-node-client';

// ----- Test Configuration -----
const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// ----- Command to test this script -----
// bun ./e2e-nodejs/group-auth-unification/test-auth-unification.ts

// ----- Test Script -----

const litNodeClient = new LitNodeClient({
  litNetwork: 'custom',
  bootstrapUrls: [
    'http://127.0.0.1:7470',
    'http://127.0.0.1:7471',
    'http://127.0.0.1:7472',
  ],
  rpcUrl: 'http://127.0.0.1:8545',
  debug: true,
  checkNodeAttestation: false,  // disable node attestation check for local testing
  contractContext: networkContext as unknown as LitContractContext,
});

await litNodeClient.connect();
process.exit();