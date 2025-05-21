import type { LitNetworkModule, NagaDevModule } from '@lit-protocol/networks';
import { z } from 'zod';
import { dispatchRequests } from './helper/handleNodePromises';
import { orchestrateHandshake } from './orchestrateHandshake';
import { GoogleAuthenticator, DiscordAuthenticator } from '@lit-protocol/auth';

type AnyNetworkModule = NagaNetworkModule | DatilNetworkModule;

interface GoogleAuthOptions {
  loginServerBaseUrl: string;
  authServerBaseUrl: string;
}

interface DiscordAuthOptions {
  loginServerBaseUrl: string;
  authServerBaseUrl: string;
}

// Create a discriminated union for the parameter object
type MintWithAuthParams =
  | {
      authenticator: typeof GoogleAuthenticator;
      config: GoogleAuthOptions;
    }
  | {
      authenticator: typeof DiscordAuthenticator;
      config: DiscordAuthOptions;
    };

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
    // the reason that this is done via a "callback" is because the "orchestrateHandshake" function is not network-dependent
    // If you want to edit the arguments being passed to the callback, ou can edit in the 'createStateManager.ts' funtion
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

  async function _pkpSign(
    params: z.infer<typeof networkModule.api.pkpSign.schemas.Input.raw>
  ) {
    console.log(`🔥 signing on ${params.chain} with ${params.signingScheme}`);

    // -- get the fresh handshake results
    const currentHandshakeResult = _stateManager.getCallbackResult();
    const currentConnectionInfo = _stateManager.getLatestConnectionInfo();

    if (!currentHandshakeResult || !currentConnectionInfo) {
      throw new Error(
        'Handshake result is not available from state manager at the time of pkpSign.'
      );
    }

    // 1. This is where the orchestration begins — we delegate the creation of the
    // request array to the `networkModule`. It encapsulates logic specific to the
    // active network (e.g., pricing, thresholds, metadata) and returns a set of
    // structured requests ready to be dispatched to the nodes.
    const requestArray = await networkModule.api.pkpSign.createRequest({
      // add chain context (btc, eth, cosmos, solana)
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
      chain: params.chain,
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
  }

  return {
    // This function is likely be used by another module to get the current context, eg. auth manager
    // only adding what is required by other modules for now.
    // maybe you will need connectionInfo: _stateManager.getLatestConnectionInfo(),
    getContext: async () => {
      return {
        latestBlockhash: await _stateManager.getLatestBlockhash(),
        currentEpoch: _stateManager.getLatestConnectionInfo(),
      };
    },
    disconnect: _stateManager.stop,
    mintPkp: networkModule.chainApi.mintPkp,
    mintWithAuth: async (params: MintWithAuthParams) => {
      // This is social auths
      if ('loginServerBaseUrl' in params.config) {
        const res = await params.authenticator.mintPkp({
          loginServerBaseUrl: params.config.loginServerBaseUrl,
          authServerBaseUrl: params.config.authServerBaseUrl,
        });

        console.log('🔥🔥 res', res);
      }

      // if (
      //   params.authenticator === GoogleAuthenticator &&
      //   'redirectUri' in params.config
      // ) {
      //   // params.opts is now correctly typed as GoogleAuthOptions
      //   console.log('Google Auth Options:', params.config.redirectUri);
      // } else if (
      //   params.authenticator === DiscordAuthenticator &&
      //   'botToken' in params.config
      // ) {
      //   // params.opts is now correctly typed as DiscordAuthOptions
      //   console.log('Discord Auth Options:', params.config.botToken);
      // }
      // // Actual minting logic will go here
      // // Replace Promise<void> with the actual return type of the minting operation
      // return Promise.resolve(); // Placeholder return
    },
    chain: {
      raw: {
        pkpSign: async (
          params: z.infer<typeof networkModule.api.pkpSign.schemas.Input.raw>
        ) => {
          return _pkpSign(params);
        },
      },
      ethereum: {
        pkpSign: async (
          params: z.input<
            typeof networkModule.api.pkpSign.schemas.Input.ethereum
          >
        ) => {
          return _pkpSign(
            networkModule.api.pkpSign.schemas.Input.ethereum.parse(params)
          );
        },
      },
      bitcoin: {
        pkpSign: async (
          params: z.input<
            typeof networkModule.api.pkpSign.schemas.Input.bitcoin
          >
        ) => {
          return _pkpSign(
            networkModule.api.pkpSign.schemas.Input.bitcoin.parse(params)
          );
        },
      },
      // solana: {
      //   pkpSign: async () => {
      //     throw new Error('Solana is not supported yet');
      //   },
      // },
      // cosmos: {
      //   pkpSign: async () => {
      //     throw new Error('Cosmos is not supported yet');
      //   },
      // },
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
