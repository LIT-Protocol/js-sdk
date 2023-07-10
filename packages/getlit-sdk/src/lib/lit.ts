import { LitCredentials, Types } from './types';

export class Lit {
  private _options: Types.LitOptions | undefined;
  private _litNodeClient: Types.NodeClient | undefined;

  public set Configure(value: Types.LitOptions) {
    this._options = value;
    this._litNodeClient = globalThis.LitNodeClient;
  }

  // ========== Encryption ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#33d88ea255ff4866bc28724249a71a7e
  public encrypt() {}

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#2465ff247cd24e71b01a3257319b84b8
  public decrypt() {}

  // ========== Signing ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#f4f4d44e2a1340ebb08517dfd2c16265
  // aka. mintWallet
  public createAccount({ credentials }: { credentials: LitCredentials }) {
    // if credentials (authSig) and there are no session sigs, throw an error which includes
    // a callback function, where they can use the Lit Auth SDK to obtain
  }

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#9b2b39cd96db42daae6a2b3a6cb3c69a
  public sign() {}
}
