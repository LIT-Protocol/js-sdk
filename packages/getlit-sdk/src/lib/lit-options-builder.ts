import { LitNodeClientConfig } from '@lit-protocol/types';
import { OrUndefined, Types } from './types';
import { getProviderMap, isBrowser, log } from './utils';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { Lit } from './lit';
import EventEmitter from 'events';
import {
  DiscordProvider,
  EthWalletProvider,
  GoogleProvider,
  WebAuthnProvider,
} from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

const DEFAULT_NETWORK = 'serrano'; // changing to "cayenne" soon

export class LitOptionsBuilder {
  private _contractOptions: OrUndefined<Types.ContractOptions>;
  private _authOptions: OrUndefined<Types.AuthOptions>;
  private _nodeClientOptions: OrUndefined<LitNodeClientConfig>;
  private _nodeClient: OrUndefined<Types.NodeClient>;
  private _emitter: OrUndefined<EventEmitter>;

  constructor(opts?: { emitter: EventEmitter }) {
    log('setting "globalThis.Lit.events"...');
    this._emitter = opts?.emitter;
    log.success('setting "globalThis.Lit.events" has been set!');
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

  public async build(): Promise<void> {
    log.start('build', 'starting...');

    // Check if the Lit instance exists in globalThis, if not, create it

    if (!globalThis.Lit.instance) {
      log('creating globalThis.Lit.instance...');
      globalThis.Lit.instance = new Lit();
      log.success('globalThis.Lit has been created!');
    } else {
      log.success('globalThis.Lit has already been initialized!');
    }

    log('setting "LitNodeClient" options...');
    const nodeClientOpts = this._nodeClientOptions ?? {
      litNetwork: DEFAULT_NETWORK,
      debug: false,
    };

    log('nodeClientOpts', nodeClientOpts);

    if (!this._nodeClient) {
      log('using class "LitNodeClient"');
      this._nodeClient = new LitNodeClient(nodeClientOpts);
    }

    log('connecting to LitNodeClient...');
    try {
      await this._nodeClient?.connect();
      log.success(
        '🎉 connected to LitNodeClient! ready:',
        this._nodeClient?.ready
      );
    } catch (e) {
      log.error(`Error while attempting to connect to LitNodeClient ${e}`);
    }

    log('setting "globalThis.litNodeClient"');
    globalThis.Lit.nodeClient = this._nodeClient as Types.NodeClient;
    log.success('"globalThis.litNodeClient" has been set!');

    log('setting "globalThis.Lit"');

    globalThis.Lit.instance.Configure = {
      ...this._authOptions,
      ...this._contractOptions,
      ...this._nodeClientOptions,
    };

    console.log(globalThis.Lit.instance.Configure);
    log.success('"globalThis.Lit" has been set!');
    log.end('build', 'done!');

    this._emitter?.emit('ready');
    globalThis.Lit.ready = true;

    await this.startAuthClient();
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
      globalThis.Lit.auth.ethWallet =
        globalThis.Lit.authClient.initProvider<EthWalletProvider>(
          ProviderType.EthWallet
        );
      globalThis.Lit.auth.webauthn =
        globalThis.Lit.authClient.initProvider<WebAuthnProvider>(
          ProviderType.WebAuthn
        );

      let authStatus = Object.entries(globalThis.Lit.auth)
        .map(([key, value]) => {
          return `authMethodType: ${getProviderMap()[key]} | ${
            value ? '✅' : '❌'
          } ${key}`;
        })
        .join('\n');

      log.success('"globalThis.Lit.auth" has been set!');
      log.info('globalThis.Lit.auth', '\n' + authStatus);
    }

    log.end('startAuthClient', 'done!');
  }
}
