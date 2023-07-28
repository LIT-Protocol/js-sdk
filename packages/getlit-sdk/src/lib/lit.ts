import {
  AccessControlConditions,
  AuthSig,
  EncryptRequestBase,
  EncryptResponse,
  SessionSig,
  SessionSigs,
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
  AuthKeys,
  EncryptResult,
  AccessControlType,
  EncryptionMetadata,
} from './types';
import {
  convertSigningMaterial,
  log,
  convertEncryptionMaterial,
  prepareEncryptionMetadata,
  parseDecryptionMaterialFromCache,
  deserializeFromType,
  getStoredAuthData,
  getProviderMap,
  resolveACCType,
  resolveACC,
  isNode,
  getSingleAuthDataByType,
  convertContentMaterial,
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
import { BaseProvider } from '@lit-protocol/lit-auth-client';
import { AuthMethod } from '../../../../dist/packages/types/src/lib/interfaces';

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
  public async encrypt(opts: EncryptProps): Promise<EncryptResult> {
    // -- vars
    let accs: Partial<EncryptRequestBase>;
    let encryptRes: EncryptResponse;
    let encryptionMaterial: LitSerialized<Uint8Array>;
    let encryptionMaterialWithMetadata: EncryptionMetadata;
    let chain = opts.chain ?? '1'; // default EVM chain
    let cache = opts.cache ?? false;

    // -- validate

    // -- node must be defined
    if (!this._litNodeClient) {
      throw new Error('_litNodeClient is undefined');
    }

    // -- access control conditions must be defined
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
      encryptRes = await this._litNodeClient.encrypt({
        dataToEncrypt: encryptionMaterial.data,
        chain,
        ...accs,
      });
    } catch (e) {
      throw new Error('Unable to encrypt content: ' + e);
    }

    let serializedEncryptResponse = JSON.stringify(encryptRes);
    let serializedMetadata = JSON.stringify(encryptionMaterialWithMetadata);

    const decryptionContext = `${serializedEncryptResponse}|${serializedMetadata}`;
    let storageKey = null;

    if (cache) {
      storageKey = `lit-encrypted-${encryptRes?.ciphertext}:${encryptRes?.dataToEncryptHash}`;

      globalThis.Lit.storage?.setItem(storageKey, decryptionContext);
      log(`Set "${storageKey}" to decryption resource: `, decryptionContext);
    }

    return {
      // -- must be provided to decrypt
      encryptResponse: {
        ...encryptRes,
        accessControlConditions: opts.accessControlConditions,
        chain,
      },
      // -- additionally
      decryptionContext: { decryptionMaterial: decryptionContext },

      // -- optional
      ...(cache && { storageKey }),
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
  public async decrypt(opts: DecryptProps) {
    if (
      !opts?.storageContext?.storageKey &&
      !opts?.decryptionContext &&
      !opts?.decryptResponse
    ) {
      log.error('Must provide either storage key or encryptionMetadata');
      return;
    }
    try {
      let material: any;
      if (opts?.storageContext && globalThis.Lit.storage) {
        let decryptionMaterial = globalThis.Lit.storage?.getItem(
          opts?.storageContext.storageKey
        );
        material = parseDecryptionMaterialFromCache(
          decryptionMaterial as string
        );
      } else if (opts.decryptionContext) {
        material = parseDecryptionMaterialFromCache(
          opts.decryptionContext.decryptionMaterial as string
        );
      } else {
        log.error(
          'Storage provider not set, cannot read from storage for decryption material'
        );
      }
      let authMaterial = opts?.authMaterial;
      let authMethodProvider = opts?.provider;
      let authMethods: Array<LitAuthMethod> = [];
      // -- when auth method provider ('google', 'discord', etc.) is provided
      if (!authMaterial && authMethodProvider?.provider) {
        authMethods = getStoredAuthData();
        if (authMethods.length < 1) {
          log.info(
            'No Authentication methods found in cache, need to re-authenticate'
          );
          return;
        }
        for (const authMethod of authMethods) {
          if (
            getProviderMap()[authMethod.authMethodType] ===
            opts.provider?.provider
          ) {
            // todo; resolve pkp info and generate session signatures for access control
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
      let acc = resolveACCType(material.metadata.accessControlConditions);
      let res = await this._litNodeClient?.decrypt({
        ...acc,
        ciphertext: material.cipherAndHash.ciphertext,
        dataToEncryptHash: material.cipherAndHash.dataToEncryptHash,
        chain: material.metadata.chain,
        authSig: opts.authMaterial as AuthSig,
      });

      return deserializeFromType(
        material.metadata.messageType,
        res?.decryptedData as Uint8Array
      );
    } catch (e) {
      log.error('Could not perform decryption operations ', e);
      return;
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
    async (authData: Array<LitAuthMethod>, cache: boolean = false) => {
      log.start('getAccounts');

      // forming a string of all the auth method types eg. '1-6'
      const authMethodTypes = authData
        .map((authData) => {
          return authData.authMethodType;
        })
        .join('-');

      log('authMethodTypes', authMethodTypes);

      const storageKey = `lit-authed-${authMethodTypes}-accounts`;
      log('storageKey', storageKey);

      try {
        let accounts;

        // -- get accounts from cache
        try {
          accounts = JSON.parse(
            globalThis.Lit.storage?.getExpirableItem(storageKey) as string
          );
        } catch (e) {
          log('error parsing cached accounts', e);
        }

        log('accounts:', accounts);

        if (!accounts) {
          log('no cached accounts found, fetching from server');
          try {
            accounts = await handleGetAccounts(authData);
          } catch (e) {
            log.error('Error while getting accounts', e);
            log.end('getAccounts');
            throw e;
          }
        }

        if (accounts.length <= 0) {
          log('no accounts found');
          log.end('getAccounts');
          return [];
        }

        // -- save to cache
        if (cache) {
          log('caching accounts');
          // -- save to cache
          // cache it to local storage
          globalThis.Lit.storage?.setExpirableItem(
            storageKey,
            JSON.stringify(accounts),
            5,
            'minutes'
          );
        }

        log.end('getAccounts');
        return accounts;
      } catch (e) {
        log.error('Error while getting accounts', e);
        log.end('getAccounts');
        throw e;
      }
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
