import path from 'path';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { success, fail, testThese } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';

export async function noAuthContext() {
  // ==================== Test Logic ====================
  try {
    new PKPEthersWallet({
      pkpPubKey: globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey,
      rpc: LITCONFIG.CHRONICLE_RPC,
      litNetwork: globalThis.LitCI.network,
    });
  } catch (e) {
    if (
      e
        .toString()
        .includes(
          'Multiple authentications are defined, can only use one at a time'
        )
    ) {
      return success(
        'It should validate that only no auth context is defined.'
      );
    }
  }

  return fail(
    'Should have thrown an error for having no auth context defined.'
  );
}

export async function authSigAndAuthContext() {
  // ==================== Test Logic ====================
  try {
    new PKPEthersWallet({
      pkpPubKey: globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey,
      rpc: LITCONFIG.CHRONICLE_RPC,
      litNetwork: globalThis.LitCI.network,
      controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
      authContext: {
        client,
        getSessionSigsProps: {
          chain: 'ethereum',
          expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
          resourceAbilityRequests: [],
          authNeededCallback: () => {},
        },
      },
    });
  } catch (e) {
    if (
      e
        .toString()
        .includes(
          'Multiple authentications are defined, can only use one at a time'
        )
    ) {
      return success(
        'It should validate that only one of authSig and authContext is defined.'
      );
    }
  }

  return fail(
    'Should have thrown an error for having both authSig and authContext defined.'
  );
}

export async function sessionSigsAndAuthContext() {
  // ==================== Test Logic ====================
  const sessionKeyPair = client.getSessionKey();
  const resourceAbilities = [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ];
  const authNeededCallback = async (params) => {
    const response = await client.signSessionKey({
      statement: params.statement,
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
    });
    return response.authSig;
  };
  const sessionSigs = await client.getSessionSigs({
    chain: 'ethereum',
    expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
    resourceAbilityRequests: resourceAbilities,
    sessionKey: sessionKeyPair,
    authNeededCallback,
  });
  try {
    new PKPEthersWallet({
      pkpPubKey: globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey,
      rpc: LITCONFIG.CHRONICLE_RPC,
      litNetwork: globalThis.LitCI.network,
      controllerSessionSigs: sessionSigs,
      authContext: {
        client,
        getSessionSigsProps: {
          chain: 'ethereum',
          expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
          resourceAbilityRequests: [],
          authNeededCallback: () => {},
        },
      },
    });
  } catch (e) {
    if (
      e
        .toString()
        .includes(
          'Multiple authentications are defined, can only use one at a time'
        )
    ) {
      return success(
        'It should validate that only one of sessionSigs and authContext is defined.'
      );
    }
  }

  return fail(
    'Should have thrown an error for having both sessionSigs and authContext defined.'
  );
}

await testThese([
  { name: path.basename(import.meta.url), fn: noAuthContext },
  { name: path.basename(import.meta.url), fn: authSigAndAuthContext },
  { name: path.basename(import.meta.url), fn: sessionSigsAndAuthContext },
]);
