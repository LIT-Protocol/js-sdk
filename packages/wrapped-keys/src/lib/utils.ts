import {
  AuthSig,
  SessionKeySignedMessage,
  SessionSigsMap,
} from '@lit-protocol/types';
import { log } from '@lit-protocol/misc';
// import { log } from 'console';

interface BaseLitTransaction {
  toAddress: string;
  value: string;
}

interface EthereumLitTransaction extends BaseLitTransaction {
  gasPrice?: string;
  gasLimit?: number;
  data?: string;
}

interface SolanaLitTransaction extends BaseLitTransaction {}

export type LitTransaction = EthereumLitTransaction | SolanaLitTransaction;

// Same for both Ethereum & Solana
export interface LitMessage {
  message: string;
}

export function getFirstSessionSig(pkpSessionSigs: SessionSigsMap): AuthSig {
  const keys = Object.keys(pkpSessionSigs);
  if (keys.length === 0) {
    throw new Error(
      `Invalid pkpSessionSigs, length zero: ${JSON.stringify(pkpSessionSigs)}`
    );
  }

  const firstSessionSig: AuthSig = pkpSessionSigs[keys[0]];
  log(`Session Sig being used: ${JSON.stringify(firstSessionSig)}`);

  return firstSessionSig;
}

export function getPkpAddressFromSessionSig(pkpSessionSig: AuthSig): string {
  const sessionSignedMessage: SessionKeySignedMessage = JSON.parse(
    pkpSessionSig.signedMessage
  );

  const capabilities = sessionSignedMessage.capabilities;
  if (capabilities.length !== 1) {
    throw new Error(
      `There should be exactly 1 element in the capabilities array but there are: ${capabilities.length}`
    );
  }

  const delegationAuthSig: AuthSig = JSON.parse(JSON.stringify(capabilities[0])); // Had to stringify as it was throwing SyntaxError: "[object Object]" is not valid JSON

  if (delegationAuthSig.algo !== 'LIT_BLS') {
    throw new Error('SessionSig is not from a PKP');
  }

  const pkpAddress = delegationAuthSig.address;

  log(`pkpAddress to permit decryption: ${pkpAddress}`);

  return pkpAddress;
}
