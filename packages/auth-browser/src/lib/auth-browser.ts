/**
 * FIXME: SessionSigs are only supported for EVM chains at the moment.  This will be expanded to other chains in the future.
 */
import {
  ALL_LIT_CHAINS,
  UnsupportedChainException,
  VMTYPE,
} from '@lit-protocol/constants';
import { AuthCallbackParams, AuthSig } from '@lit-protocol/types';

import { checkAndSignCosmosAuthMessage } from './chains/cosmos';
import { checkAndSignEVMAuthMessage } from './chains/eth';
import { checkAndSignSolAuthMessage } from './chains/sol';

/**
 * SUPPORTED CHAINS: EVM, Solana, Cosmos
 *
 * !! NOTE !!
 * This function is purely used for crafting the authSig for access control conditions & decryption. For SessionSigs, you can pass the `authSig` as `jsParams`
 * or Eth Wallet Auth Method for `signSessionKey` and claiming, but you won't be able to use this to add resource ability requests in the SIWE message. Instead, you should provide your own signer to the authNeededCallback parameter for the getSessionSigs method.
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
  walletConnectProjectId,
  nonce,
}: AuthCallbackParams): Promise<AuthSig> => {
  const chainInfo = ALL_LIT_CHAINS[chain];

  // -- validate: if chain info not found
  if (!chainInfo) {
    throw new UnsupportedChainException(
      {
        info: {
          chain,
        },
      },
      `Unsupported chain selected.  Please select one of: %s`,
      Object.keys(ALL_LIT_CHAINS)
    );
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
      walletConnectProjectId,
      nonce,
    });
  } else if (chainInfo.vmType === VMTYPE.SVM) {
    return checkAndSignSolAuthMessage();
  } else if (chainInfo.vmType === VMTYPE.CVM) {
    return checkAndSignCosmosAuthMessage({
      chain,
      walletType: cosmosWalletType || 'keplr',
    }); // Keplr is defaulted here, being the Cosmos wallet with the highest market share
  }

  // Else, throw an error
  throw new UnsupportedChainException(
    {
      info: {
        chain,
      },
    },
    `vmType not found for this chain: %s. This should not happen. Unsupported chain selected. Please select one of: %s`,
    chain,
    Object.keys(ALL_LIT_CHAINS)
  );
};
