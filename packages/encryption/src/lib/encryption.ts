import { EITHER_TYPE, InvalidParamType } from '@lit-protocol/constants';
import { safeParams } from '@lit-protocol/misc';
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
 *
 * @returns { Promise<string> } - JSON serialised string of the encrypted data and associated metadata necessary to decrypt it later
 *
 */
export const encryptToJson = async (
  params: EncryptToJsonProps
): Promise<string> => {
  const {
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    string,
    file,
    litNodeClient,
  } = params;

  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'encryptToJson',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    throw new InvalidParamType(
      {
        info: {
          params,
          function: 'encryptToJson',
        },
        cause: paramsIsSafe.result,
      },
      'Invalid params'
    );

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
        },
      },
      'You must provide either "file" or "string"'
    );
  }
};

/**
 *
 * Decrypt & return a previously encrypted string (as a string) or file (as a Uint8Array) using the metadata included
 * in the parsed JSON data
 *
 * @param params { DecryptFromJsonProps } - The params required to decrypt a parsed JSON blob containing appropriate metadata
 *
 * @returns { Promise<string | Uint8Array> } - The decrypted `string` or file (as a `Uint8Array`) depending on `dataType` property in the parsed JSON provided
 *
 */
export async function decryptFromJson(
  params: DecryptFromJsonProps
): Promise<
  ReturnType<typeof decryptToFile> | ReturnType<typeof decryptToString>
> {
  const { authContext, parsedJsonData, litNodeClient } = params;

  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decryptFromJson',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    throw new InvalidParamType(
      {
        info: {
          params,
          function: 'decryptFromJson',
        },
        cause: paramsIsSafe.result,
      },
      'Invalid params'
    );

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
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'encryptUint8Array',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    throw new InvalidParamType(
      {
        info: {
          params,
        },
      },
      'Invalid params'
    );

  return litNodeClient.encrypt({
    ...params,
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
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decrypt',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    throw new InvalidParamType(
      {
        info: {
          params,
          function: 'decryptToUint8Array',
        },
        cause: paramsIsSafe.result,
      },
      'Invalid params'
    );

  const { decryptedData } = await litNodeClient.decrypt(params);

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
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'encryptString',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    throw new InvalidParamType(
      {
        info: {
          params,
          function: 'encryptString',
        },
        cause: paramsIsSafe.result,
      },
      'Invalid params'
    );

  return litNodeClient.encrypt({
    ...params,
    dataToEncrypt: uint8arrayFromString(params.dataToEncrypt, 'utf8'),
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
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decrypt',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    throw new InvalidParamType(
      {
        info: {
          params,
          function: 'decryptToString',
        },
        cause: paramsIsSafe.result,
      },
      'Invalid params'
    );

  const { decryptedData } = await litNodeClient.decrypt(params);

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
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'encryptFile',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    throw new InvalidParamType(
      {
        info: {
          params,
          function: 'encryptFile',
        },
        cause: paramsIsSafe.result,
      },
      'Invalid params'
    );

  // encrypt the file
  const fileAsArrayBuffer = await params.file.arrayBuffer();

  return litNodeClient.encrypt({
    ...params,
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
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decrypt',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    throw new InvalidParamType(
      {
        info: {
          params,
          function: 'decryptToFile',
        },
        cause: paramsIsSafe.result,
      },
      'Invalid params'
    );

  const { decryptedData } = await litNodeClient.decrypt(params);

  return decryptedData;
};
