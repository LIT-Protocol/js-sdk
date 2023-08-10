import { AuthMethod, LitNodeClientConfig } from '@lit-protocol/types';
import {
  OrNull,
  OrUndefined,
  PersistentStorageConfig,
  Types,
  infuraConfig,
  pinataConfig,
} from './types';
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
import { BaseIPFSProvider } from './ipfs-provider/providers/BaseIPFSProvider';
import { HeliaProvider } from './ipfs-provider/providers/helia-provider';
import { PinataProvider } from './ipfs-provider/providers/pinata-provider';
import { infuraProvider } from './ipfs-provider/providers/infura-provider';
import { handleAutoAuth } from './auth/handle-auto-auth';

const DEFAULT_NETWORK = 'cayenne'; // changing to "cayenne" soon

export class LitOptionsBuilder {
  private _contractOptions: OrUndefined<Types.ContractOptions> = undefined;
  private _authOptions: OrUndefined<Types.AuthOptions> = undefined;
  private _nodeClientOptions: OrUndefined<LitNodeClientConfig> = undefined;
  private _nodeClient: OrUndefined<Types.NodeClient> = undefined;

  private _persistentStorage: OrNull<BaseIPFSProvider> = null;
  private _emitter: OrUndefined<LitEmitter> = undefined;
  private _storage: OrUndefined<LitStorage> = undefined;

  private isExecuted: boolean = false;

  constructor() {
    this.initialiseEventEmitter();
    this.initialiseIPFSProvider({
      provider: 'helia',
    });
    this.initialiseStorageProvider();
    this.createUtils();
    this.createBrowserUtils();
  }

  // ========== Default ==========ƒ
  // Converts the instance back to a function-like behavior.
  // When it is invoked directly, it should default to the normal execution behavior.
  async invoke({
    debug = true,
  }: {
    debug?: boolean;
  }): Promise<LitOptionsBuilder> {
    await this.execute({ debug });
    return this;
  }

  private async execute({ debug = true }: { debug?: boolean }): Promise<void> {
    if (this.isExecuted) {
      return;
    }

    this.isExecuted = true;

    globalThis.Lit.debug = debug; // switch this to false for production
    globalThis.Lit.builder = null;

    log.start('global', 'initializing...');

    // -- initialize LitOptionsBuilder
    try {
      globalThis.Lit.builder = new LitOptionsBuilder() as any;
    } catch (e) {
      log.throw(`Error while attempting to initialize LitOptionsBuilder\n${e}`);
    }

    if (!globalThis.Lit.builder) {
      log.throw(`globalThis.Lit.builder is undefined!`);
    }

    // -- build LitOptionsBuilder
    try {
      await globalThis.Lit.builder.build();
    } catch (e) {
      log.throw(`Error while attempting to build LitOptionsBuilder\n${e}`);
    }

    log.end('global', 'done!');

    // ---------- Enable auto auth for browser ----------
    if (isBrowser()) {
      handleAutoAuth(async (authData: AuthMethod) => {
        globalThis.Lit.eventEmitter?.createAccountStatus('in_progress');
        log.info('Creating Lit account...');

        try {
          const PKPInfoArr = await globalThis.Lit.createAccount({
            authData: [authData],
          });
          log.success('Lit account created!');
          log.info(`PKPInfo: ${JSON.stringify(PKPInfoArr)}`);

          if (Array.isArray(PKPInfoArr)) {
            globalThis.Lit.eventEmitter?.createAccountStatus(
              'completed',
              PKPInfoArr
            );
          }
        } catch (e) {
          log.error(`Error while attempting to create Lit account ${e}`);
          globalThis.Lit.eventEmitter?.createAccountStatus('failed');
        }
      });
    }
  }

  // ========== With Methods ==========
  public withContractOptions(options: Types.ContractOptions) {
    this._contractOptions = options;
    return this;
  }

  // -- if you want to customize the relay & OTP configurations
  public withAuthOptions(options: Types.AuthOptions) {
    this._authOptions = options;
    return this;
  }

  // -- if you want to customize the LitNodeClient configurations
  public withNodeClient(client: Types.NodeClient) {
    this._nodeClient = client;
    return this;
  }

  // -- If you want to specify where to store your cache data, by default it will be stored in localStorage,
  // or memory if you are using NodeJS
  public withCacheProvider(provider: ILitStorage) {
    this._storage = new LitStorage({ storageProvider: provider });
    return this;
  }

  // -- If you want to specify which IPFS provider to use, by default it will be using Helia
  public withPersistentStorage({ provider, options }: PersistentStorageConfig) {
    this.initialiseIPFSProvider({
      provider,
      options,
    });
    return this;
  }

  // ========== Build ==========
  public async build(): Promise<void> {
    // await new Promise((resolve) => setTimeout(resolve, 10000));

    log.start('build', 'starting...');

    // -- start
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
    globalThis.Lit.instance = new Lit();
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

    await this.initialiseAuthClient();
  }

  // ========== Initialise ==========
  public async initialiseAuthClient(): Promise<void> {
    log.start('initialiseAuthClient', 'starting...');

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

    log.end('initialiseAuthClient', 'done!');
  }

  public initialiseIPFSProvider({
    provider,
    options,
  }: PersistentStorageConfig): BaseIPFSProvider {
    try {
      // -- options for persistent storage
      const providerOptions = {
        helia: () => new HeliaProvider(),
        pinata: (options: pinataConfig) =>
          new PinataProvider({
            JWT: options.JWT ?? '',
          }),
        infura: (options: infuraConfig) =>
          new infuraProvider({
            API_KEY: options.API_KEY ?? '',
            API_KEY_SECRET: options.API_KEY_SECRET ?? '',
          }),
        // .. add more providers here
      };

      // -- select persistent storage provider
      if (providerOptions[provider]) {
        log.info('Provider selected: ', provider);
        const IPFSProvider = providerOptions[provider](options as any);

        // -- set globalThis.Lit.persistentStorage
        this._persistentStorage = IPFSProvider;
        globalThis.Lit.persistentStorage = IPFSProvider;
        return IPFSProvider;
      } else {
        log.throw(`Invalid persistentStorage option: ${options}`);
      }
    } catch (e) {
      log.error(`
      Error while attempting to initialize IPFSProvider, please check your persistentStorage config\n
  
      loadLit({
        persistentStorage: {
          provider: 'pinata',
          options: {
            JWT: 'your-jwt-token',
          },
        },
      })
      
      \n${e}`);
    }
    log.throw(`Error while attempting to initialize IPFSProvider`);
  }

  public initialiseStorageProvider(): LitStorage {
    let storage;

    // -- initialize LitStorage
    try {
      storage = new LitStorage();
    } catch (e) {
      log.throw(`Error while attempting to initialize LitStorage\n${e}`);
    }

    if (!storage) {
      return log.throw(`Error while attempting to initialize LitStorage`);
    }

    // -- set globalThis.Lit.storage
    this._storage = storage;
    globalThis.Lit.storage = storage;

    return storage;
  }

  public initialiseEventEmitter() {
    let emitter;

    // -- initialize LitEmitter
    try {
      emitter = new LitEmitter();
    } catch (e) {
      log.throw(`Error while attempting to initialize LitEmitter\n${e}`);
    }

    if (!emitter) {
      return log.throw(`Error while attempting to initialize LitEmitter`);
    }

    // -- set globalThis.Lit.emitter
    this._emitter = emitter;
    globalThis.Lit.eventEmitter = emitter;

    return emitter;
  }

  // ========== Create Utils ==========
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
