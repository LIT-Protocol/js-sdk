import type {
  ConnectionInfo,
  LitNetworkModule,
  NagaDevModule,
} from '@lit-protocol/networks';
import { z } from 'zod';
import {
  NodeSignResponse,
  processBatchRequests,
  RequestItem,
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
      params: z.infer<typeof networkModule.api.pkpSign.schema>
    ) => {
      const PRODUCT_NAME = 'SIGN';

      // 1. create a request array
      const _requestArray = await networkModule.api.pkpSign.createRequest({
        pricingContext: {
          product: PRODUCT_NAME,
          userMaxPrice: params.userMaxPrice,
          nodePrices: connectionInfo.priceFeedInfo.networkPrices,
          threshold: handshakeResult.threshold,
        },
        authContext: params.authContext,
        signingContext: {
          pubKey: params.pubKey,
          toSign: params.toSign,
        },
        connectionInfo,
        version: networkModule.version,
      });

      console.log('🔄 _requestArray to be sent to nodes:', _requestArray);

      if (!_requestArray || _requestArray.length === 0) {
        console.error('No requests generated for pkpSign.');
        // Or throw an error, or return a specific error structure
        throw new Error('Failed to generate requests for pkpSign.');
      }

      // 2. send the requests to nodes using the new helper
      const batchRequestId = _requestArray[0].requestId; // Assuming all requests in batch share an ID
      const minSuccessCount = handshakeResult.threshold;

      console.log(
        `Processing batch ${batchRequestId} with ${minSuccessCount} minimum successes.`
      );

      const result = await processBatchRequests<NodeSignResponse>(
        _requestArray as RequestItem[], // Cast to the expected RequestItem type
        batchRequestId,
        minSuccessCount
      );

      console.log('📦 Batch processing result:', result);

      if (result.success) {
        // Handle successful signing aggregation if needed.
        // For now, just returning the array of successful node responses.
        // You might need to further process `result.values` to get a single combined signature.
        console.log('✅ PKP Sign batch successful:', result.values);
        return { success: true, responses: result.values }; // Example success return
      } else {
        // Handle error from batch processing
        console.error('🚨 PKP Sign batch failed:', result.error);
        // Propagate the error or return a structured error response
        throw result.error; // Or return { success: false, error: result.error };
      }
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
