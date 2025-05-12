// // Export our top-level consumer API and types for consumers of the entire lit-client package
// // export `getLitClient({network, authManager, options? })` => { ...api }
// interface LitClientConfig {
//   network: 'naga-dev';
//   // authManager: ReturnType<typeof LitAuth.getAuthManager>;
// }

import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitNetworkModule } from '@lit-protocol/networks';
import { LitNagaNetworkModule } from 'packages/networks/src/networks/vNaga/LitNagaNetworkModule';

/**
 * @deprecated - this is currently just a wrapper of Lit Node Client and exposes a set of methods
 * that are required by the auth package. This will be refactored VERY SOON.
 */
export const getLitClient = async ({
  network,
}: // networkModule,
  {
    network: LitNetworkModule;
    // networkModule: ReturnType<typeof getLitNetworkModule>
  }) => {
  // 1. use the networkModule
  let _networkModule = network;


  // ❗️ NOTE: There should be better type inference somewhere to handle different network modules
  // handle datil network module
  if (_networkModule.id === 'datil') {
    throw new Error('Datil is not supported yet');
  }

  // handle naga network module
  const nagaNetworkModule = _networkModule as LitNagaNetworkModule;

  console.log(_networkModule);

  const connectionInfo = await nagaNetworkModule.getConnectionInfo();

  console.log("connection:", connectionInfo)

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

  return {
    // getLatestBlockhash: litNodeClient.getLatestBlockhash,
    // // @ts-expect-error - will be fixed soon as this value will be provided by the LitNetwork
    // getCurrentEpoch: async () => litNodeClient.currentEpochNumber ?? 0,
    // getSignSessionKey: litNodeClient.v2.signPKPSessionKey,
    // /**
    //  * @deprecated - This will be renamed to `getUrls` soon as max prices is only for Naga, but we also need to support
    //  * Datil.
    //  */
    // getMaxPricesForNodeProduct: litNodeClient.getMaxPricesForNodeProduct,
  };
};

export type LitClientType = Awaited<ReturnType<typeof getLitClient>>;
