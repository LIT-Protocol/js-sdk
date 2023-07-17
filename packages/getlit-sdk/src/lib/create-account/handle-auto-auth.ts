import { DiscordProvider, GoogleProvider } from '@lit-protocol/lit-auth-client';
import { isBrowser, isDiscordAuth, isGoogleAuth, log } from '../utils';

export async function handleAutoAuth() {
  // -- logic
  if (isGoogleAuth() && globalThis.Lit.auth.google) {
    autoAuthenticate('GoogleAuth', globalThis.Lit.auth.google);
  }

  if (isDiscordAuth() && globalThis.Lit.auth.discord) {
    autoAuthenticate('DiscordAuth', globalThis.Lit.auth.discord);
  }

  // -- inner methods
  async function autoAuthenticate(
    providerName: string,
    provider: GoogleProvider | DiscordProvider
  ) {
    // check if local storage has 'lit-auto-auth' set to 'true'
    if (isBrowser()) {
      const autoAuth = globalThis.Lit.storage?.getItem('lit-auto-auth');
      if (autoAuth !== 'true') {
        log.info(
          `Auto-authentication with ${providerName} is disabled. To enable, set 'lit-auto-auth' to 'true' in local storage.`
        );
        return;
      }
    }

    log.info(`auto-auth detected, attempting toauth ${providerName}`);

    try {
      const authData = await provider?.authenticate();
      log.success(`${providerName} auto-authentication successful!`);

      globalThis.Lit.eventEmitter?.createAccountStatus('in_progress');

      log.info('Creating Lit account...');
      try {
        const PKPInfoArr = await globalThis.Lit.createAccount({
          authData: [authData],
        });
        log.success('Lit account created!');
        log.info(`PKPInfo: ${JSON.stringify(PKPInfoArr)}`);

        if (Array.isArray(PKPInfoArr)) {
          globalThis.Lit.eventEmitter?.createAccountStatus(
            'completed',
            PKPInfoArr
          );
        }
      } catch (e) {
        log.error(`Error while attempting to create Lit account ${e}`);
        globalThis.Lit.eventEmitter?.createAccountStatus('failed');
      }
    } catch (e) {
      log.error(
        `Error while attempting to auto-authenticate with ${providerName} ${e}`
      );
    }

    clearBrowserState();
  }

  function clearBrowserState() {
    log.start('clearBrowserState', 'clearing...');
    // remove 'lit-auto-auth' from local storage
    globalThis.Lit.storage?.removeItem('lit-auto-auth');

    // clear url params
    window.history.replaceState(
      null,
      window.document.title,
      window.location.pathname
    );
    log.end('clearBrowserState', 'done!');
  }
}
