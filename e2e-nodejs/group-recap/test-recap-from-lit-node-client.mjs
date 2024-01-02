// This test requires LOAD_ENV=false implementation at
// loader.mjs
// const loadEnv = process.env.LOAD_ENV === 'false' ? false : LITCONFIG.TEST_ENV.loadEnv;
// if (loadEnv) { ... }
// Usage: LOAD_ENV=false yarn test:e2e:nodejs --filter=test-recap-from-lit-node-client

import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
// import { client } from '../00-setup.mjs';
import { RecapSessionCapabilityObject } from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { hashResourceIdForSigning } from '@lit-protocol/access-control-conditions';
import {
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';

export async function main() {
  // ==================== Setup ====================

  const mockAuthSig = {
    sig: '0x137b66529678d1fc58ab5b340ad036082af5b9912f823ba22c2851b8f50990a666ad8f2ab2328e8c94414c0a870163743bde91a5f96e9f967fd45d5e0c17c3911b',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage:
      'localhost wants you to sign in with your Ethereum account:\n0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37\n\nTESTING TESTING 123\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: eoeo0dsvyLL2gcHsC\nIssued At: 2023-11-17T15:04:20.324Z\nExpiration Time: 2215-07-14T15:04:20.323Z',
    address: '0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37',
  };

  // const att = {
  //   someResource: {
  //     'lit-ratelimitincrease/1337': [{}],
  //   },
  // };

  const path = '/bglyaysu8rvblxlk7x0ksn';

  let resourceId = {
    baseUrl: 'my-dynamic-content-server.com',
    path,
    orgId: '',
    role: '',
    extraData: '',
  };

  let hashedResourceId = await hashResourceIdForSigning(resourceId);

  const litResource = new LitAccessControlConditionResource(hashedResourceId);
  const litResources = [litResource];

  const recapObject =
    await LitNodeClient.generateSessionCapabilityObjectWithWildcards(
      litResources,
      mockAuthSig
    );

  const expectedResult = 'QmQiy7M88uboUkSF68Hv73NWL8dnrbMNZmbstVVi3UVrgM';

  // ==================== Test Logic ====================
  if (recapObject.proofs[0] !== expectedResult) {
    return fail(
      `Failed to get proof from Recap Session Capability, it should be ${expectedResult} but is ${recapObject.proofs[0]}`
    );
  }

  // ==================== Post-Validation ====================
  // if (proof === expectedResult) {
  //   return success(
  //     `Recap Session Capability has proof at index 0 of ${expectedResult}`
  //   );
  // }

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
