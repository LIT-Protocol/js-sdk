import { LitAuthMethodWithAuthData } from '../types';
import { getStoredAuthData, isBrowser, log } from '../utils';

/**
 * Middleware that provides the auth data to the function it wraps.
 * If no auth data is provided, it will attempt to get it from the browser.
 * If no auth data is provided and it is not in the browser, it will throw an error.
 * @param fn
 */
export function withAuthData(fn: Function) {
  return async function (opts?: LitAuthMethodWithAuthData): Promise<any> {
    if (!opts) {
      if (isBrowser()) {
        log.info('getting auth data from browser');
        const authData = getStoredAuthData();
        log.info('auth data from browser', authData);

        if (authData.length <= 0) {
          throw new Error('no auth data provided in browser');
        }

        return await fn(authData);
      } else {
        throw new Error('no auth data provided in nodejs');
      }
    } else if (!opts.authData) {
      throw new Error('no auth data provided');
    } else {
      return await fn(opts.authData);
    }
  };
}
