import {
  AuthSig,
  generateAuthSig,
  createSiweMessage,
  ResourceAbilityRequestBuilder,
  createSiweMessageWithRecaps,
} from '@lit-protocol/auth-helpers';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  AuthCallbackParams,
  AuthMethod,
  BaseSiweMessage,
  ExecuteJsResponse,
  JsonExecutionSdkParams,
  LitContractContext,
  LitResourceAbilityRequest,
  SessionSigsMap,
  SigResponse,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LIT_NETWORK, PKPInfo, TinnyEnvConfig } from './tinny-config';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import networkContext from './networkContext.json';
import { AuthMethodScope } from '@lit-protocol/constants';

export class TinnyPerson {
  // -- Ethereum EOA wallet
  public ethEoaWallet: ethers.Wallet;
  public ethEoaSiweMessage: string;
  public ethEoaAuthSig: AuthSig;
  public ethEoaContractsClient: LitContracts;
  public ethEoaCapacityTokenId: string;
  public ethEoaCapacityDelegationAuthSig: AuthSig;
  public ethEoaOwnedPkp: PKPInfo;
  public ethEoaPrivateKey: string;

  // -- Auth Method --
  public ethAuthMethod: AuthMethod;
  public ethAuthMethodOwnedPkp: PKPInfo;

  // TODO: add Google auth method
  // public googleAuthMethod: AuthMethod;
  // public googleAuthMethodOwnedPkp: PKPInfo;

  // TODO: add Discord auth method
  // public discordAuthMethod: AuthMethod;
  // public discordAuthMethodOwnedPkp: PKPInfo;

  // Pass this to data to sign
  public loveLetter: Uint8Array = ethers.utils.arrayify(
    ethers.utils.keccak256([1, 2, 3, 4, 5])
  );

  private ethersProvider: ethers.providers.JsonRpcProvider;
  private tinnyEnvConfig: TinnyEnvConfig;

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

  private async _getFundedFromFacuet(api: string) {
    throw new Error('_getFundedFromFacuet not implemented yet.');
  }

  // ========== Public Methods ==========

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
  async mintCapacityCreditsNFT(): Promise<string> {
    console.log('[𐬺🧪 Tinny Person𐬺] Mint a Capacity Credits NFT ');
    const capacityTokenId = (
      await this.ethEoaContractsClient.mintCapacityCreditsNFT({
        requestsPerKilosecond:
          this.tinnyEnvConfig.processEnvs.REQUEST_PER_KILOSECOND,
        daysUntilUTCMidnightExpiration: 2,
      })
    ).capacityTokenIdStr;

    this.ethEoaCapacityTokenId = capacityTokenId;

    return capacityTokenId;
  }

  /**
   * Creates and sets ˝a capacity delegation authSig by minting a Capacity Credits NFT.
   * @param addresses - An optional array of delegatee addresses.
   * @returns A promise that resolves to the capacity delegation authSig.
   */
  async setCapacityDelegationAuthSig(
    addresses: string[] = []
  ): Promise<AuthSig> {
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Mint a Capacity Credits NFT and get a capacity delegation authSig with it'
    );

    const capacityTokenId = (
      await this.ethEoaContractsClient.mintCapacityCreditsNFT({
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

  /**
   * Retrieves the session signatures for the EOA (Externally Owned Account).
   * @param resourceAbilityRequest - Optional. An array of resource ability requests. If not provided, default requests will be used.
   * @returns A promise that resolves to the session signatures.
   */
  async getEoaSession(resourceAbilityRequest?: LitResourceAbilityRequest[]) {
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
    });

    return sessionSigs;
  }

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
