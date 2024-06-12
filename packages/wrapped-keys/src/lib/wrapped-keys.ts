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
  postLitActionValidation,
  storePrivateKeyMetadataToDatabase,
} from './utils';
import {
  LitTransaction,
  ExportPrivateKeyParams,
  ExportPrivateKeyResponse,
  ImportPrivateKeyParams,
  SignTransactionWithEncryptedKeyParams,
  SignMessageWithEncryptedKeyParams,
  GeneratePrivateKeyParams,
  GeneratePrivateKeyResponse,
} from './interfaces';

export async function generatePrivateKey({
  pkpSessionSigs,
  litActionCode,
  litNodeClient,
}: GeneratePrivateKeyParams): Promise<GeneratePrivateKeyResponse> {
  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);
  console.log(
    'accessControlConditions: ',
    JSON.stringify(allowPkpAddressToDecrypt)
  );

  let ciphertext, dataToEncryptHash, publicKey;
  try {
    const result = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      code: litActionCode,
      jsParams: {
        pkpAddress,
        accessControlConditions: allowPkpAddressToDecrypt,
      },
    });

    const response = postLitActionValidation(result);
    ({ ciphertext, dataToEncryptHash, publicKey } = JSON.parse(response));
  } catch (err: any) {
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }

  const data = { ciphertext, dataToEncryptHash };

  const importedPrivateKey = await storePrivateKeyMetadataToDatabase(
    data,
    firstSessionSig
  );
  return {
    pkpAddress: importedPrivateKey.pkpAddress,
    generatedPublicKey: publicKey,
  };
}

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

  const importedPrivateKey = await storePrivateKeyMetadataToDatabase(
    data,
    firstSessionSig
  );
  return importedPrivateKey.pkpAddress;
}

export async function exportPrivateKey({
  pkpSessionSigs,
  litNodeClient,
}: ExportPrivateKeyParams): Promise<string> {
  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  let exportedPrivateKeyData: ExportPrivateKeyResponse;

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

    exportedPrivateKeyData = await response.json();
  } catch (error) {
    const errorMessage = `There was a problem fetching from the database: ${error}`;
    console.error(errorMessage);

    throw new Error(errorMessage);
  }

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

  try {
    const result = await litNodeClient.executeJs({
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

    return postLitActionValidation(result);
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
}

export async function signMessageWithEncryptedKey({
  pkpSessionSigs,
  litActionCode,
  unsignedMessage,
  litNodeClient,
}: SignMessageWithEncryptedKeyParams): Promise<string> {
  const { pkpAddress, ciphertext, dataToEncryptHash } =
    await fetchPrivateKeyMedataFromDatabase(pkpSessionSigs);

  try {
    const result = await litNodeClient.executeJs({
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

    return postLitActionValidation(result);
  } catch (err: any) {
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }
}
