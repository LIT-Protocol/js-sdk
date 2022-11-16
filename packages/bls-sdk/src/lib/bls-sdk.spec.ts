// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder

import * as blsSdk from './bls-sdk';

describe('blsSdk', () => {
  it('should work', () => {

    const OUTPUT = Object.keys(blsSdk).length;

    expect(OUTPUT).toBeGreaterThan(0)
  });
});
