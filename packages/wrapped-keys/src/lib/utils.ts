import { ethers } from 'ethers';

import { log } from '@lit-protocol/misc';
import {
  AccsDefaultParams,
  AuthSig,
  SessionKeySignedMessage,
  SessionSigsMap,
} from '@lit-protocol/types';

import { CHAIN_ETHEREUM } from './constants';

/**
 *
 * Extracts the first SessionSig from the SessionSigsMap since we only pass a single SessionSig to the AWS endpoint
 *
 * @param pkpSessionSigs - The PKP sessionSigs (map) used to associate the PKP with the generated private key
 *
 * @returns { AuthSig } - The first SessionSig from the map
 */
export function getFirstSessionSig(pkpSessionSigs: SessionSigsMap): AuthSig {
  const sessionSigsEntries = Object.entries(pkpSessionSigs);

  if (sessionSigsEntries.length === 0) {
    throw new Error(
      `Invalid pkpSessionSigs, length zero: ${JSON.stringify(pkpSessionSigs)}`
    );
  }

  const [[, sessionSig]] = sessionSigsEntries;
  log(`Session Sig being used: ${JSON.stringify(sessionSig)}`);

  return sessionSig;
}

/**
 *
 * Extracts the wallet address from an individual SessionSig
 *
 * @param pkpSessionSig - The first PKP sessionSig from the function getFirstSessionSig
 *
 * @returns { string } - The wallet address that signed the capabilites AuthSig (BLS)
 */
export function getPkpAddressFromSessionSig(pkpSessionSig: AuthSig): string {
  const sessionSignedMessage: SessionKeySignedMessage = JSON.parse(
    pkpSessionSig.signedMessage
  );

  const capabilities = sessionSignedMessage.capabilities;

  if (!capabilities || capabilities.length === 0) {
    throw new Error(
      `Capabilities in the session's signedMessage is empty, but required.`
    );
  }

  const delegationAuthSig = capabilities.find(({ algo }) => algo === 'LIT_BLS');

  if (!delegationAuthSig) {
    throw new Error(
      'SessionSig is not from a PKP; no LIT_BLS capabilities found'
    );
  }

  const pkpAddress = delegationAuthSig.address;
  log(`pkpAddress to permit decryption: ${pkpAddress}`);

  return pkpAddress;
}

/**
 *
 * Creates the access control condition used to gate the access for Wrapped Key decryption
 *
 * @param { string } pkpAddress - The wallet address of the PKP which can decrypt the encrypted Wrapped Key
 *
 * @returns { AccsDefaultParams } - The access control condition that only allows the PKP address to decrypt
 */
export function getPkpAccessControlCondition(
  pkpAddress: string
): AccsDefaultParams {
  if (!ethers.utils.isAddress(pkpAddress)) {
    throw new Error(
      `pkpAddress is not a valid Ethereum Address: ${pkpAddress}`
    );
  }

  return {
    contractAddress: '',
    standardContractType: '',
    chain: CHAIN_ETHEREUM,
    method: '',
    parameters: [':userAddress'],
    returnValueTest: {
      comparator: '=',
      value: pkpAddress,
    },
  };
}
