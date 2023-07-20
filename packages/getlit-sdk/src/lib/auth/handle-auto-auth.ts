import { DiscordProvider, GoogleProvider } from '@lit-protocol/lit-auth-client';
import { isBrowser, isDiscordAuth, isGoogleAuth, log } from '../utils';

export async function handleAutoAuth(callback: Function) {
  // -- logic
  if (isGoogleAuth() && globalThis.Lit.auth.google) {
    autoAuthenticate('GoogleAuth', globalThis.Lit.auth.google, callback);
  }

  if (isDiscordAuth() && globalThis.Lit.auth.discord) {
    autoAuthenticate('DiscordAuth', globalThis.Lit.auth.discord, callback);
  }
}
async function autoAuthenticate(
  providerName: string,
  provider: GoogleProvider | DiscordProvider,
  callback?: Function
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

  log.info(`auto-auth detected, attempting to auth "${providerName}"`);

  try {
    const authData = await provider?.authenticate();
    log.success(
      `${providerName} auto-authentication successful! calling callback...`
    );

    // -- callback
    if (callback) {
      callback(authData);
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
