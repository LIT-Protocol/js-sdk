import {
  AuthCallback,
  AuthMethod,
  AuthSig,
  EncryptRequestBase,
  EncryptResponse,
  IRelayPKP,
  RPCUrls,
  SessionSigs,
} from '@lit-protocol/types';
import {
  OrUndefined,
  Types,
  SignProps,
  PKPInfo,
  Credential,
  EncryptProps,
  LitSerialized,
  DecryptProps,
  LitAuthMethod,
  EncryptResult,
  EncryptionMetadata,
  DecryptRes,
  GetLitAccountInstance,
  GetLitAccount,
  GetLitAccountInstanceSend,
} from './types';
import {
  convertSigningMaterial,
  log,
  prepareEncryptionMetadata,
  deserializeFromType,
  getProviderMap,
  resolveACCType,
  isNode,
  getSingleAuthDataByType,
  convertContentMaterial,
  LitMessages,
  waitForLit,
  useStoredAuthMethodsIfFound,
  mapAuthMethodTypeToString,
  convertContentToBuffer,
} from './utils';
import { handleAuthMethod } from './create-account/handle-auth-data';
import { handleProvider } from './create-account/handle-provider';
import { addTimeUnitToGivenDate, hexPrefixed, isBrowser } from '@lit-protocol/misc';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';
import { handleGetAccounts } from './get-accounts/handle-get-accounts';
import {
  LitAbility,
  LitActionResource,
} from '@lit-protocol/auth-helpers';
import { LitAnalytics } from './analytics';
import { ethers } from 'ethers';
import { LIT_CHAINS, LIT_RPC, ProviderType } from '@lit-protocol/constants';
import { PKPClient } from '@lit-protocol/pkp-client';
import { LITTokenData } from '@lit-protocol/contracts-sdk';
import { coins } from '@cosmjs/amino';
import { GasPrice, SigningStargateClient, calculateFee } from '@cosmjs/stargate';

const STORAGE_SESSION_PREFIX = 'lit-session-sigs-';
const STORAGE_PKP_REPLICATED_STATE_PREFIX = 'lit-pkp-replicated-state-';

export class Lit {
  private _options: OrUndefined<Types.LitOptions>;
  private _litNodeClient: OrUndefined<Types.NodeClient>;

  public set Configure(value: Types.LitOptions) {
    this._options = value;
    this._litNodeClient = globalThis.Lit.nodeClient ?? undefined;
  }

  constructor() {
    //instance method bindings
    globalThis.Lit.encrypt = this.encrypt.bind(this);
    globalThis.Lit.decrypt = this.decrypt.bind(this);
    globalThis.Lit.sign = this.sign.bind(this);
    globalThis.Lit.createAccount = this.createAccount.bind(this);
    globalThis.Lit.getAccounts = this.getAccounts.bind(this);
    globalThis.Lit.createAccountSession = this.createAccountSession.bind(this);
    globalThis.Lit.account = this.account.bind(this);

    // util bindings
  }

  // ========== Encryption ==========

  /**
   * Encrypt a given content thats {@link LitSerializable} with provided access control conditions
   * @param {EncryptProps} opts
   * @returns {Promise<void | EncryptResult>}
   *
   * Formula:
   * A = base16(Accs)
   * ID = base16(sha256(dataToEncrypt))
   * Message = `lit_encryption_v2://${ID}/${A}`
   * BLS_KEY = BLS Network Key
   * CipherText = BLS.encrypt(BLS_KEY, dataToEncrypt, Message)
   *
   * Then, user stores the A, ID, CipherText themselves
   *
   */
  // static async encrypt(opts: EncryptProps): Promise<EncryptResult> {
  async encrypt(opts: EncryptProps): Promise<EncryptResult> {
    LitAnalytics.collect('encrypt');

    // -- vars
    let accs: Partial<EncryptRequestBase>;
    let encryptRes: EncryptResponse;
    let encryptionMaterial: LitSerialized<Uint8Array>;
    let encryptionMaterialWithMetadata: EncryptionMetadata;
    let chain = opts.chain ?? 'ethereum'; // default EVM chain
    let cache = opts.cache ?? true;
    let persistentStorage =
      opts.persistentStorage ?? globalThis.Lit.persistentStorage;

    // // -- flag to this function has been triggered
    // await waitForLit();
    // const litNodeClient = globalThis.Lit.nodeClient; // instead of this._litNodeClient
    const litNodeClient = this._litNodeClient;

    // -- node must be defined
    if (!litNodeClient) {
      throw new Error('_litNodeClient is undefined');
    }

    // -- access control conditions must be definedc
    if (
      !opts.accessControlConditions ||
      opts.accessControlConditions.length < 1
    ) {
      throw new Error(
        'Access Control Conditions are undefined or empty, at least one condition should be defined'
      );
    }

    // -- set access control conditions
    accs = resolveACCType(opts.accessControlConditions);

    // -- get encryption content
    encryptionMaterial = await convertContentMaterial(opts.content);

    // -- get additional encryption metadata
    encryptionMaterialWithMetadata = prepareEncryptionMetadata(
      opts,
      encryptionMaterial,
      accs
    );

    // -- ask nodes to use BLS key to encrypt
    try {
      encryptRes = await litNodeClient.encrypt({
        dataToEncrypt: encryptionMaterial.data,
        chain,
        ...accs,
      });
    } catch (e) {
      throw new Error('Unable to encrypt content: ' + e);
    }

    let decryptionContext = JSON.stringify({
      encryptResponse: encryptRes,
      metadata: encryptionMaterialWithMetadata,
    });

    let storageKey = null;

    if (cache) {
      log.info('Storing decryption context in cache...');
      storageKey = `lit-encrypted-${encryptRes?.ciphertext}:${encryptRes?.dataToEncryptHash}`;

      globalThis.Lit.storage?.setItem(storageKey, decryptionContext);
      log(`Set "${storageKey}" to decryption resource: `, decryptionContext);
    }

    let IPFSHash = null;

    if (opts?.uploadToIPFS) {
      if (!persistentStorage) {
        log.throw(
          `IPFS upload requested but no persistent storage provider is defined

${LitMessages.persistentStorageExample}
`
        );
      }

      log.info('Uploading decryption context to IPFS...');
      IPFSHash = await persistentStorage.set(decryptionContext);
      log.info(`Uploaded to IPFS: ${JSON.stringify(IPFSHash)}`);
    }

    const isHelia = persistentStorage?.name === 'helia';
    const isHeliaMessage = `${LitMessages.persistentStorageWarning}
${LitMessages.persistentStorageExample}`;

    if (isHelia) {
      console.warn(isHeliaMessage);
    }

    return {
      // -- optional
      ...(cache && { storageKey }),

      // -- if `uploadToIPFS` is true
      ...(IPFSHash && {
        IPFSHash: {
          ...IPFSHash,
          ...(isHelia && {
            WARNING: isHeliaMessage,
          }),
        },
      }),
      // -- must be provided to decrypt
      encryptResponse: {
        ...encryptRes,
        accessControlConditions: opts.accessControlConditions,
        chain,
      },
      // -- additionally
      decryptionContext: { decryptionMaterial: decryptionContext },
    };
  }

  /**
   * Decrypts a given resource based on the {@link DecryptProps}
   * supports resolving from cache with {@link StorageContext}
   * by providing the {@link DecryptionRequest}
   * Authentication context must be provided or cache will be checked for {@link Credential}
   * @param {DecryptProps} opts
   * @returns decrypted content as its {@link LitSerializable} compatible type
   *
   */
  public async decrypt(opts: DecryptProps): Promise<DecryptRes> {
    LitAnalytics.collect('decrypt');

    // -- validation
    if (!opts?.storageContext && !opts?.decryptionContext) {
      log.error(
        'Storage provider not set, cannot read from storage for decryption material'
      );
    }

    if (opts.storageContext && !opts.storageContext.storageKey) {
      log.throw('Storage context is provided, but storage key is missing');
    }

    if (!opts?.decryptionContext && !opts?.decryptResponse) {
      log.throw('Must provide encryptionMetadata');
    }

    interface Material {
      encryptResponse: EncryptResponse;
      metadata: EncryptionMetadata;
    }

    let material: Material | undefined;

    // -- using storage context
    if (opts?.storageContext && globalThis.Lit.storage) {
      let decryptionMaterial = globalThis.Lit.storage?.getItem(
        opts?.storageContext.storageKey
      );

      // -- check if storage key exists
      if (!decryptionMaterial) {
        log.throw(`Unable to find key "${opts?.storageContext.storageKey}"`);
      }

      // -- try to parse
      try {
        material = JSON.parse(decryptionMaterial) as Material;
      } catch (e) {
        log.throw('Unable to parse decryption material from cache: ', e);
      }
    }

    // -- using decryption context
    if (opts.decryptionContext && !material) {
      material = opts.decryptionContext as unknown as Material;
    }

    if (!material?.encryptResponse) {
      log.throw(`Unable to find encryption response in decryption material`);
    }

    if (!material?.metadata) {
      log.throw(`Unable to find encryption metadata in decryption material`);
    }

    log.info('Material:', material);

    // -- auths
    let authMaterial = opts?.authMaterial;
    let authMethodProvider = opts?.provider;
    let authMethods: Array<LitAuthMethod> = [];

    try {
      // -- when auth method provider ('google', 'discord', etc.) is provided
      if (!authMaterial && authMethodProvider?.provider) {
        authMethods = useStoredAuthMethodsIfFound();
        if (authMethods.length < 1) {
          log.throw(
            'No Authentication methods found in cache, need to re-authenticate'
          );
        }
        for (const authMethod of authMethods) {
          if (
            getProviderMap()[authMethod.authMethodType] ===
            opts.provider?.provider
          ) {
            // TODO: resolve pkp info and generate session signatures for access control
          }
        }
      } else if (!authMaterial && !authMethodProvider) {
        if (isBrowser()) {
          authMaterial = await checkAndSignAuthMessage({
            chain: material.metadata.chain,
          });
        }
      }

      opts.authMaterial = authMaterial;
      log('resolved metadata for material: ', material.metadata);
      log('typeof authMateiral ', typeof opts.authMaterial);

      if (!material.metadata.accessControlConditions) {
        log.throw('Access control conditions are undefined');
      }

      let acc = resolveACCType(material.metadata.accessControlConditions);
      let res = await this._litNodeClient?.decrypt({
        ...acc,
        ciphertext: material.encryptResponse.ciphertext,
        dataToEncryptHash: material.encryptResponse.dataToEncryptHash,
        chain: material.metadata.chain,
        authSig: opts.authMaterial as AuthSig,
      });

      const msg = deserializeFromType(
        material.metadata.messageType,
        res?.decryptedData as Uint8Array
      );

      log.info('msg:', msg);

      if (!res?.decryptedData) {
        log.throw('Could not decrypt data');
      }

      return {
        data: msg,
        rawData: res.decryptedData,
      };
    } catch (e) {
      log.throw('Could not perform decryption operations ', e);
    }
  }

  // ========== Signing ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#f4f4d44e2a1340ebb08517dfd2c16265
  // aka. mintWallet

  /**
   * Create a new PKP account with the given auth method(s).
   *
   * @param {LitAuthMethod[]} authMethods
   * @returns {Promise<void | PKPInfo[]>}
   */
  public async createAccount({
    authMethods
  }: { authMethods: LitAuthMethod[] }): Promise<void | PKPInfo[]> {
    log('creating account...');
    // If dev provides a "provider" eg. google, discord, ethwallet, etc.
    // if ((opts as LitAuthMethodWithProvider).provider) {
    //   return await handleProvider(opts as LitAuthMethodWithProvider);
    // }

    // If dev provides authMethods array where they obtain the auth data manually themselves eg. credentials: [googleAuthData, discordAuthData, etc.]
    const pkps = await handleAuthMethod({ authMethods });

    // -- cache to wait for replicated state from the sequencer, so that when we try to use this function again,
    // it will need to wait for 30 seconds
    const expiration = addTimeUnitToGivenDate(30, 'seconds', new Date()).toISOString();

    pkps.forEach((pkp: PKPInfo) => {
      globalThis.Lit.storage?.setItem(
        `${STORAGE_PKP_REPLICATED_STATE_PREFIX}${pkp.publicKey}`,
        expiration
      );
    });

    return pkps;
  }

  /**
   * Get all accounts associated with the given auth method(s).
   * @param { LitAuthMethod[] } authMethods
   * @param { boolean } cache
   */
  public async getAccounts({
    authMethods,
    cache = false
  }: {
    authMethods?: Array<LitAuthMethod>,
    cache?: boolean,
    getSessiongs?: boolean
  }): Promise<PKPInfo[]> {
    log.start('getAccounts');
    globalThis.Lit.eventEmitter?.getAccountsStatus('in_progress');

    const storedAuthMethods = useStoredAuthMethodsIfFound({ authMethods });

    // -- get account details from each auth method, such as
    // tokenId, publicKey, derived addresses, etc.
    let accounts;

    try {
      accounts = await handleGetAccounts(storedAuthMethods, {
        cache,
      });
    } catch (e) {
      log.error('Error while getting accounts', e);
      log.end('getAccounts');
      throw e;
    }

    globalThis.Lit.eventEmitter?.getAccountsStatus('completed', accounts);

    return accounts;
  }

  /**
   * Get all session sigs for the given account public key
   */
  public async createAccountSession({
    accountPublicKey,
    authMethods,
    authNeededCallback,
    resource = new LitActionResource('*'),
    ability = LitAbility.PKPSigning,
    chain = 'ethereum',
    expirationLength = 7,
    expirationUnit = 'days',
    debug = {
      pkpSign: false,
    },
  }: {
    accountPublicKey: string;
    authMethods: LitAuthMethod[];
    authNeededCallback?: AuthCallback;
    resource?: LitActionResource,
    ability?: LitAbility,
    chain?: keyof typeof LIT_CHAINS,
    expirationLength?: number;
    expirationUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
    debug?: {
      pkpSign?: boolean;
    };
  }): Promise<{ sessionSigs: SessionSigs, pkpInfo: IRelayPKP }[]> {
    log.start('createAccountSession');

    // -- we have to check if the replicated state has been synced
    // before we can proceed with this function
    const storageKey = `${STORAGE_PKP_REPLICATED_STATE_PREFIX}${accountPublicKey}`;
    const state = globalThis.Lit.storage?.getItem(storageKey);

    if (state) {
      log.info(`Checking if replicated state has been synced for ${accountPublicKey}...`);

      const expirationDate = new Date(state);

      // -- check if it has been more than 30 seconds
      if (expirationDate.getTime() > new Date().getTime()) {

        const secondsLeft = Math.floor((expirationDate.getTime() - new Date().getTime()) / 1000);

        log.throw(`Replicated state has not been synced yet, ${secondsLeft} seconds left...`);
      }
    }

    if (isNode()) {
      if (!authNeededCallback) {
        log.throw("authNeededCallback is required when running in node");
      }
    }

    // -- enforce correct format
    accountPublicKey = hexPrefixed(accountPublicKey);
    log.info(`Getting session sigs for "${accountPublicKey}"...`);

    const expiration = addTimeUnitToGivenDate(expirationLength, expirationUnit, new Date()).toISOString();
    log.info("expiration:", expiration);

    // Use Promise.all to handle multiple async tasks concurrently
    try {
      const allSessionSigs = await Promise.all(
        authMethods.map(async (authMethod) => {

          const authMethodName = mapAuthMethodTypeToString(authMethod.authMethodType);
          const provider = globalThis.Lit.auth[authMethodName];
          const ethAuthProvider = globalThis.Lit.auth[ProviderType.EthWallet]

          log.info("authMethod:", authMethod);

          // -- get all the PKPs for the given auth method
          let allPKPs = undefined;
          let pkpInfo = undefined;
          let sessionSigs = undefined;

          try {
            allPKPs = await provider?.fetchPKPsThroughRelayer(authMethod);
            pkpInfo = allPKPs?.find((pkp: IRelayPKP) => pkp.publicKey === accountPublicKey);
          } catch (e) {
            console.error("Error while fetching PKPs through relayer", e);
          }

          try {
            sessionSigs = await ethAuthProvider?.getSessionSigs({
              pkpPublicKey: accountPublicKey,
              authMethod: authMethod,
              sessionSigsParams: {
                chain: chain as string, // default EVM chain unless other chain
                resourceAbilityRequests: [{ resource, ability }],

                // -- optional
                ...(expiration && { expiration }),

                // -- conditional
                ...(isNode() && {
                  sessionKey: globalThis.Lit.nodeClient?.getSessionKey(),
                  authNeededCallback,
                })
              },
            });

            log.info("sessionSigs:", sessionSigs);

          } catch (e) {
            console.error(`Error while getting session sigs for ${accountPublicKey}`, e);
          }

          // -- cache
          if (sessionSigs && globalThis.Lit.storage) {

            const storageKey = `${STORAGE_SESSION_PREFIX}${accountPublicKey} `;

            globalThis.Lit.storage.setExpirableItem(
              storageKey,
              JSON.stringify({ pkpInfo, sessionSigs }),
              expirationLength,
              expirationUnit
            );
          }

          if (debug?.pkpSign) {
            log("Let's try to sign something with one of the session sigs...");

            try {
              const pkpRes = await globalThis.Lit.nodeClient?.pkpSign({
                toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
                pubKey: accountPublicKey,
                sessionSigs: sessionSigs,
              })

              log("result from pkpSign()", pkpRes);
            } catch (e) {
              log.error("Error while trying to sign with session sigs", e);
            }
          }

          log.end('createAccountSession');

          return {
            pkpInfo,
            sessionSigs
          };
        })
      );

      console.log('allSessionSigs: ', allSessionSigs);

      return allSessionSigs.filter(sig => sig.pkpInfo !== undefined && sig.sessionSigs !== undefined) as { sessionSigs: SessionSigs; pkpInfo: IRelayPKP }[];

    } catch (e) {
      log.end('createAccountSession');
      log.throw(`Error while getting account session: ${JSON.stringify(e)} `);
    }
  }

  public account({
    accountPublicKey,
    sessionSigs,
    configs,
  }: GetLitAccount): GetLitAccountInstance {

    const selectedPlatform = configs?.platform || 'eth';
    const supportedPlatforms = ['eth', 'cosmos'];

    const pkpClient = new PKPClient({
      controllerSessionSigs: sessionSigs,
      pkpPubKey: accountPublicKey,

      // -- optional

      // the rpcs property is only added if either eth or cosmos rpc exists. If neither exists, an empty object is spread (which has no effect)
      ...(configs?.eth?.rpc || configs?.cosmos?.rpc ? {
        rpcs: {
          ...(configs?.eth?.rpc && { eth: configs.eth.rpc }),
          ...(configs?.cosmos?.rpc && { cosmos: configs.cosmos.rpc }),
        },
      } : {}),

      // -- cosmos address prefix
      ...(configs?.cosmos?.addressPrefix && {
        cosmosAddressPrefix: configs.cosmos.addressPrefix
      }),

    });

    const accountInstance = {
      eth: async () => {
        await pkpClient.connect();
        return pkpClient.getEthWallet();
      },
      cosmos: async () => {
        await pkpClient.connect();
        return pkpClient.getCosmosWallet();
      },
      send: async ({
        to,
        amount,
        tokenAddress,
        decimal = 18,
        defaultEthGas = 500000,
        denom = "uatom",
        defaultCosmosGas = 0.025,
        defaultCosmosGasLimit = 80_000
      }: GetLitAccountInstanceSend) => {

        if (!supportedPlatforms.includes(selectedPlatform)) {
          throw new Error(`Platform "${selectedPlatform}" is not supported yet! Ping us if you want to see this platform supported!`);
        }

        log.info("Connecting pkpClient...");
        await pkpClient.connect();
        log.info("Connected pkpClient!");
        let txResponse;

        // -- eth
        if (selectedPlatform === 'eth') {
          log.info("Sending transaction on Ethereum...");
          const ethWallet = pkpClient.getEthWallet();

          const ERC20_ABI = [
            "function transfer(address recipient, uint256 amount) public returns (bool)"
          ];


          if (tokenAddress) {
            log.info(`Using token address: ${tokenAddress}`)
            const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, ethWallet);

            const amountInSmallestUnit = ethers.utils.parseUnits(amount, decimal);

            const gasPrice = await ethWallet.getGasPrice();

            let estimatedGasLimit;

            try {
              estimatedGasLimit = await tokenContract.estimateGas['transfer'](to, amountInSmallestUnit);
            } catch (e) {
              // swallow error
              console.log("error while estimating gas limit, using default gas limit instead");
              estimatedGasLimit = defaultEthGas ?? 500000;
            }

            txResponse = await tokenContract['transfer'](to, amountInSmallestUnit, {
              gasPrice,
              gasLimit: estimatedGasLimit,
            });
            console.log(`Token Transaction hash: ${txResponse.hash}`);
          } else {
            // use native token
            const gasPrice = await ethWallet.getGasPrice();
            txResponse = await ethWallet.sendTransaction({
              to,
              value: ethers.utils.parseEther(amount),
              gasPrice,
              gasLimit: defaultEthGas ?? 500000,
            });

            console.log(`Transaction hash: ${txResponse.hash}`);
          }

        }

        else if (selectedPlatform === 'cosmos') {
          const cosmosWallet = pkpClient.getCosmosWallet();
          const [pkpAccount] = await cosmosWallet.getAccounts();
          const _amount = coins(amount, denom);
          const _gas = GasPrice.fromString(`${defaultCosmosGas}${denom}`);
          const _sendFee = calculateFee(defaultCosmosGasLimit, _gas);

          const stargateClient = await SigningStargateClient.connectWithSigner(
            configs?.cosmos?.rpc || cosmosWallet.rpc || "https://cosmos-rpc.publicnode.com",
            cosmosWallet
          );

          try {
            txResponse = await stargateClient.sendTokens(
              pkpAccount.address,
              pkpAccount.address,
              _amount,
              _sendFee,
              'Transaction'
            );

          } catch (e) {
            const _error = JSON.parse(JSON.stringify(e));
            throw new Error(_error);
          }
        }

        if (!txResponse) {
          log.throw("txResponse is undefined");
        }

        return txResponse;
      },
      sign: async (content: any) => {

        content = convertContentToBuffer(content);

        const TO_SIGN: Uint8Array = ethers.utils.arrayify(
          ethers.utils.keccak256(content)
        );

        return await globalThis.Lit.nodeClient?.pkpSign({
          toSign: TO_SIGN,
          pubKey: accountPublicKey,
          sessionSigs: sessionSigs,
        });

      },
      balance: async ({
        tokenAddress,
        denom = "uatom",
      }: {
        tokenAddress?: string;
        denom?: string;
      }) => {

        await pkpClient.connect();

        if (selectedPlatform === 'eth') {
          const ethWallet = pkpClient.getEthWallet();

          // If a token address is provided, retrieve the ERC20 token balance
          if (tokenAddress) {
            const ERC20_ABI = [
              "function balanceOf(address account) public view returns (uint256)"
            ];
            const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, ethWallet);
            const balance = await tokenContract['balanceOf'](ethWallet.address);
            return ethers.utils.formatEther(balance);  // Convert Wei to Ether format for better readability
          }

          // If no token address is provided, retrieve Ether balance
          else {
            const balance = await ethWallet.getBalance();
            return ethers.utils.formatEther(balance);  // Convert Wei to Ether format for better readability
          }

        } else if (selectedPlatform === 'cosmos') {
          const cosmosWallet = pkpClient.getCosmosWallet();
          const [pkpAccount] = await cosmosWallet.getAccounts();

          const stargateClient = await SigningStargateClient.connectWithSigner(
            configs?.cosmos?.rpc || cosmosWallet.rpc || "https://cosmos-rpc.publicnode.com",
            cosmosWallet
          );

          const balance = await stargateClient.getBalance(pkpAccount.address, denom);

          // Returning the first balance item, likely Atoms for Cosmos
          return balance;
        }

        throw new Error(`Platform "${selectedPlatform}" is not supported for balance retrieval!`);
      }

    };

    return accountInstance;
  }

  /**
   * Sign a message with a given pkp specified by the public key
   * Signature responses are valid ECDSA sigatures
   * **Note** at this time signatures are NOT deterministic
   * @param {SignProps} options
   * @returns
   */
  public async sign(options: SignProps) {
    // -- validate
    if (!options.authMaterial && !options.provider) {
      if (isNode()) {
        throw new Error(
          'Must provide either auth methods or auth signature, aborting ...'
        );
      }
      let authSig = await checkAndSignAuthMessage({ chain: 'ethereum' });
      options.authMaterial = authSig;
    }

    let authMethods: Array<AuthMethod> = [];

    if (options.provider) {
      // collect cached auth methods and attempt to auth with them
      authMethods = useStoredAuthMethodsIfFound();
      const providerMap = getProviderMap();
      for (const authMethod of authMethods) {
        if (
          providerMap[authMethod.authMethodType] === options.provider.provider
        ) {
          authMethods = [authMethod];
          break;
        }
      }
    }

    const toSign: LitSerialized<number[]> = convertSigningMaterial(
      options.content
    );

    const sig = await this._litNodeClient?.pkpSign({
      pubKey: options.accountPublicKey,
      toSign: toSign.data,
      authMethods: authMethods,
      authSig: options.authMaterial as AuthSig,
    });

    return sig;
  }
}
