import { enableAutoAuth, log } from '../../utils';
import { ProviderType } from '@lit-protocol/constants';

export async function handleRedirect(
  providerType: ProviderType.Google | ProviderType.Discord | ProviderType.Apple
) {
  log.start('handleRedirect');
  enableAutoAuth();
  globalThis.Lit.auth[providerType]?.signIn();
  log.end('handleRedirect');
}
