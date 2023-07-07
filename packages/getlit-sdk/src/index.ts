import { LitOptionsBuilder, getlitEvent } from './lib/lit-options-builder';
import { log } from './lib/utils';

// -- global config

// if this exists, use it
// globalThis.customConfig = {

// };

globalThis.LitDebug = true;

// initialize globally
(async () => {
  log.h1('Intializing GetLit SDK');
  try {
    if (globalThis.LitBuilder) {
      log.warning(
        'GetLit builder has already be initalized, do you want to reinitalize the global instance?'
      );
    }
    log('setting globalThis.LitBuilder...');
    globalThis.LitBuilder = new LitOptionsBuilder();
    log.success('globalThis.LitBuilder has been set!');
    await globalThis.LitBuilder.build();
    log.h1('GetLit SDK Initialized');
  } catch (e) {
    log.error(`Error while attempting to configure GetLit instance ${e}`);
  }
})();

// -- user usage
getlitEvent.on('ready', async () => {
  // await 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  log.h1('User Usage');
  log.info('globalThis.LitIsReady:', globalThis.LitIsReady);

  globalThis.LitBuilder.withContractOptions();

  // log('globalThis.Lit:', globalThis.Lit);
});

// this is for browser
// window.Lit
// window.LitBuilder

// // this is for nodejs
// globalThis.Lit
// globalThis.LitBuilder
