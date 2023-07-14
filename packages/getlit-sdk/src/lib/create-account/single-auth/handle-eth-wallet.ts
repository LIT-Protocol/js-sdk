import { LitDispatch } from '../../events';
import { LitAuthMethod, LitAuthMethodEthWallet, PKPInfo } from '../../types';
import { log } from '../../utils';
import { handleSingleAuth } from '../handle-single-auth';

/**
 * 1 ETH Auth Method <> 1 PKP
 */
export const handleEthWallet = async (
  authData: LitAuthMethodEthWallet
): Promise<PKPInfo> => {
  LitDispatch.createAccountStatus('in_progress');

  let ethWalletAuthData;

  log.info(`authData found! ${JSON.stringify(authData, null, 2)})}`);

  try {
    ethWalletAuthData = await globalThis.Lit.auth.ethWallet?.authenticate(
      authData.opts || undefined
    );
  } catch (e) {
    LitDispatch.createAccountStatus('failed');
    log.throw(`Failed to create account with eth wallet!`);
  }

  log('ethWalletAuthData', ethWalletAuthData);

  try {
    const PKPInfo = await handleSingleAuth(ethWalletAuthData as LitAuthMethod);
    LitDispatch.createAccountStatus('completed', [PKPInfo]);

    return PKPInfo;
  } catch (e) {
    LitDispatch.createAccountStatus('failed');
    log.throw(`Failed to create account!`);
  }
};
