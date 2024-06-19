import {
  AccessControlConditions,
  AuthSig,
  ExecuteJsResponse,
  SessionKeySignedMessage,
  SessionSigsMap,
} from '@lit-protocol/types';
import { log, logError } from '@lit-protocol/misc';
import { CHAIN_ETHEREUM, ENCRYPTED_PRIVATE_KEY_ENDPOINT } from './constants';
import { ethers } from 'ethers';
import {
  ExportPrivateKeyResponse,
  ImportPrivateKeyResponse,
  StoreToDatabaseParams,
} from './interfaces';

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
  if (capabilities.length > 3) {
    throw new Error(
      `At max 3 elements can be in the capabilities array but there are: ${capabilities.length}`
    );
  }

  for (const innerAuthSig of capabilities) {
    const delegationAuthSig: AuthSig = JSON.parse(JSON.stringify(innerAuthSig)); // Had to stringify as it was throwing SyntaxError: "[object Object]" is not valid JSON

    if (delegationAuthSig.algo !== 'LIT_BLS') {
      continue;
    }

    const pkpAddress = delegationAuthSig.address;

    log(`pkpAddress to permit decryption: ${pkpAddress}`);

    return pkpAddress;
  }

  throw new Error('SessionSig is not from a PKP');
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

export async function fetchPrivateKeyMedataFromDatabase(
  pkpSessionSigs: SessionSigsMap
): Promise<ExportPrivateKeyResponse> {
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

    return await response.json();
  } catch (error) {
    const errorMessage = `There was a problem fetching from the database: ${error}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }
}

export async function storePrivateKeyMetadataToDatabase(
  data: StoreToDatabaseParams,
  firstSessionSig: AuthSig
): Promise<ImportPrivateKeyResponse> {
  try {
    const response = await fetch(ENCRYPTED_PRIVATE_KEY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pkpsessionsig: JSON.stringify(firstSessionSig),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logError(
        `Could not import the encrypted key due to the error: ${errorBody}`
      );

      throw new Error(errorBody);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = `There was a problem fetching from the database: ${error}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }
}

export function postLitActionValidation(
  result: ExecuteJsResponse | undefined
): string {
  console.log(`Lit Action result: ${JSON.stringify(result)}`);

  if (!result) {
    throw new Error('There was some error running the Lit Action');
  }

  const response = result.response;
  console.log('response');
  console.log(response);

  if (!response) {
    throw new Error(
      `Expected "response" in Lit Action result: ${JSON.stringify(result)}`
    );
  }

  if (typeof response !== 'string') {
    // As the return value is a hex string
    throw new Error(
      `Lit Action should return a string response: ${JSON.stringify(result)}`
    );
  }

  if (!result.success) {
    throw new Error(`Expected "success" in res: ${JSON.stringify(result)}`);
  }

  if (result.success !== true) {
    throw new Error(`Expected "success" to be true: ${JSON.stringify(result)}`);
  }

  if (response.startsWith('Error:')) {
    // Lit Action sets an error response
    throw new Error(`Error executing the Signing Lit Action: ${response}`);
  }

  return response;
}
