import './global';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { log } from './lib/utils';
import { EventEmitter } from 'events';

// initialize globally
(async () => {
  log.start('global', 'initializing...');

  try {
    globalThis.Lit.events = new EventEmitter();

    log('setting "globalThis.Lit.builder"...');
    globalThis.Lit.builder = new LitOptionsBuilder({
      emitter: globalThis.Lit.events,
    });

    log.success('globalThis.Lit.builder has been set!');

    log('building "globalThis.Lit.builder"...');
    await globalThis.Lit.builder.build();
    log.end('global', 'done!');
  } catch (e) {
    log.error(`Error while attempting to configure GetLit instance ${e}`);
  }
})();

// this is for browser
// window.Lit
// window.LitBuilder

// // this is for nodejs
// globalThis.Lit
// globalThis.Lit.builder
