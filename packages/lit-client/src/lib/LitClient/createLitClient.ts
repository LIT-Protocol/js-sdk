// 🏓 The general API interaction pattern is as follows:
// 1. 🟩 (LitClient) get the fresh handshake results
// 2. 🟪 (Network Module) Create requests
// 3. 🟩 (LitClient) Dispatch requests
// 4. 🟪 (Network Module) Handle response

import {
  getHashedAccessControlConditions,
  validateAccessControlConditions,
} from '@lit-protocol/access-control-conditions';
import { encrypt as blsEncrypt } from '@lit-protocol/crypto';
import { getChildLogger } from '@lit-protocol/logger';
import type {
  LitNetworkModule,
  PKPStorageProvider,
} from '@lit-protocol/networks';
import {
  AuthContextSchema2,
  AuthData,
  EncryptedVersion1Schema,
  HexPrefixedSchema,
  JsonSignCustomSessionKeyRequestForPkpReturnSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
} from '@lit-protocol/schemas';
import {
  DecryptRequest,
  DecryptResponse,
  EncryptResponse,
  EncryptSdkParams,
  LitNodeSignature,
  PkpIdentifierRaw,
  RequestItem,
} from '@lit-protocol/types';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';
import bs58 from 'bs58';
import { Chain, Hex, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { z } from 'zod';
import { dispatchRequests } from './helper/handleNodePromises';
import {
  convertDecryptedData,
  extractFileMetadata,
  inferDataType,
} from './helpers/convertDecryptedData';
import { createPKPViemAccount } from './intergrations/createPkpViemAccount';
import { orchestrateHandshake } from './orchestrateHandshake';
import {
  MintWithCustomAuthRequest,
  MintWithCustomAuthSchema,
} from './schemas/MintWithCustomAuthSchema';
import { NagaNetworkModule } from './type';

const _logger = getChildLogger({
  module: 'createLitClient',
});

type SupportedNetworkModule = NagaNetworkModule | DatilNetworkModule;

/**
 * Creates a Lit client based on the provided network configuration.
 * The Lit Client is the core interface for interacting with the Lit Protocol network.
 * 1. First, select your network configuration, then create your client instance.
 * 2. Then, you can use the client instance to interact with the Lit Protocol network.
 *
 * @see https://v8-interactive-docs.getlit.dev/setup-lit-client For more information about the Lit Client
 *
 * @param config.network - The network module to use (Naga v8 or Datil v7)
 * @returns A Promise that resolves to the appropriate client instance
 *
 * @example
 * ```typescript
 * import { nagaDev } from "@lit-protocol/networks"
 *
 * // Create Naga client (v8)
 * const litClient = await createLitClient({
 *   network: nagaDev,
 * });
 * ```
 */
export const createLitClient = async ({
  network,
}: {
  network: SupportedNetworkModule;
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
 * Creates a Naga Lit client instance for v8 networks.
 * This function sets up the state manager, orchestrates handshakes with network nodes,
 * and returns a fully configured client with all available methods.
 *
 * @param networkModule - The Naga network module configuration
 * @returns A Promise that resolves to a NagaLitClient instance with the following methods:
 *
 * **Encryption:**
 * - `encrypt(params)` - Encrypt data with access control conditions
 * - `decrypt(params)` - Decrypt data with access control conditions
 *
 * **PKP Signing:**
 * - `chain.raw.pkpSign(params)` - Raw PKP signing with full control
 * - `chain.ethereum.pkpSign(params)` - Ethereum-specific PKP signing
 * - `chain.bitcoin.pkpSign(params)` - Bitcoin-specific PKP signing
 *
 * **Lit Actions:**
 * - `executeJs(params)` - Execute JavaScript/Lit Actions on the network
 *
 * **PKP Management:**
 * - `mintWithEoa(params)` - Mint PKP using EOA
 * - `mintWithAuth(params)` - Mint PKP using authentication
 * - `mintWithCustomAuth(params)` - Mint PKP with custom authentication
 * - `getPKPPermissionsManager(params)` - Manage PKP permissions
 * - `viewPKPPermissions(pkpId)` - View PKP permissions
 * - `viewPKPsByAuthData(params)` - View PKPs by auth data
 * - `viewPKPsByAddress(params)` - View PKPs by owner address
 *
 * **Utilities:**
 * - `getChainConfig()` - Get chain configuration and RPC URL
 * - `getDefault` - Default service URLs (authServiceUrl, loginUrl)
 * - `authService.mintWithAuth(params)` - Auth service PKP minting
 *
 * **Integrations:**
 * - `getPkpViemAccount(params)` - Get Viem account for PKP interactions
 *
 * @example
 * ```typescript
 * import { nagaDev } from "@lit-protocol/networks"
 *
 * const litClient = await createLitClient({ network: nagaDev });
 * ```
 */
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
    params: z.infer<typeof networkModule.api.pkpSign.schemas.Input.raw> & {
      bypassAutoHashing?: boolean;
    }
  ): Promise<LitNodeSignature> {
    _logger.info(
      `🔥 signing on ${params.chain} with ${params.signingScheme} (bypass: ${
        params.bypassAutoHashing || false
      })`
    );

    // 🟩 get the fresh handshake results
    const currentHandshakeResult = _stateManager.getCallbackResult();
    const currentConnectionInfo = _stateManager.getLatestConnectionInfo();

    if (!currentHandshakeResult || !currentConnectionInfo) {
      throw new Error(
        'Handshake result is not available from state manager at the time of pkpSign.'
      );
    }

    const jitContext = await networkModule.api.createJitContext(
      currentConnectionInfo,
      currentHandshakeResult
    );

    // 🟪 Create requests
    // 1. This is where the orchestration begins — we delegate the creation of the
    // request array to the `networkModule`. It encapsulates logic specific to the
    // active network (e.g., pricing, thresholds, metadata) and returns a set of
    // structured requests ready to be dispatched to the nodes.

    // Create signing context with optional bypass flag
    const signingContext: any = {
      pubKey: params.pubKey,
      toSign: params.toSign,
      signingScheme: params.signingScheme,
    };

    // Add bypass flag if provided
    if (params.bypassAutoHashing) {
      signingContext.bypassAutoHashing = true;
    }

    const requestArray = (await networkModule.api.pkpSign.createRequest({
      // add chain context (btc, eth, cosmos, solana)
      serverKeys: currentHandshakeResult.serverKeys,
      pricingContext: {
        product: 'SIGN',
        userMaxPrice: params.userMaxPrice,
        nodePrices: currentConnectionInfo.priceFeedInfo.networkPrices,
        threshold: currentHandshakeResult.threshold,
      },
      authContext: params.authContext,
      signingContext,
      connectionInfo: currentConnectionInfo,
      version: networkModule.version,
      chain: params.chain,
      jitContext,
    })) as RequestItem<z.infer<typeof EncryptedVersion1Schema>>[];

    const requestId = requestArray[0].requestId;

    // 🟩 Dispatch requests
    // 2. With the request array prepared, we now coordinate the parallel execution
    // across multiple nodes. This step handles batching, minimum threshold success
    // tracking, and error tolerance. The orchestration layer ensures enough valid
    // responses are collected before proceeding.
    const result = await dispatchRequests<
      z.infer<typeof EncryptedVersion1Schema>,
      z.infer<typeof EncryptedVersion1Schema>
    >(requestArray, requestId, currentHandshakeResult.threshold);

    // 🟪 Handle response
    // 3. Once node responses are received and validated, we delegate final
    // interpretation and formatting of the result back to the `networkModule`.
    // This allows the module to apply network-specific logic such as decoding,
    // formatting, or transforming the response into a usable signature object.

    // Pass the success result to handleResponse - the result structure matches GenericEncryptedPayloadSchema
    return await networkModule.api.pkpSign.handleResponse(
      result as any,
      requestId,
      jitContext
    );
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

    const jitContext = await networkModule.api.createJitContext(
      currentConnectionInfo,
      currentHandshakeResult
    );

    // 2. 🟪 Create requests
    const requestArray = await networkModule.api.signSessionKey.createRequest(
      params.requestBody,
      networkModule.config.httpProtocol,
      networkModule.version,
      jitContext
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
      result as any,
      params.requestBody.pkpPublicKey,
      jitContext
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

    const jitContext = await networkModule.api.createJitContext(
      currentConnectionInfo,
      currentHandshakeResult
    );

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
        networkModule.version,
        jitContext
      );

    const requestId = requestArray[0].requestId;

    // 3. 🟩 Dispatch requests
    const result = await dispatchRequests<any, any>(
      requestArray,
      requestId,
      currentHandshakeResult.threshold
    );

    // 4. 🟪 Handle response
    return await networkModule.api.signCustomSessionKey.handleResponse(
      result as any,
      params.requestBody.pkpPublicKey,
      jitContext
    );
  }

  async function _executeJs(
    params: z.infer<typeof networkModule.api.executeJs.schemas.Input>
  ) {
    _logger.info(`🔥 executing JS with ${params.code ? 'code' : 'ipfsId'}`);

    // 🟩 get the fresh handshake results
    const currentHandshakeResult = _stateManager.getCallbackResult();
    const currentConnectionInfo = _stateManager.getLatestConnectionInfo();

    if (!currentHandshakeResult || !currentConnectionInfo) {
      throw new Error(
        'Handshake result is not available from state manager at the time of executeJs.'
      );
    }

    const jitContext = await networkModule.api.createJitContext(
      currentConnectionInfo,
      currentHandshakeResult
    );

    // 🟪 Create requests
    // 1. This is where the orchestration begins — we delegate the creation of the
    // request array to the `networkModule`. It encapsulates logic specific to the
    // active network (e.g., pricing, thresholds, metadata) and returns a set of
    // structured requests ready to be dispatched to the nodes.
    const requestArray = (await networkModule.api.executeJs.createRequest({
      // add pricing context for Lit Actions
      pricingContext: {
        product: 'LIT_ACTION',
        userMaxPrice: params.userMaxPrice,
        nodePrices: currentConnectionInfo.priceFeedInfo.networkPrices,
        threshold: currentHandshakeResult.threshold,
      },
      authContext: params.authContext,
      executionContext: {
        code: params.code,
        ipfsId: params.ipfsId,
        jsParams: params.jsParams,
      },
      connectionInfo: currentConnectionInfo,
      version: networkModule.version,
      useSingleNode: params.useSingleNode,
      responseStrategy: params.responseStrategy,
      jitContext,
    })) as RequestItem<z.infer<typeof EncryptedVersion1Schema>>[];

    const requestId = requestArray[0].requestId;

    // 🟩 Dispatch requests
    // 2. With the request array prepared, we now coordinate the parallel execution
    // across multiple nodes. This step handles batching, minimum threshold success
    // tracking, and error tolerance. The orchestration layer ensures enough valid
    // responses are collected before proceeding.
    const result = await dispatchRequests<
      z.infer<typeof EncryptedVersion1Schema>,
      z.infer<typeof EncryptedVersion1Schema>
    >(requestArray, requestId, currentHandshakeResult.threshold);

    // 🟪 Handle response
    // 3. Once node responses are received and validated, we delegate final
    // interpretation and formatting of the result back to the `networkModule`.
    // This allows the module to apply network-specific logic such as decoding,
    // formatting, or transforming the response into a usable executeJs result.
    return await networkModule.api.executeJs.handleResponse(
      result as any,
      requestId,
      jitContext
    );
  }

  /**
   * Get the identity parameter for encryption.
   * This combines the hash of access control conditions with the hash of private data.
   */
  function _getIdentityParamForEncryption(
    hashOfConditionsStr: string,
    hashOfPrivateDataStr: string
  ): string {
    return `lit-accesscontrolcondition://${hashOfConditionsStr}/${hashOfPrivateDataStr}`;
  }

  /**
   * Convert various data types to Uint8Array for encryption
   */
  function _convertDataToUint8Array(
    data: string | object | any[] | Uint8Array
  ): Uint8Array {
    if (data instanceof Uint8Array) {
      return data;
    }

    if (typeof data === 'string') {
      return new TextEncoder().encode(data);
    }

    if (typeof data === 'object') {
      // Convert object/array to JSON string then to Uint8Array
      const jsonString = JSON.stringify(data);
      return new TextEncoder().encode(jsonString);
    }

    // Fallback: convert to string then to Uint8Array
    return new TextEncoder().encode(String(data));
  }

  /**
   * Validate if the encryption/decryption parameters contain valid access control conditions.
   */
  function _validateEncryptionParams(params: any): boolean {
    return !!(
      params.accessControlConditions ||
      params.evmContractConditions ||
      params.solRpcConditions ||
      params.unifiedAccessControlConditions
    );
  }

  async function _encrypt(params: EncryptSdkParams): Promise<EncryptResponse> {
    _logger.info('🔒 Encrypting data');

    // ========== Get handshake results ==========
    const currentHandshakeResult = _stateManager.getCallbackResult();

    if (!currentHandshakeResult) {
      throw new Error(
        'Handshake result is not available from state manager at the time of encrypt.'
      );
    }

    if (!currentHandshakeResult.coreNodeConfig?.subnetPubKey) {
      throw new Error('subnetPubKey cannot be null');
    }

    // ========== Convert data to Uint8Array ==========
    const dataAsUint8Array = _convertDataToUint8Array(params.dataToEncrypt);

    // ========== Handle metadata ==========
    let metadata = params.metadata;

    // If no metadata provided but dataType can be inferred, create it
    if (!metadata) {
      const inferredType = inferDataType(params.dataToEncrypt);
      if (inferredType !== 'uint8array') {
        metadata = { dataType: inferredType };

        // Extract file metadata for File/Blob objects
        if (
          inferredType === 'image' ||
          inferredType === 'video' ||
          inferredType === 'file'
        ) {
          const fileMetadata = extractFileMetadata(params.dataToEncrypt);
          metadata = {
            ...metadata,
            ...fileMetadata,
          };
        }
      }
    }

    // ========== Validate Params ==========
    if (!_validateEncryptionParams(params)) {
      throw new Error(
        'You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions'
      );
    }

    // ========== Validate Access Control Conditions Schema ==========
    await validateAccessControlConditions(params);

    // ========== Hash Access Control Conditions ==========
    const hashOfConditions: ArrayBuffer | undefined =
      await getHashedAccessControlConditions(params);

    if (!hashOfConditions) {
      throw new Error(
        'You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions'
      );
    }

    const hashOfConditionsStr = uint8arrayToString(
      new Uint8Array(hashOfConditions),
      'base16'
    );

    // ========== Hash Private Data ==========
    const hashOfPrivateData = await crypto.subtle.digest(
      'SHA-256',
      dataAsUint8Array
    );
    const hashOfPrivateDataStr = uint8arrayToString(
      new Uint8Array(hashOfPrivateData),
      'base16'
    );

    // ========== Assemble identity parameter ==========
    const identityParam = _getIdentityParamForEncryption(
      hashOfConditionsStr,
      hashOfPrivateDataStr
    );

    // ========== Encrypt ==========
    const ciphertext = await blsEncrypt(
      currentHandshakeResult.coreNodeConfig.subnetPubKey,
      dataAsUint8Array,
      uint8arrayFromString(identityParam, 'utf8')
    );

    return {
      ciphertext,
      dataToEncryptHash: hashOfPrivateDataStr,
      metadata,
    };
  }

  async function _decrypt(params: DecryptRequest): Promise<DecryptResponse> {
    _logger.info('🔓 Decrypting data');

    // ========== Extract data from params ==========
    // Support both formats: individual properties or complete data object
    let ciphertext: string;
    let dataToEncryptHash: string;
    let metadata: any;

    if ('data' in params && params.data) {
      // New format: complete encrypted data object
      ciphertext = params.data.ciphertext!;
      dataToEncryptHash = params.data.dataToEncryptHash!;
      metadata = params.data.metadata;
    } else {
      // Traditional format: individual properties
      ciphertext = (params as any).ciphertext;
      dataToEncryptHash = (params as any).dataToEncryptHash;
      metadata = (params as any).metadata;
    }

    // ========== Get handshake results ==========
    const currentHandshakeResult = _stateManager.getCallbackResult();
    const currentConnectionInfo = _stateManager.getLatestConnectionInfo();

    if (!currentHandshakeResult || !currentConnectionInfo) {
      throw new Error(
        'Handshake result is not available from state manager at the time of decrypt.'
      );
    }

    const jitContext = await networkModule.api.createJitContext(
      currentConnectionInfo,
      currentHandshakeResult
    );

    if (!currentHandshakeResult || !currentConnectionInfo) {
      throw new Error(
        'Handshake result is not available from state manager at the time of decrypt.'
      );
    }

    if (!currentHandshakeResult.coreNodeConfig?.subnetPubKey) {
      throw new Error('subnetPubKey cannot be null');
    }

    // ========== Validate Params ==========
    if (!_validateEncryptionParams(params)) {
      throw new Error(
        'You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions'
      );
    }

    // ========== Validate Access Control Conditions Schema ==========
    await validateAccessControlConditions(params);

    // ========== Hash Access Control Conditions ==========
    const hashOfConditions: ArrayBuffer | undefined =
      await getHashedAccessControlConditions(params);

    if (!hashOfConditions) {
      throw new Error(
        'You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions'
      );
    }

    const hashOfConditionsStr = uint8arrayToString(
      new Uint8Array(hashOfConditions),
      'base16'
    );

    // ========== Assemble identity parameter ==========
    const identityParam = _getIdentityParamForEncryption(
      hashOfConditionsStr,
      dataToEncryptHash
    );

    // 🟪 Create requests
    const requestArray = (await networkModule.api.decrypt.createRequest({
      pricingContext: {
        product: 'DECRYPTION',
        userMaxPrice: params.userMaxPrice,
        nodePrices: currentConnectionInfo.priceFeedInfo.networkPrices,
        threshold: currentHandshakeResult.threshold,
      },
      authContext: params.authContext,
      ciphertext: ciphertext,
      dataToEncryptHash: dataToEncryptHash,
      accessControlConditions: params.accessControlConditions,
      evmContractConditions: params.evmContractConditions,
      solRpcConditions: params.solRpcConditions,
      unifiedAccessControlConditions: params.unifiedAccessControlConditions,
      connectionInfo: currentConnectionInfo,
      version: networkModule.version,
      chain: params.chain,
      jitContext,
    })) as RequestItem<z.infer<typeof EncryptedVersion1Schema>>[];

    const requestId = requestArray[0].requestId;

    // 🟩 Dispatch requests
    const result = await dispatchRequests<
      z.infer<typeof EncryptedVersion1Schema>,
      z.infer<typeof EncryptedVersion1Schema>
    >(requestArray, requestId, currentHandshakeResult.threshold);

    // 🟪 Handle response
    const decryptResult = await networkModule.api.decrypt.handleResponse(
      result as any,
      requestId,
      identityParam,
      ciphertext,
      currentHandshakeResult.coreNodeConfig.subnetPubKey,
      jitContext
    );

    // ========== Handle metadata and data conversion ==========
    const response: DecryptResponse = {
      decryptedData: decryptResult.decryptedData,
      metadata: metadata,
    };

    // Convert data if metadata specifies a data type
    if (metadata?.dataType && metadata.dataType !== 'uint8array') {
      response.convertedData = convertDecryptedData(
        decryptResult.decryptedData,
        metadata.dataType,
        metadata
      );
    }

    return response;
  }

  const litClient = {
    // This function is likely be used by another module to get the current context, eg. auth manager
    // only adding what is required by other modules for now.
    // maybe you will need connectionInfo: _stateManager.getLatestConnectionInfo(),
    encrypt: _encrypt,
    decrypt: _decrypt,
    getContext: async () => {
      return {
        latestBlockhash: await _stateManager.getLatestBlockhash(),
        latestConnectionInfo: _stateManager.getLatestConnectionInfo(),
        handshakeResult: _stateManager.getCallbackResult(),
        getMaxPricesForNodeProduct: networkModule.getMaxPricesForNodeProduct,
        getUserMaxPrice: networkModule.getUserMaxPrice,
        signSessionKey: _signSessionKey,
        signCustomSessionKey: _signCustomSessionKey,
        executeJs: _executeJs,
      };
    },
    getChainConfig: () => {
      const viemConfig = networkModule.getChainConfig();
      const rpcUrl = networkModule.getRpcUrl();

      return {
        viemConfig: viemConfig,
        rpcUrl,
      };
    },
    getDefault: {
      authServiceUrl: networkModule.getDefaultAuthServiceBaseUrl(),
      loginUrl: networkModule.getDefaultLoginBaseUrl(),
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
        authMethodTypes: [validatedParams.authData.authMethodType, BigInt(2)], // 2 is Lit Action
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
    getPKPPermissionsManager: networkModule.chainApi.getPKPPermissionsManager,
    getPaymentManager: async (params: { account: any }) => {
      return await networkModule.chainApi.getPaymentManager({
        account: params.account,
      });
    },
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
    viewPKPsByAuthData: async (params: {
      authData: {
        authMethodType: number | bigint;
        authMethodId: string;
        accessToken?: string;
      } | AuthData;
      pagination?: { limit?: number; offset?: number };
      storageProvider?: PKPStorageProvider;
    }) => {
      // Use read-only account for viewing PKPs
      const account = privateKeyToAccount(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      );

      return await networkModule.chainApi.getPKPsByAuthData({
        authData: params.authData,
        pagination: params.pagination,
        storageProvider: params.storageProvider,
        account,
      });
    },
    viewPKPsByAddress: async (params: {
      ownerAddress: string;
      pagination?: { limit?: number; offset?: number };
      storageProvider?: PKPStorageProvider;
    }) => {
      // Use read-only account for viewing PKPs
      const account = privateKeyToAccount(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      );

      return await networkModule.chainApi.getPKPsByAddress({
        ownerAddress: params.ownerAddress,
        pagination: params.pagination,
        storageProvider: params.storageProvider,
        account,
      });
    },
    authService: {
      mintWithAuth: async (params: {
        authData: AuthData;
        authServiceBaseUrl?: string;
        scopes?: ('sign-anything' | 'personal-sign' | 'no-permissions')[];
      }) => {
        return networkModule.authService.pkpMint(params);
      },
    },
    executeJs: async (
      params: z.infer<typeof networkModule.api.executeJs.schemas.Input>
    ) => {
      return _executeJs(params);
    },
    getPkpViemAccount: async (params: {
      pkpPublicKey: string | Hex;
      authContext: AuthContextSchema2;
      chainConfig: Chain;
    }) => {
      const _pkpPublicKey = HexPrefixedSchema.parse(params.pkpPublicKey);

      return createPKPViemAccount({
        pkpPublicKey: _pkpPublicKey,
        authContext: params.authContext,
        chainConfig: params.chainConfig,
        sign: async (data: any, options?: { bypassAutoHashing?: boolean }) => {
          const res = await _pkpSign({
            chain: 'ethereum',
            signingScheme: 'EcdsaK256Sha256',
            pubKey: _pkpPublicKey,
            toSign: data,
            authContext: params.authContext,
            bypassAutoHashing: options?.bypassAutoHashing,
          });

          return res.signature;
        },
      });
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

  return litClient;
};

/**
 * This is the default network type used for all Datil environments (v7)
 */
type DatilNetworkModule = LitNetworkModule;

export const _createDatilLitClient = async () => {
  throw new Error('Datil is not supported yet');
};

export type LitClientType = Awaited<ReturnType<typeof createLitClient>>;
