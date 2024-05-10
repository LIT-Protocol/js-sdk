import { ethers } from 'ethers';
import { normalizeArray } from './normalize-array';

describe('normalizeArray', () => {
  it('should normalize an array-like object', () => {
    const toSign = new Uint8Array([1, 2, 3]);

    const result = normalizeArray(toSign);

    expect(result).toEqual([1, 2, 3]);
  });

  it('should normalize a Buffer', () => {
    const toSign = Buffer.from('hello');

    const result = normalizeArray(toSign);

    expect(result).toEqual([104, 101, 108, 108, 111]);
  });

  it('should normalize a Buffer from ethers', () => {
    const toSign = ethers.utils.toUtf8Bytes('hello');

    const result = normalizeArray(toSign);

    expect(result).toEqual([104, 101, 108, 108, 111]);
  });
});
