import { LitNodeClientConfig } from '@lit-protocol/types';
import { OrNull, OrUndefined, Types } from './types';
import {
  clearSessions,
  getProviderMap,
  getStoredAuthData,
  getStoredEncryptedData,
  isBrowser,
  isNode,
  log,
} from './utils';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { Lit } from './lit';
import { ILitStorage, LitStorage } from '@lit-protocol/lit-storage';

import {
  AppleProvider,
  DiscordProvider,
  EthWalletProvider,
  GoogleProvider,
  OtpProvider,
  WebAuthnProvider,
} from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { LitEmitter } from './events/lit-emitter';
import { BrowserHelper } from './browser-helper';
import { BaseIPFSProvider } from './ipfs-provider-sdk/providers/BaseIPFSProvider';

const DEFAULT_NETWORK = 'cayenne'; // changing to "cayenne" soon

export class LitOptionsBuilder {
  private _contractOptions: OrUndefined<Types.ContractOptions> = undefined;
  private _authOptions: OrUndefined<Types.AuthOptions> = undefined;
  private _nodeClientOptions: OrUndefined<LitNodeClientConfig> = undefined;
  private _nodeClient: OrUndefined<Types.NodeClient> = undefined;

  private _persistentStorage: OrNull<BaseIPFSProvider> = null;
  private _emitter: OrUndefined<LitEmitter> = undefined;
  private _storage: OrUndefined<LitStorage> = undefined;

  constructor(opts?: {
    persistentStorage?: BaseIPFSProvider;
    emitter?: LitEmitter;
    storage?: LitStorage;
  }) {
    log.start('LitOptionsBuilder', 'starting LitOptionsBuilder...');

    // -- set globalThis.Lit.persistentStorage
    if (opts?.persistentStorage) {
      this._persistentStorage = opts.persistentStorage;

      if (this._persistentStorage) {
        globalThis.Lit.persistentStorage = this._persistentStorage as any;
      }
    }

    // -- set globalThis.Lit.emitter
    if (opts?.emitter) {
      this._emitter = opts.emitter;

      // todo: figure out why there is type incompatibility
      globalThis.Lit.eventEmitter = this._emitter as any;
    }
    // -- set globalThis.Lit.storage
    if (opts?.storage) {
      this._storage = opts.storage;
      globalThis.Lit.storage = this._storage;
    }

    log.end('LitOptionsBuilder', 'done!');
  }

  public withContractOptions(options: Types.ContractOptions) {
    this._contractOptions = options;
  }

  public withAuthOptions(options: Types.AuthOptions) {
    this._authOptions = options;
  }
  public withNodeClient(client: Types.NodeClient) {
    this._nodeClient = client;
  }

  public withStorageProvider(provider: ILitStorage) {
    this._storage = new LitStorage({ storageProvider: provider });
  }

  public async build(): Promise<void> {
    log.start('build', 'starting...');

    const nodeClientOpts = this._nodeClientOptions ?? {
      litNetwork: DEFAULT_NETWORK,
      debug: false,
    };

    log('using class "LitNodeClient"');
    this._nodeClient = new LitNodeClient(nodeClientOpts);

    try {
      await this._nodeClient?.connect();
      log.success(
        '🎉 connected to LitNodeClient! ready:',
        this._nodeClient?.ready
      );
    } catch (e) {
      log.throw(`Error while attempting to connect to LitNodeClient ${e}`);
    }

    globalThis.Lit.nodeClient = this._nodeClient as Types.NodeClient;
    // todo: figure out why there is type incompatibility
    globalThis.Lit.instance = new Lit() as any;
    log.info('"globalThis.Lit" has already been initialized!');

    if (!globalThis.Lit.instance) {
      return;
    }

    globalThis.Lit.instance.Configure = {
      ...this._authOptions,
      ...this._contractOptions,
      ...this._nodeClientOptions,
    };

    log.end('build', 'done!');

    this._emitter?.emit('ready', true);
    globalThis.Lit.ready = true;

    await this.startAuthClient();

    this.createUtils();
    this.createBrowserUtils();
  }

  public emit(event: string, ...args: any[]) {
    this._emitter?.emit(event, ...args);
  }

  public async startAuthClient(): Promise<void> {
    log.start('startAuthClient', 'starting...');

    globalThis.Lit.authClient = new LitAuthClient({
      // redirectUri: window.location.href.replace(/\/+$/, ''),
      litRelayConfig: {
        relayApiKey: '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
      },
      litNodeClient: globalThis.Lit.nodeClient,
      storageProvider: globalThis.Lit.storage,
    });

    if (!globalThis.Lit.authClient) {
      return log.throw('"globalThis.Lit.authClient" failed to initialize');
    }

    log.success('"globalThis.Lit.authClient" has been set!');

    log('setting "globalThis.Lit.auth"');

    if (isBrowser()) {
      globalThis.Lit.auth.google =
        globalThis.Lit.authClient.initProvider<GoogleProvider>(
          ProviderType.Google
        );
      globalThis.Lit.auth.discord =
        globalThis.Lit.authClient.initProvider<DiscordProvider>(
          ProviderType.Discord
        );
      globalThis.Lit.auth.webauthn =
        globalThis.Lit.authClient.initProvider<WebAuthnProvider>(
          ProviderType.WebAuthn
        );

      // globalThis.Lit.auth.apple =
      //   globalThis.Lit.authClient.initProvider<AppleProvider>(
      //     ProviderType.Apple
      //   );
    }
    globalThis.Lit.auth.ethwallet =
      globalThis.Lit.authClient.initProvider<EthWalletProvider>(
        ProviderType.EthWallet
      );

    globalThis.Lit.auth.otp =
      globalThis.Lit.authClient.initProvider<OtpProvider>(ProviderType.Otp);

    let authStatus = Object.entries(globalThis.Lit.auth)
      .map(([key, value]) => {
        return `${value ? '✅' : '❌'} authMethodType: ${
          getProviderMap()[key.toLowerCase()]
        } |  ${key}`;
      })
      .join('\n');

    log.success('"globalThis.Lit.auth" has been set!');
    log.info('globalThis.Lit.auth', '\n' + authStatus);
    log.info(
      `(UPDATED AT: 14/07/2023) A list of available auth methods can be found in PKPPermissions.sol https://bit.ly/44HHa5n (private, to be public soon)`
    );

    log.end('startAuthClient', 'done!');
  }

  public createUtils() {
    log.start('createUtils', 'starting...');

    globalThis.Lit.getStoredAuthData = getStoredAuthData;
    globalThis.Lit.getStoredEncryptedData = getStoredEncryptedData;
    globalThis.Lit.clearSessions = clearSessions;

    log.end('createUtils', 'done!');
  }

  public createBrowserUtils() {
    // -- validate
    if (isNode()) {
      log.info(
        'skipping "createBrowserUtils" as we are not in a browser environment'
      );
      return;
    }

    // -- create
    globalThis.Lit.browserHelper = new BrowserHelper();
  }
}
