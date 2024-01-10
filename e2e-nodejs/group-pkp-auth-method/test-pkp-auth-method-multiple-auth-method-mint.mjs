import { client } from '../00-setup.mjs';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { AuthMethodType } from '@lit-protocol/constants';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import path from 'path';
import { LitContracts } from '@lit-protocol/contracts-sdk';

export async function main() {
  const authMethod1 = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(globalThis.LitCI.CONTROLLER_AUTHSIG),
  };

  const authMethod2 = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(LITCONFIG.CONTROLLER_AUTHSIG_2),
  };

  let authClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: 'aasdasdasdasd',
    },
    litNodeClient: client,
  });

  let res = await authClient.mintPKPWithAuthMethods(
    [authMethod1, authMethod2],
    {
      pkpPermissionScopes: [[1], [1]],
      sendPkpToitself: true,
      addPkpEthAddressAsPermittedAddress: true,
    }
  );

  if (typeof res != 'object') {
    fail('Type of mint response is not of type string');
  }

  const authNeededCallback = async (params) => {
    const response = await client.signSessionKey({
      sessionKey: params.sessionKeyPair,
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

  const resourceAbilities = [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.PKPSigning,
    },
  ];

  // ==================== Test Logic ====================

  const sessionSigs = await client.getSessionSigs({
    chain: 'ethereum',
    expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
    resourceAbilityRequests: resourceAbilities,
    authNeededCallback,
  });

  console.log(sessionSigs);

  if (!sessionSigs) {
    fail('session signatures have not been signed');
  }

  if (Object.keys(sessionSigs).length < client.config.minNodeCount) {
    fail('Session key map is not at least the same as the node threshold.')
  }

  return success('mint returned type of string with multiple auth methods');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
