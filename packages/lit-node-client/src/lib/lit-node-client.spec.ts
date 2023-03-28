import { LitNodeClient } from './lit-node-client';
import { hashResourceIdForSigning } from '@lit-protocol/access-control-conditions';

const CONFIG = {
  MNEUMONIC:
    'island arrow object divide umbrella snap essay seminar top develop oyster success',
  RPC_ENDPOINT: 'https://cosmos-mainnet-rpc.allthatnode.com:26657',
  RECIPIENT: 'cosmos1jyz3m6gxuwceq63e44fqpgyw2504ux85ta8vma',
  DENOM: 'uatom',
  AMOUNT: 1, // CHANGE THIS TO 1 IF YOU WANT TO SEND 1 ATOM
  DEFAULT_GAS: 0.025,
  CONTROLLER_AUTHSIG: {
    sig: '0x7dd45119cb1fde7fb0b891d3de7262e5d564e64ec46b873163a373a4645626a328bceb089209ac68bdd429185a30f32e7bbf2eb71820c94c5f0547716526884c1c',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage:
      'localhost:1209 wants you to sign in with your Ethereum account:\n0x18f987D15a973776f6a60652B838688a1833fE95\n\n\nURI: http://localhost:1209/auth\nVersion: 1\nChain ID: 1\nNonce: 1IbQokxUmJZ1opsTY\nIssued At: 2023-03-20T15:40:48.024Z\nExpiration Time: 2023-03-27T15:40:48.010Z',
    address: '0x18f987d15a973776f6a60652b838688a1833fe95',
  },
  PKP_PUBKEY:
    '0x04cd5fc4b661a2ae2dc425aa42abbfeaa187c07063928322a8c748ebb7611868144c0ff28b1910faeafedea914ec8a23baa579b6ff7f03efa322e7eb098e62dd8f',
};
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
      authSig: CONFIG.CONTROLLER_AUTHSIG,
      code: `(async () => {
        console.log('hello world')
      })();`,
      jsParams: {
        publicKey: CONFIG.PKP_PUBKEY,
      },
    });

    expect(res.logs).toContain('hello world');
  });

  it('lit action response should return json {hello: "world"}', async () => {
    const res = await client.executeJs({
      authSig: CONFIG.CONTROLLER_AUTHSIG,
      code: `(async () => {
        LitActions.setResponse({
          response: JSON.stringify({hello: 'world'})
        });
      })();`,
      jsParams: {
        publicKey: CONFIG.PKP_PUBKEY,
      },
    });

    expect(res.response).toEqual({ hello: 'world' });
  });

  it('lit action should sign a message', async () => {
    const res = await client.executeJs({
      authSig: CONFIG.CONTROLLER_AUTHSIG,
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
        publicKey: CONFIG.PKP_PUBKEY,
        sigName: 'hello-world-sig',
      },
    });

    expect(res.signatures['hello-world-sig']).toBeDefined();
    expect(res.signatures['hello-world-sig'].publicKey).toEqual(
      '04cd5fc4b661a2ae2dc425aa42abbfeaa187c07063928322a8c748ebb7611868144c0ff28b1910faeafedea914ec8a23baa579b6ff7f03efa322e7eb098e62dd8f'
    );
  });
});
