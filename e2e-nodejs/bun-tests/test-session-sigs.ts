// Test command: bun run ./e2e-nodejs/bun-tests/test-session-sigs.ts
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { ENV, devEnv } from './setup/env-setup';
import { getAuthNeededCallback } from './auth-needed-callback';
import * as ethers from 'ethers';
import { SiweMessage } from 'siwe';

const {
  litNodeClient,
  litContractsClient,
  hotWallet,
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

const testExecuteJsWithHotWalletAuthSig = async () => {
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


// -- get session sigs for the hot wallet
const testGetHotWalletSessionSigs = async () => {
  const resourceAbilityRequests = [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },

  ];

  const hotWalletAuthNeededCallback = async ({ resources, expiration, uri }) => {

    const nonce = await litNodeClient.getLatestBlockhash();

    const message = new SiweMessage({
      domain: 'localhost',
      address: hotWallet.address,
      statement: 'This is a test statement.  You can put anything you want here.',
      uri,
      version: '1',
      chainId: 1,
      expirationTime: expiration,
      resources,
      nonce,
    })

    const toSign = message.prepareMessage();
    const signature = await hotWallet.signMessage(toSign);

    const authSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: hotWallet.address,
    };

    return authSig;
  }

  const sessionSigs = await litNodeClient.getSessionSigs({
    chain: 'ethereum',
    resourceAbilityRequests,
    authNeededCallback: hotWalletAuthNeededCallback as any,
  });

  console.log('sessionSigs:', sessionSigs);

  const runWithSessionSigs = await litNodeClient.executeJs({
    sessionSigs,
    code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
    jsParams: {
      dataToSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
      publicKey: hotWalletOwnedPkp.publicKey,
    },
  });

  console.log('runWithSessionSigs:', runWithSessionSigs);
}

// await testExecuteJsWithHotWalletAuthSig();
await testGetHotWalletSessionSigs();
// process.exit();

// const authNeededCallback = async (params) => {

//   console.log("params:", params);

//   // write the params to local file
//   const fs = require('fs');
//   fs.writeFileSync('./e2e-nodejs/bun-tests/logs/auth-needed-callback-params.json', JSON.stringify(params, null, 2));

//   const response = await litNodeClient.signSessionKey({
//     // sessionKey: params.sessionKeyPair,
//     sessionKeyUri: params.sessionKeyUri,
//     statement: params.statement,
//     authMethods: [hotWalletAuthMethod],
//     pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
//     expiration: params.expiration,
//     resources: params.resources,
//     chainId: 1,
//     resourceAbilityRequests: resourceAbilityRequests,
//   });
//   return response.authSig;
// };

// const sessionSigs = await litNodeClient.getSessionSigs({
//   pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
//   chain: 'ethereum',
//   resourceAbilityRequests,
//   authNeededCallback: authNeededCallback,
//   capacityDelegationAuthSig,
// });

// console.log('sessionSigs:', sessionSigs);

// // -- execute js
// const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

// const res = await litNodeClient.executeJs({
//   sessionSigs,
//   code: `(async() => {
//     console.log("Testing!");
//   })()`,
//   jsParams: {},
// });

// console.log('res:', res);

process.exit();
