import { LitOptionsBuilder } from './lib/getlit-sdk';
import { log } from './lib/utils';

// -- global config
globalThis.LitDebug = true;

// -- we do this for users
// initialize globally
(async () => {
  log('Intializing GetLit SDK...');
  try {
    if (globalThis.LitBuilder) {
      log.warning(
        'GetLit builder has already be initalized, do you want to reinitalize the global instance?'
      );
    }
    globalThis.LitBuilder = new LitOptionsBuilder();
    await globalThis.LitBuilder.build();
    log.success('✅ GetLit SDK initialized successfully!');
  } catch (e) {
    log.error(`Error while attempting to configure GetLit instance ${e}`);
  }
})();

// -- user usage
// this is for browser
// window.Lit
// window.LitBuilder

// // this is for nodejs
// globalThis.Lit
// globalThis.LitBuilder
