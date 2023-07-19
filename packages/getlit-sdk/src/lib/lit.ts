import {
  AccessControlConditions,
  AuthSig,
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
  AccessControlType,
  DecryptProps,
} from './types';
import {
  convertSigningMaterial,
  log,
  convertEncryptionMaterial,
  prepareEncryptionMetadata,
  parseDecryptionMaterialFromCache,
  deserializeFromType,
} from './utils';
import { handleAuthData } from './create-account/handle-auth-data';
import { handleProvider } from './create-account/handle-provider';
import { isBrowser } from '@lit-protocol/misc';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';
import { handleGetAccounts } from './get-accounts/handle-get-accounts';
import { decryptToString } from '@lit-protocol/encryption';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

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

    let authMaterial: Credential | undefined = opts?.authMaterial;
    let authMethodProvider: LitAuthMethodWithProvider | undefined =
      opts?.provider;

    try {
      // -- when auth method provider ('google', 'discord', etc.) is provided
      if (!authMaterial && authMethodProvider) {
        // todo: authenticate with the given provider type.
      } else if (!authMaterial && !authMethodProvider) {
        if (isBrowser()) {
          authMaterial = await checkAndSignAuthMessage({ chain: opts.chain });
        }
      }
      opts.authMaterial = authMaterial;
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
          authSig: opts.authMaterial,
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
        encryptionResponse: encryptionKey,
        decryptionContext,
      };
    } catch (e) {
      log.error('Error while performing decryption operations', e);
      return;
    }
  }

  /**
   *
   * @param opts
   * @returns
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
      } else {
        log.error(
          'Storage provider not set, cannot read from storage for decryption material'
        );
      }
      log('resolved metadata for material: ', material.metadata);
      let res = await this._litNodeClient?.decrypt({
        accessControlConditions: material.metadata.accessControlConditions,
        ciphertext: material.cipherAndHash.ciphertext,
        dataToEncryptHash: material.cipherAndHash.dataToEncryptHash,
        chain: material.metadata.chain,
        authSig: material.metadata.authMaterial,
      });
      return deserializeFromType(
        material.metadata.type,
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

  public async getAccounts(
    opts: LitAuthMethodWithAuthData
  ): Promise<PKPInfo[]> {
    log('getting accounts...');

    // If dev provides a "authData" array
    if (opts) {
      return await handleGetAccounts(opts.authData);
    }

    throw new Error('Not implemented');
  }

  /**
   *
   * @param options
   * @returns
   */
  public async sign(options: SignProps) {
    const toSign: LitSerialized<number[]> = convertSigningMaterial(
      options.signingMaterial
    );
    if (options.authMatrial == undefined) {
      throw new Error('Credentials must be provided, aborting');
    }

    const sig = await this._litNodeClient?.pkpSign({
      pubKey: options.accountPublicKey,
      toSign: toSign.data,
      authMethods: options.credentials,
      authSig: options.authMatrial as AuthSig,
    });

    return sig;
  }
}
