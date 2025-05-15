import type {
  ConnectionInfo,
  LitNetworkModule,
  NagaDevModule,
} from '@lit-protocol/networks';
import { Bytes32Schema, HexPrefixedSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { orchestrateHandshake } from './orchestrateHandshake';
// import { LitNetworkModule } from './type';
import * as LitNodeApi from '@lit-protocol/lit-node-client';
import { nagaDevModule } from 'packages/networks/src/networks/vNaga/envs/naga-dev/naga-dev.module';
import { ExpectedAccountOrWalletClient } from 'packages/networks/src/networks/vNaga/LitChainClient/contract-manager/createContractsManager';

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
    mintPkp: nagaDevModule.chainApi.mintPkp,
    latestBlockhash: await _stateManager.getLatestBlockhash(),
    pkpSign: async (
      params: z.infer<typeof _networkModule.api.pkpSign.schema>
    ) => {
      // 1. create a request
      const _request = await _networkModule.api.pkpSign.createRequest({
        pricingContext: {
          product: 'SIGN',
          userMaxPrice: params.userMaxPrice,
          nodePrices: connectionInfo.priceFeedInfo.networkPrices,
          threshold: handshakeResult!.threshold,
        },
        authContext: params.authContext,
        signingContext: {
          // pubKey: HexPrefixedSchema.parse(params.pubKey),
          // toSign: Bytes32Schema.parse(params.toSign),
          pubKey: params.pubKey,
          toSign: params.toSign,
        },
        connectionInfo,
        version: nagaDevModule.version,
      });

      console.log('🔄 _request', _request);

      // 2. send the request
      const res1 = await LitNodeApi.sendNodeRequest(_request[0]);

      console.log('🔄 res1', res1);
    },
  };
};

export type LitClientType = Awaited<ReturnType<typeof getLitClient>>;
