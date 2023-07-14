import './global';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { log } from './lib/utils';
import { EventEmitter } from 'events';
import { handleAutoAuth } from './lib/create-account/handle-auto-auth';

// initialize globally
(async () => {
  log.start('global', 'initializing...');

  try {
    globalThis.Lit.events = new EventEmitter();
    globalThis.Lit.builder = new LitOptionsBuilder({
      emitter: globalThis.Lit.events,
    });

    log.start('building');
    await globalThis.Lit.builder.build();
    log.end('building');

    // ---------- auto auth ----------
    handleAutoAuth();
  } catch (e) {
    log.error(`Error while attempting to configure GetLit instance ${e}`);
  }

  log.end('global', 'done!');
  log.info('globalThis.Lit', globalThis.Lit);
})();
