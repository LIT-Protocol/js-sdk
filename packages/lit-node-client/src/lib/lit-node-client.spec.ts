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
    litNetwork: 'custom',
    debug: true,
    bootstrapUrls: [
      'http://127.0.0.1:7470',
      'http://127.0.0.1:7471',
      'http://127.0.0.1:7472',
    ],
    minNodeCount: 2,
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
      hdKeyRequest: { keyId: 'hello-world' },
    });

    // add padding
    sig.publicKey =
      sig.publicKey.length % 2 == 0 ? sig.publicKey : '0' + sig.publicKey;
    expect(sig.publicKey).toBeDefined();
  });

  it('should claim key id from auth method', async () => {
    let res = await client.claimKeyId({
      authMethodType: 6,
      accessToken:
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjkxMWUzOWUyNzkyOGFlOWYxZTlkMWUyMTY0NmRlOTJkMTkzNTFiNDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNTUwMDc5ODY3MzEtbGxianE1a2JzZzhpZWI3MDVtbzY0bmZuaDg4ZGhsbW4uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNTUwMDc5ODY3MzEtbGxianE1a2JzZzhpZWI3MDVtbzY0bmZuaDg4ZGhsbW4uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDY4MjU2NjQ1MjI4NTg3MzIzODEiLCJoZCI6ImxpdHByb3RvY29sLmNvbSIsImVtYWlsIjoiam9zaEBsaXRwcm90b2NvbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Imk3Vm5JRzFTME91cy1WQVhybzAtVnciLCJpYXQiOjE2OTE0MzA5NDQsImV4cCI6MTY5MTQzNDU0NH0.q80G4c64N8kBYE-6BZBTdjw0rrMiLVng-SOVgCx_XoRmOWzMT5L_BHdMoweO7ozNEIDWMhHFfI0Mz9v0g2FFz3I3MVKmZju900tjXrPXhYAILIk5SMPcIkvB7owqGs4rPJmZ8RbtxAGpqv5GMcK-FOoC3Ct0doMJzP-QNP2k9vixwU9_n2pWYOTJoDrkaPIXO86ZnVzg-VASP60tzVO0nv991tHTSneg6V_K8n27FxkZD30rOQ8gOuexEr7x5V-tKqTECvBOZy1FWf9snm8UHdOsKp2DEbkJslJVOez3qeczIOX12z-vhjP8m27qs7HXHQ8hCNxPtx-9-Fsf5krhsA',
    });
    let pubkey = client.computeHDPubKey(
      res.derivedKeyId,
      SIGTYPE.EcdsaCaitSith
    );
    console.log(pubkey);
    const data = {
      // hello world in Uint8Array
      toSign: [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100],
      publicKey: LITCONFIG.PKP_PUBKEY,
      sigName: 'hello-world-sig',
    };
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
    let sig = await client.pkpSign({
      toSign: data.toSign,
      pubKey: data.publicKey,
      authMethods: [],
      authSig: LITCONFIG.CONTROLLER_AUTHSIG,
      hdKeyRequest: { keyId: res.derivedKeyId },
    });

    expect(sig.publicKey.toLowerCase()).toEqual(pubkey.toLowerCase());
  }, 20_0000);
});
