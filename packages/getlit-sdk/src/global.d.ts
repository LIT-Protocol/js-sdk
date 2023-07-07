// import { Lit, LitOptionsBuilder, Types } from './lib/getlit-sdk';
import { Lit } from './lib/lit';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { Types } from './lib/types';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

declare global {
  var Lit: Lit;
  var LitBuilder: LitOptionsBuilder;
  var LitNodeClient: Types.NodeClient;
  var LitDebug: boolean;
  var LitIsReady: boolean;
}
