// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import { uint8arrayFromString, uint8arrayToString } from '../index';

describe('uint8arrays', () => {
  it('result of uint8arrayToString should be the reverse of uint8arrayFromString', () => {

    const str = 'hello world';

    const uint8 = uint8arrayFromString(str);

    const str2 = uint8arrayToString(uint8);

    expect(str2).toEqual(str);

  });
});
