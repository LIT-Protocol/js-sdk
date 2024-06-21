import {
  CHAIN_ETHEREUM,
  ENCRYPTED_PRIVATE_KEY_ENDPOINT,
  LIT_ACTION_CID_REPOSITORY,
  LIT_PREFIX,
  NETWORK_SOLANA,
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

/**
 *
 * Generates a random Solana/EVM private key inside the corresponding Lit Action and returns the publicKey of the random private key. We don't return the generated wallet address since it can be derived from the publicKey
 *
 * @param pkpSessionSigs - The PKP sessionSigs used to associated the PKP with the generated private key
 * @param network - The network for which the private key needs to be generated. This is used to call different Lit Actions since the keys will be of different types
 * @param litNodeClient - The Lit Node Client used for executing the Lit Action
 *
 * @returns { Promise<GeneratePrivateKeyResponse> } - The publicKey of the generated random private key along with the PKP EthAddres associated with the Wrapped Key
 */
export async function generatePrivateKey({
  pkpSessionSigs,
  network,
  litNodeClient,
}: GeneratePrivateKeyParams): Promise<GeneratePrivateKeyResponse> {
  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);
  console.log(
    'accessControlConditions: ',
    JSON.stringify(allowPkpAddressToDecrypt)
  );

  const ipfsId =
    network === NETWORK_SOLANA
      ? LIT_ACTION_CID_REPOSITORY.generateEncryptedSolanaPrivateKey
      : LIT_ACTION_CID_REPOSITORY.generateEncryptedEthereumPrivateKey;

  let ciphertext, dataToEncryptHash, publicKey;
  try {
    const result = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      ipfsId,
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

/**
 *
 * Import a provided Solana/EVM private key into our DynamoDB instance. First the key is pre-pended with LIT_PREFIX for security reasons. Then the updated key is encrypted and stored in the database
 *
 * @param pkpSessionSigs - The PKP sessionSigs used to associated the PKP with the generated private key
 * @param privateKey - The private key imported into the database
 * @param litNodeClient - The Lit Node Client used for executing the Lit Action
 *
 * @returns { Promise<string> } - The PKP EthAddres associated with the Wrapped Key
 */
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

/**
 *
 * Exports the imported Solana/EVM private key. First the stored encrypted private key is fetched from the database. Then it's decrypted and returned to the user
 *
 * @param pkpSessionSigs - The PKP sessionSigs used to associated the PKP with the generated private key
 * @param privateKey - The private key imported into the database
 * @param litNodeClient - The Lit Node Client used for executing the Lit Action
 *
 * @returns { Promise<string> } - The bare private key which was imported without any prefix
 */
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

/**
 *
 * Signs a transaction inside the Lit Action using the Solana/EVM key. First it fetches the encrypted key from database and then executes a Lit Action that signed the tx
 *
 * @param pkpSessionSigs - The PKP sessionSigs used to associated the PKP with the generated private key
 * @param network - The network for which the private key needs to be generated. This is used to call different Lit Actions since the keys will be of different types
 * @param unsignedTransaction - The unsigned transaction which will be signed inside the Lit Action. It can be of type LitTransaction
 * @param broadcast - Flag used to determine whether the Lit Action should broadcast the signed transaction or only return the signed transaction
 * @param litNodeClient - The Lit Node Client used for executing the Lit Action
 *
 * @returns { Promise<string> } - Either the signed Solana/EVM transaction which the user can use to broadcast themselves or the transaction hash or the broadcasted Solana/EVM transaction
 */
export async function signTransactionWithEncryptedKey<T = LitTransaction>({
  pkpSessionSigs,
  network,
  unsignedTransaction,
  broadcast,
  litNodeClient,
}: SignTransactionWithEncryptedKeyParams<T>): Promise<string> {
  const { pkpAddress, ciphertext, dataToEncryptHash } =
    await fetchPrivateKeyMedataFromDatabase(pkpSessionSigs);

  const ipfsId =
    network === NETWORK_SOLANA
      ? LIT_ACTION_CID_REPOSITORY.signTransactionWithSolanaEncryptedKey
      : LIT_ACTION_CID_REPOSITORY.signTransactionWithEthereumEncryptedKey;

  let result;
  try {
    result = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      ipfsId,
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
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }

  return postLitActionValidation(result);
}

/**
 *
 * Signs a message inside the Lit Action using the Solana/EVM key. First it fetches the encrypted key from database and then executes a Lit Action that signed the tx
 *
 * @param pkpSessionSigs - The PKP sessionSigs used to associated the PKP with the generated private key
 * @param network - The network for which the private key needs to be generated. This is used to call different Lit Actions since the keys will be of different types
 * @param messageToSign - The unsigned message which will be signed inside the Lit Action
 * @param litNodeClient - The Lit Node Client used for executing the Lit Action
 *
 * @returns { Promise<string> } - The signed Solana/EVM message
 */
export async function signMessageWithEncryptedKey({
  pkpSessionSigs,
  network,
  messageToSign,
  litNodeClient,
}: SignMessageWithEncryptedKeyParams): Promise<string> {
  const { pkpAddress, ciphertext, dataToEncryptHash } =
    await fetchPrivateKeyMedataFromDatabase(pkpSessionSigs);

  const ipfsId =
    network === NETWORK_SOLANA
      ? LIT_ACTION_CID_REPOSITORY.signMessageWithSolanaEncryptedKey
      : LIT_ACTION_CID_REPOSITORY.signMessageWithEthereumEncryptedKey;

  let result;
  try {
    result = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      ipfsId,
      jsParams: {
        pkpAddress,
        ciphertext,
        dataToEncryptHash,
        messageToSign,
        accessControlConditions: getPkpAccessControlCondition(pkpAddress),
      },
    });
  } catch (err: any) {
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }

  return postLitActionValidation(result);
}
