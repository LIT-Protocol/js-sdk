// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import crypto, { createHash } from 'crypto';
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

import {
  hashAccessControlConditions,
  hashEVMContractConditions,
  hashResourceId,
  hashResourceIdForSigning,
  hashSolRpcConditions,
  hashUnifiedAccessControlConditions,
} from './hashing';

// ---------- Test Cases ----------
describe('hashing.ts', () => {

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

  it('should call hashUnifiedAccessControlConditions in node.js', async () => {
    const OUTPUT = await hashUnifiedAccessControlConditions([
      {
        conditionType: 'evmBasic',
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',
        },
      },
    ]);
    // console.log(typeof OUTPUT);
    expect(new Uint8Array(OUTPUT).length).toBe(32);
  });

  it('should call hashResourceId in node.js', async () => {
    const OUTPUT = await hashResourceId({
      baseUrl: 'https://example.com',
      path: '/api/v1',
      orgId: '',
      role: '',
      extraData: '',
    });
    // console.log(typeof OUTPUT);
    expect(new Uint8Array(OUTPUT).length).toBe(32);
  });

  it('should call hashResourceIdForSigning in node.js', async () => {
    const OUTPUT = await hashResourceIdForSigning({
      baseUrl: 'https://example.com',
      path: '/api/v1',
      orgId: '',
      role: '',
      extraData: '',
    });
    // console.log(typeof OUTPUT);
    expect(OUTPUT).toBe(
      '5b36d72f2145af3617e5da2a8a626f9f42e64ed14340622bdfe1a6f0702b9e8d'
    );
  });

  it('should call hashAccessControlConditions in node.js', async () => {
    const OUTPUT = await hashAccessControlConditions([
      {
        conditionType: 'evmBasic',
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',
        },
      },
    ]);
    // console.log(typeof OUTPUT);
    expect(typeof OUTPUT).toBe('object');
  });

  it('should call hashEVMContractConditions in node.js', async () => {
    const OUTPUT = await hashEVMContractConditions([
      {
        contractAddress: '0xb71a679cfff330591d556c4b9f21c7739ca9590c',
        functionName: 'members',
        functionParams: [':userAddress'],
        functionAbi: {
          constant: true,
          inputs: [
            {
              name: '',
              type: 'address',
            },
          ],
          name: 'members',
          outputs: [
            {
              name: 'delegateKey',
              type: 'address',
            },
            {
              name: 'shares',
              type: 'uint256',
            },
            {
              name: 'loot',
              type: 'uint256',
            },
            {
              name: 'exists',
              type: 'bool',
            },
            {
              name: 'highestIndexYesVote',
              type: 'uint256',
            },
            {
              name: 'jailed',
              type: 'uint256',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
        chain: 'xdai',
        returnValueTest: {
          key: 'shares',
          comparator: '>=',
          value: '1',
        },
      },
    ]);
    // console.log(typeof OUTPUT);
    expect(typeof OUTPUT).toBe('object');
  });

  it('should call hashSolRpcConditions in node.js', async () => {
    const OUTPUT = await hashSolRpcConditions([
      {
        method: 'getBalance',
        params: [':userAddress'],
        pdaParams: [],
        pdaInterface: { offset: 0, fields: {} },
        pdaKey: '',
        chain: 'solana',
        returnValueTest: {
          key: '',
          comparator: '>=',
          value: '100000000', // equals 0.1 SOL
        },
      },
    ]);
    // console.log(typeof OUTPUT);
    expect(typeof OUTPUT).toBe('object');
  });
});
