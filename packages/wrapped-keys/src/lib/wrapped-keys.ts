import { CHAIN_ETHEREUM, ENCRYPTED_PRIVATE_KEY_ENDPOINT } from './constants';
import { decryptToString, encryptString } from '@lit-protocol/encryption';
import { log, logError } from '@lit-protocol/misc';
import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from './utils';
import {
  LitMessage,
  LitTransaction,
  ExportPrivateKeyParams,
  ExportPrivateKeyResponse,
  ImportPrivateKeyParams,
  ImportPrivateKeyResponse,
  SignWithEncryptedKeyParams,
} from './interfaces';

export async function importPrivateKey({
  pkpSessionSigs,
  privateKey,
  litNodeClient,
}: ImportPrivateKeyParams): Promise<string> {
  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      accessControlConditions: allowPkpAddressToDecrypt,
      dataToEncrypt: privateKey,
    },
    litNodeClient
  );

  const data = {
    ciphertext,
    dataToEncryptHash,
  };

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

    const importedPrivateKey: ImportPrivateKeyResponse = await response.json();
    return importedPrivateKey.pkpAddress;
  } catch (error) {
    const errorMessage = `There was a problem fetching from the database: ${error}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }
}

export async function exportPrivateKey({
  pkpSessionSigs,
  litNodeClient,
}: ExportPrivateKeyParams): Promise<string> {
  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

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

    const exportedPrivateKeyData: ExportPrivateKeyResponse =
      await response.json();

    const decryptedPrivateKey = await decryptToString(
      {
        accessControlConditions: allowPkpAddressToDecrypt,
        chain: CHAIN_ETHEREUM,
        ciphertext: exportedPrivateKeyData.ciphertext,
        dataToEncryptHash: exportedPrivateKeyData.dataToEncryptHash,
        sessionSigs: pkpSessionSigs,
      },
      litNodeClient
    );

    return decryptedPrivateKey;
  } catch (error) {
    const errorMessage = `There was a problem fetching from the database: ${error}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }
}

export async function signWithEncryptedKey<T = LitMessage | LitTransaction>({
  pkpSessionSigs,
  litActionCid,
  unsignedTransaction,
  broadcast,
  litNodeClient,
}: SignWithEncryptedKeyParams<T>): Promise<string> {
  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);

  let pkpAddress: string, ciphertext: string, dataToEncryptHash: string;

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

    const exportedPrivateKeyData: ExportPrivateKeyResponse =
      await response.json();

    ({ pkpAddress, ciphertext, dataToEncryptHash, } = exportedPrivateKeyData);
  } catch (error) {
    const errorMessage = `There was a problem fetching from the database: ${error}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }

  const result = await litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionCid,
    jsParams: {
      pkpAddress,
      ciphertext,
      dataToEncryptHash,
      unsignedTransaction,
      broadcast,
    },
  });

  console.log(`Lit Action result: ${result}`);

  if (!result) {
    throw new Error('There was some error running the Lit Action');
  }

  if (typeof result.response !== 'string') {
    throw new Error('Lit Action should return a string response');
  }

  return result.response;
}
