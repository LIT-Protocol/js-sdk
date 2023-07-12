import { LitNodeClientConfig } from '@lit-protocol/types';
import { OrUndefined, Types } from './types';
import { log } from './utils';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { Lit } from './lit';
import EventEmitter from 'events';

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
    log.h1('Build Started');

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
    log.h1('Build Completed');

    this._emitter?.emit('ready');
    globalThis.Lit.ready = true;
  }
}
