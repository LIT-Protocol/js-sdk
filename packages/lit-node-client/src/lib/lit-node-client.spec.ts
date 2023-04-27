import { LitNodeClient } from './lit-node-client';
import { hashResourceIdForSigning } from '@lit-protocol/access-control-conditions';

import * as LITCONFIG from 'lit.config.json';

let client: LitNodeClient;

describe('litNodeClient', () => {
  it('should create an instance', async () => {
    client = new LitNodeClient({
      litNetwork: 'serrano',
      debug: false,
    });

    await client.connect();

    expect(client.ready).toBe(true);
  });
});

describe('Lit Actions', () => {
  it('lit action log should return hello world', async () => {
    const res = await client.executeJs({
      authSig: LITCONFIG.CONTROLLER_AUTHSIG,
      code: `(async () => {
        console.log('hello world')
      })();`,
      jsParams: {
        publicKey: LITCONFIG.PKP_PUBKEY,
      },
    });

    expect(res.logs).toContain('hello world');
  });

  it('lit action response should return json {hello: "world"}', async () => {
    const res = await client.executeJs({
      authSig: LITCONFIG.CONTROLLER_AUTHSIG,
      code: `(async () => {
        LitActions.setResponse({
          response: JSON.stringify({hello: 'world'})
        });
      })();`,
      jsParams: {
        publicKey: LITCONFIG.PKP_PUBKEY,
      },
    });

    expect(res.response).toEqual({ hello: 'world' });
  });

  it('lit action should sign a message', async () => {
    const res = await client.executeJs({
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
    });

    expect(res.signatures['hello-world-sig']).toBeDefined();
    expect(res.signatures['hello-world-sig'].publicKey).toEqual(
      // remove 0x prefix
      LITCONFIG.PKP_PUBKEY.slice(2)
    );
  });
});
