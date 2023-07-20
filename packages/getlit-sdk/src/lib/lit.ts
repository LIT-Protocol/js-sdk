import {
  AccessControlConditions,
  AuthMethod,
  AuthSig,
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

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#33d88ea255ff4866bc28724249a71a7e
  public async encrypt(opts: EncryptProps) {
    if (
      opts?.accessControlConditions &&
      opts.accessControlConditions.length < 1
    ) {
      log.error(
        'Access Control Conditions are undefined, no conditions will be defined'
      );
    }

    try {
      let serializedEncryptionMaterial = convertEncryptionMaterial(
        opts.encryptMaterial
      );
      let encryptionMaterialWithMetadata = prepareEncryptionMetadata(
        opts,
        serializedEncryptionMaterial
      );

      let encryptionKey = await this._litNodeClient
        ?.encrypt({
          dataToEncrypt: serializedEncryptionMaterial.data,
          chain: opts.chain,
          accessControlConditions:
            opts.accessControlConditions as AccessControlConditions,
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
        storageKey,
        decryptionContext,
        encryptionResponse: {
          cipher: encryptionKey?.ciphertext,
          dataToEncryptHash: encryptionKey?.dataToEncryptHash,
          accessControlConditions: opts.accessControlConditions,
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
      let authMethodProvider = opts?.authMaterial;
      let authMethods: Array<LitAuthMethod> = [];
      // -- when auth method provider ('google', 'discord', etc.) is provided
      if (!authMaterial && authMethodProvider) {
        authMethods = getStoredAuthData();
        if (authMethods.length < 1) {
          log.info(
            'No Authentication methods found in cache, need to re-authenticate'
          );
          return;
        }
        // todo: auth the material found in cache if session isnt already cached.
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

      let res = await this._litNodeClient?.decrypt({
        accessControlConditions: material.metadata.accessControlConditions,
        ciphertext: material.cipherAndHash.ciphertext,
        dataToEncryptHash: material.cipherAndHash.dataToEncryptHash,
        chain: material.metadata.chain,
        authSig: opts.authMaterial,
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
   *
   * @param options
   * @returns
   */
  public async sign(options: SignProps) {
    const toSign: LitSerialized<number[]> = convertSigningMaterial(
      options.signingMaterial
    );
    if (options.authData == undefined) {
      throw new Error('Auth data must be provided, aborting');
    }

    // -- session sig
    const resource = new LitAccessControlConditionResource('*');
    const ability = LitAbility.PKPSigning;

    const sessionSigsFromAuthData = await Promise.all(
      options.authData.map(async (authData: AuthMethod) => {
        const authProviderMap = getProviderMap();
        const authMethodName = authProviderMap[authData.authMethodType];

        // -- validate existence of auth provider
        if (!authMethodName) {
          throw new Error(
            `Auth provider "${authData.authMethodType}" not found, aborting`
          );
        }

        // --
        const authProvider: BaseProvider = (
          globalThis.Lit.auth as { [key: string]: any }
        )[authMethodName];

        const sessionSigs = authProvider.getSessionSigs({
          pkpPublicKey: options.accountPublicKey,
          authMethod: authData,
          sessionSigsParams: {
            chain: 'ethereum',
            resourceAbilityRequests: [
              {
                resource,
                ability,
              },
            ],
          },
        });

        return sessionSigs;
      })
    );

    console.log('sessionSigsFromAuthData:', sessionSigsFromAuthData);

    // -- ok, but which session sig do we use?
    const sig = await this._litNodeClient?.pkpSign({
      pubKey: options.accountPublicKey,
      toSign: toSign.data,
      authMethods: options.authData,
      authSig: options.authMaterial as AuthSig,
    });

    return sig;
  }
}
