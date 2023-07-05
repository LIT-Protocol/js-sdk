import {
  LitNodeClientConfig,
  LitRelayConfig,
  OtpProviderOptions,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
declare global {
  var Lit: Lit;
  var LitBuilder: LitOptionsBuilder;
}

export namespace Types {
  export interface ContractOptions {
    signer: ethers.Wallet | ethers.Signer; // No provider!
  }
  export interface AuthOptions {
    litRelayConfig?: LitRelayConfig;
    litOtpConfig?: OtpProviderOptions;
  }
  export type NodeOptions = LitNodeClientConfig;

  export type LitOptions = ContractOptions & AuthOptions & NodeOptions & ;
  export type NodeClient = LitNodeClientNodeJs | LitNodeClient;  
}

// const LitNodeClient = _LitNodeClient.LitNodeClient;
// if (!globalThis.LitNodeClient) {
//   globalThis.LitNodeClient = LitNodeClient;
// LitNodeClient.connect();
// }


export class Lit {
  private _options: Types.LitOptions | undefined;
  private _litNodeClient: LitNodeClientNodeJs | undefined;

  public set Configure(value: Types.LitOptions) {
    this._options = value;
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

  public build(): void {

    console.log("HEY IT BUILDS!")

    if(globalThis.Lit) {
      console.warn("GetLit has already be initalized, do you want to reinitalize the global instance?");  
    }
    
    globalThis.Lit = new Lit();
    if (!LitOptionsBuilder._nodeClient) {
      // define client and connect;
    }
    globalThis.Lit.Configure = ({...LitOptionsBuilder._authOptions, ...LitOptionsBuilder._contractOptions, ...LitOptionsBuilder._nodeOptions});
  }
}

// -- we do this for users
// initialize globally
(async () => {
  if(globalThis.LitBuilder) {
    console.warn("GetLit builder has already be initalized, do you want to reinitalize the global instance?");  
  }
  globalThis.LitBuilder = new LitOptionsBuilder();
  globalThis.LitBuilder.build();
})();

// -- user usage
// this is for browser
// window.Lit
// window.LitBuilder

// // this is for nodejs
// globalThis.Lit
// globalThis.LitBuilder