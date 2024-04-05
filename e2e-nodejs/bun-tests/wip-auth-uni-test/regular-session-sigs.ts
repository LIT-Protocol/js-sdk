// Test command: bun run ./e2e-nodejs/bun-tests/regular-session-sigs.ts
import { LitAbility, LitPKPResource } from '@lit-protocol/auth-helpers';
import { ENV, devEnv } from './setup/env-setup';
import { getAuthNeededCallback } from './auth-needed-callback';
import * as ethers from 'ethers';

const {
  litNodeClient,
  litContractsClient,
  hotWalletAuthSig,
  hotWalletAuthMethod,
  hotWalletOwnedPkp,
  lastestBlockhash,
} = await devEnv({
  env: ENV.HABANERO,
  debug: true,
});

const resourceAbilityRequests = [
  {
    resource: new LitPKPResource('*'),
    ability: LitAbility.PKPSigning,
  },
];

const sessionSigs = await litNodeClient.getSessionSigs({
  chain: 'ethereum',
  resourceAbilityRequests,
  authNeededCallback: getAuthNeededCallback({
    litNodeClient,
    authMethod: hotWalletAuthMethod,
    pkp: hotWalletOwnedPkp,
    VALID_LIT_ACTION_CODE: true,
  }) as any,
});

console.log(sessionSigs);

// process.exit();

// -- use pkp sign endpoint
const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

const res = await litNodeClient.pkpSign({
  sessionSigs,
  toSign: TO_SIGN,
  pubKey: hotWalletOwnedPkp.publicKey,
});

console.log(res);

process.exit();
