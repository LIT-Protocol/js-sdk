import { LitNodeClient } from './lit-node-client';
import * as LITCONFIG from 'lit.config.json';
import { processTx } from '../../../../tx-handler';

let client: LitNodeClient;

jest.setTimeout(60000);

describe('Lit Actions', () => {
  client = new LitNodeClient({
    litNetwork: 'cayenne',
    // bootstrapUrls: [
    //   "http://127.0.0.1:7470",
    //   "http://127.0.0.1:7471",
    //   "http://127.0.0.1:7472"
    // ],
    minNodeCount: 2,
    debug: true
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

  it('lit action claim should return claim', async () => {
    let res = await client.executeJs({
      authSig: LITCONFIG.CONTROLLER_AUTHSIG,
      code: `(async () => {
          Lit.Actions.claimKey({keyId: "foo"});
        })();`,
      jsParams: {
        //publicKey: LITCONFIG.PKP_PUBKEY,
      },
    });

    expect(Object.keys(res.claims).length).toEqual(1);
    expect(res.claims['foo'].signatures.length).toEqual(3);
  });


  it('lit action claim should return grouped claims', async () => {

    let res = await client.executeJs({
      authSig: LITCONFIG.CONTROLLER_AUTHSIG,
      code: `(async () => {
        Lit.Actions.claimKey({keyId: "foo"});
        Lit.Actions.claimKey({keyId: "bar"});
      })();`,
      jsParams: {
        //publicKey: LITCONFIG.PKP_PUBKEY,
      },
    });

    expect(Object.keys(res.claims).length).toEqual(2);
    expect(res.claims['foo'].signatures.length).toEqual(3);
    expect(res.claims['bar'].signatures.length).toEqual(3);
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
    });

    // add padding
    sig.publicKey =
      sig.publicKey.length % 2 == 0 ? sig.publicKey : '0' + sig.publicKey;
    expect(sig.publicKey).toBeDefined();
  });

  it('Should combine claim responses', () => {
    const nodeclaimResponses = [
      {
        'foo': {
          keyId: "abc1234",
          signature: "f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b"
        },
        bar: {
          keyId: "xyz1234",
          signature: "f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b"
        }
      },
      {
        'foo': {
          keyId: "abc1234",
          signature: "f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b"
        },
        bar: {
          keyId: "xyz1234",
          signature: "f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b"
        }
      },
      {
        'foo': {
          keyId: "abc1234",
          signature: "f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b"
        },
        bar: {
          keyId: "xyz1234",
          signature: "f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b"
        }
      }
    ];

    const combinedClaims = client.getClaims(nodeclaimResponses);
    expect(Object.keys(combinedClaims).length).toEqual(2);
    expect(combinedClaims['foo'].signatures.length).toEqual(3);
  });
  // it('should claim key id from auth method', async () => {
  //   const authMethod = {
  //     authMethodType: 4,
  //     accessToken: LITCONFIG.AUTH_METHOD_ACCESS_TOKEN
  //   };
  //   let res = await client.claimKeyId({
  //     authMethod
  //   });

  //   const data = {
  //     // hello world in Uint8Array
  //     toSign: [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100],
  //     publicKey: LITCONFIG.PKP_PUBKEY,
  //     sigName: 'hello-world-sig',
  //   };


  //   let sig = await client.pkpSign({
  //     toSign: data.toSign,
  //     pubKey: res.pubkey,
  //     authMethods: [authMethod],
  //     authSig: LITCONFIG.CONTROLLER_AUTHSIG,
  //   });

  //   let msg: any = ethers.utils.arrayify('0x' + sig.dataSigned)
  //   const recoveredPk = ethers.utils.recoverPublicKey(msg, { r: '0x' + sig.r, s: '0x' + sig.s, v: sig.recid });

  //   const addr = ethers.utils.computeAddress(ethers.utils.arrayify('0x' + sig.publicKey));
  //   const recoveredAddr = ethers.utils.computeAddress(ethers.utils.arrayify(recoveredPk));
  //   expect(recoveredAddr).toEqual(addr);
  // }, 20_0000);
});
