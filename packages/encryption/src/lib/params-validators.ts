/**
 * Param Validators is an abstraction of validating params of a function, each validator
 * returns a boolean value indicating whether the validation is passed or not.
 */

import {
  DecryptFileProps,
  JsonEncryptionRetrieveRequest,
  JsonSaveEncryptionKeyRequest,
  DecryptZipFileWithMetadataProps,
  EncryptFileAndZipWithMetadataProps,
  KV,
  ExecuteJsProps,
  LIT_ERROR,
} from '@lit-protocol/constants';
import {
  checkIfAuthSigRequiresChainParam,
  checkType,
  is,
  log,
  throwError,
} from '@lit-protocol/misc';

export const safeParams = ({
  functionName,
  params,
}: {
  functionName: string;
  params: any[] | any;
}) => {
  const validators = paramsValidators as KV;

  const validator = validators[functionName](params);

  if (!validator) {
    log(`This function ${functionName} is skipping params safe guarding.`);
    return true;
  }

  return validator;
};

export const paramsValidators = {
  executeJs: (params: ExecuteJsProps) => {
    // -- prepare params
    const { code, ipfsId, authSig, jsParams, debug, sessionSigs } = params;

    // -- validate: either 'code' or 'ipfsId' must exists
    if (!code && !ipfsId) {
      const message = 'You must pass either code or ipfsId';
      throwError({ message, error: LIT_ERROR.PARAMS_MISSING_ERROR });
      return false;
    }

    // -- validate: 'code' and 'ipfsId' can't exists at the same time
    if (code && ipfsId) {
      const message = "You cannot have both 'code' and 'ipfs' at the same time";

      throwError({ message, error: LIT_ERROR.INVALID_PARAM });
      return false;
    }

    // -- validate: authSig and its type is correct
    if (
      authSig &&
      !checkType({
        value: authSig,
        allowedTypes: ['Object'],
        paramName: 'authSig',
        functionName: 'executeJs',
      })
    )
      return false;

    // -- validate: if sessionSig and authSig exists
    if (!sessionSigs && !authSig) {
      throwError({
        message: 'You must pass either authSig or sessionSigs',
        name: 'InvalidArgumentException',
        errorCode: 'invalid_argument',
      });
      return false;
    }

    return true;
  },

  saveEncryptionKey: (params: JsonSaveEncryptionKeyRequest) => {
    // -- prepare params
    const {
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
      authSig,
      chain,
      symmetricKey,
      encryptedSymmetricKey,
      permanant,
      permanent,
    } = params;

    if (
      accessControlConditions &&
      !is(
        accessControlConditions,
        'Array',
        'accessControlConditions',
        'saveEncryptionKey'
      )
    )
      return false;
    if (
      evmContractConditions &&
      !is(
        evmContractConditions,
        'Array',
        'evmContractConditions',
        'saveEncryptionKey'
      )
    )
      return false;
    if (
      solRpcConditions &&
      !is(solRpcConditions, 'Array', 'solRpcConditions', 'saveEncryptionKey')
    )
      return false;
    if (
      unifiedAccessControlConditions &&
      !is(
        unifiedAccessControlConditions,
        'Array',
        'unifiedAccessControlConditions',
        'saveEncryptionKey'
      )
    )
      return false;

    console.log('authSig:', authSig);
    if (!is(authSig, 'Object', 'authSig', 'saveEncryptionKey')) return false;
    if (!checkIfAuthSigRequiresChainParam(authSig, chain, 'saveEncryptionKey'))
      return false;
    if (
      symmetricKey &&
      !is(symmetricKey, 'Uint8Array', 'symmetricKey', 'saveEncryptionKey')
    )
      return false;
    if (
      encryptedSymmetricKey &&
      !is(
        encryptedSymmetricKey,
        'Uint8Array',
        'encryptedSymmetricKey',
        'saveEncryptionKey'
      )
    )
      return false;

    // to fix spelling mistake
    if (typeof params.permanant !== 'undefined') {
      params.permanent = params.permanant;
    }

    if (
      (!symmetricKey || symmetricKey == '') &&
      (!encryptedSymmetricKey || encryptedSymmetricKey == '')
    ) {
      throw new Error(
        'symmetricKey and encryptedSymmetricKey are blank.  You must pass one or the other'
      );
    }

    if (
      !accessControlConditions &&
      !evmContractConditions &&
      !solRpcConditions &&
      !unifiedAccessControlConditions
    ) {
      throw new Error(
        'accessControlConditions and evmContractConditions and solRpcConditions and unifiedAccessControlConditions are blank'
      );
    }
    if (!authSig) {
      throw new Error('authSig is blank');
    }

    //   -- case: success
    return true;
  },

  getEncryptionKey: (params: JsonEncryptionRetrieveRequest) => {
    const {
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
      toDecrypt,
      authSig,
      chain,
    } = params;

    // -- validate
    if (
      accessControlConditions &&
      !is(
        accessControlConditions,
        'Array',
        'accessControlConditions',
        'getEncryptionKey'
      )
    )
      return false;

    if (
      evmContractConditions &&
      !is(
        evmContractConditions,
        'Array',
        'evmContractConditions',
        'getEncryptionKey'
      )
    )
      return false;

    if (
      solRpcConditions &&
      !is(solRpcConditions, 'Array', 'solRpcConditions', 'getEncryptionKey')
    )
      return false;

    if (
      unifiedAccessControlConditions &&
      !is(
        unifiedAccessControlConditions,
        'Array',
        'unifiedAccessControlConditions',
        'getEncryptionKey'
      )
    )
      return false;

    console.log('TYPEOF:', typeof toDecrypt);
    if (!is(toDecrypt, 'String', 'toDecrypt', 'getEncryptionKey')) return false;
    if (!is(authSig, 'Object', 'authSig', 'getEncryptionKey')) return false;

    // -- validate if 'chain' is null
    if (!chain) {
      return false;
    }

    if (!authSig) {
      return;
    }

    if (!checkIfAuthSigRequiresChainParam(authSig, chain, 'getEncryptionKey'))
      return false;

    return true;
  },

  decryptString: (params: any) => {
    const encryptedStringBlob: Blob = params[0];
    const symmKey: Uint8Array = params[1];

    // -- validate
    if (
      !checkType({
        value: encryptedStringBlob,
        allowedTypes: ['Blob', 'File'],
        paramName: 'encryptedStringBlob',
        functionName: 'decryptString',
      })
    )
      return false;

    if (
      !checkType({
        value: symmKey,
        allowedTypes: ['Uint8Array'],
        paramName: 'symmKey',
        functionName: 'decryptString',
      })
    )
      return false;

    // -- success
    return true;
  },

  decryptFile: (params: DecryptFileProps) => {
    // -- validate
    if (
      !checkType({
        value: params.file,
        allowedTypes: ['Blob', 'File'],
        paramName: 'file',
        functionName: 'decryptFile',
      })
    )
      return false;

    // -- validate
    if (
      !checkType({
        value: params.symmetricKey,
        allowedTypes: ['Uint8Array'],
        paramName: 'symmetricKey',
        functionName: 'decryptFile',
      })
    )
      return false;

    return true;
  },

  decryptZipFileWithMetadata: (params: DecryptZipFileWithMetadataProps) => {
    // -- validate
    if (
      !checkType({
        value: params.authSig,
        allowedTypes: ['Object'],
        paramName: 'authSig',
        functionName: 'decryptZipFileWithMetadata',
      })
    )
      return false;

    // -- validate
    if (
      !checkType({
        value: params.file,
        allowedTypes: ['Blob', 'File'],
        paramName: 'file',
        functionName: 'decryptZipFileWithMetadata',
      })
    )
      return false;

    // -- success case
    return true;
  },

  decryptZip: (params: any) => {
    const { encryptedZipBlob, symmKey } = params;

    console.log('encryptedZipBlob:', encryptedZipBlob);

    // -- validate
    if (
      !checkType({
        value: encryptedZipBlob,
        allowedTypes: ['Blob', 'File'],
        paramName: 'encryptedZipBlob',
        functionName: 'decryptZip',
      })
    )
      return false;

    // -- validate
    if (
      !checkType({
        value: symmKey,
        allowedTypes: ['Uint8Array'],
        paramName: 'symmKey',
        functionName: 'decryptZip',
      })
    )
      return false;

    return true;
  },

  encryptFileAndZipWithMetadata: (
    params: EncryptFileAndZipWithMetadataProps
  ) => {
    // -- validate

    console.log('params:', params);

    if (
      !checkType({
        value: params.authSig,
        allowedTypes: ['Object'],
        paramName: 'authSig',
        functionName: 'encryptFileAndZipWithMetadata',
      })
    )
      return false;

    // -- validate
    if (
      params.accessControlConditions &&
      !checkType({
        value: params.accessControlConditions,
        allowedTypes: ['Array'],
        paramName: 'accessControlConditions',
        functionName: 'encryptFileAndZipWithMetadata',
      })
    )
      return false;

    // -- validate
    if (
      params.evmContractConditions &&
      !checkType({
        value: params.evmContractConditions,
        allowedTypes: ['Array'],
        paramName: 'evmContractConditions',
        functionName: 'encryptFileAndZipWithMetadata',
      })
    )
      return false;

    // -- validate
    if (
      params.solRpcConditions &&
      !checkType({
        value: params.solRpcConditions,
        allowedTypes: ['Array'],
        paramName: 'solRpcConditions',
        functionName: 'encryptFileAndZipWithMetadata',
      })
    )
      return false;

    // -- validate
    if (
      params.unifiedAccessControlConditions &&
      !checkType({
        value: params.unifiedAccessControlConditions,
        allowedTypes: ['Array'],
        paramName: 'unifiedAccessControlConditions',
        functionName: 'encryptFileAndZipWithMetadata',
      })
    )
      return false;

    // -- validate
    if (
      !checkIfAuthSigRequiresChainParam(
        params.authSig,
        params.chain,
        'encryptFileAndZipWithMetadata'
      )
    )
      return false;

    // -- validate
    if (
      !checkType({
        value: params.file,
        allowedTypes: ['File'],
        paramName: 'file',
        functionName: 'encryptFileAndZipWithMetadata',
      })
    )
      return false;

    // -- validate
    if (
      params.readme &&
      !checkType({
        value: params.readme,
        allowedTypes: ['String'],
        paramName: 'readme',
        functionName: 'encryptFileAndZipWithMetadata',
      })
    )
      return false;

    // -- success case
    return true;
  },
};

export type ParamsValidatorsType = typeof paramsValidators;
