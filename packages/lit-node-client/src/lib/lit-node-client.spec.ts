import { LitNodeClient } from './lit-node-client';
import * as LITCONFIG from 'lit.config.json';
import { processTx } from '../../../../tx-handler';
import { RelayClaimProcessor } from '@lit-protocol/types';
import { ethers } from 'ethers';

let client: LitNodeClient;

jest.setTimeout(60000);

describe('Lit Actions', () => {
  client = new LitNodeClient({
    litNetwork: 'cayenne',
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


  it('should claim key id from auth method', async () => {

    let res = await client.claimKeyId({
      authMethod: {
        authMethodType: 4,
        accessToken: "RTPcbUUguY7YtOjZhKeXtEPTYkXfgX"
      }
    });

    const data = {
      // hello world in Uint8Array
      toSign: [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100],
      publicKey: LITCONFIG.PKP_PUBKEY,
      sigName: 'hello-world-sig',
    };

    let authMethod = {
      authMethodType: 4,
      accessToken: "RTPcbUUguY7YtOjZhKeXtEPTYkXfgX"
    }

    let sig = await client.pkpSign({
      toSign: data.toSign,
      pubKey: "0x044ec325db817193c3a01088d082ded81dc0a29ad615a67b87b9e295d9a1c91d955f8aeeec551d5d4930795f5c390e369f745e36e97893ead710354ee882ed60c0",
      authMethods: [authMethod],
      authSig: LITCONFIG.CONTROLLER_AUTHSIG,
    });

    let msg: any = ethers.utils.arrayify('0x' + sig.dataSigned)
    const recoveredPk = ethers.utils.recoverPublicKey(msg, { r: '0x' + sig.r, s: '0x' + sig.s, v: sig.recid });

    const addr = ethers.utils.computeAddress(ethers.utils.arrayify('0x' + sig.publicKey));
    const recoveredAddr = ethers.utils.computeAddress(ethers.utils.arrayify(recoveredPk));
    expect(recoveredAddr).toEqual(addr);
  }, 20_0000);
});
