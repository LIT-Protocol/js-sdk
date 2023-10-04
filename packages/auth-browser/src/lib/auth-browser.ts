import { ALL_LIT_CHAINS, LIT_ERROR, VMTYPE } from '@lit-protocol/constants';

import { AuthCallbackParams, AuthSig } from '@lit-protocol/types';

import { throwError } from '@lit-protocol/misc';
import { checkAndSignCosmosAuthMessage } from './chains/cosmos';
import { checkAndSignEVMAuthMessage } from './chains/eth';
import { checkAndSignSolAuthMessage } from './chains/sol';

/**
 *
 * Check for an existing cryptographic authentication signature and create one of it does not exist.  This is used to prove ownership of a given crypto wallet address to the Lit nodes.  The result is stored in LocalStorage so the user doesn't have to sign every time they perform an operation.
 *
 * @param { AuthCallbackParams }
 *
 *  @returns { AuthSig } The AuthSig created or retrieved
 */
export const checkAndSignAuthMessage = ({
  chain,
  resources,
  switchChain,
  expiration,
  uri,
  cosmosWalletType,
<<<<<<< HEAD
  cache = true,
=======
  walletConnectProjectId,
>>>>>>> feature/lit-1447-js-sdk-merge-sdk-v3-into-revamp-feature-branch-2
}: AuthCallbackParams): Promise<AuthSig> => {

  const chainInfo = ALL_LIT_CHAINS[chain];

  // -- validate: if chain info not found
  if (!chainInfo) {
    throwError({
      message: `Unsupported chain selected.  Please select one of: ${Object.keys(
        ALL_LIT_CHAINS
      )}`,
      errorKind: LIT_ERROR.UNSUPPORTED_CHAIN_EXCEPTION.kind,
      errorCode: LIT_ERROR.UNSUPPORTED_CHAIN_EXCEPTION.name,
    });
  }

  if (!expiration) {
    // set default of 1 week
    expiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  }

  // -- check and sign auth message based on chain
  if (chainInfo.vmType === VMTYPE.EVM) {
    return checkAndSignEVMAuthMessage({
      chain,
      resources,
      switchChain,
      expiration,
      uri,
<<<<<<< HEAD
      cache,
=======
      walletConnectProjectId,
>>>>>>> feature/lit-1447-js-sdk-merge-sdk-v3-into-revamp-feature-branch-2
    });
  } else if (chainInfo.vmType === VMTYPE.SVM) {
    return checkAndSignSolAuthMessage({ cache });
  } else if (chainInfo.vmType === VMTYPE.CVM) {
    return checkAndSignCosmosAuthMessage({
      chain,
      walletType: cosmosWalletType || 'keplr',
    }); // Keplr is defaulted here, being the Cosmos wallet with the highest market share
  } else {
    return throwError({
      message: `vmType not found for this chain: ${chain}.  This should not happen.  Unsupported chain selected.  Please select one of: ${Object.keys(
        ALL_LIT_CHAINS
      )}`,
      errorKind: LIT_ERROR.UNSUPPORTED_CHAIN_EXCEPTION.kind,
      errorCode: LIT_ERROR.UNSUPPORTED_CHAIN_EXCEPTION.name,
    });
  }
};
