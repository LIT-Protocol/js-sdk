import { EventEmitter } from 'stream';
import { Lit } from './lib/lit';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { OrNull, Types } from './lib/types';

declare global {
  var Lit: {
    instance: OrNull<Lit>;
    builder: OrNull<LitOptionsBuilder>;
    nodeClient: OrNull<Types.NodeClient>;
    debug: boolean;
    ready: boolean;
    events: OrNull<EventEmitter>;
  };
}
