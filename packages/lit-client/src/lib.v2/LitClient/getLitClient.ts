// import { InitError } from '@lit-protocol/constants'; // Removed
import { RawHandshakeResponse } from '@lit-protocol/lit-node-client';
import type { ResolvedHandshakeResponse } from '@lit-protocol/lit-node-client';
// import * as LitNodeApi from '@lit-protocol/lit-node-client'; // Removed
// import { resolveHandshakeResponse } from '@lit-protocol/lit-node-client'; // Removed
import type { NagaDevModule } from '@lit-protocol/networks';
import { LitNetworkModule } from './type';
import {
  orchestrateHandshake,
  OrchestrateHandshakeResponse,
} from './orchestrateHandshake';

export const getLitClient = async ({
  network,
}: {
  network: LitNetworkModule;
}) => {
  // renaming it to make it clearer that this is the network module
  const networkModule = network;

  // client context
  // const clientContext = {
  //   getThreshold: () => {
  //     return;
  //   },
  // };

  // ❗️ NOTE: There should be better type inference somewhere to handle different network modules
  // handle datil network module
  if (networkModule.id === 'datil') {
    throw new Error('Datil is not supported yet');
  }

  // handle naga network module
  const nagaNetworkModule = networkModule as NagaDevModule;
  const networkStateManager = await nagaNetworkModule.getStateManager({
    // so whenever there's a new state detected, it will orchestrate a handshake and update the connection info
    callback: orchestrateHandshake,
    networkModule: nagaNetworkModule,
  });

  const handshakeResult = networkStateManager.getCallbackResult();

  return {
    disconnect: networkStateManager.stop,
  };
};

export type LitClientType = Awaited<ReturnType<typeof getLitClient>>;
