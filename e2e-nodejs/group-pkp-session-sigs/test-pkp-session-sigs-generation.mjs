import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import {
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import {
  EthWalletProvider,
  LitAuthClient,
} from '@lit-protocol/lit-auth-client';
import { AuthMethodType, ProviderType } from '@lit-protocol/constants';

export async function main() {
  // ==================== Setup ====================
  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
    },
    version: 'V3',
    litNodeClient: client,
  });

  const authProvider = litAuthClient.initProvider(ProviderType.EthWallet);

  const authMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(LITCONFIG.CONTROLLER_AUTHSIG),
  };

  console.log('authMethod', authMethod);

  const sessionSigs = await authProvider?.getSessionSigs({
    pkpPublicKey: `0x${LITCONFIG.PKP_PUBKEY}`,
    authMethod,
    sessionSigsParams: {
      chain: 'ethereum',
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource('*'),
          ability: LitAbility.PKPSigning,
        },
      ],
    },
  });

  console.log("sessionSigs:", sessionSigs);

  // ==================== Test Logic ====================
  // const res = await client.executeJs({
  //   authSig: LITCONFIG.CONTROLLER_AUTHSIG,
  //   code: `(async () => {
  //     console.log('hello world')
  //   })();`,
  //   jsParams: {
  //     publicKey: LITCONFIG.PKP_PUBKEY,
  //   },
  // });

  // ==================== Post-Validation ====================
  // if (!res.logs.includes('hello world')) {
  //   return fail('lit action client should be ready');
  // }
  // if (!res.success) {
  //   return fail('response should be success');
  // }
  // ==================== Success ====================
  return success('it should generate session sigs');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
