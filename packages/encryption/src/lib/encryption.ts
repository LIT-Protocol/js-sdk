import {
  EITHER_TYPE,
  ILitError,
  LIT_ERROR,
  NETWORK_PUB_KEY,
} from '@lit-protocol/constants';
import { verifySignature } from '@lit-protocol/crypto';

import {
  DecryptFromIpfsProps,
  DecryptRequest,
  DecryptZipFileWithMetadata,
  DecryptZipFileWithMetadataProps,
  EncryptFileAndZipWithMetadataProps,
  EncryptFileRequest,
  EncryptRequestBase,
  EncryptResponse,
  EncryptStringRequest,
  EncryptToIpfsDataType,
  EncryptToIpfsPayload,
  EncryptToIpfsProps,
  EncryptZipRequest,
  IJWT,
  ILitNodeClient,
  MetadataForFile,
  SigningAccessControlConditionJWTPayload,
  VerifyJWTProps,
} from '@lit-protocol/types';

// @ts-ignore
import * as JSZip from 'jszip/dist/jszip.js';

import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

import { checkType, isBrowser, log, throwError } from '@lit-protocol/misc';

import { safeParams } from './params-validators';

import * as ipfsClient from 'ipfs-http-client';

/**
 *
 * Encrypt a string or file using the LIT network public key and upload all the metadata required to decrypt i.e. accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions & chain to IPFS using the ipfs-client-http SDK & returns the IPFS CID.
 *
 * @param { EncryptToIpfsProps } - The params required to encrypt & upload to IPFS
 *
 * @returns { Promise<string> } - IPFS CID
 *
 */
export const encryptToIpfs = async (
  params: EncryptToIpfsProps
): Promise<string> => {
  const {
    authSig,
    sessionSigs,
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    string,
    file,
    litNodeClient,
    infuraId,
    infuraSecretKey,
  } = params;

  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'encryptToIpfs',
    params: {
      authSig,
      sessionSigs,
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
      chain,
      string,
      file,
      litNodeClient,
    },
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  let ciphertext: string;
  let dataToEncryptHash: string;
  let dataType: EncryptToIpfsDataType;

  if (string !== undefined) {
    const encryptResponse = await encryptString(
      {
        ...params,
        dataToEncrypt: string,
      },
      litNodeClient
    );
    ciphertext = encryptResponse.ciphertext;
    dataToEncryptHash = encryptResponse.dataToEncryptHash;
    dataType = 'string';
  } else {
    const encryptResponse = await encryptFile(
      { ...params, file: file! },
      litNodeClient
    );
    ciphertext = encryptResponse.ciphertext;
    dataToEncryptHash = encryptResponse.dataToEncryptHash;
    dataType = 'file';
  }

  const authorization =
    'Basic ' + Buffer.from(`${infuraId}:${infuraSecretKey}`).toString('base64');
  const ipfs = ipfsClient.create({
    url: 'https://ipfs.infura.io:5001/api/v0',
    headers: {
      authorization,
    },
  });

  try {
    const res = await ipfs.add(
      JSON.stringify({
        ciphertext,
        dataToEncryptHash,
        accessControlConditions,
        evmContractConditions,
        solRpcConditions,
        unifiedAccessControlConditions,
        chain,
        dataType,
      } as EncryptToIpfsPayload)
    );

    return res.path;
  } catch (e) {
    return throwError({
      message: 'Unable to upload to IPFS',
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
  }
};

/**
 *
 * Decrypt & return the string or file (in Uint8Array format) using its metadata stored on IPFS with the given ipfsCid.
 *
 * @param { DecryptFromIpfsProps } - The params required to decrypt from IPFS
 *
 * @returns { Promise<string | Uint8Array> } - The decrypted string or file (in Uint8Array format)
 *
 */
export const decryptFromIpfs = async (
  params: DecryptFromIpfsProps
): Promise<string | Uint8Array> => {
  const { authSig, sessionSigs, ipfsCid, litNodeClient } = params;

  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decryptFromIpfs',
    params: {
      authSig,
      sessionSigs,
      ipfsCid,
      litNodeClient,
    },
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  try {
    const metadata: EncryptToIpfsPayload = await (
      await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsCid}`)
    ).json();
    if (metadata.dataType === 'string') {
      return decryptToString(
        {
          accessControlConditions: metadata.accessControlConditions,
          evmContractConditions: metadata.evmContractConditions,
          solRpcConditions: metadata.solRpcConditions,
          unifiedAccessControlConditions:
            metadata.unifiedAccessControlConditions,
          ciphertext: metadata.ciphertext,
          dataToEncryptHash: metadata.dataToEncryptHash,
          chain: metadata.chain,
          authSig,
          sessionSigs,
        },
        litNodeClient
      );
    } else {
      return decryptToFile(
        {
          accessControlConditions: metadata.accessControlConditions,
          evmContractConditions: metadata.evmContractConditions,
          solRpcConditions: metadata.solRpcConditions,
          unifiedAccessControlConditions:
            metadata.unifiedAccessControlConditions,
          ciphertext: metadata.ciphertext,
          dataToEncryptHash: metadata.dataToEncryptHash,
          chain: metadata.chain,
          authSig,
          sessionSigs,
        },
        litNodeClient
      );
    }
  } catch (e) {
    return throwError({
      message: 'Unable to fetch or decrypt from IPFS',
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
  }
};

// ---------- Local Helpers ----------

/**
 *
 * Encrypt a string.  This is used to encrypt any string that is to be locked via the Lit Protocol.
 *
 * @param { EncryptStringRequest } params - The params required to encrypt a string
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
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

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
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  const { decryptedData } = await litNodeClient.decrypt(params);

  return uint8arrayToString(decryptedData, 'utf8');
};

/**
 *
 * Zip and encrypt a string.  This is used to encrypt any string that is to be locked via the Lit Protocol.
 *
 * @param { EncryptStringRequest } params - The params required to encrypt a string
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 *
 * @returns { Promise<EncryptResponse> } - The encrypted string and the hash of the string
 */
export const zipAndEncryptString = async (
  params: EncryptStringRequest,
  litNodeClient: ILitNodeClient
): Promise<EncryptResponse> => {
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'zipAndEncryptString',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  let zip;

  try {
    zip = new JSZip.default();
  } catch (e) {
    zip = new JSZip();
  }

  zip.file('string.txt', params.dataToEncrypt);

  return encryptZip({ ...params, zip }, litNodeClient);
};

/**
 * 
 * Zip and encrypt multiple files.
 * 
 * @param { Array<File> } files - The files to encrypt
 * @param { EncryptRequestBase } paramsBase - The params required to encrypt a file
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 * 
 * @returns { Promise<EncryptResponse> } - The encrypted file and the hash of the file
 
*/
export const zipAndEncryptFiles = async (
  files: Array<File>,
  paramsBase: EncryptRequestBase,
  litNodeClient: ILitNodeClient
): Promise<EncryptResponse> => {
  // let's zip em
  let zip;

  try {
    zip = new JSZip.default();
  } catch (e) {
    zip = new JSZip();
  }

  // -- zip each file
  for (let i = 0; i < files.length; i++) {
    // -- validate
    if (
      !checkType({
        value: files[i],
        allowedTypes: ['File'],
        paramName: `files[${i}]`,
        functionName: 'zipAndEncryptFiles',
      })
    )
      throwError({
        message: 'Invalid file type',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    const folder: JSZip | null = zip.folder('encryptedAssets');

    if (!folder) {
      log("Failed to get 'encryptedAssets' from zip.folder() ");
      return throwError({
        message: "Failed to get 'encryptedAssets' from zip.folder() ",
        errorKind: LIT_ERROR.UNKNOWN_ERROR.kind,
        errorCode: LIT_ERROR.UNKNOWN_ERROR.name,
      });
    }

    folder.file(files[i].name, files[i]);
  }

  return encryptZip({ ...paramsBase, zip }, litNodeClient);
};

/**
 *
 * Decrypt and unzip a zip that was created using encryptZip, zipAndEncryptString, or zipAndEncryptFiles.
 *
 * @param { DecryptRequest } params - The params required to decrypt a string
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 *
 * @returns { Promise<{ [key: string]: JSZip.JSZipObject }>} - The decrypted zip file
 */
export const decryptToZip = async (
  params: DecryptRequest,
  litNodeClient: ILitNodeClient
): Promise<{ [key: string]: JSZip.JSZipObject }> => {
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decrypt',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  const { decryptedData } = await litNodeClient.decrypt(params);

  // unpack the zip
  let zip;

  try {
    zip = new JSZip.default();
  } catch (e) {
    zip = new JSZip();
  }
  const unzipped = await zip.loadAsync(decryptedData);

  return unzipped.files;
};

/**
 *
 * Encrypt a zip file created with JSZip.
 *
 * @param { EncryptZipRequest } params - The params required to encrypt a zip
 * @param { ILitNodeClient } litNodeClient - The Lit Node Client
 *
 * @returns { Promise<EncryptResponse> } - The encrypted zip file and the hash of the zip file
 */
export const encryptZip = async (
  params: EncryptZipRequest,
  litNodeClient: ILitNodeClient
): Promise<EncryptResponse> => {
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'encryptZip',
    params,
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  const { zip } = params;
  let zipBlob;
  let zipBlobArrayBuffer: ArrayBuffer;

  if (isBrowser()) {
    zipBlob = await zip.generateAsync({ type: 'blob' });
    zipBlobArrayBuffer = await zipBlob.arrayBuffer();
  } else {
    zipBlobArrayBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  }

  // to download the encrypted zip file for testing, uncomment this
  // saveAs(encryptedZipBlob, 'encrypted.bin')

  return litNodeClient.encrypt({
    ...params,
    dataToEncrypt: new Uint8Array(zipBlobArrayBuffer),
  });
};

/**
 *
 * Encrypt a single file and then zip it up with the metadata.
 *
 * @param { EncryptFileAndZipWithMetadataProps } params - The params required to encrypt a file and zip it up with the metadata
 *
 * @returns { Promise<any> } - The encrypted zip file and the hash of the zip file
 *
 */
export const encryptFileAndZipWithMetadata = async (
  params: EncryptFileAndZipWithMetadataProps
): Promise<any> => {
  const {
    authSig,
    sessionSigs,
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    file,
    litNodeClient,
    readme,
  } = params;

  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'encryptFileAndZipWithMetadata',
    params: {
      authSig,
      sessionSigs,
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
      chain,
      file,
      litNodeClient,
      readme,
    },
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  // encrypt the file
  const { ciphertext, dataToEncryptHash } = await encryptFile(
    { ...params },
    litNodeClient
  );

  // Zip up with metadata
  let zip;

  try {
    zip = new JSZip.default();
  } catch (e) {
    zip = new JSZip();
  }
  const metadata: MetadataForFile = {
    name: file.name,
    type: file.type,
    size: file.size,
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    dataToEncryptHash,
  };

  zip.file('lit_protocol_metadata.json', JSON.stringify(metadata));
  if (readme) {
    zip.file('readme.txt', readme);
  }

  const folder: JSZip | null = zip.folder('encryptedAssets');

  if (!folder) {
    log("Failed to get 'encryptedAssets' from zip.folder() ");
    return throwError({
      message: `Failed to get 'encryptedAssets' from zip.folder()`,
      errorKind: LIT_ERROR.UNKNOWN_ERROR.kind,
      errorCode: LIT_ERROR.UNKNOWN_ERROR.name,
    });
  }

  folder.file(file.name, uint8arrayFromString(ciphertext, 'base64'));

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return zipBlob;
};

/**
 *
 * Given a zip file with metadata inside it, unzip, load the metadata, and return the decrypted file and the metadata.  This zip file would have been created with the encryptFileAndZipWithMetadata function.
 *
 * @param { DecryptZipFileWithMetadataProps } params - The params required to decrypt a zip file with metadata
 *
 * @returns { Promise<DecryptZipFileWithMetadata> } A promise containing an object that contains decryptedFile and metadata properties.  The decryptedFile is an ArrayBuffer that is ready to use, and metadata is an object that contains all the properties of the file like it's name and size and type.
 */
export const decryptZipFileWithMetadata = async (
  params: DecryptZipFileWithMetadataProps
): Promise<DecryptZipFileWithMetadata | undefined> => {
  const { authSig, sessionSigs, file, litNodeClient } = params;

  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decryptZipFileWithMetadata',
    params: {
      authSig,
      sessionSigs,
      file,
      litNodeClient,
    },
  });

  if (paramsIsSafe.type === EITHER_TYPE.ERROR)
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  // -- execute
  const zip = await JSZip.loadAsync(file);

  const jsonFile: JSZip.JSZipObject | null = zip.file(
    'lit_protocol_metadata.json'
  );

  if (!jsonFile) {
    log(`Failed to read lit_protocol_metadata.json while zip.file()`);
    return;
  }

  const metadata: MetadataForFile = JSON.parse(await jsonFile.async('string'));

  log('zip metadata', metadata);

  const folder: JSZip | null = zip.folder('encryptedAssets');

  if (!folder) {
    log("Failed to get 'encryptedAssets' from zip.folder() ");
    return;
  }

  const _file: JSZip.JSZipObject | null = folder.file(metadata.name);

  if (!_file) {
    log("Failed to get 'metadata.name' while zip.folder().file()");
    return;
  }

  const encryptedFile = await _file.async('blob');

  const decryptedFile = await decryptToFile(
    {
      ...params,
      accessControlConditions: metadata.accessControlConditions,
      evmContractConditions: metadata.evmContractConditions,
      solRpcConditions: metadata.solRpcConditions,
      unifiedAccessControlConditions: metadata.unifiedAccessControlConditions,
      chain: metadata.chain,
      ciphertext: uint8arrayToString(
        new Uint8Array(await encryptedFile.arrayBuffer()),
        'base64'
      ),
      dataToEncryptHash: metadata.dataToEncryptHash,
    },
    litNodeClient
  );

  const data: DecryptZipFileWithMetadata = { decryptedFile, metadata };

  return data;
};

/**
 *
 * Encrypt a file without doing any zipping or packing.  This is useful for large files.  A 1gb file can be encrypted in only 2 seconds, for example.
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
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  // encrypt the file
  var fileAsArrayBuffer = await params.file.arrayBuffer();

  return litNodeClient.encrypt({
    ...params,
    dataToEncrypt: new Uint8Array(fileAsArrayBuffer),
  });
};

/**
 *
 * Decrypt a file that was encrypted with the encryptFile function, without doing any unzipping or unpacking.  This is useful for large files.  A 1gb file can be decrypted in only 1 second, for example.
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
    return throwError({
      message: `Invalid params: ${(paramsIsSafe.result as ILitError).message}`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  const { decryptedData } = await litNodeClient.decrypt(params);

  return decryptedData;
};

declare global {
  var wasmExports: any;
  var wasmECDSA: any;
  var LitNodeClient: any;
  // var litNodeClient: ILitNodeClient;
}

/**
 * // TODO check for expiration
 *
 * Verify a JWT from the LIT network.  Use this for auth on your server.  For some background, users can specify access control condiitons for various URLs, and then other users can then request a signed JWT proving that their ETH account meets those on-chain conditions using the getSignedToken function.  Then, servers can verify that JWT using this function.  A successful verification proves that the user meets the access control conditions defined earlier.  For example, the on-chain condition could be posession of a specific NFT.
 *
 * @param { VerifyJWTProps } jwt
 *
 * @returns { IJWT<T> } An object with 4 keys: "verified": A boolean that represents whether or not the token verifies successfully.  A true result indicates that the token was successfully verified.  "header": the JWT header.  "payload": the JWT payload which includes the resource being authorized, etc.  "signature": A uint8array that represents the raw  signature of the JWT.
 */
export const verifyJwt = ({
  publicKey,
  jwt,
}: VerifyJWTProps): IJWT<SigningAccessControlConditionJWTPayload> => {
  // -- validate
  if (
    !checkType({
      value: jwt,
      allowedTypes: ['String'],
      paramName: 'jwt',
      functionName: 'verifyJwt',
    })
  )
    return throwError({
      message: 'jwt must be a string',
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  log('verifyJwt', jwt);

  // verify that the wasm was loaded
  if (!globalThis.wasmExports) {
    log('wasmExports is not loaded.');
  }

  const jwtParts = jwt.split('.');
  const signature = uint8arrayFromString(jwtParts[2], 'base64url');

  const unsignedJwt = `${jwtParts[0]}.${jwtParts[1]}`;

  const message = uint8arrayFromString(unsignedJwt);

  verifySignature(publicKey, message, signature);

  const _jwt: IJWT<SigningAccessControlConditionJWTPayload> = {
    verified: true,
    header: JSON.parse(
      uint8arrayToString(uint8arrayFromString(jwtParts[0], 'base64url'))
    ),
    payload: JSON.parse(
      uint8arrayToString(uint8arrayFromString(jwtParts[1], 'base64url'))
    ),
    signature,
  };

  return _jwt;
};
