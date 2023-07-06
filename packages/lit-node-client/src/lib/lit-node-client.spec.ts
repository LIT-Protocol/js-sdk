import { LitNodeClient } from './lit-node-client';
import * as LITCONFIG from 'lit.config.json';
import { processTx } from '../../../../tx-handler';
import { AuthSig } from '@lit-protocol/types';
let client: LitNodeClient;

jest.setTimeout(60000);

describe('Lit Actions', () => {
  client = new LitNodeClient({
    litNetwork: 'serrano',
    debug: false,
  });

  beforeAll(async () => {
    await client.connect();
  });

  it('should be connected', () => {
    expect(client.ready).toBe(true);
  });

  it('lit action log should return hello world', async () => {
    const res = await processTx(
      expect.getState().currentTestName,
      await client.executeJs({
        authSig: LITCONFIG.CONTROLLER_AUTHSIG,
        code: `(async () => {
          console.log('hello world')
        })();`,
        jsParams: {
          publicKey: LITCONFIG.PKP_PUBKEY,
        },
      })
    );

    expect(res.logs).toContain('hello world');
  });

  it('lit action response should return json {hello: "world"}', async () => {
    const res = await processTx(
      expect.getState().currentTestName,
      await client.executeJs({
        authSig: LITCONFIG.CONTROLLER_AUTHSIG,
        code: `(async () => {
            LitActions.setResponse({
              response: JSON.stringify({hello: 'world'})
            });
          })();`,
        jsParams: {
          publicKey: LITCONFIG.PKP_PUBKEY,
        },
      })
    );

    expect(res.response).toEqual({ hello: 'world' });
  });

  it('lit action should sign a message', async () => {
    const res = await processTx(
      expect.getState().currentTestName,
      await client.executeJs({
        authSig: LITCONFIG.CONTROLLER_AUTHSIG,
        code: `(async () => {
            const sigShare = await LitActions.signEcdsa({ 
              toSign, 
              publicKey, 
              sigName 
            });
          })();`,
        jsParams: {
          // hello world in Uint8Array
          toSign: [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100],
          publicKey: LITCONFIG.PKP_PUBKEY,
          sigName: 'hello-world-sig',
        },
      })
    );

    expect(res.signatures['hello-world-sig']).toBeDefined();
    expect(res.signatures['hello-world-sig'].publicKey).toEqual(
      LITCONFIG.PKP_PUBKEY
    );
  });

  it('pkp sign endpoint should sign message', async () => {
    const data = {
      // hello world in Uint8Array
      toSign: [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100],
      publicKey: LITCONFIG.PKP_PUBKEY,
      sigName: 'hello-world-sig',
    };

    let res = await client.pkpSign({
      toSign: data.toSign as unknown as ArrayBufferLike,
      pubKey: data.publicKey,
      authMethods: [],
      authSig: LITCONFIG.CONTROLLER_AUTHSIG
    });
    console.log(res);
  });
});
