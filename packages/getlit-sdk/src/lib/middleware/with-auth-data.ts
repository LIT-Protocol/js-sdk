import { LitAuthMethod, LitAuthMethodWithAuthData } from '../types';
import { getStoredAuthData, isBrowser, log } from '../utils';

export interface MiddlewareOptions {
  authData?: Array<LitAuthMethod>;
  cache?: boolean;
}

/**
 * Middleware that provides the auth data to the function it wraps.
 * If no auth data is provided, it will attempt to get it from the browser.
 * If no auth data is provided and it is not in the browser, it will throw an error.
 * @param fn
 */
export function withAuthData(fn: Function) {
  return async function (opts?: MiddlewareOptions): Promise<any> {
    let authData: Array<LitAuthMethod> | undefined = opts?.authData;
    let cache: boolean = opts?.cache ?? true; // Set cache to true by default if undefined

    if (!authData) {
      if (isBrowser()) {
        log.info('getting auth data from browser');
        authData = getStoredAuthData();
        log.info('auth data from browser', authData);

        if (authData.length <= 0) {
          throw new Error('no auth data provided in browser');
        }
      } else {
        throw new Error('no auth data provided in nodejs');
      }
    }

    return await fn(authData, cache);
  };
}
