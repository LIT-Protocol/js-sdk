import { ethers } from 'ethers';
import { normalizeJsParams } from './normalize-params';

describe('normalizeJsParams', () => {
  it('should convert ArrayBuffer to array', () => {
    const jsParams = {
      key1: new Uint8Array([1, 2, 3]).buffer,
      key2: new Uint8Array([4, 5, 6]).buffer,
    };

    const normalizedParams = normalizeJsParams(jsParams);

    expect(normalizedParams.key1).toEqual([1, 2, 3]);
    expect(normalizedParams.key2).toEqual([4, 5, 6]);
  });

  it('should not modify non-ArrayBuffer values', () => {
    const jsParams = {
      key1: [1, 2, 3],
      key2: 'test',
      key3: { prop: 'value' },
    };

    const normalizedParams = normalizeJsParams(jsParams);

    expect(normalizedParams.key1).toEqual([1, 2, 3]);
    expect(normalizedParams.key2).toEqual('test');
    expect(normalizedParams.key3).toEqual({ prop: 'value' });
  });

  it('should handle empty object', () => {
    const jsParams = {};

    const normalizedParams = normalizeJsParams(jsParams);

    expect(normalizedParams).toEqual({});
  });

  it('should handle real world example of jsParams', () => {
    const jsParams = {
      dataToSign: ethers.utils.arrayify(
        ethers.utils.keccak256([1, 2, 3, 4, 5])
      ),
      publicKey:
        '04940acdc50052416b0458623a99a12cc5717959222bfa5dc0553702b91efcaf7527889af26cfad48ac6c96417a2f06412d22e06a98d856202809743b614403dd5',
    };

    const normalizedParams = normalizeJsParams(jsParams);
    expect(normalizedParams.dataToSign).toEqual([
      125, 135, 197, 234, 117, 247, 55, 139, 183, 1, 228, 4, 197, 6, 57, 22, 26,
      243, 239, 246, 98, 147, 233, 243, 117, 181, 241, 126, 181, 4, 118, 244,
    ]);
  });

  it('should handle multiple types', () => {
    const jsParams = {
      foo: 'bar',
      num: 123,
      arr: [1, 2, 3],
      obj: {
        nested: 'value',
      },
      uint8Arr: new Uint8Array([1, 2, 3]),
    };

    const normalizedParams = normalizeJsParams(jsParams);

    expect(normalizedParams).toEqual({
      foo: 'bar',
      num: 123,
      arr: [1, 2, 3],
      obj: {
        nested: 'value',
      },
      uint8Arr: [1, 2, 3],
    });
  });

  it('should recursively convert nested objects', () => {
    const jsParams = {
      foo: 'bar',
      obj: {
        nested: {
          deep: 'value',
        },
      },
    };

    const normalizedParams = normalizeJsParams(jsParams);

    expect(normalizedParams).toEqual({
      foo: 'bar',
      obj: {
        nested: {
          deep: 'value',
        },
      },
    });
  });
});
