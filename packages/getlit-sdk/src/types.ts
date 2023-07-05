import {
  LitNodeClientConfig,
  LitRelayConfig,
  OtpProviderOptions,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import * as litNodeClientNodejs from '@lit-protocol/lit-node-client-nodejs';

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

declare global {
  var Lit: Lit;
  var litNodeClient: Types.NodeClient;
  var LitBuilder: LitOptionsBuilder;
}

// const LitNodeClient = _LitNodeClient.LitNodeClient;
// if (!globalThis.LitNodeClient) {
//   globalThis.LitNodeClient = LitNodeClient;
// LitNodeClient.connect();
// }

export class Lit {
  private _options: Types.LitOptions | undefined;
  private _litNodeClient: Types.NodeClient | undefined;

  public set Configure(value: Types.LitOptions) {
    this._options = value;
    this._litNodeClient = globalThis.litNodeClient;
  }

  // static ContractOptions(options: Types.ContractOptions){
  //   return new Lit(options);
  // }
}

export class LitOptionsBuilder {
  private static _contractOptions: Types.ContractOptions;
  private static _authOptions: Types.AuthOptions;
  private static _nodeOptions: LitNodeClientConfig;
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

  public async build(): void {
    console.log('HEY IT BUILDS!');

    if (globalThis.Lit) {
      console.warn(
        'GetLit has already be initalized, do you want to reinitalize the global instance?'
      );
    }

    if (!LitOptionsBuilder._nodeClient) {
      LitOptionsBuilder._nodeClient = new LitNodeClient(
        LitOptionsBuilder._nodeOptions ?? { litNetwork: 'serrano' }
      );
    } else {
      LitOptionsBuilder._nodeClient = new LitNodeClientNodeJs(
        LitOptionsBuilder._nodeOptions ?? { litNetwork: 'serrano' }
      );
    }

    await LitOptionsBuilder._nodeClient.connect();
    globalThis.litNodeClient = LitOptionsBuilder._nodeClient;

    globalThis.Lit.Configure = {
      ...LitOptionsBuilder._authOptions,
      ...LitOptionsBuilder._contractOptions,
      ...LitOptionsBuilder._nodeOptions,
    };
  }
}

// -- we do this for users
// initialize globally
(async () => {
  try {
    if (globalThis.LitBuilder) {
      console.warn(
        'GetLit builder has already be initalized, do you want to reinitalize the global instance?'
      );
    }
    globalThis.LitBuilder = new LitOptionsBuilder();
    await globalThis.LitBuilder.build();
  } catch (e) {
    console.error(`Error while attempting to configure GetLit instance ${e}`);
  }
})();

// -- user usage
// this is for browser
// window.Lit
// window.LitBuilder

// // this is for nodejs
// globalThis.Lit
// globalThis.LitBuilder
