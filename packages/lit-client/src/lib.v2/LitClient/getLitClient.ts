import type {
  ConnectionInfo,
  LitNetworkModule,
  NagaDevModule,
} from '@lit-protocol/networks';
import { z } from 'zod';
import {
  NodeResponse,
  processBatchRequests,
} from './helper/handleNodePromises';
import { orchestrateHandshake } from './orchestrateHandshake';

type AnyNetworkModule = NagaNetworkModule | DatilNetworkModule;

// ❗️ NOTE: There should be better type inference somewhere to handle different network modules
// handle datil network module
export const getLitClient = async ({
  network,
}: {
  network: AnyNetworkModule;
}) => {
  // -- (v8) Naga Network Module
  if (network.id === 'naga') {
    return _getNagaLitClient(network);
  }

  // -- (v7) Datil Network Module
  if (network.id === 'datil') {
    return _getDatilLitClient();
  }

  throw new Error(
    `Network module ${network.id || JSON.stringify(network)} not supported`
  );
};

/**
 * This is the default network type used for all Naga environments (v8)
 */
type NagaNetworkModule = NagaDevModule;

export const _getNagaLitClient = async (networkModule: NagaNetworkModule) => {
  const _stateManager = await networkModule.getStateManager<
    Awaited<ReturnType<typeof orchestrateHandshake>>,
    NagaNetworkModule
  >({
    // so whenever there's a new state detected, it will orchestrate a handshake and update the connection info
    callback: orchestrateHandshake,
    networkModule,
  });

  // This is essnetially the result from orchestrateHandshake
  const handshakeResult = _stateManager.getCallbackResult();
  const connectionInfo =
    _stateManager.getLatestConnectionInfo() as ConnectionInfo;
  console.log('connectionInfo', connectionInfo);

  if (!handshakeResult) {
    throw new Error(
      'Handshake result is not available from state manager. LitClient cannot be initialized.'
    );
  }

  return {
    disconnect: _stateManager.stop,
    connectionInfo,
    mintPkp: networkModule.chainApi.mintPkp,
    latestBlockhash: await _stateManager.getLatestBlockhash(),
    pkpSign: async (
      params: z.infer<typeof networkModule.api.pkpSign.schemas.Input>
    ) => {
      // 1. create a request array
      const requestArray = await networkModule.api.pkpSign.createRequest({
        pricingContext: {
          product: 'SIGN',
          userMaxPrice: params.userMaxPrice,
          nodePrices: connectionInfo.priceFeedInfo.networkPrices,
          threshold: handshakeResult.threshold,
        },
        authContext: params.authContext,
        signingContext: {
          pubKey: params.pubKey,
          toSign: params.toSign,
          signingScheme: params.signingScheme,
        },
        connectionInfo,
        version: networkModule.version,
      });

      const requestId = requestArray[0].requestId;

      // 2. send the requests to nodes using the new helper
      const result = await processBatchRequests<
        z.infer<typeof networkModule.api.pkpSign.schemas.RequestData>,
        any
      >(requestArray, requestId, handshakeResult.threshold);

      // 3. ask the network module to handle the result
      return await networkModule.api.pkpSign.handleResponse(result, requestId);
    },
  };
};

/**
 * This is the default network type used for all Datil environments (v7)
 */
type DatilNetworkModule = LitNetworkModule;

export const _getDatilLitClient = async () => {
  throw new Error('Datil is not supported yet');
};

export type LitClientType = Awaited<ReturnType<typeof getLitClient>>;
