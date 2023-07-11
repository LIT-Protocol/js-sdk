import './global'; 
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { log } from './lib/utils';
import { EventEmitter } from 'events';

// initialize globally
(async () => {
  log.h1('Intializing GetLit SDK');

  try {
    log('setting "globalThis.Lit.events"...');
    globalThis.Lit.events = new EventEmitter();
    log.success('setting "globalThis.Lit.events" has been set!');

    log('setting "globalThis.Lit.builder"...');
    globalThis.Lit.builder = new LitOptionsBuilder();
    log.success('globalThis.Lit.builder has been set!');

    log('building "globalThis.Lit.builder"...');
    await globalThis.Lit.builder.build();
    log.h1('GetLit SDK Initialized');
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
