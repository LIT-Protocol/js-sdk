// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import * as ecdsaSdk from './ecdsa-sdk';

describe('ecdsaSdk', () => {
  it('ecdsaSdk keys should be more than 0', () => {
    // test if the object keys is more than 0
    expect(Object.keys(ecdsaSdk).length).toBeGreaterThan(1);
  });
});
