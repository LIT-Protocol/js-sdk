import {
  AccessControlConditions,
  AuthSig,
  SessionKeySignedMessage,
  SessionSigsMap,
} from '@lit-protocol/types';
import { log, logError } from '@lit-protocol/misc';
import { CHAIN_ETHEREUM, ENCRYPTED_PRIVATE_KEY_ENDPOINT } from './constants';
import { ethers } from 'ethers';
import { ExportPrivateKeyResponse } from './interfaces';
// import { log } from 'console';

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

  const delegationAuthSig: AuthSig = JSON.parse(
    JSON.stringify(capabilities[0])
  ); // Had to stringify as it was throwing SyntaxError: "[object Object]" is not valid JSON

  if (delegationAuthSig.algo !== 'LIT_BLS') {
    throw new Error('SessionSig is not from a PKP');
  }

  const pkpAddress = delegationAuthSig.address;

  log(`pkpAddress to permit decryption: ${pkpAddress}`);

  return pkpAddress;
}

export function getPkpAccessControlCondition(
  pkpAddress: string
): AccessControlConditions {
  if (!ethers.utils.isAddress(pkpAddress)) {
    throw new Error(
      `pkpAddress is not a valid Ethereum Address: ${pkpAddress}`
    );
  }

  return [
    {
      contractAddress: '',
      standardContractType: '',
      chain: CHAIN_ETHEREUM,
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: pkpAddress,
      },
    },
  ];
}

export async function fetchPrivateKeyMedataFromDatabase(pkpSessionSigs: SessionSigsMap): Promise<ExportPrivateKeyResponse> {
  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);

  try {
    const response = await fetch(ENCRYPTED_PRIVATE_KEY_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        pkpsessionsig: JSON.stringify(firstSessionSig),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logError(
        `Could not fetch the encrypted key due to the error: ${errorBody}`
      );

      throw new Error(errorBody);
    }

    return await response.json() as ExportPrivateKeyResponse;
  } catch (error) {
    const errorMessage = `There was a problem fetching from the database: ${error}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }
}
