import { LIT_ERROR, NETWORK_PUB_KEY } from '@lit-protocol/constants';

import {
  AcceptedFileType,
  DecryptFileProps,
  DecryptZipFileWithMetadata,
  DecryptZipFileWithMetadataProps,
  EncryptedFile,
  EncryptedString,
  EncryptedZip,
  EncryptFileAndZipWithMetadataProps,
  EncryptToIpfsProps,
  DecryptFromIpfsProps,
  IJWT,
  SymmetricKey,
  ThreeKeys,
  VerifyJWTProps,
} from '@lit-protocol/types';

import { wasmBlsSdkHelpers } from '@lit-protocol/bls-sdk';

// @ts-ignore
import * as JSZip from 'jszip/dist/jszip.js';

import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

import {
  decryptWithSymmetricKey,
  encryptWithSymmetricKey,
  generateSymmetricKey,
  importSymmetricKey,
} from '@lit-protocol/crypto';

import { checkType, isBrowser, log, throwError } from '@lit-protocol/misc';

import { safeParams } from './params-validators';

import * as ipfsClient from 'ipfs-http-client';

// ---------- Local Interfaces ----------

interface MetadataForFile {
  name: string | any;
  type: string | any;
  size: string | number | any;
  accessControlConditions: any[] | any;
  evmContractConditions: any[] | any;
  solRpcConditions: any[] | any;
  unifiedAccessControlConditions: any[] | any;
  chain: string;
  encryptedSymmetricKey: Uint8Array | any;
}

// ---------- Local Helpers ----------

/**
 *
 * Get all the metadata needed to decrypt something in the future.  If you're encrypting files with Lit and storing them in IPFS or Arweave, then this function will provide you with a properly formatted metadata object that you should save alongside the files.
 *
 * @param { MetadataForFile }
 *
 * @return { MetadataForFile }
 *
 */
const metadataForFile = ({
  name,
  type,
  size,
  accessControlConditions,
  evmContractConditions,
  solRpcConditions,
  unifiedAccessControlConditions,
  chain,
  encryptedSymmetricKey,
}: MetadataForFile): MetadataForFile => {
  return {
    name,
    type,
    size,
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    encryptedSymmetricKey: uint8arrayToString(encryptedSymmetricKey, 'base16'),
  };
};

/**
 *
 * Encrypt a string or file, save the key to the Lit network, and upload all the metadata required to decrypt i.e. accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions & chain to IPFS using the ipfs-client-http SDK & returns the IPFS CID.
 *
 * @param { EncryptToIpfsProps }
 *
 * @returns { Promise<string> }
 *
 */
export const encryptToIpfs = async ({
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
}: EncryptToIpfsProps): Promise<string> => {
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

  if (!paramsIsSafe)
    return throwError({
      message: `authSig, sessionSigs, accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, chain, litNodeClient, string or file must be provided`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  if (string === undefined && file === undefined)
    return throwError({
      message: `Either string or file must be provided`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  if (!infuraId || !infuraSecretKey) {
    return throwError({
      message:
        'Please provide your Infura Project Id and Infura API Key Secret to add the encrypted metadata on IPFS',
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });
  }

  let encryptedData;
  let symmetricKey;
  if (string !== undefined && file !== undefined) {
    return throwError({
      message: 'Provide only either a string or file to encrypt',
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });
  } else if (string !== undefined) {
    const encryptedString = await encryptString(string);
    encryptedData = encryptedString.encryptedString;
    symmetricKey = encryptedString.symmetricKey;
  } else {
    const encryptedFile = await encryptFile({ file: file! });
    encryptedData = encryptedFile.encryptedFile;
    symmetricKey = encryptedFile.symmetricKey;
  }

  const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    symmetricKey,
    authSig,
    sessionSigs,
    chain,
  });

  log('encrypted key saved to Lit', encryptedSymmetricKey);

  const encryptedSymmetricKeyString = uint8arrayToString(
    encryptedSymmetricKey,
    'base16'
  );

  const authorization =
    'Basic ' + Buffer.from(`${infuraId}:${infuraSecretKey}`).toString('base64');
  const ipfs = ipfsClient.create({
    url: 'https://ipfs.infura.io:5001/api/v0',
    headers: {
      authorization,
    },
  });

  const encryptedDataJson = Buffer.from(
    await encryptedData.arrayBuffer()
  ).toJSON();
  try {
    const res = await ipfs.add(
      JSON.stringify({
        [string !== undefined ? 'encryptedString' : 'encryptedFile']:
          encryptedDataJson,
        encryptedSymmetricKeyString,
        accessControlConditions,
        evmContractConditions,
        solRpcConditions,
        unifiedAccessControlConditions,
        chain,
      })
    );

    return res.path;
  } catch (e) {
    return throwError({
      message:
        "Provided INFURA_ID or INFURA_SECRET_KEY in invalid hence can't upload to IPFS",
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
  }
};

/**
 *
 * Decrypt & return the string or file (in Uint8Array format) using its metadata stored on IPFS with the given ipfsCid.
 *
 * @param { DecryptFromIpfsProps }
 *
 * @returns { Promise<string | Uint8Array> }
 *
 */
export const decryptFromIpfs = async ({
  authSig,
  sessionSigs,
  ipfsCid,
  litNodeClient,
}: DecryptFromIpfsProps): Promise<string | Uint8Array> => {
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

  if (!paramsIsSafe)
    return throwError({
      message: `authSig, sessionSigs, ipfsCid, litNodeClient must be provided`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  try {
    const metadata = await (
      await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsCid}`)
    ).json();
    const symmetricKey = await litNodeClient.getEncryptionKey({
      accessControlConditions: metadata.accessControlConditions,
      evmContractConditions: metadata.evmContractConditions,
      solRpcConditions: metadata.solRpcConditions,
      unifiedAccessControlConditions: metadata.unifiedAccessControlConditions,
      toDecrypt: metadata.encryptedSymmetricKeyString,
      chain: metadata.chain,
      authSig,
      sessionSigs,
    });

    if (metadata.encryptedString !== undefined) {
      const encryptedStringBlob = new Blob(
        [Buffer.from(metadata.encryptedString)],
        { type: 'application/octet-stream' }
      );
      return await decryptString(encryptedStringBlob, symmetricKey);
    }

    const encryptedFileBlob = new Blob([Buffer.from(metadata.encryptedFile)], {
      type: 'application/octet-stream',
    });
    return await decryptFile({ file: encryptedFileBlob, symmetricKey });
  } catch (e) {
    return throwError({
      message: 'Invalid ipfsCid',
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
 * @param { string } str The string to encrypt
 * @returns { Promise<Object> } A promise containing the encryptedString as a Blob and the symmetricKey used to encrypt it, as a Uint8Array.
 */
export const encryptString = async (str: string): Promise<EncryptedString> => {
  // -- validate
  if (
    !checkType({
      value: str,
      allowedTypes: ['String'],
      paramName: 'str',
      functionName: 'encryptString',
    })
  ) {
    return throwError({
      message: `{${str}} must be a string`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });
  }

  // -- prepare
  const encodedString: Uint8Array = uint8arrayFromString(str, 'utf8');

  const symmKey: CryptoKey = await generateSymmetricKey();

  const encryptedString: Blob = await encryptWithSymmetricKey(
    symmKey,
    encodedString.buffer
  );

  const exportedSymmKey: Uint8Array = new Uint8Array(
    await crypto.subtle.exportKey('raw', symmKey)
  );

  return {
    symmetricKey: exportedSymmKey,
    encryptedString,
    encryptedData: encryptedString,
  };
};

/**
 *
 * Decrypt a string that was encrypted with the encryptString function.
 *
 * @param { AcceptedFileType } encryptedStringBlob The encrypted string as a Blob
 * @param { Uint8Array } symmKey The symmetric key used that will be used to decrypt this.
 *
 * @returns { Promise<string> } A promise containing the decrypted string
 */
export const decryptString = async (
  encryptedStringBlob: Blob,
  symmKey: Uint8Array
): Promise<string> => {
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decryptString',
    params: [encryptedStringBlob, symmKey],
  });

  if (!paramsIsSafe) {
    throwError({
      message: 'Invalid params',
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });
  }

  // -- import the decrypted symm key
  const importedSymmKey: CryptoKey = await importSymmetricKey(symmKey);

  const decryptedStringArrayBuffer: Uint8Array = await decryptWithSymmetricKey(
    encryptedStringBlob,
    importedSymmKey
  );

  return uint8arrayToString(new Uint8Array(decryptedStringArrayBuffer), 'utf8');
};

/**
 *
 * Zip and encrypt a string.  This is used to encrypt any string that is to be locked via the Lit Protocol.
 *
 * @param { string } string The string to zip and encrypt
 *
 * @returns { Promise<Object> } A promise containing the encryptedZip as a Blob and the symmetricKey used to encrypt it, as a Uint8Array.  The encrypted zip will contain a single file called "string.txt"
 */
export const zipAndEncryptString = async (
  string: string
): Promise<EncryptedZip> => {
  // -- validate
  if (
    !checkType({
      value: string,
      allowedTypes: ['String'],
      paramName: 'string',
      functionName: 'zipAndEncryptString',
    })
  )
    throwError({
      message: 'Invalid string',
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  let zip;

  try {
    zip = new JSZip.default();
  } catch (e) {
    zip = new JSZip();
  }

  zip.file('string.txt', string);

  return encryptZip(zip);
};

/**
 * 
 * Zip and encrypt multiple files.
 * 
 * @param { Array<File> } files An array of the files you wish to zip and encrypt
 * 
 * @returns {Promise<Object>} A promise containing the encryptedZip as a Blob and the symmetricKey used to encrypt it, as a Uint8Array.  The encrypted zip will contain a folder "encryptedAssets" and all of the files will be inside it.
 
*/
export const zipAndEncryptFiles = async (
  files: Array<File>
): Promise<EncryptedZip> => {
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

  return encryptZip(zip);
};

/**
 *
 * Decrypt and unzip a zip that was created using encryptZip, zipAndEncryptString, or zipAndEncryptFiles.
 *
 * @param { AcceptedFileType } encryptedZipBlob The encrypted zip as a Blob
 * @param { SymmetricKey } symmKey The symmetric key used that will be used to decrypt this zip.
 *
 * @returns { Promise<Object> } A promise containing a JSZip object indexed by the filenames of the zipped files.  For example, if you have a file called "meow.jpg" in the root of your zip, you could get it from the JSZip object by doing this: const imageBlob = await decryptedZip['meow.jpg'].async('blob')
 */
export const decryptZip = async (
  encryptedZipBlob: AcceptedFileType,
  symmKey: SymmetricKey
): Promise<{ [key: string]: JSZip.JSZipObject }> => {
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decryptZip',
    params: {
      encryptedZipBlob,
      symmKey,
    },
  });

  if (!paramsIsSafe) {
    throwError({
      message: `encryptedZipBlob must be a Blob or File. symmKey must be a Uint8Array`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });
  }

  // import the decrypted symm key
  const importedSymmKey = await importSymmetricKey(symmKey);

  const decryptedZipArrayBuffer = await decryptWithSymmetricKey(
    encryptedZipBlob,
    importedSymmKey
  );

  // unpack the zip
  let zip;

  try {
    zip = new JSZip.default();
  } catch (e) {
    zip = new JSZip();
  }
  const unzipped = await zip.loadAsync(decryptedZipArrayBuffer);

  return unzipped.files;
};

/**
 *
 * Encrypt a zip file created with JSZip using a new random symmetric key via WebCrypto.
 *
 * @param { JSZip } zip The JSZip instance to encrypt
 *
 * @returns { Promise<Object> } A promise containing the encryptedZip as a Blob and the symmetricKey used to encrypt it, as a Uint8Array string.
 */
export const encryptZip = async (zip: JSZip): Promise<EncryptedZip> => {
  let zipBlob;
  let zipBlobArrayBuffer: ArrayBuffer;

  if (isBrowser()) {
    zipBlob = await zip.generateAsync({ type: 'blob' });
    zipBlobArrayBuffer = await zipBlob.arrayBuffer();
  } else {
    zipBlobArrayBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  }

  const symmKey: CryptoKey = await generateSymmetricKey();

  const encryptedZipBlob: Blob = await encryptWithSymmetricKey(
    symmKey,
    zipBlobArrayBuffer
  );

  // to download the encrypted zip file for testing, uncomment this
  // saveAs(encryptedZipBlob, 'encrypted.bin')

  const exportedSymmKey: Uint8Array = new Uint8Array(
    await crypto.subtle.exportKey('raw', symmKey)
  );

  const encryptedZip: EncryptedZip = {
    symmetricKey: exportedSymmKey,
    encryptedZip: encryptedZipBlob,
  };

  return encryptedZip;
};

/**
 *
 * Encrypt a single file, save the key to the Lit network, and then zip it up with the metadata.
 *
 * @param { EncryptFileAndZipWithMetadataProps }
 *
 * @returns { Promise<ThreeKeys> }
 *
 */
export const encryptFileAndZipWithMetadata = async ({
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
}: EncryptFileAndZipWithMetadataProps): Promise<ThreeKeys> => {
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

  if (!paramsIsSafe)
    return throwError({
      message: `authSig, sessionSigs, accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, chain, file, litNodeClient, and readme must be provided`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });

  // -- validate
  const symmetricKey = await generateSymmetricKey();
  const exportedSymmKey = new Uint8Array(
    await crypto.subtle.exportKey('raw', symmetricKey)
  );
  // log('exportedSymmKey in hex', uint8arrayToString(exportedSymmKey, 'base16'))

  const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    symmetricKey: exportedSymmKey,
    authSig,
    sessionSigs,
    chain,
  });

  log('encrypted key saved to Lit', encryptedSymmetricKey);

  // encrypt the file
  var fileAsArrayBuffer = await file.arrayBuffer();
  const encryptedZipBlob = await encryptWithSymmetricKey(
    symmetricKey,
    fileAsArrayBuffer
  );

  let zip;

  try {
    zip = new JSZip.default();
  } catch (e) {
    zip = new JSZip();
  }
  const metadata = metadataForFile({
    name: file.name,
    type: file.type,
    size: file.size,
    encryptedSymmetricKey,
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
  });

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

  folder.file(file.name, encryptedZipBlob);

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  const threeKeys: ThreeKeys = {
    zipBlob,
    encryptedSymmetricKey,
    symmetricKey: exportedSymmKey,
  };

  return threeKeys;
};

/**
 *
 * Given a zip file with metadata inside it, unzip, load the metadata, and return the decrypted file and the metadata.  This zip file would have been created with the encryptFileAndZipWithMetadata function.
 *
 * @param { DecryptZipFileWithMetadataProps }
 *
 * @returns { Promise<DecryptZipFileWithMetadata> } A promise containing an object that contains decryptedFile and metadata properties.  The decryptedFile is an ArrayBuffer that is ready to use, and metadata is an object that contains all the properties of the file like it's name and size and type.
 */
export const decryptZipFileWithMetadata = async ({
  authSig,
  sessionSigs,
  file,
  litNodeClient,
  additionalAccessControlConditions,
}: DecryptZipFileWithMetadataProps): Promise<
  DecryptZipFileWithMetadata | undefined
> => {
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decryptZipFileWithMetadata',
    params: {
      authSig,
      sessionSigs,
      file,
      litNodeClient,
      additionalAccessControlConditions,
    },
  });

  if (!paramsIsSafe) return;

  // -- execute
  const zip = await JSZip.loadAsync(file);

  const jsonFile: JSZip.JSZipObject | null = zip.file(
    'lit_protocol_metadata.json'
  );

  if (!jsonFile) {
    log(`Failed to read lit_protocol_metadata.json while zip.file()`);
    return;
  }

  const metadata = JSON.parse(await jsonFile.async('string'));

  log('zip metadata', metadata);

  let symmKey;

  try {
    symmKey = await litNodeClient.getEncryptionKey({
      accessControlConditions: metadata.accessControlConditions,
      evmContractConditions: metadata.evmContractConditions,
      solRpcConditions: metadata.solRpcConditions,
      unifiedAccessControlConditions: metadata.unifiedAccessControlConditions,
      toDecrypt: metadata.encryptedSymmetricKey,
      chain: metadata.chain, // -- validate
      authSig,
      sessionSigs,
    });
  } catch (e: any) {
    if (
      e.errorCode === 'NodeNotAuthorized' ||
      e.errorCode === 'not_authorized'
    ) {
      // try more additionalAccessControlConditions
      if (!additionalAccessControlConditions) {
        throw e;
      }
      log('trying additionalAccessControlConditions');

      // -- loop start
      for (let i = 0; i < additionalAccessControlConditions.length; i++) {
        const accessControlConditions =
          additionalAccessControlConditions[i].accessControlConditions;

        log('trying additional condition', accessControlConditions);

        try {
          symmKey = await litNodeClient.getEncryptionKey({
            accessControlConditions: accessControlConditions,
            toDecrypt:
              additionalAccessControlConditions[i].encryptedSymmetricKey,
            chain: metadata.chain,
            authSig,
            sessionSigs,
          });

          // okay we got the additional symmkey, now we need to decrypt the symmkey and then use it to decrypt the original symmkey
          // const importedAdditionalSymmKey = await importSymmetricKey(symmKey)
          // symmKey = await decryptWithSymmetricKey(additionalAccessControlConditions[i].encryptedSymmetricKey, importedAdditionalSymmKey)

          break; // it worked, we can leave the loop and stop checking additional access control conditions
        } catch (e: any) {
          // swallow not_authorized because we are gonna try some more accessControlConditions
          if (
            e.errorCode === 'NodeNotAuthorized' ||
            e.errorCode === 'not_authorized'
          ) {
            throw e;
          }
        }
      }
      // -- loop ends

      if (!symmKey) {
        // we tried all the access control conditions and none worked
        throw e;
      }
    } else {
      throw e;
    }
  }

  if (!symmKey) {
    return;
  }

  const importedSymmKey = await importSymmetricKey(symmKey);

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

  const decryptedFile = await decryptWithSymmetricKey(
    encryptedFile,
    importedSymmKey
  );

  const data: DecryptZipFileWithMetadata = { decryptedFile, metadata };

  return data;
};

/**
 *
 * Encrypt a file without doing any zipping or packing.  This is useful for large files.  A 1gb file can be encrypted in only 2 seconds, for example.  A new random symmetric key will be created and returned along with the encrypted file.
 *
 * @param { Object } params
 * @param { AcceptedFileType } params.file The file you wish to encrypt
 *
 * @returns { Promise<Object> } A promise containing an object with keys encryptedFile and symmetricKey.  encryptedFile is a Blob, and symmetricKey is a Uint8Array that can be used to decrypt the file.
 */
export const encryptFile = async ({
  file,
}: {
  file: AcceptedFileType;
}): Promise<EncryptedFile> => {
  // -- validate
  if (
    !checkType({
      value: file,
      allowedTypes: ['Blob', 'File'],
      paramName: 'file',
      functionName: 'encryptFile',
    })
  ) {
    return throwError({
      message: 'file must be a Blob or File',
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });
  }

  // generate a random symmetric key
  const symmetricKey = await generateSymmetricKey();
  const exportedSymmKey = new Uint8Array(
    await crypto.subtle.exportKey('raw', symmetricKey)
  );

  // encrypt the file
  var fileAsArrayBuffer = await file.arrayBuffer();
  const encryptedFile = await encryptWithSymmetricKey(
    symmetricKey,
    fileAsArrayBuffer
  );

  const _encryptedFile: EncryptedFile = {
    encryptedFile,
    symmetricKey: exportedSymmKey,
  };

  return _encryptedFile;
};

/**
 *
 * Decrypt a file that was encrypted with the encryptFile function, without doing any unzipping or unpacking.  This is useful for large files.  A 1gb file can be decrypted in only 1 second, for example.
 *
 * @property { Object } params
 * @property { AcceptedFileType } params.file The file you wish to decrypt
 * @property { Uint8Array } params.symmetricKey The symmetric key used that will be used to decrypt this.
 *
 * @returns { Promise<Object> } A promise containing the decrypted file.  The file is an ArrayBuffer.
 */
export const decryptFile = async ({
  file,
  symmetricKey,
}: DecryptFileProps): Promise<Uint8Array> => {
  // -- validate
  const paramsIsSafe = safeParams({
    functionName: 'decryptFile',
    params: {
      file,
      symmetricKey,
    },
  });

  if (!paramsIsSafe) {
    return throwError({
      message: `file type must be Blob or File, and symmetricKey type must be Uint8Array | string | CryptoKey | BufferSource`,
      errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
      errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
    });
  }

  // -- execute
  const importedSymmKey = await importSymmetricKey(symmetricKey);

  // decrypt the file
  const decryptedFile = await decryptWithSymmetricKey(file, importedSymmKey);

  return decryptedFile;
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
 * Verify a JWT from the LIT network.  Use this for auth on your server.  For some background, users can define resources (URLs) for authorization via on-chain conditions using the saveSigningCondition function.  Other users can then request a signed JWT proving that their ETH account meets those on-chain conditions using the getSignedToken function.  Then, servers can verify that JWT using this function.  A successful verification proves that the user meets the on-chain conditions defined in the saveSigningCondition step.  For example, the on-chain condition could be posession of a specific NFT.
 *
 * @param { VerifyJWTProps } jwt
 *
 * @returns { IJWT } An object with 4 keys: "verified": A boolean that represents whether or not the token verifies successfully.  A true result indicates that the token was successfully verified.  "header": the JWT header.  "payload": the JWT payload which includes the resource being authorized, etc.  "signature": A uint8array that represents the raw  signature of the JWT.
 */
export const verifyJwt = ({ jwt }: VerifyJWTProps): IJWT => {
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

  const pubKey = uint8arrayFromString(NETWORK_PUB_KEY, 'base16');
  // log("pubkey is ", pubKey);

  const jwtParts = jwt.split('.');
  const sig = uint8arrayFromString(jwtParts[2], 'base64url');
  // log("sig is ", uint8arrayToString(sig, "base16"));

  const unsignedJwt = `${jwtParts[0]}.${jwtParts[1]}`;
  // log("unsignedJwt is ", unsignedJwt);

  const message = uint8arrayFromString(unsignedJwt);
  // log("message is ", message);

  // p is public key uint8array
  // s is signature uint8array
  // m is message uint8array
  // function is: function (p, s, m)
  const verified = Boolean(wasmBlsSdkHelpers.verify(pubKey, sig, message));

  const _jwt: IJWT = {
    verified,
    header: JSON.parse(
      uint8arrayToString(uint8arrayFromString(jwtParts[0], 'base64url'))
    ),
    payload: JSON.parse(
      uint8arrayToString(uint8arrayFromString(jwtParts[1], 'base64url'))
    ),
    signature: sig,
  };

  return _jwt;
};
