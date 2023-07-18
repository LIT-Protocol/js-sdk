import { IRelayPKP } from '@lit-protocol/types';
import { LitAuthMethod, PKPInfo } from '../types';
import { iRelayPKPToPKPInfo, log, mapAuthMethodTypeToString } from '../utils';
import { AuthMethodType } from '@lit-protocol/constants';

export const handleGetAccounts = async (
  authDataArray: Array<LitAuthMethod>
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

    let authProvider;

    authProvider = globalThis.Lit.auth[authMethodName];

    if (!authProvider) {
      log.info("Special case: we'll try email or phone");

      if (authData.authMethodType === AuthMethodType.OTP) {
        if (authData?.otpType === 'email') {
          authProvider = globalThis.Lit.auth['email'];
        }

        if (authData?.otpType === 'phone') {
          authProvider = globalThis.Lit.auth['phone'];
        }
      }
    }

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

    // -- execute
    try {
      const pkps: Array<IRelayPKP> =
        await authProvider?.fetchPKPsThroughRelayer(authData);

      const formattedPKPs: Array<PKPInfo> = pkps.map((pkp) => {
        return iRelayPKPToPKPInfo(pkp);
      });

      results.push(...formattedPKPs);
    } catch (e) {
      log.error(
        `Error fetching PKPs for ${authMethodName} auth method: ${e}. Continuing...`
      );
    }
  }

  log.end('handleGetAccounts', `got accounts by provider!`);

  return results;
};
