import { LitCredentialManual } from '../types';
import { getProviderMap, log } from '../utils';
import { handleSingleAuth } from './handle-single-auth';
import { validateCreateAccount } from './validate';

export async function handleCredentials(opts: LitCredentialManual) {
  const { credentials = [] } = opts;
  log.start('handleCredentials', 'creating account manually...');

  validateCreateAccount(credentials);

  log.info(
    `credentials found! [${credentials.map(
      (c) => `(${c.authMethodType}|${getProviderMap()[c.authMethodType]})`
    )}]`
  );

  /**
   * 1 Auth Method <> 1 PKP
   */
  if (credentials.length === 1) {
    const PKPInfo = await handleSingleAuth(credentials[0]);
    log.end('handleCredentials', 'account created successfully!');
    return [PKPInfo];
  }

  /**
   * Multiple Auth Methods <> 1 PKP
   * TODO: implement this
   */
  if (credentials.length > 1) {
    log.error(`multiple credentials are not supported yet!`);
    log.end('handleCredentials', 'failed to create account!');
  }

  log.throw(`Failed to create account!`);
}
