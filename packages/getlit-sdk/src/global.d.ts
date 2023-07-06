import { Lit, LitOptionsBuilder, Types } from './lib/getlit-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

declare global {
  var Lit: Lit;
  var LitBuilder: LitOptionsBuilder;
  var litNodeClient: Types.NodeClient;
  var LitDebug: boolean;
}
