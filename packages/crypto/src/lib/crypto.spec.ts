// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import crypto, { createHash } from 'crypto'
Object.defineProperty(global.self, "crypto", {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
    subtle: {
      digest: (algorithm: string, data: Uint8Array) => {
        return new Promise((resolve, reject) =>
          resolve(
            createHash(algorithm.toLowerCase().replace("-", ""))
              .update(data)
              .digest()
          )
        );
      },
      generateKey: (x, y, z) => {
        return 'polyfilled';
      }
    },
  },
});

declare global {
    var wasmExport: any;
    var wasmECDSA: any;
}

import { generateSymmetricKey } from './crypto';

describe('crypto', () => {


    it('should work', () => {
        expect(1).toBe(1);
    })

//   it('should generateSymmetricKey', async () => {
//     const symmKey = await generateSymmetricKey();

//     expect(symmKey).toBe('polyfilled');
//   });

//   it('should encryptWithSymmetricKey', () => {

//   })
});
