import { LitNodeClient, uint8arrayFromString } from '@lit-protocol/lit-node-client';
import LITCONFIG from '../lit.config.json' assert { type: 'json' };
import { fail, formatNxLikeLine } from '../tools/scripts/utils.mjs';
import {LitContracts} from "@lit-protocol/contracts-sdk";
import {ethers} from "ethers";
import * as siwe from 'siwe';

const client = new LitNodeClient({
  litNetwork: globalThis.LitCI.network,
  debug: globalThis.LitCI.debug,
  minNodeCount: globalThis.LitCI.minNodeCount,
  checkNodeAttestation: globalThis.LitCI.sevAttestation
});
await client.connect();

// ==================== Validation ====================
if (client.ready !== true) {
  fail('client not ready');
}

if (LITCONFIG.CONTROLLER_AUTHSIG === undefined) {
  fail('Controller authSig cannot be empty');
}

// ==================== Success ====================
export { client };
