// // Export our top-level consumer API and types for consumers of the entire lit-client package
// // export `getLitClient({network, authManager, options? })` => { ...api }
// interface LitClientConfig {
//   network: 'naga-dev';
//   // authManager: ReturnType<typeof LitAuth.getAuthManager>;
// }

import { LitNodeClient } from '@lit-protocol/lit-node-client';
// import { LitNetworkModule } from '@lit-protocol/networks';
import type { NagaDevModule } from '@lit-protocol/networks';

type LitNetworkModule = NagaDevModule;
// | NagaTestModule
// | NagaProdModule
// | NagaLocalModule
// | DatilDevModule
// | DatilTestModule
// | DatilProdModule
// | DatilLocalModule

/**
 * @deprecated - this is currently just a wrapper of Lit Node Client and exposes a set of methods
 * that are required by the auth package. This will be refactored VERY SOON.
 */
export const getLitClient = async (networkModule: LitNetworkModule) => {
  // ❗️ NOTE: There should be better type inference somewhere to handle different network modules
  // handle datil network module
  if (networkModule.id === 'datil') {
    throw new Error('Datil is not supported yet');
  }

  // handle naga network module
  const nagaNetworkModule = networkModule as NagaDevModule;

  console.log('⭐️ _networkModule:', networkModule);

  // const connectionInfo = await nagaNetworkModule.getConnectionInfo();

  // console.log('⭐️ connection:', connectionInfo);

  const stateManager = await nagaNetworkModule.getStateManager();

  console.log('⭐️ stateManager:', stateManager);

  console.log('⏳ Calling stateManager.getLatestBlockhash()...');
  const latestBlockhash = await stateManager.getLatestBlockhash();
  stateManager.getLatestBootstrapUrls;

  console.log('✅ Received latestBlockhash:', latestBlockhash);

  const connectionInfo = stateManager.getLatestConnectionInfo();

  console.log('⭐️ connectionInfo:', connectionInfo);

  // console.log(await _networkModule.getConnectionInfo())

  // --- all the litNodeClient dependencies we want to remove soon
  // const litNodeClient = new LitNodeClient({
  //   litNetwork: network,
  // });

  // await litNodeClient.connect();
  // const _nodeUrls = await litNodeClient.getMaxPricesForNodeProduct({
  //   product: 'LIT_ACTION',
  // });
  // const _nonce = await litNodeClient.getLatestBlockhash();
  // const _currentEpoch = litNodeClient.currentEpochNumber!;
  // const _signSessionKey = litNodeClient.v2.signPKPSessionKey;

  // const currentEpochNumber = calculateEffectiveEpochNumber(this._epochCache);

  // Expose necessary methods
  // const getLatestBlockhash = stateManager.getLatestBlockhash;

  return {
    // clean up the stateManager
    disconnect: stateManager.stop,
    // getLatestBlockhash, // Expose the stateManager's method
    // Add other required methods here as needed
    // Example placeholder:
    // getCurrentEpoch: async () => { console.warn('getCurrentEpoch not fully implemented yet'); return 0; },
  };
};

export type LitClientType = Awaited<ReturnType<typeof getLitClient>>;
