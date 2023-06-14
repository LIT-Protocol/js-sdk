// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;
global.jestTesting = true;
import fetch from 'node-fetch';
import { LitNodeClientNodeJs } from './lit-node-client-nodejs';
import { hashResourceIdForSigning } from '@lit-protocol/access-control-conditions';
import { SiweMessage } from 'lit-siwe';
globalThis.fetch = fetch;
import { nacl } from '@lit-protocol/nacl';
globalThis.nacl = nacl;

import crypto, { createHash } from 'crypto';
import { ethers } from 'ethers';
import {
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
    subtle: {
      digest: (algorithm: string, data: Uint8Array) => {
        return new Promise((resolve, reject) =>
          resolve(
            createHash(algorithm.toLowerCase().replace('-', ''))
              .update(data)
              .digest()
          )
        );
      },
    },
  },
});

const getWalletAuthSig = async (prop) => {
  const { privateKey, chainId } = prop;

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // const buffer = Buffer.from(privateKey, 'hex');

  const wallet = new ethers.Wallet(privateKey);

  const origin = 'https://localhost/login';

  const message = `Generate a server auth signature for ${wallet.address} at ${now}`;

  const statement = message;

  const siweMessage = new SiweMessage({
    domain: 'node',
    address: wallet.address,
    uri: origin,
    statement,
    version: '1',
    chainId,
  });

  const messageToSign = siweMessage.prepareMessage();

  const signature = await wallet.signMessage(messageToSign);

  const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: recoveredAddress,
  };

  return authSig;
};

const isClass = (v) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('LitNodeClientNodeJs', () => {
  // --global
  let litNodeClient: LitNodeClientNodeJs;

  it('should connect to serrano network and return true after connected', async () => {
    litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'serrano',
      debug: false,
    });

    await litNodeClient.connect();

    expect(litNodeClient.ready).toBe(true);
  });

  // it('should execute js (lit action)', async () => {
  //   const privateKey =
  //     '0x49723865a8ab41e5e8081839e33dff15ab6b0125ba3acc82c25df64e8a8668f5';

  //   const authSig = await getWalletAuthSig({
  //     privateKey,
  //     chainId: 1,
  //   });

  //   const res = await litNodeClient.executeJs({
  //     authSig,
  //     code: `(async () => {
  //       console.log("toSign:", toSign);
  //     })();`,
  //     // ipfsId: "QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm",
  //     jsParams: {
  //       toSign: [0, 0, 0],
  //       // publicKey: 'xxx',
  //       sigName: "test-sig",
  //     },
  //   });

  //   console.log(res);

  //   // expect(res).toBeDefined();
  // });

  // --start;
  it('imported { LitNodeClientNodeJs } is a class', async () => {
    expect(isClass(LitNodeClientNodeJs)).toBe(true);
  });

  it('should be able to instantiate a new LitNodeClientNodeJs', async () => {
    const litNodeClient = new LitNodeClientNodeJs();
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to instantiate a new LitNodeClientNodeJs to serrano', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'serrano',
    });
    await litNodeClient.connect();
    expect(litNodeClient.config.litNetwork).toBe('serrano');
  });

  it('should be able to instantiate a new LitNodeClientNodeJs to serrano', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'serrano',
    });
    await litNodeClient.connect();
    expect(litNodeClient.config.litNetwork).toBe('serrano');
  });

  it('should be able to instantiate a new LitNodeClientNodeJs to localhost', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'localhost',
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should connect to lit nodes', async () => {
    litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'serrano',
    });

    await litNodeClient.connect();

    expect(litNodeClient).toBeDefined();
  });

  it('hashes a resource id', async () => {
    const path = '/bglyaysu8rvblxlk7x0ksn';

    let resourceId = {
      baseUrl: 'my-dynamic-content-server.com',
      path,
      orgId: '',
      role: '',
      extraData: '',
    };

    let hashedResourceId = await hashResourceIdForSigning(resourceId);

    expect(hashedResourceId).toBe(
      'd3b7c933579ff8cce79a9db8f135cf93d8e4b1d206129cbe28405ed81dad7cb1'
    );
  });

  it('gets capabilities', async () => {
    const path = '/bglyaysu8rvblxlk7x0ksn';

    let resourceId = {
      baseUrl: 'my-dynamic-content-server.com',
      path,
      orgId: '',
      role: '',
      extraData: '',
    };

    let hashedResourceId = await hashResourceIdForSigning(resourceId);

    const litResource = new LitAccessControlConditionResource(hashedResourceId);

    let sessionCapabilityObject =
      litNodeClient.generateSessionCapabilityObjectWithWildcards([litResource]);
    expect(sessionCapabilityObject.attenuations).toStrictEqual({
      [`lit-accesscontrolcondition://${hashedResourceId}`]: {
        '*/*': [{}],
      },
    });
    expect(
      sessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(true);
  });

  it('gets expiration', () => {
    const expiration = litNodeClient.getExpiration();

    expect(expiration).toContain('T');
  });
});
