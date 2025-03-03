import { InvalidParamType } from '@lit-protocol/constants';
import {
  applySchemaWithValidation,
  DecryptRequestSchema,
  DecryptFromJsonPropsSchema,
  EncryptFileRequestSchema,
  EncryptStringRequestSchema,
  EncryptToJsonPropsSchema,
  EncryptRequestSchema,
} from '@lit-protocol/schemas';
import {
  DecryptRequest,
  EncryptFileRequest,
  EncryptResponse,
  EncryptUint8ArrayRequest,
  EncryptStringRequest,
  ILitNodeClient,
  EncryptToJsonPayload,
  EncryptToJsonProps,
  DecryptFromJsonProps,
} from '@lit-protocol/types';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

/**
 * Encrypt a string or file using the LIT network public key and serialise all the metadata required to decrypt
 * i.e. accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions & chain to JSON
 *
 * Useful for encrypting/decrypting data in IPFS or other storage without compressing it in a file.
 *
 * @param params { EncryptToJsonProps } - The params required to encrypt either a file or string and serialise it to JSON
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 *
 * @returns { Promise<string> } - JSON serialised string of the encrypted data and associated metadata necessary to decrypt it later
 *
 */
export const encryptToJson = async (
  params: EncryptToJsonProps,
  litNodeClient: ILitNodeClient
): Promise<string> => {
  const _params = applySchemaWithValidation(
    'encryptToJson',
    params,
    EncryptToJsonPropsSchema
  );
  const {
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    string,
    file,
  } = _params;

  if (string !== undefined) {
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        ...params,
        dataToEncrypt: string,
      },
      litNodeClient
    );

    return JSON.stringify({
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
      chain,
      dataType: 'string',
    } as EncryptToJsonPayload);
  } else if (file) {
    const { ciphertext, dataToEncryptHash } = await encryptFile(
      { ...params, file },
      litNodeClient
    );

    return JSON.stringify({
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
      chain,
      dataType: 'file',
    } as EncryptToJsonPayload);
  } else {
    throw new InvalidParamType(
      {
        info: {
          params,
          function: 'encryptToJson',
        },
      },
      'You must provide either "file" or "string" param'
    );
  }
};

/**
 *
 * Decrypt & return a previously encrypted string (as a string) or file (as a Uint8Array) using the metadata included
 * in the parsed JSON data
 *
 * @param params { DecryptFromJsonProps } - The params required to decrypt a parsed JSON blob containing appropriate metadata
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 *
 * @returns { Promise<string | Uint8Array> } - The decrypted `string` or file (as a `Uint8Array`) depending on `dataType` property in the parsed JSON provided
 *
 */
export async function decryptFromJson(
  params: DecryptFromJsonProps,
  litNodeClient: ILitNodeClient
): Promise<
  ReturnType<typeof decryptToFile> | ReturnType<typeof decryptToString>
> {
  const _params = applySchemaWithValidation(
    'decryptFromJson',
    params,
    DecryptFromJsonPropsSchema
  );

  const { authContext, parsedJsonData } = _params;

  if (parsedJsonData.dataType === 'string') {
    return decryptToString(
      {
        accessControlConditions: parsedJsonData.accessControlConditions,
        evmContractConditions: parsedJsonData.evmContractConditions,
        solRpcConditions: parsedJsonData.solRpcConditions,
        unifiedAccessControlConditions:
          parsedJsonData.unifiedAccessControlConditions,
        ciphertext: parsedJsonData.ciphertext,
        dataToEncryptHash: parsedJsonData.dataToEncryptHash,
        chain: parsedJsonData.chain,
        userMaxPrice: parsedJsonData.userMaxPrice,
        authContext,
      },
      litNodeClient
    );
  } else if (parsedJsonData.dataType === 'file') {
    return decryptToFile(
      {
        accessControlConditions: parsedJsonData.accessControlConditions,
        evmContractConditions: parsedJsonData.evmContractConditions,
        solRpcConditions: parsedJsonData.solRpcConditions,
        unifiedAccessControlConditions:
          parsedJsonData.unifiedAccessControlConditions,
        ciphertext: parsedJsonData.ciphertext,
        dataToEncryptHash: parsedJsonData.dataToEncryptHash,
        chain: parsedJsonData.chain,
        userMaxPrice: parsedJsonData.userMaxPrice,
        authContext,
      },
      litNodeClient
    );
  } else {
    throw new InvalidParamType(
      {
        info: {
          dataType: parsedJsonData.dataType,
          params,
        },
      },
      'dataType of %s is not valid. Must be "string" or "file".',
      parsedJsonData.dataType
    );
  }
}

// ---------- Local Helpers ----------

/** Encrypt a uint8array. This is used to encrypt any uint8array that is to be locked via the Lit Protocol.
 * @param { EncryptUint8ArrayRequest } params - The params required to encrypt a uint8array
 * @param params.dataToEncrypt - (optional) The uint8array to encrypt
 * @param params.accessControlConditions - (optional) The access control conditions
 * @param params.evmContractConditions - (optional) The EVM contract conditions
 * @param params.solRpcConditions - (optional) The Solana RPC conditions
 * @param params.unifiedAccessControlConditions - The unified access control conditions
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 *
 * @returns { Promise<EncryptResponse> } - The encrypted uint8array and the hash of the data that was encrypted
 */
export const encryptUint8Array = async (
  params: EncryptUint8ArrayRequest,
  litNodeClient: ILitNodeClient
): Promise<EncryptResponse> => {
  const _params = applySchemaWithValidation(
    'encryptUint8Array',
    params,
    EncryptRequestSchema
  );

  return litNodeClient.encrypt({
    ..._params,
  });
};

/**
 * Decrypt a cyphertext into a Uint8Array that was encrypted with the encryptUint8Array function.
 *
 * @param { DecryptRequest } params - The params required to decrypt a string
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 *
 * @returns { Promise<Uint8Array> } - The decrypted `Uint8Array`
 */
export const decryptToUint8Array = async (
  params: DecryptRequest,
  litNodeClient: ILitNodeClient
): Promise<Uint8Array> => {
  const _params = applySchemaWithValidation(
    'decryptToUint8Array',
    params,
    DecryptRequestSchema
  );

  const { decryptedData } = await litNodeClient.decrypt(_params);

  return decryptedData;
};

/**
 *
 * Encrypt a string.  This is used to encrypt any string that is to be locked via the Lit Protocol.
 *
 * @param { EncryptStringRequest } params - The params required to encrypt a string
 * @param params.dataToEncrypt - (optional) The string to encrypt
 * @param params.accessControlConditions - (optional) The access control conditions
 * @param params.evmContractConditions - (optional) The EVM contract conditions
 * @param params.solRpcConditions - (optional) The Solana RPC conditions
 * @param params.unifiedAccessControlConditions - The unified access control conditions
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 *
 * @returns { Promise<EncryptResponse> } - The encrypted string and the hash of the string
 */
export const encryptString = async (
  params: EncryptStringRequest,
  litNodeClient: ILitNodeClient
): Promise<EncryptResponse> => {
  const _params = applySchemaWithValidation(
    'encryptString',
    params,
    EncryptStringRequestSchema
  );

  return litNodeClient.encrypt({
    ..._params,
    dataToEncrypt: uint8arrayFromString(_params.dataToEncrypt, 'utf8'),
  });
};

/**
 *
 * Decrypt ciphertext into a string that was encrypted with the encryptString function.
 *
 * @param { DecryptRequest } params - The params required to decrypt a string
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client

 * @returns { Promise<string> } - The decrypted string
 */
export const decryptToString = async (
  params: DecryptRequest,
  litNodeClient: ILitNodeClient
): Promise<string> => {
  const _params = applySchemaWithValidation(
    'decryptToString',
    params,
    DecryptRequestSchema
  );

  const { decryptedData } = await litNodeClient.decrypt(_params);

  return uint8arrayToString(decryptedData, 'utf8');
};

/**
 *
 * Encrypt a file without doing any compression or packing.  This is useful for large files.  A 1gb file can be encrypted in only 2 seconds, for example.
 *
 * @param { EncryptFileRequest } params - The params required to encrypt a file
 * @param { ILitNodeClient } litNodeClient - The lit node client to use to encrypt the file
 *
 * @returns { Promise<EncryptResponse> } - The encrypted file and the hash of the file
 */
export const encryptFile = async (
  params: EncryptFileRequest,
  litNodeClient: ILitNodeClient
): Promise<EncryptResponse> => {
  const _params = applySchemaWithValidation(
    'encryptFile',
    params,
    EncryptFileRequestSchema
  );

  // encrypt the file
  const fileAsArrayBuffer = await _params.file.arrayBuffer();

  return litNodeClient.encrypt({
    ..._params,
    dataToEncrypt: new Uint8Array(fileAsArrayBuffer),
  });
};

/**
 *
 * Decrypt a file that was encrypted with the encryptFile function, without doing any uncompressing or unpacking.  This is useful for large files.  A 1gb file can be decrypted in only 1 second, for example.
 *
 * @param { DecryptRequest } params - The params required to decrypt a file
 * @param { ILitNodeClient } litNodeClient - The lit node client to use to decrypt the file
 *
 * @returns { Promise<Uint8Array> } - The decrypted file
 */
export const decryptToFile = async (
  params: DecryptRequest,
  litNodeClient: ILitNodeClient
): Promise<Uint8Array> => {
  const _params = applySchemaWithValidation(
    'decryptToFile',
    params,
    DecryptRequestSchema
  );

  const { decryptedData } = await litNodeClient.decrypt(_params);

  return decryptedData;
};
