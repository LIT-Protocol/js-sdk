import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

export async function main() {
  const authClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: 'abc1234',
    },
    litNodeClient: client,
  });
  switch (client.config.litNetwork) {
    case 'cayenne':
      if (
        authClient.relay.getUrl() !==
        'https://relayer-server-staging-cayenne.getlit.dev'
      ) {
        throw new Error('wrong url for network');
      }
      break;
    case 'habanero':
      if (authClient.relay.getUrl() !== 'https://habanero-relayer.getlit.dev') {
        throw new Error('wrong url for network');
      }
      break;
    case 'manzano':
      if (authClient.relay.getUrl() !== 'https://manzano-relayer.getlit.dev') {
        throw new Error('wrong url for network');
      }
      break;
  }

  console.log('relayUrl', authClient.relay.getUrl());
  return success('should initalize with correct relay url for network');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
