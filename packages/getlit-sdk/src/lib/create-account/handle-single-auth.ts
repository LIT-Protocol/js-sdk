import { ProviderType } from '@lit-protocol/constants';
import { LitAuthMethod, PKPInfo } from '../types';
import { getProviderMap, log, relayResToPKPInfo } from '../utils';
import { WebAuthnProvider } from '@lit-protocol/lit-auth-client';

export async function handleSingleAuth(authData: LitAuthMethod) {
  log.start('handleSingleAuth', 'handle-single-auth.ts');
  const providerMap = getProviderMap();
  const authMethodType: ProviderType = providerMap[authData.authMethodType];

  const provider = globalThis.Lit.authClient?.getProvider(authMethodType);

  log('provider', provider);

  if (!provider) {
    return log.throw(`provider "${authMethodType}" is not supported`);
  }

  log.info(`authMethodType is webauthn`);

  let txHash;
  let res;

  // -- cases
  globalThis.Lit.eventEmitter?.createAccountStatus('in_progress');
  if (authMethodType === 'webauthn') {
    const _provider = provider as WebAuthnProvider;

    let opts;

    // -- register
    try {
      opts = await _provider.register();
      log('opts', opts);
    } catch (e) {
      globalThis.Lit.eventEmitter?.createAccountStatus('failed');
      log.throw(`Failed to create account with webauthn!`);
    }

    log.info('minting through verifyAndMintPKPThroughRelayer');
    try {
      txHash = await _provider.verifyAndMintPKPThroughRelayer(opts);
    } catch (e) {
      globalThis.Lit.eventEmitter?.createAccountStatus('failed');
      log.throw(`Failed to create account with webauthn!`);
    }
  } else {
    log.info('minting through mintPKPThroughRelayer');
    txHash = await provider.mintPKPThroughRelayer(authData);
  }

  // -- wait for response
  try {
    res =
      await globalThis.Lit.auth.webauthn?.relay.pollRequestUntilTerminalState(
        txHash
      );
  } catch (e) {
    globalThis.Lit.eventEmitter?.createAccountStatus('failed');
    log.throw(`Failed to create account with webauthn!`);
  }

  log.info('res', res);

  const _PKPInfo: PKPInfo = relayResToPKPInfo(res);

  log.end('handleSingleAuth', 'handle-single-auth.ts');

  globalThis.Lit.eventEmitter?.createAccountStatus('completed', [_PKPInfo]);

  return _PKPInfo;
}
