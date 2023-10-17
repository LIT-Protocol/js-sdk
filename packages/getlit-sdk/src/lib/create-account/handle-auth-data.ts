import { LitAuthMethod } from '../types';
import { getProviderMap, log } from '../utils';
import { handleSingleAuth } from './handle-single-auth';
import { handleMultiAuths } from './handle-multi-auths';
import { validateCreateAccount } from './validate';

export async function handleAuthMethod({ authMethods }: { authMethods: LitAuthMethod[] }) {

  log.start('handleAuthMethod', 'creating account with provided multiple authMethod...');

  validateCreateAccount(authMethods);

  log.info(
    `authMethod found! [${authMethods.map(
      (c) => `(${c.authMethodType}|${getProviderMap()[c.authMethodType]})`
    )}]`
  );

  /**
   * 1 Auth Method <> 1 PKP
   */
  if (authMethods.length === 1) {
    const PKPInfo = await handleSingleAuth(authMethods[0]);
    log.end('handleAuthMethod', 'account created successfully!');
    return [PKPInfo];
  }

  /**
   * Multiple Auth Methods <> 1 PKP
   * TODO: implement this
   */
  if (authMethods.length > 1) {
    const PKPInfo = await handleMultiAuths(authMethods);
    log.end('handleAuthMethod', 'account created successfully!');
    return [PKPInfo];
  }

  log.throw(`Failed to create account!`);
}
