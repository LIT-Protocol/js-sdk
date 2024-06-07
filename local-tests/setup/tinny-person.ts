import {
  AuthSig,
  ResourceAbilityRequestBuilder,
  createSiweMessage,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from '@lit-protocol/auth-helpers';
import {
  AuthMethodScope,
  AuthMethodType,
  LitNetwork,
} from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import {
  AuthCallbackParams,
  AuthMethod,
  BaseSiweMessage,
  ExecuteJsResponse,
  JsonExecutionSdkParams,
  LitActionSdkParams,
  LitContractContext,
  LitResourceAbilityRequest,
  SessionSigsMap,
  SigResponse,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import networkContext from './networkContext.json';
import { LIT_NETWORK, PKPInfo, TinnyEnvConfig } from './tinny-config';

export class TinnyPerson {
  // ========== Ethereum EOA wallet ==========
  /**
   * External Owned Account (EOA) wallet.
   */
  public ethEoaWallet: ethers.Wallet;

  /**
   * Siwe message for the EOA wallet.
   */
  public ethEoaSiweMessage: string;

  /**
   * AuthSig for the EOA wallet.
   */
  public ethEoaAuthSig: AuthSig;

  /**
   * LitContracts client for the EOA wallet.
   */
  public ethEoaContractsClient: LitContracts;

  /**
   * Capacity token ID for the EOA wallet.
   * TODO: Might be deprecated soon.
   */
  public ethEoaCapacityTokenId: string;

  /**
   * Capacity delegation authSig for the EOA wallet.
   * TODO: Might be deprecated soon.
   */
  public ethEoaCapacityDelegationAuthSig: AuthSig;

  /**
   * PKP owned by the EOA wallet.
   */
  public ethEoaOwnedPkp: PKPInfo;

  /**
   * Private key for the EOA wallet.
   */
  public ethEoaPrivateKey: string;

  // ========== Ethereum Auth Methods ==========

  /**
   * Ethereum authentication method.
   */
  public ethAuthMethod: AuthMethod;

  /**
   * PKP owned by the Ethereum auth method.
   */
  public ethAuthMethodOwnedPkp: PKPInfo;

  // TODO: add Google auth method
  // public googleAuthMethod: AuthMethod;
  // public googleAuthMethodOwnedPkp: PKPInfo;

  // TODO: add Discord auth method
  // public discordAuthMethod: AuthMethod;
  // public discordAuthMethodOwnedPkp: PKPInfo;

  /**
   * A test value
   */
  public loveLetter: Uint8Array = ethers.utils.arrayify(
    ethers.utils.keccak256([1, 2, 3, 4, 5])
  );

  /**
   * A test Lit Action code
   */
  public testLitActionCode: string = `(async () => {
    const sigShare = await LitActions.signEcdsa({
      toSign: dataToSign,
      publicKey,
      sigName: "sig",
    });
  })();`;

  public testValidCustomLitActionCode: string = `(async () => {
    LitActions.setResponse({ response: "true" });
  })();`;

  public testInValidCustomLitActionCode: string = `(async () => {
    LitActions.setResponse({ response: "false" });
  })();`;

  /** ========== Private Fields ========== */
  /**
   * Ethers provider.
   * TODO: We should support other providers as well.
   */
  private ethersProvider: ethers.providers.JsonRpcProvider;

  /**
   * Tinny environment configuration.
   */
  private tinnyEnvConfig: TinnyEnvConfig;

  // ========== Constructor ==========
  constructor({
    privateKey,
    envConfig,
  }: {
    privateKey: string;
    envConfig: TinnyEnvConfig;
  }) {
    this.tinnyEnvConfig = envConfig;

    this.ethEoaPrivateKey = privateKey;
    this.ethersProvider = new ethers.providers.JsonRpcProvider(
      this.tinnyEnvConfig.rpc
    );
    this.ethEoaWallet = new ethers.Wallet(
      this.ethEoaPrivateKey,
      this.ethersProvider
    );
  }

  // ========== Private Methods ==========
  /**
   * Gets funds from a known private key and transfers them to the specified payee address.
   * @param payeeAddress - The address of the payee.
   * @param amount - The amount of funds to transfer (default: '0.00001').
   * @returns An object containing the transfer receipt.
   */
  private async _getFundedFromKnownPrivateKey(
    payeeAddress: string,
    amount: string = '0.00001'
  ) {
    // -- payer
    const pkeys = this.tinnyEnvConfig.processEnvs.PRIVATE_KEYS;
    const rand = Math.floor(Math.random() * pkeys.length);
    const randomPrivateKey = this.tinnyEnvConfig.processEnvs.PRIVATE_KEYS[rand];
    const payerWallet = new ethers.Wallet(
      randomPrivateKey,
      this.ethersProvider
    );

    // -- transfer
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Requesting Funds for person:',
      payeeAddress
    );

    const transferTx = await payerWallet.sendTransaction({
      to: payeeAddress,
      value: ethers.utils.parseEther(amount),
    });

    const transferReciept = await transferTx.wait();

    console.log(
      `[𐬺🧪 Tinny Person𐬺] Transfered Assets for person tx: ${transferTx.hash}`
    );

    return { transferReciept };
  }

  /**
   * Retrieves funding from a faucet API.
   * @param api The URL of the faucet API.
   * @throws {Error} If the method is not implemented yet.
   */
  private async _getFundedFromFacuet(api: string) {
    throw new Error('_getFundedFromFacuet not implemented yet.');
  }

  /**
   * Retrieves the PKP session signatures.
   *
   * @param resourceAbilityRequests - Optional resource ability requests.
   * @param pkpPublicKey - The PKP public key.
   * @param authMethods - The authentication methods.
   * @returns The PKP session signatures.
   */
  private async _getPkpSession({
    resourceAbilityRequests,
  }: {
    resourceAbilityRequests?: LitResourceAbilityRequest[];
    pkpPublicKey?: string;
    authMethods?: AuthMethod[];
  }) {
    const builder = new ResourceAbilityRequestBuilder();

    const _resourceAbilityRequests =
      resourceAbilityRequests ||
      builder
        .addPKPSigningRequest('*')
        .addLitActionExecutionRequest('*')
        .build();

    const pkpSessionSigs =
      await this.tinnyEnvConfig.litNodeClient.getPkpSessionSigs({
        pkpPublicKey: this.ethEoaOwnedPkp.publicKey,
        authMethods: [this.ethAuthMethod],
        resourceAbilityRequests: _resourceAbilityRequests,

        // -- only add this for manzano network
        ...(this.tinnyEnvConfig.litNodeClient.config.litNetwork ===
        LitNetwork.Manzano
          ? { capacityDelegationAuthSig: this.ethEoaCapacityDelegationAuthSig }
          : {}),
      });

    return pkpSessionSigs;
  }
  // ========== Public Methods ==========

  // ========== Init Methods ==========
  /**
   * Initializes the funded wallet.
   * If the PERSON_FUNDING_STRATEGY is set to 'known-private-keys', it gets funded from a known private key.
   * Otherwise, it gets funded from a faucet.
   * @returns A Promise that resolves when the wallet is successfully funded.
   */
  public async initFundedWallet(): Promise<void> {
    console.log(`[𐬺🧪 Tinny Person𐬺] Initializing funded wallet for person:`);
    if (
      this.tinnyEnvConfig.processEnvs.PERSON_FUNDING_STRATEGY ===
      'known-private-keys'
    ) {
      await this._getFundedFromKnownPrivateKey(this.ethEoaWallet.address);
    } else {
      await this._getFundedFromFacuet('xxx');
    }
  }

  /**
   * Initializes the EOA (Externally Owned Account) authentication signature.
   * This method creates a SiweMessage and generates an authentication signature using the provided wallet.
   * @returns {Promise<void>} A promise that resolves once the authentication signature is generated.
   */
  public async initEthEoaAuthSig(): Promise<void> {
    console.log(`[𐬺🧪 Tinny Person𐬺] Initializing EOA AuthSig for person:`);
    this.ethEoaSiweMessage = await createSiweMessage<BaseSiweMessage>({
      nonce: this.tinnyEnvConfig.litNodeClient.latestBlockhash,
      walletAddress: this.ethEoaWallet.address,
    });

    this.ethEoaAuthSig = await generateAuthSig({
      signer: this.ethEoaWallet,
      toSign: this.ethEoaSiweMessage,
    });
  }

  /**
   * Initializes the Ethereum wallet authentication method.
   * This method crafts an authMethod from the authSig for the eth wallet auth method.
   * @returns {Promise<void>} A promise that resolves when the authentication method is initialized.
   */
  public async initEthAuthMethod(): Promise<void> {
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Crafting an authMethod from the authSig for the eth wallet auth method...'
    );
    this.ethAuthMethod = await EthWalletProvider.authenticate({
      signer: this.ethEoaWallet,
      litNodeClient: this.tinnyEnvConfig.litNodeClient,
    });
  }

  /**
   * Initializes the contract client and connects to the network.
   * If the network is set to LIT_NETWORK.LOCALCHAIN, it creates a new LitContracts instance with custom context.
   * Otherwise, it creates a new LitContracts instance with the specified network.
   * @returns A promise that resolves when the contract client is connected to the network.
   */
  public async initEoaContractClient(): Promise<void> {
    console.log('[𐬺🧪 Tinny Person𐬺] Initializing contract client...');
    if (this.tinnyEnvConfig.network === LIT_NETWORK.LOCALCHAIN) {
      this.ethEoaContractsClient = new LitContracts({
        signer: this.ethEoaWallet,
        debug: this.tinnyEnvConfig.processEnvs.DEBUG,
        rpc: this.tinnyEnvConfig.processEnvs.LIT_RPC_URL, // anvil rpc
        customContext: networkContext as unknown as LitContractContext,
      });
    } else {
      this.ethEoaContractsClient = new LitContracts({
        signer: this.ethEoaWallet,
        debug: this.tinnyEnvConfig.processEnvs.DEBUG,
        network: this.tinnyEnvConfig.network,
      });
    }

    await this.ethEoaContractsClient.connect();
  }

  // ========== Smart Contract Methods ==========
  /**
   * Mint a PKP with an EOA wallet.
   * @returns A Promise that resolves when the PKP is minted.
   */
  public async mintPkpWithEoaWallet(): Promise<void> {
    console.log(
      `[𐬺🧪 Tinny Person𐬺] Minting a PKP with EOA wallet: ${this.ethEoaWallet.address}`
    );
    const walletMintRes =
      await this.ethEoaContractsClient.pkpNftContractUtils.write.mint();

    this.ethEoaOwnedPkp = walletMintRes.pkp;
  }

  /**
   * Mint a PKP with eth wallet auth method.
   * @returns A promise that resolves when the PKP is minted.
   */
  public async mintPkpWithEthWalletAuthMethod(): Promise<void> {
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Minting a PKP with eth wallet auth method...'
    );
    this.ethAuthMethodOwnedPkp = (
      await this.ethEoaContractsClient.mintWithAuth({
        authMethod: this.ethAuthMethod,
        scopes: [AuthMethodScope.SignAnything],
      })
    ).pkp;
  }

  /**
   * Mint a Capacity Credits NFT.
   * @returns The capacity token ID of the minted NFT.
   */
  public async mintCapacityCreditsNft(): Promise<string> {
    console.log('[𐬺🧪 Tinny Person𐬺] Mint a Capacity Credits NFT ');
    const capacityTokenId = (
      await this.ethEoaContractsClient.mintCapacityCreditsNft({
        requestsPerKilosecond:
          this.tinnyEnvConfig.processEnvs.REQUEST_PER_KILOSECOND,
        daysUntilUTCMidnightExpiration: 2,
      })
    ).capacityTokenIdStr;

    this.ethEoaCapacityTokenId = capacityTokenId;

    return capacityTokenId;
  }

  // ========== Person Setter Methods ==========
  /**
   * Creates and sets ˝a capacity delegation authSig by minting a Capacity Credits NFT.
   * @param addresses - An optional array of delegatee addresses.
   * @returns A promise that resolves to the capacity delegation authSig.
   */
  public async setCapacityDelegationAuthSig(
    addresses: string[] = []
  ): Promise<AuthSig> {
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Mint a Capacity Credits NFT and get a capacity delegation authSig with it'
    );

    const capacityTokenId = (
      await this.ethEoaContractsClient.mintCapacityCreditsNft({
        requestsPerKilosecond:
          this.tinnyEnvConfig.processEnvs.REQUEST_PER_KILOSECOND,
        daysUntilUTCMidnightExpiration: 2,
      })
    ).capacityTokenIdStr;

    this.ethEoaContractsClient.signer = this.ethEoaWallet;
    await this.ethEoaContractsClient.connect();
    this.ethEoaCapacityDelegationAuthSig = (
      await this.tinnyEnvConfig.litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: this.ethEoaWallet,
        capacityTokenId: capacityTokenId,
        ...(addresses.length && { delegateeAddresses: addresses }),
      })
    ).capacityDelegationAuthSig;

    return this.ethEoaCapacityDelegationAuthSig;
  }

  // ========== Session Methods ==========
  /**
   * Retrieves the session signatures for the EOA (Externally Owned Account).
   * @param resourceAbilityRequest - Optional. An array of resource ability requests. If not provided, default requests will be used.
   * @returns A promise that resolves to the session signatures.
   */
  async getEthEoaSession({
    resourceAbilityRequest,
    expiration,
  }: {
    resourceAbilityRequest?: LitResourceAbilityRequest[];
    expiration?: string;
  } = {}) {
    const builder = new ResourceAbilityRequestBuilder();

    const _resourceAbilityRequests =
      resourceAbilityRequest ||
      builder
        .addPKPSigningRequest('*')
        .addLitActionExecutionRequest('*')
        .build();

    const sessionSigs = await this.tinnyEnvConfig.litNodeClient.getSessionSigs({
      chain: 'ethereum',
      resourceAbilityRequests: _resourceAbilityRequests,
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }: AuthCallbackParams) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri,
          expiration: expiration,
          resources: resourceAbilityRequests,
          walletAddress: this.ethEoaWallet.address,
          nonce: await this.tinnyEnvConfig.litNodeClient.getLatestBlockhash(),
          litNodeClient: this.tinnyEnvConfig.litNodeClient,
        });

        const authSig = await generateAuthSig({
          signer: this.ethEoaWallet,
          toSign,
        });

        return authSig;
      },
      ...(expiration && { expiration }),
    });

    return sessionSigs;
  }

  /**
   * Retrieves the authentication method session.
   *
   * @param resourceAbilityRequests - Optional array of resource ability requests.
   * @param pkpPublicKey - The public key for PKP.
   * @param authMethods - Array of authentication methods.
   * @returns A promise that resolves to the PKP session.
   * @throws {Error} If the authentication method type is not supported or if `authMethods` or `pkpPublicKey` is missing.
   */
  async getAuthMethodSession({
    resourceAbilityRequests,
    pkpPublicKey,
    authMethods,
  }: {
    resourceAbilityRequests?: LitResourceAbilityRequest[];
    authMethods: AuthMethod[];
    pkpPublicKey: string;
  }) {
    const supportedAuthMethodTypes = Object.values(AuthMethodType).filter(
      (v) => typeof v === 'number'
    );

    // -- validate authMethods
    authMethods.forEach((authMethod) => {
      if (!supportedAuthMethodTypes.includes(authMethod.authMethodType)) {
        const authMethodTypeString =
          AuthMethodType[authMethod.authMethodType] || 'Unknown';
        throw new Error(
          `Unsupported AuthMethodType: ${
            authMethod.authMethodType
          } (${authMethodTypeString}). Supported types are: ${supportedAuthMethodTypes
            .map((type) => `${type} (${AuthMethodType[type]})`)
            .join(', ')}`
        );
      }
    });

    if (!authMethods || !authMethods.length) {
      throw new Error('authMethods is required');
    }

    if (!pkpPublicKey) {
      throw new Error('pkpPublicKey is required');
    }

    const builder = new ResourceAbilityRequestBuilder();

    const _resourceAbilityRequests =
      resourceAbilityRequests ||
      builder
        .addPKPSigningRequest('*')
        .addLitActionExecutionRequest('*')
        .build();

    return this._getPkpSession({
      resourceAbilityRequests: _resourceAbilityRequests,
      pkpPublicKey: pkpPublicKey,
      authMethods: authMethods,
    });
  }

  async getCustomSession({
    customAuthMethod,
    resourceAbilityRequests,
    assignedPkp,
    jsParams,
    litActionCode,
    litActionIpfsId,
    permissions,
  }: {
    /**
     * This is a custom auth method. You will be handling the logic in the Lit action code yourself.
     */
    customAuthMethod: {
      authMethodType: number;
      authMethodId: string;
    };

    /**
     * The permissions for the custom auth method.
     */
    permissions: {
      /**
       * This will run the `addPermittedAuthMethod` smart contract function to add
       * the custom auth method to the PKP token ID.
       */
      permitAuthMethod: boolean;

      /**
       * The scopes that the custom auth method will have access to.
       * - NoPermissions = 0
       * - SignAnything = 1
       * - PersonalSign = 2
       *
       * @example
       * ```
       * permitAuthMethodScopes: [AuthMethodScope.NoPermissions],
       * permitAuthMethodScopes: [AuthMethodScope.SignAnything],
       * permitAuthMethodScopes: [AuthMethodScope.PersonalSign],
       *
       * // or
       * permitAuthMethodScopes: [0],
       * permitAuthMethodScopes: [1],
       * permitAuthMethodScopes: [2],
       * ```
       */
      permitAuthMethodScopes: AuthMethodScope[];
    };

    resourceAbilityRequests?: LitResourceAbilityRequest[];

    /**
     * The PKP that the custom auth method will have access to.
     */
    assignedPkp: {
      publicKey: string;
      ethAddress: string;
      tokenId: string;
    };
    jsParams: {
      [key: string]: any;
      publicKey?: string;
    };
  } & ( // Either litActionCode or litActionIpfsId is required
    | {
        litActionCode: string;
        litActionIpfsId?: never;
      }
    | {
        litActionCode?: never;
        litActionIpfsId: string;
      }
  )) {
    function _validate() {
      if (!customAuthMethod) {
        throw new Error('customAuthMethod is required');
      }

      if (customAuthMethod) {
        if (!customAuthMethod.authMethodType) {
          throw new Error('customAuthMethod.authMethodType is required');
        }
        if (!customAuthMethod.authMethodId) {
          throw new Error('customAuthMethod.authMethodId is required');
        }
      }

      if (!assignedPkp) {
        throw new Error('assignedPkp is required');
      }

      if (assignedPkp) {
        if (!assignedPkp.publicKey) {
          throw new Error('assignedPkp.publicKey is required');
        }
        if (!assignedPkp.ethAddress) {
          throw new Error('assignedPkp.ethAddress is required');
        }
        if (!assignedPkp.tokenId) {
          throw new Error('assignedPkp.tokenId is required');
        }
      }

      if (!jsParams) {
        throw new Error('jsParams is required');
      }

      // Check if either litActionCode or litActionIpfsId is provided
      if (!litActionCode && !litActionIpfsId) {
        throw new Error(
          "Either 'litActionCode' or 'litActionIpfsId' must be provided."
        );
      }

      // Check if both litActionCode and litActionIpfsId are provided
      if (litActionCode && litActionIpfsId) {
        throw new Error(
          "Both 'litActionCode' and 'litActionIpfsId' cannot be provided at the same time."
        );
      }
    }

    _validate();

    // -- permit auth method
    if (permissions.permitAuthMethod) {
      const contractClient = this.ethEoaContractsClient;
      const addPermittedAuthMethodReceipt =
        await contractClient.addPermittedAuthMethod({
          pkpTokenId: assignedPkp.tokenId,
          authMethodType: customAuthMethod.authMethodType,
          authMethodId: customAuthMethod.authMethodId,
          authMethodScopes: permissions.permitAuthMethodScopes,
        });

      console.log(
        '✅ addPermittedAuthMethodReceipt:',
        addPermittedAuthMethodReceipt
      );
    }

    const builder = new ResourceAbilityRequestBuilder();

    const _resourceAbilityRequests =
      resourceAbilityRequests ||
      builder
        .addPKPSigningRequest('*')
        .addLitActionExecutionRequest('*')
        .build();

    if (litActionCode) {
      return this.tinnyEnvConfig.litNodeClient.getLitActionSessionSigs({
        pkpPublicKey: assignedPkp.publicKey,
        resourceAbilityRequests: _resourceAbilityRequests,
        litActionCode: Buffer.from(litActionCode).toString('base64'),
        jsParams,
      });
    }

    if (litActionIpfsId) {
      return this.tinnyEnvConfig.litNodeClient.getLitActionSessionSigs({
        pkpPublicKey: assignedPkp.publicKey,
        resourceAbilityRequests: _resourceAbilityRequests,
        litActionIpfsId,
        jsParams,
      });
    }
  }

  // ========== Session Usages ==========
  /**
   * Use session signatures for various operations.
   *
   * @param {SessionSigsMap} sessionSigs - The session signatures map.
   * @returns {Object} An object containing methods to execute operations with the session signatures.
   * @returns {Function} toExecute - Executes a Lit Action (Serverless Javascript code) with the provided parameters.
   * @returns {Function} toPkpSign - Signs data with a PKP (Programmable Key Pairs).
   */
  public useSession(sessionSigs: SessionSigsMap) {
    return {
      /**
       * Executes a JavaScript function with the provided parameters.
       *
       * @param {Omit<JsonExecutionSdkParams, 'sessionSigs'>} params - The execution parameters, excluding sessionSigs.
       * @returns {Promise<any>} The result of the execution.
       */
      toExecute: async (
        params: Omit<JsonExecutionSdkParams, 'sessionSigs'>
      ): Promise<ExecuteJsResponse> => {
        const litNodeClient = this.tinnyEnvConfig.litNodeClient;
        return await litNodeClient.executeJs({
          ...params,
          sessionSigs,
        });
      },

      /**
       * Signs data with a PKP
       *
       * @param {string} [pkpPubKey] - The public key of the PKP.
       * @param {string | Uint8Array} [toSign] - The data to sign, either as a string or Uint8Array.
       * @returns {Promise<SigResponse>} The signature result.
       */
      toPkpSign: async (
        pkpPubKey?: string,
        toSign?: string | Uint8Array
      ): Promise<SigResponse> => {
        let _toSign: Uint8Array;

        if (typeof toSign === 'string') {
          _toSign = ethers.utils.arrayify(
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes(toSign))
          );
        }

        const litNodeClient = this.tinnyEnvConfig.litNodeClient;

        return await litNodeClient.pkpSign({
          pubKey: pkpPubKey ?? this.ethEoaOwnedPkp.publicKey,
          sessionSigs,
          toSign: _toSign,
        });
      },
    };
  }
}
