import { AuthSig } from '@lit-protocol/types';
import {
  LitCredential,
  OrUndefined,
  Types,
  SignProps,
  PKPInfo,
  LitCredentialOptions,
  LitCredentialAutomatic,
  LitCredentialManual,
} from './types';
import {
  convertSigningMaterial,
  isBrowser,
  isNode,
  log,
  getProviderMap,
  getDerivedAddresses,
} from './utils';
import { ProviderType } from '@lit-protocol/constants';
import { handleOneToOneCreation } from './create-account/handle-one-to-one-creation';
import { handleCreateAccountValidation } from './create-account/handle-validation';

export class Lit {
  private _options: OrUndefined<Types.LitOptions>;
  private _litNodeClient: OrUndefined<Types.NodeClient>;

  public set Configure(value: Types.LitOptions) {
    this._options = value;
    this._litNodeClient = globalThis.Lit.nodeClient ?? undefined;
  }

  constructor() {
    globalThis.Lit.encrypt = this.encrypt.bind(this);
    globalThis.Lit.decrypt = this.decrypt.bind(this);
    globalThis.Lit.sign = this.sign.bind(this);

    // multiple auth methods to 1 PKP
    globalThis.Lit.createAccount = this.createAccount.bind(this);

    // 1 auth method to 1 PKP
    globalThis.Lit.createAccountWithGoogle =
      this.createAccountWithGoogle.bind(this);
    globalThis.Lit.createAccountWithDiscord =
      this.createAccountWithDiscord.bind(this);
  }

  // ========== Encryption ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#33d88ea255ff4866bc28724249a71a7e
  public encrypt() {}

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#2465ff247cd24e71b01a3257319b84b8
  public decrypt() {}

  // ========== Signing ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#f4f4d44e2a1340ebb08517dfd2c16265
  // aka. mintWallet

  // simple first, advanced later
  public async createAccount(
    opts: LitCredentialOptions = {
      provider: null,
      credentials: [],
    }
  ): Promise<void | PKPInfo[]> {
    log('creating account...');

    // create account manually by passing in credentials (eg. googleAuthData)
    if (!(opts as LitCredentialAutomatic).provider) {
      return await handleManualCreation(opts as LitCredentialManual);
    }
    // create account automatically by passing in provider (eg. google)
    else {
      return await handleAutomaticCreation(opts as LitCredentialAutomatic);
    }

    // -- helper functions --
    async function handleManualCreation(opts: LitCredentialManual) {
      const { credentials = [] } = opts;
      log.start('handleManualCreation', 'creating account manually...');

      handleCreateAccountValidation(credentials);

      log.info(
        `credentials found! [${credentials.map(
          (c) => `(${c.authMethodType}|${getProviderMap()[c.authMethodType]})`
        )}]`
      );

      if (credentials.length === 1) {
        const PKPInfo = await handleOneToOneCreation(credentials[0]);
        log.end('handleManualCreation', 'account created successfully!');
        return [PKPInfo];
      }

      if (credentials.length > 1) {
        log.error(`multiple credentials are not supported yet!`);
        log.end('handleManualCreation', 'failed to create account!');
      }

      log.throw(`Failed to create account!`);
    }

    async function handleAutomaticCreation(opts: LitCredentialAutomatic) {
      if (!opts.provider) {
        log.throw(
          `"provider" is required to create an account automatically! eg. google, discord`
        );
      }

      log.start('handleAutomaticCreation', 'creating account automatically...');
      localStorage.setItem('lit-auto-auth', 'true');

      if (
        opts.provider === ProviderType.Google ||
        opts.provider === ProviderType.Discord
      ) {
        globalThis.Lit.auth[opts.provider]?.signIn();
      } else {
        log.throw(`provider ${opts.provider} is not supported yet!`);
      }
    }
  }

  public createAccountWithGoogle() {
    log.start('createAccountWithGoogle', 'creating google account...');

    if (isNode()) {
      log.throw(
        `createAccountWithGoogle is not supported in node at the moment!`
      );
    }

    localStorage.setItem('lit-auto-auth', 'true');
    globalThis.Lit.auth.google?.signIn();

    // when the user return to the app, we will check it in index.ts to global initialize & auto authenticate
  }

  public async createAccountWithDiscord() {
    log.start('createAccountWithDiscord', 'creating discord account...');

    if (isNode()) {
      log.throw(
        `createAccountWithDiscord is not supported in node at the moment!`
      );
    }

    localStorage.setItem('lit-auto-auth', 'true');

    globalThis.Lit.auth.discord?.signIn();

    // when the user return to the app, we will check it in index.ts to global initialize & auto authenticate
  }

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#9b2b39cd96db42daae6a2b3a6cb3c69a
  public async sign(options: SignProps) {
    const toSign: number[] = convertSigningMaterial(options.signingMaterial);

    const sig = await this._litNodeClient?.pkpSign({
      pubKey: options.accountPublicKey,
      toSign,
      authMethods: options.credentials,
      authSig: options.authMatrial as AuthSig,
    });

    return sig;
  }
}
