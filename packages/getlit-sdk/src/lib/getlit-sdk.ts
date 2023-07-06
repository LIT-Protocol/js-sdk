import {
  LitNodeClientConfig,
  LitRelayConfig,
  OtpProviderOptions,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import * as litNodeClientNodejs from '@lit-protocol/lit-node-client-nodejs';
import { log } from './utils';

const DEFAULT_NETWORK = 'serrano'; // changing to "cayenne" soon

export namespace Types {
  export interface ContractOptions {
    signer: ethers.Wallet | ethers.Signer; // No provider!
  }
  export interface AuthOptions {
    litRelayConfig?: LitRelayConfig;
    litOtpConfig?: OtpProviderOptions;
  }
  export type NodeOptions = { nodeOptions?: LitNodeClientConfig };

  export type NodeClient<T = LitNodeClient | LitNodeClientNodeJs> = T;
  export type LitOptions = ContractOptions & AuthOptions & NodeOptions;
}

export class Lit {
  private _options: Types.LitOptions | undefined;
  private _litNodeClient: Types.NodeClient | undefined;

  public set Configure(value: Types.LitOptions) {
    this._options = value;
    this._litNodeClient = globalThis.litNodeClient;
  }

  // ========== Encryption ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#33d88ea255ff4866bc28724249a71a7e
  public encrypt() {}

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#2465ff247cd24e71b01a3257319b84b8
  public decrypt() {}

  // ========== Signing ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#f4f4d44e2a1340ebb08517dfd2c16265
  // aka. mintWallet
  public createAccount() {}

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#9b2b39cd96db42daae6a2b3a6cb3c69a
  public sign() {}
}

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
    log('Building...');

    if (globalThis.Lit) {
      log.success('globalThis.Lit has already been initialized!');
    }

    log('setting LitNodeClient options...');
    const nodeClientOpts = LitOptionsBuilder._nodeClientOptions ?? {
      litNetwork: DEFAULT_NETWORK,
    };

    if (!LitOptionsBuilder._nodeClient) {
      log('using LitNodeClient');
      LitOptionsBuilder._nodeClient = new LitNodeClient(nodeClientOpts);
    } else {
      log('using LitNodeClientNodeJs');
      LitOptionsBuilder._nodeClient = new LitNodeClientNodeJs(nodeClientOpts);
    }

    log('connecting to LitNodeClient...');
    await LitOptionsBuilder._nodeClient.connect();
    log.success('connected to LitNodeClient!');
    globalThis.litNodeClient = LitOptionsBuilder._nodeClient;

    log('setting globalThis.Lit...');
    globalThis.Lit.Configure = {
      ...LitOptionsBuilder._authOptions,
      ...LitOptionsBuilder._contractOptions,
      ...LitOptionsBuilder._nodeClientOptions,
    };
    log.success('globalThis.Lit has been set!');
  }
}
