import { AuthSig } from '../interfaces';

export interface ParsedSignedMessage {
  [key: string]: any;
}

export interface ParsedSessionMessage extends ParsedSignedMessage {
  capabilities: Capability[];
}

export interface Capability extends AuthSig {
  parsedSignedMessage?: ParsedSignedMessage;
}
