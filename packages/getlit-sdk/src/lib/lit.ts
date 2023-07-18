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
} from './types';
import {
  convertSigningMaterial,
  log,
  convertEncryptionMaterial,
  prepareEncryptionMetadata,
} from './utils';
import { handleAuthData } from './create-account/handle-auth-data';
import { handleProvider } from './create-account/handle-provider';
import { isBrowser } from '@lit-protocol/misc';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';
import { handleGetAccounts } from './get-accounts/handle-get-accounts';

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
      let authMaterial: Credential | undefined = opts?.authMaterial;
      let authMethodProvider: LitAuthMethodWithProvider | undefined =
        opts?.provider;

      // -- when auth method provider ('google', 'discord', etc.) is provided
      if (!authMaterial && authMethodProvider) {
        // todo: authenticate with the given provider type.
      } else if (!authMaterial && !authMethodProvider) {
        if (isBrowser()) {
          authMaterial = await checkAndSignAuthMessage({ chain: opts.chain });
        }
      }

      let serializedEncryptionMaterial = convertEncryptionMaterial(
        opts.encryptMaterial
      );
      let encryptionMaterialWithMetadata = prepareEncryptionMetadata(opts);

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

      const decryptionContext = `${serializedEncryptionKey}:${serializedMetadata}`;
      let storageKey: string = `${encryptionKey?.ciphertext}:${encryptionKey?.dataToEncryptHash}`;

      globalThis.Lit.storage?.setItem(storageKey, decryptionContext);
      log('Set ', storageKey, 'to decrypytion resource: ', decryptionContext);

      return {
        storageKey,
        encryption: encryptionKey,
      };
    } catch (e) {
      log.error(`Error while attempting to encrypt and save ${e}`);
    }

    return;
  }

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#2465ff247cd24e71b01a3257319b84b8
  public decrypt(opts: {
    storageKey?: string;
    encryptionMetadata?: EncryptResponse;
    authMaterial?: Credential;
    chain?: string;
  }) {
    if (!opts.storageKey && opts.encryptionMetadata) {
      log.error('Must provide either storage key or encryptionMetadata');
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

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#9b2b39cd96db42daae6a2b3a6cb3c69a
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
