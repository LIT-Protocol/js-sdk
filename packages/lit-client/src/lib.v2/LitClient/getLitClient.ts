import type {
  ConnectionInfo,
  LitNetworkModule,
  NagaDevModule,
} from '@lit-protocol/networks';
import { orchestrateHandshake } from './orchestrateHandshake';
import { JsonPkpSignSdkParams } from '@lit-protocol/types';
import { createRequestId } from '@lit-protocol/lit-node-client';
import { PRODUCT_IDS } from '@lit-protocol/constants';
import { z } from 'zod';
import { Bytes32Schema, HexPrefixedSchema } from '@lit-protocol/schemas';
// import { LitNetworkModule } from './type';

export const getLitClient = async ({
  network,
}: {
  network: LitNetworkModule;
}) => {
  // renaming it to make it clearer that this is the network module
  // const networkModule = network;

  // ❗️ NOTE: There should be better type inference somewhere to handle different network modules
  // handle datil network module
  if (network.id === 'datil') {
    throw new Error('Datil is not supported yet');
  }

  // -------------------- Naga Network Module --------------------
  const _networkModule = network as NagaDevModule;
  const _stateManager = await _networkModule.getStateManager<
    Awaited<ReturnType<typeof orchestrateHandshake>>,
    NagaDevModule
  >({
    // so whenever there's a new state detected, it will orchestrate a handshake and update the connection info
    callback: orchestrateHandshake,
    networkModule: network,
  });

  // This is essnetially the result from orchestrateHandshake
  const handshakeResult = _stateManager.getCallbackResult();
  const connectionInfo =
    _stateManager.getLatestConnectionInfo() as ConnectionInfo;
  console.log('connectionInfo', connectionInfo);

  return {
    disconnect: _stateManager.stop,
    connectionInfo,
    latestBlockhash: await _stateManager.getLatestBlockhash(),
    pkpSign: async (
      params: z.infer<typeof _networkModule.api.pkpSign.schema>
    ) => {
      // const _requestId = createRequestId();
      // const _latestBlockhash = await _stateManager.getLatestBlockhash();
      const _request = await _networkModule.api.pkpSign.createRequest({
        pricingContext: {
          product: 'SIGN',
          userMaxPrice: params.userMaxPrice,
          nodePrices: connectionInfo.priceFeedInfo.networkPrices,
          threshold: handshakeResult!.threshold,
        },
        authContext: params.authContext,
        signingContext: {
          pubKey: HexPrefixedSchema.parse(params.pubKey),
          toSign: Bytes32Schema.parse(params.toSign),
        },
        // latestBlockhash: _latestBlockhash,
      });

      console.log('🔄 _request', _request);
    },
  };
};

export type LitClientType = Awaited<ReturnType<typeof getLitClient>>;
