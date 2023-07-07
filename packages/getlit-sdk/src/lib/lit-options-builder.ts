import { LitNodeClientConfig } from '@lit-protocol/types';
import { Types } from './types';
import { log } from './utils';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { Lit } from './lit';
import { EventEmitter } from 'events';
export const getlitEvent = new EventEmitter();

const DEFAULT_NETWORK = 'serrano'; // changing to "cayenne" soon

export class LitOptionsBuilder {
  private static _contractOptions: Types.ContractOptions;
  private static _authOptions: Types.AuthOptions;
  private static _nodeClientOptions: LitNodeClientConfig;
  private static _nodeClient: Types.NodeClient;

  public static withContractOptions(options: Types.ContractOptions) {
    LitOptionsBuilder._contractOptions = options;
  }
  public static withAuthOptions(options: Types.AuthOptions) {
    LitOptionsBuilder._authOptions;
  }
  public static withNodeClient(client: Types.NodeClient) {
    LitOptionsBuilder._nodeClient = client;
  }

  public async build(): Promise<void> {
    log.h1('Build Started');

    // Check if the Lit instance exists in globalThis, if not, create it
    if (!globalThis.Lit) {
      log('creating globalThis.Lit...');
      globalThis.Lit = new Lit();
      log.success('globalThis.Lit has been created!');
    } else {
      log.success('globalThis.Lit has already been initialized!');
    }

    log('setting "LitNodeClient" options...');
    const nodeClientOpts = LitOptionsBuilder._nodeClientOptions ?? {
      litNetwork: DEFAULT_NETWORK,
      debug: false,
    };
    log('nodeClientOpts', nodeClientOpts);

    if (!LitOptionsBuilder._nodeClient) {
      log('using class "LitNodeClient"');
      LitOptionsBuilder._nodeClient = new LitNodeClient(nodeClientOpts);
    } else {
      log('using class "LitNodeClientNodeJs"');
      LitOptionsBuilder._nodeClient = new LitNodeClientNodeJs(nodeClientOpts);
    }

    log('connecting to LitNodeClient...');
    try {
      await LitOptionsBuilder._nodeClient.connect();
      log.success(
        '🎉 connected to LitNodeClient! ready:',
        LitOptionsBuilder._nodeClient.ready
      );
    } catch (e) {
      log.error(`Error while attempting to connect to LitNodeClient ${e}`);
    }

    log('setting "globalThis.litNodeClient"');
    globalThis.LitNodeClient = LitOptionsBuilder._nodeClient;
    log.success('"globalThis.litNodeClient" has been set!');

    log('setting "globalThis.Lit"');
    globalThis.Lit.Configure = {
      ...LitOptionsBuilder._authOptions,
      ...LitOptionsBuilder._contractOptions,
      ...LitOptionsBuilder._nodeClientOptions,
    };
    console.log(globalThis.Lit.Configure)
    log.success('"globalThis.Lit" has been set!');
    log.h1('Build Completed');

    getlitEvent.emit('ready');
    globalThis.LitIsReady = true;
  }
}
