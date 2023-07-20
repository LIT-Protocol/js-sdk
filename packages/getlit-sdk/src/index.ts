import './global';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { isBrowser, log } from './lib/utils';
import { handleAutoAuth } from './lib/auth/handle-auto-auth';
import { LitEmitter } from './lib/events/lit-emitter';
import { LitStorage } from '@lit-protocol/lit-storage';
import { AuthMethod } from '@lit-protocol/types';

// initialize globally
(async () => {
  log.start('global', 'initializing...');

  let storage;
  let emitter;
  globalThis.Lit.builder = null;

  // -- initialize LitStorage
  try {
    storage = new LitStorage();
  } catch (e) {
    log.throw(`Error while attempting to initialize LitStorage\n${e}`);
  }

  // -- initialize LitEmitter
  try {
    emitter = new LitEmitter();
  } catch (e) {
    log.throw(`Error while attempting to initialize LitEmitter\n${e}`);
  }

  // -- initialize LitOptionsBuilder
  try {
    globalThis.Lit.builder = new LitOptionsBuilder({
      emitter,
      storage,
    });
  } catch (e) {
    log.throw(`Error while attempting to initialize LitOptionsBuilder\n${e}`);
  }

  if (!globalThis.Lit.builder) {
    log.throw(`globalThis.Lit.builder is undefined!`);
  }

  // -- build LitOptionsBuilder
  try {
    await globalThis.Lit.builder.build();
  } catch (e) {
    log.throw(`Error while attempting to build LitOptionsBuilder\n${e}`);
  }

  log.end('global', 'done!');

  // ---------- Enable auto auth for browser ----------
  if (isBrowser()) {
    handleAutoAuth(async (authData: AuthMethod) => {
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
    });
  }
})();
