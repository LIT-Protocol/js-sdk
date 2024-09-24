import { AuthSig } from '../interfaces';

export interface ParsedSignedMessage {
  // Known keys
  URI?: string;
  Version?: string;
  'Chain ID'?: string;
  Nonce?: string;
  'Issued At'?: string;

  /**
   * Inner expiration
   */
  'Expiration Time'?: string;
  Resources?: string[]; // Should be an array of strings

  /**
   * Outer expiration
   */
  expiration?: string;

  // Dynamic keys
  [key: string]: unknown;
}

export interface ParsedSessionMessage extends ParsedSignedMessage {
  capabilities: Capability[];
}

export interface Capability extends AuthSig {
  parsedSignedMessage?: ParsedSignedMessage;
}
