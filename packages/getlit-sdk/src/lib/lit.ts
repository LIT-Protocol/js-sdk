import { AuthSig } from '@lit-protocol/types';
import { LitCredential, OrUndefined, Types, SignProps, PKPInfo } from './types';
import {
  convertSigningMaterial,
  isBrowser,
  isNode,
  log,
  getProviderMap,
  getDerivedAddresses,
} from './utils';
import { AuthMethodType, ProviderType } from '@lit-protocol/constants';

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
    { credentials }: { credentials: Array<LitCredential> } = { credentials: [] }
  ) {
    log('creating account...');

    if (credentials.length <= 0) {
      return log.throw(`credentials are required to create an account. here's an example of how to create an account:

      // this will redirect the user to a google sign in page
      await Lit.auth.google.signIn();

      // once the user has signed in and returned to your app, you can authenticate with the obtained credentials
      const googleAuthData = await Lit.auth.google.authenticate();

      Lit.createAccount({
        credentials: [
          googleAuthData
        ]
      });
      `);
    }

    log.info(
      `credential found! [${credentials.map(
        (c) => getProviderMap()[c.authMethodType]
      )}]`
    );

    // // in numbers
    // const supportedAuthMethods = Object.keys(AuthMethodType);

    // const authMethodMap: {
    //   [key in AuthMethodType]?: (credential: LitCredential) => Promise<PKPInfo>;
    // } = {
    //   [AuthMethodType.GoogleJwt]: handleAuth,
    //   [AuthMethodType.Discord]: handleAuth,
    // };

    // const results = [];

    // for (const credential of credentials) {
    //   const authMethod = authMethodMap[credential.authMethodType];

    //   if (!authMethod) {
    //     return log.throw(
    //       `authMethod ${credential.authMethodType} is not supported`
    //     );
    //   }

    //   const res = await authMethod(credential);

    //   results.push(res);
    // }

    // log.info('results', results);

    // log.info('accounts created!');

    // // -- inner methods
    // async function handleAuth(credential: LitCredential): Promise<PKPInfo> {
    //   const providerMap = getProviderMap();

    //   const authMethodType: ProviderType =
    //     providerMap[credential.authMethodType];

    //   if (!authMethodType) {
    //     log.throw(
    //       `authMethod ${credential.authMethodType} | ${
    //         providerMap[credential.authMethodType]
    //       } is not supported`
    //     );
    //   }

    //   const provider = globalThis.Lit.authClient?.getProvider(authMethodType);

    //   if (!provider) {
    //     return log.throw(`provider ${authMethodType} is not supported`);
    //   }

    //   const txHash = await provider.mintPKPThroughRelayer(credential);

    //   const response = await provider.relay.pollRequestUntilTerminalState(
    //     txHash
    //   );

    //   log.info('response', response);

    //   if (
    //     response.status !== 'Succeeded' ||
    //     !response.pkpPublicKey ||
    //     !response.pkpTokenId ||
    //     !response.pkpEthAddress
    //   ) {
    //     return log.throw('failed to mint PKP');
    //   }

    //   const derivedAddresses = getDerivedAddresses(response.pkpPublicKey);

    //   if (!derivedAddresses.btcAddress || !derivedAddresses.cosmosAddress) {
    //     return log.throw('failed to derive addresses');
    //   }

    //   const _PKPInfo: PKPInfo = {
    //     tokenId: response.pkpTokenId,
    //     publicKey: response.pkpPublicKey,
    //     ethAddress: response.pkpEthAddress,
    //     ...derivedAddresses,
    //   };

    //   return _PKPInfo;
    // }

    return;

    // private key -> mint pkp
    // private key -> pkp signer -> mint pkp

    // if credentials (authSig) and there are no session sigs, throw an error which includes
    // a callback function, where they can use the Lit Auth SDK to obtain

    // using relay supports both browser and nodejs

    // -- browser
    // (higher abstraction) if relayer fails, then use default LitContracts SDK
    //

    // -- nodejs

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

        // const litContracts = new LitContracts({
        //   signer: window.ethereum,
        //   debug: globalThis.Lit.debug,
        // });

        // await litContracts.connect();
        // const mintCost = await litContracts.pkpNftContract.read.mintCost();
        // const tx = await litContracts.pkpNftContract.write.mintNext(2, {
        //   value: mintCost,
        // });

        // const res = await tx.wait();

        // let events = 'events' in res ? res.events : res.logs;

        // // @ts-ignore
        // const tokenId = events[1].topics[1];

        // log('tx:', tx);
        // log('res:', res);
        // log('events:', events);
        // log('tokenId:', tokenId);
      }
    }

    if (isNode()) {
      log("[Node] We're in node!");
    }
  }

  // https://www.notion.so/litprotocol/SDK-Revamp-b0ee61ef448b41ee92eac6da2ec16082?pvs=4#9b2b39cd96db42daae6a2b3a6cb3c69a
  public async sign(options: SignProps) {
    const toSign: number[] = convertSigningMaterial(options.signingMaterial);

    const sig = await this._litNodeClient?.pkpSign({
      pubKey: options.accountPublicKey,
      toSign,
      authMethods: options.credentials,
      authSig: options.authMatrial as AuthSig,
    });

    return sig;
  }
}
