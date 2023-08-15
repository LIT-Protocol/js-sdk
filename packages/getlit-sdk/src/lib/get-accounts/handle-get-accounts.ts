import { IRelayPKP } from '@lit-protocol/types';
import { LitAuthMethod, PKPInfo } from '../types';
import { iRelayPKPToPKPInfo, log, mapAuthMethodTypeToString } from '../utils';

export const handleGetAccounts = async (
  authDataArray: Array<LitAuthMethod>,
  { cache }: { cache?: boolean } = {
    cache: true,
  }
): Promise<Array<PKPInfo>> => {
  log.start('handleGetAccounts', `getting accounts by provider...`);
  globalThis.Lit.eventEmitter?.getAccountsStatus('in_progress');

  // for each auth data in the array, get the provider in the provider map
  // and call the provider's fetchPKPsThroughRelayer method
  let results: Array<PKPInfo> = [];

  for (let i = 0; i < authDataArray.length; i++) {
    const authData = authDataArray[i];

    // -- prepare
    // convert authMethodType (eg. 6) to authMethodName (eg. 'google')
    const authMethodName = mapAuthMethodTypeToString(authData.authMethodType);
    log.info('authMethodName:', authMethodName);
    const authProvider = globalThis.Lit.auth[authMethodName];
    log.info('authProvider:', authProvider);

    if (!authProvider) {
      log.error("otp is not initialised. We'll try email or phone");
    }

    // -- validate auth provider
    if (!authProvider?.fetchPKPsThroughRelayer) {
      log.error(
        `No fetchPKPsThroughRelayer method found for "${authMethodName}" auth method. Continuing...`
      );
      continue;
    }

    // -- cache
    const storageUID = authProvider
      .getAuthMethodStorageUID(authData.accessToken)
      .split('-')[3];

    const storageKey = `lit-accounts-${storageUID}`;

    let cachedAccounts;

    // -- fetch from cache
    if (cache && globalThis.Lit.storage) {
      cachedAccounts = globalThis.Lit.storage.getExpirableItem(storageKey);
      if (cachedAccounts) {
        log.info(
          `Found cached accounts for ${authMethodName} auth method. Returning cached accounts...`
        );
        results.push(...JSON.parse(cachedAccounts));
        continue;
      }
    }
    // -- OR: fetch manually

    if (!cachedAccounts) {
      log.info(
        `No cached accounts found for ${authMethodName} auth method. Fetching accounts manually...`
      );
      try {
        const pkps: Array<IRelayPKP> =
          await authProvider?.fetchPKPsThroughRelayer(authData);

        const formattedPKPs: Array<PKPInfo> = pkps.map((pkp) => {
          return iRelayPKPToPKPInfo(pkp);
        });

        // -- cache
        if (cache && globalThis.Lit.storage) {
          log.info('Caching accounts...');
          globalThis.Lit.storage.setExpirableItem(
            storageKey,
            JSON.stringify(formattedPKPs),
            24,
            'hours'
          );
        }

        results.push(...formattedPKPs);
      } catch (e) {
        log.error(
          `Error fetching PKPs for ${authMethodName} auth method: ${e}. Continuing...`
        );
      }
    }
  }

  log.end('handleGetAccounts', `got accounts by provider!`);
  globalThis.Lit.eventEmitter?.getAccountsStatus('completed', results);

  return results;
};
