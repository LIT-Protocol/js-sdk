import { log } from '@lit-protocol/misc';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import * as networkContextData from './networkContext.example.json';

let litNetwork = process.env['NETWORK'] as TESTABLE_NETWORK_TYPE;
const debug = process.env['DEBUG'] === 'true' ? true : false;

export type TESTABLE_NETWORK_TYPE =
  | 'habanero'
  | 'manzano'
  | 'cayenne'
  | 'custom';

export interface DevEnv {
  network: TESTABLE_NETWORK_TYPE;
  litNodeClient: LitNodeClient;
}

export const devEnv = async (params?: {
  network?: TESTABLE_NETWORK_TYPE;
}): Promise<DevEnv> => {
  /**
   * ====================================
   * Setting up Lit Node Client
   * ====================================
   */
  log('🧪 [env-setup.ts] Starting devEnv');
  let litNodeClient: LitNodeClient;

  litNetwork = params?.network || litNetwork;

  if (litNetwork === 'custom') {
    litNodeClient = new LitNodeClient({
      litNetwork: 'custom',
      bootstrapUrls: [
        'http://127.0.0.1:7470',
        'http://127.0.0.1:7471',
        'http://127.0.0.1:7472',
      ],
      debug,
      checkNodeAttestation: false,
      networkContext: networkContextData,
    });
  } else if (litNetwork === 'manzano' || litNetwork === 'habanero') {
    litNodeClient = new LitNodeClient({
      litNetwork,
      debug,
      checkNodeAttestation: true,
    });
  } else {
    litNodeClient = new LitNodeClient({
      litNetwork: 'cayenne',
      debug,
      checkNodeAttestation: false,
    });
  }

  await litNodeClient.connect();

  return {
    network: litNetwork,
    litNodeClient,
  };
};
