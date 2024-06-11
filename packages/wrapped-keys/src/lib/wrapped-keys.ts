import {
  CHAIN_ETHEREUM,
  ENCRYPTED_PRIVATE_KEY_ENDPOINT,
  LIT_PREFIX,
} from './constants';
import { decryptToString, encryptString } from '@lit-protocol/encryption';
import { logError } from '@lit-protocol/misc';
import {
  fetchPrivateKeyMedataFromDatabase,
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
  SignTransactionWithEncryptedKeyParams,
  SignMessageWithEncryptedKeyParams,
} from './interfaces';

export async function importPrivateKey({
  pkpSessionSigs,
  privateKey,
  litNodeClient,
}: ImportPrivateKeyParams): Promise<string> {
  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const updatedPrivateKey = LIT_PREFIX + privateKey;

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      accessControlConditions: allowPkpAddressToDecrypt,
      dataToEncrypt: updatedPrivateKey,
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

    // It will be of the form lit_<privateKey>
    return decryptedPrivateKey.startsWith(LIT_PREFIX)
      ? decryptedPrivateKey.slice(LIT_PREFIX.length)
      : decryptedPrivateKey;
  } catch (error) {
    const errorMessage = `There was a problem fetching from the database: ${error}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }
}

export async function signTransactionWithEncryptedKey<T = LitTransaction>({
  pkpSessionSigs,
  litActionCode,
  unsignedTransaction,
  broadcast,
  litNodeClient,
}: SignTransactionWithEncryptedKeyParams<T>): Promise<string> {
  const { pkpAddress, ciphertext, dataToEncryptHash } =
    await fetchPrivateKeyMedataFromDatabase(pkpSessionSigs);

  let result;
  try {
    result = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      code: litActionCode,
      jsParams: {
        pkpAddress,
        ciphertext,
        dataToEncryptHash,
        unsignedTransaction,
        broadcast,
        accessControlConditions: getPkpAccessControlCondition(pkpAddress),
      },
    });
  } catch (err: any) {
    if (broadcast && err.errorCode === 'NodeJsTimeoutError') {
      throw new Error(
        `The action timed out: ${err.message}. This doesn't mean that your transaction wasn't broadcast but that it took more than 30 secs to confirm. Please confirm whether it went through on the blockchain explorer for your chain.`
      );
    } else {
      throw new Error(
        `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
      );
    }
  }

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

export async function signMessageWithEncryptedKey({
  pkpSessionSigs,
  litActionCode,
  unsignedMessage,
  litNodeClient,
}: SignMessageWithEncryptedKeyParams): Promise<string> {
  const { pkpAddress, ciphertext, dataToEncryptHash } =
    await fetchPrivateKeyMedataFromDatabase(pkpSessionSigs);

  let result;
  try {
    result = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      code: litActionCode,
      jsParams: {
        pkpAddress,
        ciphertext,
        dataToEncryptHash,
        unsignedMessage,
        accessControlConditions: getPkpAccessControlCondition(pkpAddress),
      },
    });
  } catch (err: any) {
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }

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
