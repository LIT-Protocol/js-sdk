import {
  AccessControlConditions,
  AuthSig,
  EncryptRequestBase,
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

    // util bindings
  }

  // ========== Encryption ==========

  /**
   * Encrypt a given content thats {@link LitSerializable} with provided access control conditions
   * @param {EncryptProps} opts
   * @returns {Promise<void | EncryptResult>}
   */
  public async encrypt(opts: EncryptProps): Promise<void | EncryptResult> {
    if (
      opts?.accessControlConditions &&
      opts.accessControlConditions.length < 1
    ) {
      log.error(
        'Access Control Conditions are undefined, no conditions will be defined'
      );
    }
    let conditions = resolveACCType(
      opts?.accessControlConditions as AccessControlType
    );

    try {
      let serializedEncryptionMaterial = convertEncryptionMaterial(
        opts.encryptMaterial
      );
      let encryptionMaterialWithMetadata = prepareEncryptionMetadata(
        opts,
        serializedEncryptionMaterial,
        conditions as Partial<EncryptRequestBase>
      );

      let encryptionKey = await this._litNodeClient
        ?.encrypt({
          dataToEncrypt: serializedEncryptionMaterial.data,
          chain: opts.chain,
          ...conditions,
        })
        .catch((e) => {
          log.error('Unable to encrypt content ', opts.encryptMaterial, e);
          throw e;
        });

      let serializedEncryptionKey = JSON.stringify(encryptionKey);
      let serializedMetadata = JSON.stringify(encryptionMaterialWithMetadata);

      const decryptionContext = `${serializedEncryptionKey}|${serializedMetadata}`;
      let storageKey: string = `${encryptionKey?.ciphertext}:${encryptionKey?.dataToEncryptHash}`;

      globalThis.Lit.storage?.setItem(storageKey, decryptionContext);
      log('Set ', storageKey, 'to decrypytion resource: ', decryptionContext);

      return {
        storageContext: { storageKey },
        decryptionContext: { decryptionMaterial: decryptionContext },
        encryptResponse: {
          ciphertext: encryptionKey?.ciphertext as string,
          dataToEncryptHash: encryptionKey?.dataToEncryptHash as string,
          accessControlConditions:
            opts.accessControlConditions as AccessControlConditions,
          chain: opts.chain,
        },
      };
    } catch (e) {
      log.error('Error while performing decryption operations', e);
      return;
    }
  }

  /**
   * Decrypts a given resource based on the {@link DecryptProps}
   * supports resolving from cache with {@link StorageContext}
   * by providing the {@link DecryptionRequest}
   * Authentication context must be provided or cache will be checked for {@link Credential}
   * @param {DecryptProps} opts
   * @returns decrypted content as its {@link LitSerializable} compatible type
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
  public getAccounts = withAuthData(async (authData: Array<LitAuthMethod>) => {
    log('getting accounts...');

    try {
      return await handleGetAccounts(authData);
    } catch (e) {
      log.error('Error while getting accounts', e);
      throw e;
    }
  });

  /**
   * Sign a message with a given pkp specified by the public key
   * Signature responses are valid ECDSA sigatures
   * **Note** at this time signatures are NOT deterministic
   * @param {SignProps} options
   * @returns
   */
  public async sign(options: SignProps) {
    const toSign: LitSerialized<number[]> = convertSigningMaterial(
      options.signingMaterial
    );
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

    if (!options.authMaterial && !options.provider) {
      if (isBrowser()) {
        let authSig = await checkAndSignAuthMessage({ chain: 'ethereum' });
        options.authMaterial = authSig;
      } else {
        throw new Error(
          'Must provide either auth methods or auth signature, aborting ...'
        );
      }
    }
    const sig = await this._litNodeClient?.pkpSign({
      pubKey: options.accountPublicKey,
      toSign: toSign.data,
      authMethods: authMethods,
      authSig: options.authMaterial as AuthSig,
    });

    return sig;
  }
}
