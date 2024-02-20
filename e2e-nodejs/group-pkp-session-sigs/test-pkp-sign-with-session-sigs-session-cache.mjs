import path from 'path';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { ethers } from 'ethers';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';

// NOTE: you need to hash data before you send it in.
// If you send something that isn't 32 bytes, the nodes will return an error.
// PKPEthersWallet::signMessage does this for you before passing it to the lit client.
const message = [1, 2, 3, 4, 5];
// const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256(message));

export async function main() {
  // ==================== Setup ====================
  const resourceAbilities = [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
      // ability: LitAbility.PKPSigning,
    },
  ];

  const authNeededCallback = async (params) => {
    const response = await client.signSessionKey({
      statement: params.statement,
      // authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
      authMethods: [
        {
          authMethodType: 1,
          accessToken: JSON.stringify(globalThis.LitCI.CONTROLLER_AUTHSIG),
        },
      ],
      pkpPublicKey: `0x${globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey}`,
      expiration: params.expiration,
      resources: params.resources,
      chainId: 1,
      resourceAbilityRequests: resourceAbilities,
    });
    return response.authSig;
  };

  // ==================== Test Logic ====================

  // const sessionSigs = await client.getSessionSigs({
  //   chain: 'ethereum',
  //   expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
  //   resourceAbilityRequests: resourceAbilities,
  //   sessionKey: sessionKeyPair,
  //   authNeededCallback,
  // });

  // console.log('sessionSigs:', sessionSigs);

  // const pkpSignRes = await client?.pkpSign({
  //   toSign: TO_SIGN,
  //   pubKey: globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey,
  //   sessionSigs: sessionSigs,
  // });
  // console.log(`====================== ${JSON.stringify(pkpSignRes)}`);

  const pkpWallet = new PKPEthersWallet({
    pkpPubKey: globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey,
    rpc: LITCONFIG.CHRONICLE_RPC,
    litNetwork: globalThis.LitCI.network,
    authContext: {
      client,
      getSessionSigsProps: {
        chain: 'ethereum',
        expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
        resourceAbilityRequests: resourceAbilities,
        authNeededCallback,
      },
    },
  });
  await pkpWallet.init();

  const signature = await pkpWallet.signMessage(message);

  // ==================== Post-Validation ====================

  if (!signature) {
    return fail('Failed to sign data with sessionSigs generated previously');
  }

  // ==================== Success ====================
  return success(
    `it should get sessionSigs on demand from client and sign data with it`
  );
}
await testThis({ name: path.basename(import.meta.url), fn: main });
