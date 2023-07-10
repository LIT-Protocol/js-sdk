import { EventEmitter } from 'stream';
import { Lit } from './lib/lit';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { Types } from './lib/types';

type OrNull<T> = T | null;

declare global {
  var Lit: {
    instance: OrNull<Lit>;
    builder: OrNull<LitOptionsBuilder>;
    nodeClient: OrNull<EventEmitter>;
    debug: boolean;
    ready: boolean;
    events: OrNull<EventEmitter>;
  };
}
