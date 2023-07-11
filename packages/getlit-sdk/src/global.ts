import { EventEmitter } from 'stream';
import { Lit } from './lib/lit';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { OrNull, Types } from './lib/types';

declare global {
  var Lit: {
    builder: OrNull<LitOptionsBuilder>;
    nodeClient: OrNull<Types.NodeClient>;
    debug: boolean;
    ready: boolean;
    events: OrNull<EventEmitter>;

    // Lit class instance
    instance: OrNull<Lit>;

    // Lit class methods
    encrypt: Function;
    decrypt: Function;
    createAccount: Function;
    sign: Function;
  };

  var ethereum: any;
}

// -- global constructor | APIs
globalThis.Lit = {
  builder: null,
  nodeClient: null,
  debug: true,
  ready: false,
  events: null,

  // Lit class instance
  instance: null,

  // Lit class methods
  encrypt: () => {
    console.log('not initialized');
  },
  decrypt: () => {
    console.log('not initialized');
  },
  createAccount: () => {
    console.log('not initialized');
  },
  sign: () => {
    console.log('not initialized');
  },
};
