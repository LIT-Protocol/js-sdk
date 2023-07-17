import { AuthSig } from '@lit-protocol/types';
import {
  OrUndefined,
  Types,
  SignProps,
  PKPInfo,
  LitAuthMethodOptions,
  LitAuthMethodWithProvider,
  Credential,
  EncryptProps,
  LitAuthMethodManual,
  LitSerialized,
} from './types';
import {
  convertSigningMaterial,
  log,
  getProviderMap,
  convertEncryptionMaterial,
  prepareEncryptionMetadata,
} from './utils';
import { handleAuthData } from './create-account/handle-auth-data';
import { handleProvider } from './create-account/handle-provider';
import { handleCredentials } from './create-account/handle-credentials';
import { isBrowser } from '@lit-protocol/misc';
import { uint8arrayToString } from '@lit-protocol/uint8arrays';
import { encryptString } from '@lit-protocol/encryption';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';

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

    // util bindings
  }

  // ========== Encryption ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#33d88ea255ff4866bc28724249a71a7e
  public async encrypt(opts: EncryptProps) {
    if (opts.accessControlConditions.length < 1) {
      log.error('Access Control Conditions must be defined.');
      return;
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
      let encryptionMaterialWithMetadata = prepareEncryptionMetadata(
        serializedEncryptionMaterial,
        opts.chain,
        opts.accessControlConditions
      );

      let encryptionKey = await this._litNodeClient?.encrypt({
        dataToEncrypt: serializedEncryptionMaterial.data,
        chain: opts.chain,
        accessControlConditions: opts.accessControlConditions,
        authSig: opts.authMaterial,
      }).catch(e => {
        log.error("Unable to encrypt content ", opts.encryptMaterial, e);
        throw e;
      });

      let serializedEncryptionKey = JSON.stringify(encryptionKey);
      let serializedMetadata = JSON.stringify(encryptionMaterialWithMetadata);
      
      const decryptionContext =  `${serializedEncryptionKey}:${serializedMetadata}`;
      let storageKey: string = `${encryptionKey?.ciphertext}:${encryptionKey?.dataToEncryptHash}`;

      localStorage.setItem(storageKey, decryptionContext);
    } catch (e) {
      log.error(`Error while attempting to encrypt and save ${e}`);
    }

    return;
  }

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#2465ff247cd24e71b01a3257319b84b8
  public decrypt() {}

  // ========== Signing ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#f4f4d44e2a1340ebb08517dfd2c16265
  // aka. mintWallet

  // simple first, advanced later
  // https://bit.ly/3DetZ0o
  public async createAccount(
    opts: LitAuthMethodOptions
  ): Promise<void | PKPInfo[]> {
    log('creating account...');
    log('opts', opts);

    // If dev provides a "provider" eg. google, discord, ethwallet, etc.
    if ((opts as LitAuthMethodWithProvider).provider) {
      return await handleProvider(opts as LitAuthMethodWithProvider);
    }

    // If dev provides a "credentials" array where they obtain the auth data manually themselves eg. credentials: [googleAuthData, discordAuthData, etc.]
    return await handleCredentials(opts as LitAuthMethodManual);
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
