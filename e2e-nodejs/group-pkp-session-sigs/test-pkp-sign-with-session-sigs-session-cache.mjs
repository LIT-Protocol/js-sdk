import path from 'path';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { ethers } from 'ethers';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { uint8arrayFromString } from '@lit-protocol/uint8arrays';

// NOTE: you need to hash data before you send it in.
// If you send something that isn't 32 bytes, the nodes will return an error.
const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

export async function main() {
  // ==================== Setup ====================
  const sessionKeyPair = client.getSessionKey();
  const authNeededCallback = async (params) => {
    const response = await client.signSessionKey({
      statement: params.statement,
      // authSig: globalThis.LitCI.CONTROLLER_AUTHSIG, // When this is empty or undefined, it will fail
      authMethods: [
        {
          authMethodType: 1,
          accessToken: JSON.stringify(globalThis.LitCI.CONTROLLER_AUTHSIG),
        },
      ],
      pkpPublicKey: `0x${globalThis.LitCI.PKP_INFO.publicKey}`,
      expiration: params.expiration,
      resources: params.resources,
      chainId: 1,
    });
    return response.authSig;
  };

  const resourceAbilities = [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.PKPSigning,
    },
  ];

  // ==================== Test Logic ====================

  const sessionSigs = await client.getSessionSigs({
    chain: 'ethereum',
    // expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
    resourceAbilityRequests: resourceAbilities,
    sessionKey: sessionKeyPair,
    authNeededCallback,
  });

  console.log('sessionSigs:', sessionSigs);

  // const pkpSignRes = await client?.pkpSign({
  //   toSign: TO_SIGN,
  //   pubKey: globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey,
  //   sessionSigs: sessionSigs,
  // });

  const pkpWallet = new PKPEthersWallet({
    pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
    rpc: globalThis.LitCI.CONTROLLER_WALLET.connection.url,
    litNetwork: globalThis.LitCI.network,
    authContext: {
      client,
      getSessionSigsProps: {
        chain: 'ethereum',
        // expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
        resourceAbilityRequests: resourceAbilities,
        sessionKey: sessionKeyPair,
        authNeededCallback,
      },
    },
  });
  await pkpWallet.init();

  const signature = await pkpWallet.signMessage(TO_SIGN);

  // ==================== Post-Validation ====================

  // if (!pkpSignRes) {
  //   return fail(
  //     'Failed to sign data with sessionSigs generated by eth wallet auth method'
  //   );
  // }

  // let missingKeys = [];

  // if (pkpSignRes) {
  //   ['r', 's', 'recid', 'signature', 'publicKey', 'dataSigned'].forEach(
  //     (key) => {
  //       if (pkpSignRes[key] === undefined) {
  //         missingKeys.push(key);
  //       }
  //     }
  //   );
  // }

  // if (missingKeys.length > 0) {
  //   return fail(`Missing keys: ${missingKeys.join(', ')}`);
  // }

  if (!signature) {
    return fail(
      'Failed to sign data with sessionSigs generated by eth wallet auth method'
    );
  }

  // ==================== Success ====================
  return success(
    `it should use sessionSigs generated by eth wallet auth method to sign data. Signature is ${signature} and pkpSignRes is ${JSON.stringify(
      'pkpSignRes'
    )}`
  );
}
await testThis({ name: path.basename(import.meta.url), fn: main });
