import { LitNodeClientConfig } from '@lit-protocol/types';
import { OrUndefined, Types } from './types';
import { getProviderMap, isBrowser, log } from './utils';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { Lit } from './lit';

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
import { LitStorage } from './storage/lit-storage';
import { LitEmitter } from './events/lit-emitter';

const DEFAULT_NETWORK = 'cayenne'; // changing to "cayenne" soon

export class LitOptionsBuilder {
  private _contractOptions: OrUndefined<Types.ContractOptions> = undefined;
  private _authOptions: OrUndefined<Types.AuthOptions> = undefined;
  private _nodeClientOptions: OrUndefined<LitNodeClientConfig> = undefined;
  private _nodeClient: OrUndefined<Types.NodeClient> = undefined;

  private _emitter: OrUndefined<LitEmitter> = undefined;
  private _storage: OrUndefined<LitStorage> = undefined;

  constructor(opts?: { emitter?: LitEmitter; storage?: LitStorage }) {
    log.start('LitOptionsBuilder', 'starting LitOptionsBuilder...');

    // -- set globalThis.Lit.emitter
    if (opts?.emitter) {
      this._emitter = opts.emitter;
      globalThis.Lit.eventEmitter = this._emitter;
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

  public async build(): Promise<void> {
    log.start('build', 'starting...');

    if (!globalThis.Lit.instance) {
      globalThis.Lit.instance = new Lit();
    } else {
      log.info('"globalThis.Lit" has already been initialized!');
    }

    const nodeClientOpts = this._nodeClientOptions ?? {
      litNetwork: DEFAULT_NETWORK,
      debug: false,
    };

    if (!this._nodeClient) {
      log('using class "LitNodeClient"');
      this._nodeClient = new LitNodeClient(nodeClientOpts);
    }

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

    globalThis.Lit.instance.Configure = {
      ...this._authOptions,
      ...this._contractOptions,
      ...this._nodeClientOptions,
    };

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
      globalThis.Lit.auth.ethwallet =
        globalThis.Lit.authClient.initProvider<EthWalletProvider>(
          ProviderType.EthWallet
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

    globalThis.Lit.auth.otp =
      globalThis.Lit.authClient.initProvider<OtpProvider>(ProviderType.Otp);

    let authStatus = Object.entries(globalThis.Lit.auth)
      .map(([key, value]) => {
        if (key === 'otp') {
          return `${value ? '✅' : '❌'} authMethodType: ${
            getProviderMap()[key.toLowerCase()]
          } |  ${key} | (You will need to manually "initProvider<OtpProvider>(ProviderType.Otp, { userId: 'email_or_phone_number' })")`;
        }

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
}
