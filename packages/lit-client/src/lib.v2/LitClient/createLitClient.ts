import type {
  ConnectionInfo,
  LitNetworkModule,
  NagaDevModule,
} from '@lit-protocol/networks';
import { z } from 'zod';
import { dispatchRequests } from './helper/handleNodePromises';
import { orchestrateHandshake } from './orchestrateHandshake';

type AnyNetworkModule = NagaNetworkModule | DatilNetworkModule;

// ❗️ NOTE: There should be better type inference somewhere to handle different network modules
// handle datil network module
export const createLitClient = async ({
  network,
}: {
  network: AnyNetworkModule;
}) => {
  switch (network.id) {
    // -- (v8) Naga Network Module
    case 'naga':
      return _createNagaLitClient(network);

    // -- (v7) Datil Network Module
    case 'datil':
      return _createDatilLitClient();
    default:
      throw new Error(`Network module ${network.id} not supported`);
  }
};

/**
 * This is the default network type used for all Naga environments (v8)
 */
type NagaNetworkModule = NagaDevModule;

export const _createNagaLitClient = async (
  networkModule: NagaNetworkModule
) => {
  const _stateManager = await networkModule.createStateManager<
    Awaited<ReturnType<typeof orchestrateHandshake>>,
    NagaNetworkModule
  >({
    // so whenever there's a new state detected, it will orchestrate a handshake and update the connection info
    callback: orchestrateHandshake,
    networkModule,
  });

  // ❗️ NOTE: handshakeResult is no longer stored here directly.
  // It will be fetched from _stateManager inside functions that need it.

  // const connectionInfo =
  //   _stateManager.getLatestConnectionInfo() as ConnectionInfo;

  // Initial check to ensure handshakeResult is available after setup
  if (!_stateManager.getCallbackResult()) {
    throw new Error(
      'Initial handshake result is not available from state manager. LitClient cannot be initialized.'
    );
  }

  return {
    // This function is likely be used by another module to get the current context, eg. auth manager
    getContext: async () => {
      return {
        latestBlockhash: await _stateManager.getLatestBlockhash(),

        // only adding what is required by other modules for now.
        // connectionInfo: _stateManager.getLatestConnectionInfo(),
      };
    },
    disconnect: _stateManager.stop,
    mintPkp: networkModule.chainApi.mintPkp,
    pkpSign: async (
      params: z.infer<typeof networkModule.api.pkpSign.schemas.Input>
    ) => {
      // -- get the fresh handshake results
      const currentHandshakeResult = _stateManager.getCallbackResult();
      const currentConnectionInfo = _stateManager.getLatestConnectionInfo();

      if (!currentHandshakeResult) {
        throw new Error(
          'Handshake result is not available from state manager at the time of pkpSign.'
        );
      }

      // 1. This is where the orchestration begins — we delegate the creation of the
      // request array to the `networkModule`. It encapsulates logic specific to the
      // active network (e.g., pricing, thresholds, metadata) and returns a set of
      // structured requests ready to be dispatched to the nodes.
      const requestArray = await networkModule.api.pkpSign.createRequest({
        pricingContext: {
          product: 'SIGN',
          userMaxPrice: params.userMaxPrice,
          nodePrices: currentConnectionInfo.priceFeedInfo.networkPrices,
          threshold: currentHandshakeResult.threshold,
        },
        authContext: params.authContext,
        signingContext: {
          pubKey: params.pubKey,
          toSign: params.toSign,
          signingScheme: params.signingScheme,
        },
        connectionInfo: currentConnectionInfo,
        version: networkModule.version,
      });

      const requestId = requestArray[0].requestId;

      // 2. With the request array prepared, we now coordinate the parallel execution
      // across multiple nodes. This step handles batching, minimum threshold success
      // tracking, and error tolerance. The orchestration layer ensures enough valid
      // responses are collected before proceeding.
      const result = await dispatchRequests<
        z.infer<typeof networkModule.api.pkpSign.schemas.RequestData>,
        z.infer<typeof networkModule.api.pkpSign.schemas.ResponseData>
      >(requestArray, requestId, currentHandshakeResult.threshold);

      // 3. Once node responses are received and validated, we delegate final
      // interpretation and formatting of the result back to the `networkModule`.
      // This allows the module to apply network-specific logic such as decoding,
      // formatting, or transforming the response into a usable signature object.
      return await networkModule.api.pkpSign.handleResponse(result, requestId);
    },
  };
};

/**
 * This is the default network type used for all Datil environments (v7)
 */
type DatilNetworkModule = LitNetworkModule;

export const _createDatilLitClient = async () => {
  throw new Error('Datil is not supported yet');
};

export type LitClientType = Awaited<ReturnType<typeof createLitClient>>;
