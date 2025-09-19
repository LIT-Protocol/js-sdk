import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { logger } from './logger';
import { AppConfig } from './env';

export const deriveTxSenderAddress = async (cfg: AppConfig) => {
  if (!cfg.litTxsenderPrivateKey) {
    logger.warn(
      'LIT_TXSENDER_PRIVATE_KEY not set, cannot display TX Sender Address.'
    );
    return;
  }
  try {
    const serviceAccount = privateKeyToAccount(
      cfg.litTxsenderPrivateKey as Hex
    );
    logger.info({ txSender: serviceAccount.address }, 'TX Sender Address');
  } catch {
    logger.warn('Could not derive TX Sender Address from private key.');
  }
};
