import { authBrowser } from './auth-browser';

describe('authBrowser', () => {
  it('should work', () => {
    expect(authBrowser()).toEqual('auth-browser');
  });
});
