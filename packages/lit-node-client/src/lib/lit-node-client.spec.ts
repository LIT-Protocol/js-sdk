import { LitNodeClient } from './lit-node-client';
import * as LITCONFIG from 'lit.config.json';
import { processTx } from '../../../../tx-handler';
import { AuthSig } from '@lit-protocol/types';
import { ethers } from 'ethers';
import { SIGTYPE } from '@lit-protocol/constants';
let client: LitNodeClient;

jest.setTimeout(60000);

describe('Lit Actions', () => {
  client = new LitNodeClient({
    litNetwork: "custom",
    debug: true,
    bootstrapUrls: [
        "http://127.0.0.1:7470",
        "http://127.0.0.1:7471",
        "http://127.0.0.1:7472"
    ],
    minNodeCount: 2
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

    let sig = await client.pkpSign({
      toSign: data.toSign,
      pubKey: data.publicKey,
      authMethods: [],
      authSig: LITCONFIG.CONTROLLER_AUTHSIG,
      hdKeyRequest: {keyId: "hello-world"}
    });

    // add padding
    sig.publicKey =
      sig.publicKey.length % 2 == 0 ? sig.publicKey : '0' + sig.publicKey;
    expect(sig.publicKey).toBeDefined();
    let pubkeys = ["049552b1bec13fb7903b052d5ea7cbe0227f3b2d01e131aa04caaab61cddc9e53840e4959ec2388e6f332e089399ccbe515464034ed999ada56a6a449822ce8285", "046b47116d2edea42e526274a468fc80f94f509ab9797763bd80d879a048ab4cb4348cca96489ddabdb978ddb06487897d9f983d047e23788153f7a535d8d7d7ff"];
    let keyId = "hello-world";
    let pubkey = client.computeHDPubKey(keyId, pubkeys, SIGTYPE.EcdsaCaitSith);
    expect(pubkey.toLowerCase()).toEqual(sig.publicKey.toLowerCase());
  });
});
