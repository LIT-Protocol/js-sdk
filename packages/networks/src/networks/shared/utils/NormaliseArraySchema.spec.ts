import { ethers } from 'ethers';
import { NormaliseArraySchema } from './NormaliseArraySchema';

describe('NormaliseArraySchema', () => {
  it('should normalise an array-like object', () => {
    const toSign = new Uint8Array([1, 2, 3]);

    const result = NormaliseArraySchema.parse(toSign);

    expect(result).toEqual([1, 2, 3]);
  });

  it('should normalise a Buffer', () => {
    const toSign = Buffer.from('hello');

    const result = NormaliseArraySchema.parse(toSign);

    expect(result).toEqual([104, 101, 108, 108, 111]);
  });

  it('should normalise a Buffer from ethers', () => {
    const toSign = ethers.utils.toUtf8Bytes('hello');

    const result = NormaliseArraySchema.parse(toSign);

    expect(result).toEqual([104, 101, 108, 108, 111]);
  });
});
