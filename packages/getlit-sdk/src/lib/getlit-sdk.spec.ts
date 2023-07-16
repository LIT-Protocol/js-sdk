import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import * as LITCONFIG from '../../../../lit.config.json';

describe('getlitSDK', () => {
  it('should', () => {
    expect(true).toBe(true);
  });

  it('should emit ready event and configure custom option', async () => {
    let res: (value: void | PromiseLike<void>) => void;
    let rej: (reason?: any) => void;
    const promise = new Promise<void>((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    await import('./../../dist/src/index.js');
    if (globalThis.Lit.events) {
      globalThis.Lit.events.on('ready', async () => {
        // await 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        res();
      });

      await promise;
      globalThis.Lit.builder?.withContractOptions({
        signer: new PKPEthersWallet({
          pkpPubKey: LITCONFIG.PKP_PUBKEY,
          rpc: LITCONFIG.CHRONICLE_RPC,
          controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
        }),
      });
      await globalThis.Lit.builder?.build();

      expect(globalThis.Lit).toBeDefined();
      expect(globalThis.Lit.instance).toBeDefined();
      expect(
        (globalThis.Lit.instance as any)['_options']?.signer
      ).toBeDefined();
      expect((globalThis.Lit.events as any)['_eventsCount']).toBe(1);
    }
  }, 10_000);

  it('Should sign message', async () => {
    let res: (value: void | PromiseLike<void>) => void;
    let rej: (reason?: any) => void;
    const promise = new Promise<void>((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    await import('./../../dist/src/index.js');
    if (globalThis.Lit.events) {
      globalThis.Lit.events.on('ready', async () => {
        // await 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        res();
      });

      await promise;
    }

    const sig = await globalThis.Lit.sign({
      accountPublicKey: LITCONFIG.PKP_PUBKEY,
      signingMaterial: 'Hello World',
      credentials: [],
      authMatrial: LITCONFIG.CONTROLLER_AUTHSIG,
    });
    expect(sig).toBeDefined();
  }, 10_000);

  it('Should encrypt message', async () => {
    let res: (value: void | PromiseLike<void>) => void;
    let rej: (reason?: any) => void;
    const promise = new Promise<void>((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    await import('./../../dist/src/index.js');
    if (globalThis.Lit.events) {
      globalThis.Lit.events.on('ready', async () => {
        // await 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        res();
      });

      await promise;
    }

    const enctyptedContent = await globalThis.Lit.encrypt({
      accessControlConditions: [
        {
          conditionType: 'evmBasic',
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',
          },
        },
      ],
      chain: 'ethereum',
      encryptMaterial: 'Hello World',
      authMaterial: LITCONFIG.CONTROLLER_AUTHSIG,
    });

    expect(enctyptedContent).toBeDefined();
  }, 100_000);
});
