// Test command: bun run ./e2e-nodejs/bun-tests/test-session-sigs.ts
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { ENV, devEnv } from './setup/env-setup';
import { getAuthNeededCallback } from './auth-needed-callback';
import * as ethers from 'ethers';

const {
  litNodeClient,
  litContractsClient,
  hotWalletAuthSig,
  hotWalletAuthMethod,
  hotWalletOwnedPkp,
  hotWalletAuthMethodOwnedPkp,
  lastestBlockhash,
  capacityTokenId,
  capacityDelegationAuthSig,
} = await devEnv({
  env: ENV.HABANERO,
  debug: true,
});

const testExecuteJs = async () => {
  const TO_SIGN = ethers.utils.arrayify(
    ethers.utils.keccak256([1, 2, 3, 4, 5])
  );

  const runWithAuthSig = await litNodeClient.executeJs({
    authSig: hotWalletAuthSig,
    code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
    jsParams: {
      dataToSign: TO_SIGN,
      publicKey: hotWalletOwnedPkp.publicKey,
    },
  });

  console.log('runWithAuthSig:', runWithAuthSig);
};

await testExecuteJs();

process.exit();

const resourceAbilityRequests = [
  {
    resource: new LitActionResource('*'),
    ability: LitAbility.LitActionExecution,
  },
];

// -- get session sigs for the hot wallet
const authNeededCallback = async (params) => {
  const response = await litNodeClient.signSessionKey({
    sessionKey: params.sessionKeyPair,
    statement: params.statement,
    authMethods: [hotWalletAuthMethod],
    pkpPublicKey: hotWalletOwnedPkp.publicKey,
    expiration: params.expiration,
    resources: params.resources,
    chainId: 1,
    resourceAbilityRequests: resourceAbilityRequests,
  });
  return response.authSig;
};

const sessionSigs = await litNodeClient.getSessionSigs({
  pkpPublicKey: hotWalletOwnedPkp.publicKey,
  chain: 'ethereum',
  resourceAbilityRequests,
  authNeededCallback: authNeededCallback,
  capacityDelegationAuthSig,
});

console.log('sessionSigs:', sessionSigs);

// -- execute js
const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

const res = await litNodeClient.executeJs({
  sessionSigs,
  code: `(async() => {
    console.log("Testing!");
  })()`,
  jsParams: {},
});

console.log('res:', res);

process.exit();
