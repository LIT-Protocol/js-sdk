import { LitAuthMethod, LitAuthMethodEthWallet, PKPInfo } from '../../types';
import { log } from '../../utils';
import { handleSingleAuth } from '../handle-single-auth';

/**
 * 1 ETH Auth Method <> 1 PKP
 */
export const handleEthWallet = async (
  authData: LitAuthMethodEthWallet
): Promise<PKPInfo> => {
  globalThis.Lit.eventEmitter?.createAccountStatus('in_progress');

  let ethWalletAuthData;

  log.info(`authData found! ${JSON.stringify(authData, null, 2)})}`);

  try {
    ethWalletAuthData = await globalThis.Lit.auth.ethwallet?.authenticate(
      authData.opts || undefined
    );
  } catch (e) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`Failed to create account with eth wallet!`);
  }

  log('ethWalletAuthData', ethWalletAuthData);

  try {
    const PKPInfo = await handleSingleAuth(ethWalletAuthData as LitAuthMethod);
    globalThis.Lit.eventEmitter?.createAccountStatus('completed', [PKPInfo]);

    return PKPInfo;
  } catch (e) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`Failed to create account!`);
  }
};
