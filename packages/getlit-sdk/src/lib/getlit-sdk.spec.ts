// import { getlitSdk } from './getlit-sdk';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import * as LITCONFIG from '../../../../lit.config.json';
import { log } from './utils';

describe('getlitSDK', () => {
  it('should emit ready event and configure custom option', async () => {
    let res: (value: void | PromiseLike<void>) => void;
    let rej: (reason?: any) => void;
    const promise = new Promise<void>((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    await import('./../index');
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
});
