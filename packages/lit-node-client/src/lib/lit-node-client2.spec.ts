import { LitNodeClient } from './lit-node-client';
import * as LITCONFIG from 'lit.config.json';

let client: LitNodeClient;

describe('Lit Actions', async () => {
  client = new LitNodeClient({
    litNetwork: 'cayenne',
    debug: true
  });

  await client.connect();

  test('should be connected', async () => {
    expect(client.ready).toBe(true);
  });

  test('lit action log should return hello world', async () => {

    const res = await client.executeJs({
      authSig: LITCONFIG.CONTROLLER_AUTHSIG,
      code: `(async () => {
        console.log('hello world')
      })();`,
      jsParams: {
        publicKey: LITCONFIG.PKP_PUBKEY,
      },
    })

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
    })
    expect(res.response).toEqual(JSON.stringify({ hello: 'world' }));
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

    expect(res).toBe(1);

  });
});
