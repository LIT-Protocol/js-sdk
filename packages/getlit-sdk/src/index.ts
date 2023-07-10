import { LitOptionsBuilder } from './lib/lit-options-builder';
import { log } from './lib/utils';
import './global';

// -- global config / APIs
globalThis.Lit = {
  instance: null,
  builder: null,
  nodeClient: null,
  debug: true,
  ready: false,
  events: null,
};

// initialize globally
(async () => {
  log.h1('Intializing GetLit SDK');
  try {
    if (globalThis.Lit.builder) {
      log.warning(
        'GetLit builder has already be initalized, do you want to reinitalize the global instance?'
      );
    }
    log('setting globalThis.Lit.builder...');
    globalThis.Lit.builder = new LitOptionsBuilder();
    log.success('globalThis.Lit.builder has been set!');
    await globalThis.Lit.builder.build();
    log.h1('GetLit SDK Initialized');
  } catch (e) {
    log.error(`Error while attempting to configure GetLit instance ${e}`);
  }
})();

// -- user usage

if (globalThis.Lit.events) {
  globalThis.Lit.events.on('ready', async () => {
    // await 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    log.h1('User Usage');
    log.info('globalThis.Lit.ready:', globalThis.Lit.ready);

    // globalThis.Lit.builder.withContractOptions();

    // log('globalThis.Lit:', globalThis.Lit);
  });
}

// this is for browser
// window.Lit
// window.LitBuilder

// // this is for nodejs
// globalThis.Lit
// globalThis.Lit.builder
