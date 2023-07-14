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
  isNode,
  log,
  getProviderMap,
  enableAutoAuth,
} from './utils';
import { ProviderType } from '@lit-protocol/constants';
import { handleSingleAuthToAccount } from './create-account/handle-single-auth';
import { handleCreateAccountValidation } from './create-account/handle-validation';
import { LitDispatch } from './events';

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
    globalThis.Lit.createAccount = this.createAccount.bind(this);
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
  // https://bit.ly/3DetZ0o
  public async createAccount(
    opts: LitCredentialOptions = {
      provider: null,
      credentials: [],
    }
  ): Promise<void | PKPInfo[]> {
    log('creating account...');

    // const provider = (opts as LitCredentialAutomatic).provider;
    // const credentials = (opts as LitCredentialManual).credentials;

    // a. Manually obtain credentials - passing in authData (eg. googleAuthData)
    if (!(opts as LitCredentialAutomatic).provider) {
      return await handleManualCreation(opts as LitCredentialManual);
    }
    // b. Automatically create account by passing in provider (eg. google)
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
        const PKPInfo = await handleSingleAuthToAccount(credentials[0]);
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
      const provider = (opts as LitCredentialAutomatic).provider?.toLowerCase();

      log.start(
        'handleAutomaticCreation',
        `creating account automatically with provider "${provider}"`
      );

      if (!provider) {
        log.throw(
          `"provider" is required to create an account automatically! eg. google, discord`
        );
      }

      // -- handle wallet auths
      if (provider === ProviderType.EthWallet.toLowerCase()) {
        const ethWalletAuthData =
          await globalThis.Lit.auth.ethWallet?.authenticate();
        log('ethWalletAuthData', ethWalletAuthData);
        LitDispatch.createAccountStatus('in_progress');
        try {
          const PKPInfo = await handleSingleAuthToAccount(
            ethWalletAuthData as LitCredential
          );
          LitDispatch.createAccountStatus('completed', [PKPInfo]);

          return [PKPInfo];
        } catch (e) {
          LitDispatch.createAccountStatus('failed');
          log.throw(`Failed to create account!`);
        }
      }

      // -- handle social auths
      if (
        provider === ProviderType.Google ||
        provider === ProviderType.Discord
      ) {
        enableAutoAuth();
        globalThis.Lit.auth[provider]?.signIn();
      }

      log.throw(`provider "${provider}" is not supported yet!`);
    }
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
