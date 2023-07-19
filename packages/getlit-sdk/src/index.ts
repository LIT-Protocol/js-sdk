import './global';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { isBrowser, log } from './lib/utils';
import { handleAutoAuth } from './lib/create-account/handle-auto-auth';
import { LitEmitter } from './lib/events/lit-emitter';
import { LitStorage } from '@lit-protocol/lit-storage';

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
    handleAutoAuth();
  }
})();
