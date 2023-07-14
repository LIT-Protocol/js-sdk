import { LitDispatch } from '../../events';
import { LitCredential, LitCredentialEthWallet, PKPInfo } from '../../types';
import { log } from '../../utils';
import { handleSingleAuth } from '../handle-single-auth';

/**
 * 1 ETH Auth Method <> 1 PKP
 */
export const handleEthWallet = async (
  credential: LitCredentialEthWallet
): Promise<PKPInfo> => {
  LitDispatch.createAccountStatus('in_progress');

  let ethWalletAuthData;

  log.info(`credentials found! ${JSON.stringify(credential, null, 2)})}`);

  try {
    ethWalletAuthData = await globalThis.Lit.auth.ethWallet?.authenticate(
      credential.opts || undefined
    );
  } catch (e) {
    LitDispatch.createAccountStatus('failed');
    log.throw(`Failed to create account with eth wallet!`);
  }

  log('ethWalletAuthData', ethWalletAuthData);

  try {
    const PKPInfo = await handleSingleAuth(ethWalletAuthData as LitCredential);
    LitDispatch.createAccountStatus('completed', [PKPInfo]);

    return PKPInfo;
  } catch (e) {
    LitDispatch.createAccountStatus('failed');
    log.throw(`Failed to create account!`);
  }
};
