// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;
global.jestTesting = true;
import fetch from 'node-fetch';
import { LitNodeClient } from './lit-node-client';
import { hashResourceIdForSigning } from '@lit-protocol/access-control-conditions';

globalThis.fetch = fetch;
import { nacl } from '@lit-protocol/nacl';
globalThis.nacl = nacl;

import crypto, { createHash } from 'crypto';
import { SessionCapabilityObject } from '@lit-protocol/auth';
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

const isClass = (v) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('litNodeClient', () => {
  // --global
  let litNodeClient;

  // -- start
  it('imported { LitNodeClient } is a class', async () => {
    expect(isClass(LitNodeClient)).toBe(true);
  });

  it('should be able to instantiate a new LitNodeClient', async () => {
    const litNodeClient = new LitNodeClient();
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to instantiate a new LitNodeClient to serrano', async () => {
    const litNodeClient = new LitNodeClient({
      litNetwork: 'serrano',
    });
    await litNodeClient.connect();
    expect(litNodeClient.config.litNetwork).toBe('serrano');
  });

  it('should be able to instantiate a new LitNodeClient to jalapeno', async () => {
    const litNodeClient = new LitNodeClient({
      litNetwork: 'jalapeno',
    });
    await litNodeClient.connect();
    expect(litNodeClient.config.litNetwork).toBe('jalapeno');
  });

  it('should be able to instantiate a new LitNodeClient to localhost', async () => {
    const litNodeClient = new LitNodeClient({
      litNetwork: 'localhost',
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should connect to lit nodes', async () => {
    litNodeClient = new LitNodeClient({
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

  // it('gets session key', () => {
  //   let sessionKey = litNodeClient.getSessionKey();

  //   // sessionKey has 'publicKey' property
  //   expect(sessionKey).toHaveProperty('publicKey');
  // });

  // it('gets sessionKeyUri', () => {
  //   let sessionKey = litNodeClient.getSessionKey();
  //   sessionKey.publicKey =
  //     '41cf12fde8e8dd8ba7e1f9f443bbf8a60be6aae4771109083f0378511f9ca599';
  //   let sessionKeyUri = getSessionKeyUri({ publicKey: sessionKey.publicKey });

  //   expect(sessionKeyUri).toBe(
  //     'lit:session:41cf12fde8e8dd8ba7e1f9f443bbf8a60be6aae4771109083f0378511f9ca599'
  //   );
  // });

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

    let resources = [`litSigningCondition://${hashedResourceId}`];

    let capabilityObject = litNodeClient.getSessionCapabilityObject(
      resources,
      new SessionCapabilityObject()
    );
    expect(capabilityObject.getCapableActionsForAllResources()[0]).toBe(
      'litSigningCondition'
    );
  });

  it('gets expiration', () => {
    const expiration = litNodeClient.getExpiration();

    // expect expiration to contains 'T'
    expect(expiration).toContain('T');
  });

//   it('hashes a resource id', async () => {
//     const path = '/bglyaysu8rvblxlk7x0ksn';

//     let resourceId = {
//       baseUrl: 'my-dynamic-content-server.com',
//       path,
//       orgId: '',
//       role: '',
//       extraData: '',
//     };

//     let hashedResourceId = await hashResourceIdForSigning(resourceId);

//     let sessionSigs = await litNodeClient.getSessionSigs({
//       chain: 'ethereum',
//       resources: [`litSigningCondition://${hashedResourceId}`],
//     });

//     expect(sessionSigs).toBe(1);
//   });
});
