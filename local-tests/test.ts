import { LitNodeClient } from '@lit-protocol/lit-node-client';
/**
 * Executes specified tests in the local development environment.
 *
 * Usage:
 * DEBUG=true yarn test:local --filter={testName} --network={network | 'localchain' is default}
 *
 * Parameters:
 * - `--filter={testName}`: Specify the test name to run.
 * - `--network={network}`: Define the blockchain network (default: 'localchain').
 *
 * Example:
 * DEBUG=true yarn test:local --filter=testUserAuthentication --network=testnet
 */

// import { TinnyEnvironment } from './setup/tinny-environment';
// import { runInBand, runTestsParallel } from './setup/tinny-operations';
// import { testExample } from './tests/test-example';
export enum LIT_TESTNET {
  LOCALCHAIN = 'localchain',
  MANZANO = 'manzano',
  CAYENNE = 'cayenne',
}

(async () => {
  let litNodeClient: LitNodeClient;

  console.log('🏃 Running tests...');
  litNodeClient = new LitNodeClient({
    litNetwork: 'manzano',
    checkNodeAttestation: false,
    debug: true,
  });

  await litNodeClient.connect();
})();
