import { nacl } from './nacl';

describe('nacl', () => {
  it('should work', () => {
    expect(Object.keys(nacl)).toEqual([
      'lowlevel',
      'randomBytes',
      'secretbox',
      'scalarMult',
      'box',
      'sign',
      'hash',
      'verify',
      'setPRNG',
    ]);
  });
});
