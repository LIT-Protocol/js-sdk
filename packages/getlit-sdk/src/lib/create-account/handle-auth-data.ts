import { LitAuthMethodWithAuthData } from '../types';
import { getProviderMap, log } from '../utils';
import { handleSingleAuth } from './handle-single-auth';
import { handleMultiAuths } from './handle-multi-auths';
import { validateCreateAccount } from './validate';

export async function handleAuthData(opts: LitAuthMethodWithAuthData) {
  const { authData = [] } = opts;
  log.start('handleAuthData', 'creating account manually...');

  validateCreateAccount(authData);

  log.info(
    `authData found! [${authData.map(
      (c) => `(${c.authMethodType}|${getProviderMap()[c.authMethodType]})`
    )}]`
  );

  /**
   * 1 Auth Method <> 1 PKP
   */
  if (authData.length === 1) {
    const PKPInfo = await handleSingleAuth(authData[0]);
    log.end('handleAuthData', 'account created successfully!');
    return [PKPInfo];
  }

  /**
   * Multiple Auth Methods <> 1 PKP
   * TODO: implement this
   */
  if (authData.length > 1) {
    const PKPInfo = await handleMultiAuths(authData);
    log.end('handleAuthData', 'account created successfully!');
    return [PKPInfo];
  }

  log.throw(`Failed to create account!`);
}
