import { ProviderType } from '@lit-protocol/constants';
import {
  LitAuthMethodEthWallet,
  LitAuthMethodWithProvider,
  PKPInfo,
} from '../types';
import { log } from '../utils';
import { handleRedirect } from './single-auth/handle-redirect';
import { handleEthWallet } from './single-auth/handle-eth-wallet';
import { handleWebAuthn } from './single-auth/handle-webauthn';

// -- provider handlers
const PROVIDER_HANDLERS: {
  [key in ProviderType]?: (
    opts?: LitAuthMethodWithProvider
  ) => Promise<Array<PKPInfo> | void>;
} = {
  [ProviderType.EthWallet.toLowerCase()]: (opts: LitAuthMethodEthWallet) =>
    handleEthWallet(opts),
  [ProviderType.Google]: () => handleRedirect(ProviderType.Google),
  [ProviderType.Discord]: () => handleRedirect(ProviderType.Discord),
  [ProviderType.WebAuthn.toLowerCase()]: () => handleWebAuthn(),
  [ProviderType.Apple]: () => handleRedirect(ProviderType.Apple),
};

export async function handleProvider(opts: LitAuthMethodWithProvider) {
  const provider = (opts as LitAuthMethodWithProvider).provider?.toLowerCase();

  log.start('handleProvider', `creating account with provider "${provider}"`);

  if (!provider) {
    log.throw(
      `"provider" is required to create an account! eg. google, discord`
    );
  }

  // check if the provider is supported
  if (!(provider in PROVIDER_HANDLERS)) {
    log.throw(`provider "${provider}" is not supported yet!`);
  }

  // -- execute the function
  return await PROVIDER_HANDLERS[provider as ProviderType]?.(opts);
}
