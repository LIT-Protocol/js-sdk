// 🏓 The general API interaction pattern is as follows:
// 1. 🟩 (LitClient) get the fresh handshake results
// 2. 🟪 (Network Module) Create requests
// 3. 🟩 (LitClient) Dispatch requests
// 4. 🟪 (Network Module) Handle response

import type { LitNetworkModule, NagaDevModule } from '@lit-protocol/networks';
import {
  JsonSignCustomSessionKeyRequestForPkpReturnSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';
import { dispatchRequests } from './helper/handleNodePromises';
import { orchestrateHandshake } from './orchestrateHandshake';
import { getChildLogger } from '@lit-protocol/logger';
import { privateKeyToAccount } from 'viem/accounts';
import { PkpIdentifierRaw } from '@lit-protocol/types';
import { stringToIpfsHash } from './helpers/stringToIpfsHash';
import {
  MintWithCustomAuthRequest,
  MintWithCustomAuthSchema,
} from './schemas/MintWithCustomAuthSchema';
import bs58 from 'bs58';
import { hexToBigInt, keccak256, toBytes, toHex } from 'viem';

const _logger = getChildLogger({
  module: 'createLitClient',
});

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
    _logger.info(`🔥 signing on ${params.chain} with ${params.signingScheme}`);

    // 🟩 get the fresh handshake results
    const currentHandshakeResult = _stateManager.getCallbackResult();
    const currentConnectionInfo = _stateManager.getLatestConnectionInfo();

    if (!currentHandshakeResult || !currentConnectionInfo) {
      throw new Error(
        'Handshake result is not available from state manager at the time of pkpSign.'
      );
    }

    // 🟪 Create requests
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

    // 🟩 Dispatch requests
    // 2. With the request array prepared, we now coordinate the parallel execution
    // across multiple nodes. This step handles batching, minimum threshold success
    // tracking, and error tolerance. The orchestration layer ensures enough valid
    // responses are collected before proceeding.
    const result = await dispatchRequests<
      z.infer<typeof networkModule.api.pkpSign.schemas.RequestData>,
      z.infer<typeof networkModule.api.pkpSign.schemas.ResponseData>
    >(requestArray, requestId, currentHandshakeResult.threshold);

    // 🟪 Handle response
    // 3. Once node responses are received and validated, we delegate final
    // interpretation and formatting of the result back to the `networkModule`.
    // This allows the module to apply network-specific logic such as decoding,
    // formatting, or transforming the response into a usable signature object.
    return await networkModule.api.pkpSign.handleResponse(result, requestId);
  }

  async function _signSessionKey(params: {
    nodeUrls: string[];
    requestBody: z.infer<typeof JsonSignSessionKeyRequestForPkpReturnSchema>;
  }) {
    // 1. 🟩 get the fresh handshake results
    const currentHandshakeResult = _stateManager.getCallbackResult();
    const currentConnectionInfo = _stateManager.getLatestConnectionInfo();

    if (!currentHandshakeResult || !currentConnectionInfo) {
      throw new Error(
        'Handshake result is not available from state manager at the time of pkpSign.'
      );
    }

    // 2. 🟪 Create requests
    const requestArray = await networkModule.api.signSessionKey.createRequest(
      params.requestBody,
      networkModule.config.httpProtocol,
      networkModule.version
    );

    const requestId = requestArray[0].requestId;

    // 3. 🟩 Dispatch requests
    const result = await dispatchRequests<any, any>(
      requestArray,
      requestId,
      currentHandshakeResult.threshold
    );

    // 4. 🟪 Handle response
    return await networkModule.api.signSessionKey.handleResponse(
      result,
      params.requestBody.pkpPublicKey
    );
  }

  async function _signCustomSessionKey(params: {
    nodeUrls: string[];
    requestBody: z.infer<
      typeof JsonSignCustomSessionKeyRequestForPkpReturnSchema
    >;
  }) {
    // 1. 🟩 get the fresh handshake results
    const currentHandshakeResult = _stateManager.getCallbackResult();
    const currentConnectionInfo = _stateManager.getLatestConnectionInfo();

    if (!currentHandshakeResult || !currentConnectionInfo) {
      throw new Error(
        'Handshake result is not available from state manager at the time of pkpSign.'
      );
    }

    // 2. 🟪 Create requests
    const requestArray =
      await networkModule.api.signCustomSessionKey.createRequest(
        params.requestBody,
        networkModule.config.httpProtocol,
        networkModule.version
      );

    const requestId = requestArray[0].requestId;

    // 3. 🟩 Dispatch requests
    const result = await dispatchRequests<any, any>(
      requestArray,
      requestId,
      currentHandshakeResult.threshold
    );

    // 4. 🟪 Handle response
    return await networkModule.api.signSessionKey.handleResponse(
      result,
      params.requestBody.pkpPublicKey
    );
  }

  // TODO APIS:
  // - [x] viewPkps
  // - [ ] encrypt
  // - [ ] decrypt
  // - [ ] Sign withSolana
  // - [ ] Sign withCosmos
  return {
    // This function is likely be used by another module to get the current context, eg. auth manager
    // only adding what is required by other modules for now.
    // maybe you will need connectionInfo: _stateManager.getLatestConnectionInfo(),
    getContext: async () => {
      return {
        latestBlockhash: await _stateManager.getLatestBlockhash(),
        latestConnectionInfo: _stateManager.getLatestConnectionInfo(),
        handshakeResult: _stateManager.getCallbackResult(),
        getMaxPricesForNodeProduct: networkModule.getMaxPricesForNodeProduct,
        getUserMaxPrice: networkModule.getUserMaxPrice,
        signSessionKey: _signSessionKey,
        signCustomSessionKey: _signCustomSessionKey,
      };
    },
    disconnect: _stateManager.stop,
    mintWithEoa: networkModule.chainApi.mintWithEoa,
    mintWithAuth: networkModule.chainApi.mintWithAuth,
    mintWithCustomAuth: async (params: MintWithCustomAuthRequest) => {
      const validatedParams = MintWithCustomAuthSchema.parse(params);

      // Determine IPFS hash - either from code or CID
      // let ipfsHash: string;
      // if (validatedParams.validationCode) {
      //   // Validate that validation code is not empty
      //   if (validatedParams.validationCode.trim() === '') {
      //     throw new Error(
      //       '❌ validationCode cannot be empty. Please provide a valid Lit Action code or use validationIpfsCid instead.'
      //     );
      //   }

      //   // Convert code to IPFS hash
      //   ipfsHash = await stringToIpfsHash(validatedParams.validationCode);

      //   // Inform user about pinning the IPFS CID
      //   console.log(
      //     '💡 Note: Your validation code has been converted to IPFS hash:',
      //     ipfsHash
      //   );
      //   console.log(
      //     '💡 For production use, please pin this IPFS CID to ensure persistence.'
      //   );
      //   console.log(
      //     '💡 You can pin your Lit Action at: https://explorer.litprotocol.com/create-action'
      //   );
      // }
      // else {
      //   // Use provided CID
      //   ipfsHash = validatedParams.validationIpfsCid!;

      //   // Validate IPFS CID format
      //   if (!ipfsHash.startsWith('Qm') || ipfsHash.length < 46) {
      //     throw new Error(
      //       'Invalid IPFS CID format. CID should start with "Qm" and be at least 46 characters long.'
      //     );
      //   }
      // }

      // Convert IPFS hash to hex
      const ipfsHash = validatedParams.validationIpfsCid!;
      const ipfsHex = toHex(bs58.decode(ipfsHash));

      // Use the same scope for both auth methods (pass as strings, schema will transform)
      const scopes = [[validatedParams.scope], [validatedParams.scope]];

      // Call mintWithMultiAuths with transformed data

      const pkp = await networkModule.chainApi.mintWithMultiAuths({
        account: validatedParams.account,
        authMethodIds: [validatedParams.authData.authMethodId, ipfsHex],
        authMethodTypes: [validatedParams.authData.authMethodType, 2n], // 2n is Lit Action
        authMethodScopes: scopes,
        pubkeys: ['0x', '0x'],
        addPkpEthAddressAsPermittedAddress:
          validatedParams.addPkpEthAddressAsPermittedAddress,
        sendPkpToItself: validatedParams.sendPkpToItself,
      });
      return {
        validationIpfsCid: ipfsHash,
        pkpData: pkp,
      };
    },
    utils: {
      generateUniqueAuthMethodType: ({
        uniqueDappName,
      }: {
        uniqueDappName: string;
      }) => {
        const hex = keccak256(toBytes(uniqueDappName));
        const bigint = hexToBigInt(hex);

        return {
          hex,
          bigint,
        };
      },
      generateAuthData: ({
        uniqueDappName,
        uniqueAuthMethodType,
        userId,
      }: {
        uniqueDappName: string;
        uniqueAuthMethodType: bigint;
        userId: string;
      }) => {
        const uniqueUserId = `${uniqueDappName}-${userId}`;

        return {
          authMethodType: uniqueAuthMethodType,
          authMethodId: keccak256(toBytes(uniqueUserId)),
        };
      },
    },
    getPKPPermissionsManager: networkModule.chainApi.getPKPPermissionsManager,
    viewPKPPermissions: async (pkpIdentifier: PkpIdentifierRaw) => {
      // It's an Anvil private key, chill. 🤣
      const account = privateKeyToAccount(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      );

      const pkpPermissionsManager =
        await networkModule.chainApi.getPKPPermissionsManager({
          pkpIdentifier,
          account,
        });

      const { actions, addresses, authMethods } =
        await pkpPermissionsManager.getPermissionsContext();

      return {
        actions,
        addresses,
        authMethods,
      };
    },
    authService: {
      mintWithAuth: networkModule.authService.pkpMint,
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
