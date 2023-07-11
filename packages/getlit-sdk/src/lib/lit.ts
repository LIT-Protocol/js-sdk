import { LitCredentials, OrUndefined, Types } from './types';
import { isBrowser, isNode, log } from './utils';
import { LitContracts } from '@lit-protocol/contracts-sdk';

export class Lit {
  private _options: OrUndefined<Types.LitOptions>;
  private _litNodeClient: OrUndefined<Types.NodeClient>;

  public set Configure(value: Types.LitOptions) {
    this._options = value;
    this._litNodeClient = globalThis.Lit.nodeClient ?? undefined;
  }

  constructor() {
    globalThis.Lit.encrypt = this.encrypt.bind(this);
    globalThis.Lit.decrypt = this.decrypt.bind(this);
    globalThis.Lit.createAccount = this.createAccount.bind(this);
    globalThis.Lit.sign = this.sign.bind(this);
  }

  // ========== Encryption ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#33d88ea255ff4866bc28724249a71a7e
  public encrypt() {}

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#2465ff247cd24e71b01a3257319b84b8
  public decrypt() {}

  // ========== Signing ==========

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#f4f4d44e2a1340ebb08517dfd2c16265
  // aka. mintWallet
  public async createAccount(
    { credentials }: { credentials: LitCredentials } = { credentials: null }
  ) {
    log('creating account...');
    // if credentials (authSig) and there are no session sigs, throw an error which includes
    // a callback function, where they can use the Lit Auth SDK to obtain

    if (isBrowser()) {
      log("[Browser] We're in the browser!");

      if (!credentials) {
        log('no credentials provided, using "window.ethereum"');

        if (!window.ethereum) {
          log.error(
            `window.ethereum is not defined, please install web3 wallet (eg. MetaMask) or provide a callback function to obtain credentials. eg.
            
            Lit.createAccount({
              auth: async () => {} // ..to be fixed
            });
            `
          );
          return;
        }
        console.log(window.ethereum);

        const litContracts = new LitContracts({
          signer: window.ethereum,
          debug: globalThis.Lit.debug,
        });

        await litContracts.connect();
        const mintCost = await litContracts.pkpNftContract.read.mintCost();
        const tx = await litContracts.pkpNftContract.write.mintNext(2, {
          value: mintCost,
        });

        const res = await tx.wait();

        let events = 'events' in res ? res.events : res.logs;

        // @ts-ignore
        const tokenId = events[1].topics[1];

        log('tx:', tx);
        log('res:', res);
        log('events:', events);
        log('tokenId:', tokenId);
      }
    }

    if (isNode()) {
      log("[Node] We're in node!");
    }
  }

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#9b2b39cd96db42daae6a2b3a6cb3c69a
  public sign() {}
}
