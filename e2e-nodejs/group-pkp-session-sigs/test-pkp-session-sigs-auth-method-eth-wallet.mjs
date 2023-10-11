import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import {
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
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

  const sessionKeyPair = client.getSessionKey();

  // ==================== Test Logic ====================
  const sessionSigs = await authProvider?.getSessionSigs({
    pkpPublicKey: `0x${LITCONFIG.PKP_PUBKEY}`,
    authMethod,
    sessionSigsParams: {
      sessionKey: sessionKeyPair,
      chain: 'ethereum',
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource('*'),
          ability: LitAbility.PKPSigning,
        },
      ],
    },
  });

  console.log('sessionSigs:', sessionSigs);

  // ==================== Post-Validation ====================
  // Check if the number of session signatures is less than 3
  if (Object.keys(sessionSigs).length < 3) {
    return fail(
      `Number of session sigs should be at least 3, but received: ${
        Object.keys(sessionSigs).length
      }`
    );
  }

  const oneOfTheSessionSigs = Object.entries(sessionSigs)[0][1];

  // Check if the algorithm used is not 'ed25519'
  if (oneOfTheSessionSigs.algo !== 'ed25519') {
    return fail(
      `algo should be ed25519, but received: ${oneOfTheSessionSigs.algo}`
    );
  }

  // Check if the signed message is not present
  if (!oneOfTheSessionSigs.signedMessage) {
    return fail(`signedMessage should be present`);
  }

  let parsedSignedMessage;

  // Try to parse the signed message, fail if it's not a valid JSON string
  try {
    parsedSignedMessage = JSON.parse(oneOfTheSessionSigs.signedMessage);
  } catch (e) {
    return fail(`signedMessage should be a valid JSON string`);
  }

  // Check if the ability is not 'PKPSigning'
  if (
    parsedSignedMessage.resourceAbilityRequests[0].ability !==
    LitAbility.PKPSigning
  ) {
    return fail(
      `ability should be PKPSigning, but received: ${parsedSignedMessage.resourceAbilityRequests[0].ability}`
    );
  }

  // ==================== Success ====================
  return success(
    'it should generate session sigs using eth wallet auth method'
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
