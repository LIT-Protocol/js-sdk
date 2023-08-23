import {
  AuthMethod,
  AuthSig,
  EncryptRequestBase,
  EncryptResponse,
} from '@lit-protocol/types';
import {
  OrUndefined,
  Types,
  SignProps,
  PKPInfo,
  LitAuthMethodOptions,
  LitAuthMethodWithProvider,
  Credential,
  EncryptProps,
  LitSerialized,
  LitAuthMethodWithAuthData,
  DecryptProps,
  LitAuthMethod,
  EncryptResult,
  EncryptionMetadata,
  DecryptRes,
} from './types';
import {
  convertSigningMaterial,
  log,
  prepareEncryptionMetadata,
  deserializeFromType,
  getStoredAuthData,
  getProviderMap,
  resolveACCType,
  isNode,
  getSingleAuthDataByType,
  convertContentMaterial,
  LitMessages,
  waitForLit,
} from './utils';
import { handleAuthData } from './create-account/handle-auth-data';
import { handleProvider } from './create-account/handle-provider';
import { isBrowser } from '@lit-protocol/misc';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';
import { handleGetAccounts } from './get-accounts/handle-get-accounts';
import { withAuthData } from './middleware/with-auth-data';
import {
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import { LitAnalytics } from './analytics';

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
    globalThis.Lit.getAccountSession = this.getAccountSession.bind(this);

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
    if (opts.decryptionContext) {
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
        authMethods = getStoredAuthData();
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
   * @diagrams
   * - createAccoutn function https://bit.ly/3NZw4SA
   * - create account with social auth (eg. google, discord) https://bit.ly/3DkC9UV
   * - create account with webauthn https://bit.ly/44J4rUw
   * - create account with ethwallet https://bit.ly/3OiIVRa
   * - create account with OTP https://bit.ly/3rFbLSQ
   *
   * @param {LitAuthMethodOptions} opts
   * @returns {Promise<void | PKPInfo[]>}
   */
  public async createAccount(
    opts: LitAuthMethodOptions
  ): Promise<void | PKPInfo[]> {
    log('creating account...');
    log('opts', opts);

    // If dev provides a "provider" eg. google, discord, ethwallet, etc.
    if ((opts as LitAuthMethodWithProvider).provider) {
      return await handleProvider(opts as LitAuthMethodWithProvider);
    }

    // If dev provides a "authData" array where they obtain the auth data manually themselves eg. credentials: [googleAuthData, discordAuthData, etc.]
    return await handleAuthData(opts as LitAuthMethodWithAuthData);
  }

  /**
   * Get all accounts associated with the given auth method(s).
   * @param {LitAuthMethod[]} authData
   */
  public getAccounts = withAuthData(
    async (authData: Array<LitAuthMethod>, cache: boolean) => {
      log.start('getAccounts');

      let accounts;

      try {
        accounts = await handleGetAccounts(authData, {
          cache,
        });
      } catch (e) {
        log.error('Error while getting accounts', e);
        log.end('getAccounts');
        throw e;
      }

      return accounts;
    }
  );

  /**
   * Get the session sigs for the given account
   * NOTE: this function can only be called if user cached their auth data
   */
  public async getAccountSession(
    accountPublicKey: string,
    opts?: {
      authData?: LitAuthMethod;
      chain?: string;
    }
  ) {
    log.start('getAccountSession');

    // we should be able to look up which auth method provider was used to authenticate the user by public key
    const authMethodProvider = 'google';

    console.log('accountPublicKey', accountPublicKey);

    // if accountPublicKey doesn't start with '0x' add it
    if (!accountPublicKey.startsWith('0x')) {
      accountPublicKey = '0x' + accountPublicKey;
    }

    let authData: LitAuthMethod | undefined;

    // -- validate
    if (!opts?.authData) {
      log.info('No auth data provided, checking cache for auth data');

      try {
        authData = getSingleAuthDataByType(authMethodProvider);
      } catch (e) {
        log.error('No auth data found in cache, please re-authenticate');
        throw e;
      }
    }

    if (!authData) {
      log.error('No auth data found in cache, please re-authenticate');
      throw new Error('No auth data found in cache, please re-authenticate');
    }

    console.log('authData', authData);

    // -- execute
    const resource = new LitAccessControlConditionResource('*');
    const ability = LitAbility.PKPSigning;
    const provider = globalThis.Lit.auth[authMethodProvider];

    log.info(`Getting session sigs for "${accountPublicKey}"...`);

    const sessionSigs = await provider?.getSessionSigs({
      pkpPublicKey: accountPublicKey,
      authMethod: authData,
      sessionSigsParams: {
        chain: 'ethereum', // default EVM chain unless other chain
        resourceAbilityRequests: [
          {
            resource,
            ability,
          },
        ],
      },
    });

    console.log('sessionSigs: ', sessionSigs);

    log.end('getAccountSession');

    return sessionSigs;
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
      authMethods = getStoredAuthData();
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
