import { PKPWalletConnect } from './pkp-walletconnect';

const isClass = (v: unknown) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('PKPWalletConnect', () => {
  it('is a class', async () => {
    expect(isClass(PKPWalletConnect)).toBe(true);
  });
});
