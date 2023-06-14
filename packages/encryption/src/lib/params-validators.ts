/**
 * Param Validators is an abstraction of validating params of a function, each validator
 * returns a boolean value indicating whether the validation is passed or not.
 */

import {
  EITHER_TYPE,
  ELeft,
  ERight,
  IEither,
  LIT_ERROR,
} from '@lit-protocol/constants';

import {
  AcceptedFileType,
  AccessControlConditions,
  AuthSig,
  DecryptFileProps,
  DecryptFromIpfsProps,
  DecryptRequest,
  DecryptZipFileWithMetadataProps,
  EncryptFileAndZipWithMetadataProps,
  EncryptFileRequest,
  EncryptRequest,
  EncryptStringRequest,
  EncryptToIpfsProps,
  EncryptZipRequest,
  EvmContractConditions,
  ExecuteJsProps,
  SessionSigs,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

import {
  checkIfAuthSigRequiresChainParam,
  checkType,
  is,
  log,
} from '@lit-protocol/misc';
import { isHexString } from 'ethers/lib/utils';

export const safeParams = ({
  functionName,
  params,
}: {
  functionName: string;
  params: any[] | any;
}): IEither<void> => {
  if (!paramsValidators[functionName]) {
    log(`This function ${functionName} is skipping params safe guarding.`);
    return ERight(undefined);
  }

  const paramValidators = paramsValidators[functionName](params);

  for (const validator of paramValidators) {
    const validationResponse = validator.validate();
    if (validationResponse.type === EITHER_TYPE.ERROR) {
      return validationResponse;
    }
  }

  return ERight(undefined);
};

export const paramsValidators: {
  [key: string]: (params: any) => ParamsValidator[];
} = {
  executeJs: (params: ExecuteJsProps) => [
    new AuthMaterialValidator('executeJs', params),
    new ExecuteJsValidator('executeJs', params),
    new AuthMethodValidator('executeJs', params.authMethods),
  ],

  encrypt: (params: EncryptRequest) => [
    new AccessControlConditionsValidator('encrypt', params),
    new AuthMaterialValidator('encrypt', params, true),
  ],

  encryptFile: (params: EncryptFileRequest) => [
    new AccessControlConditionsValidator('encryptFile', params),
    new AuthMaterialValidator('encryptFile', params),
    new FileValidator('encryptFile', params.file),
  ],

  encryptString: (params: EncryptStringRequest) => [
    new AccessControlConditionsValidator('encryptString', params),
    new AuthMaterialValidator('encryptString', params, true),
    new StringValidator(
      'encryptString',
      params.dataToEncrypt,
      'dataToEncrypt',
      true
    ),
  ],

  encryptZip: (params: EncryptZipRequest) => [
    new AccessControlConditionsValidator('encryptZip', params),
    new AuthMaterialValidator('encryptZip', params),
  ],

  zipAndEncryptString: (params: EncryptStringRequest) => [
    new StringValidator('zipAndEncryptString', params.dataToEncrypt),
  ],

  decrypt: (params: DecryptRequest) => [
    new AccessControlConditionsValidator('decrypt', params),
    new AuthMaterialValidator('decrypt', params, true),
    new StringValidator('decrypt', params.ciphertext, 'ciphertext', true),
  ],

  decryptFile: (params: DecryptFileProps) => [
    new FileValidator('decryptFile', params.file),
  ],

  decryptZipFileWithMetadata: (params: DecryptZipFileWithMetadataProps) => [
    new AuthMaterialValidator('decryptZipFileWithMetadata', params),
    new FileValidator('decryptZipFileWithMetadata', params.file),
  ],

  decryptZip: (params: any) => [
    new FileValidator('decryptZip', params.encryptedZipBlob),
  ],

  encryptToIpfs: (params: EncryptToIpfsProps) => [
    new AccessControlConditionsValidator('encryptToIpfs', params),
    new AuthMaterialValidator('encryptToIpfs', params, true),
    new IpfsValidator('encryptToIpfs', params),
  ],

  decryptFromIpfs: (params: DecryptFromIpfsProps) => [
    new AuthMaterialValidator('decryptFromIpfs', params),
  ],

  encryptFileAndZipWithMetadata: (
    params: EncryptFileAndZipWithMetadataProps
  ) => [
    new AuthMaterialValidator('encryptFileAndZipWithMetadata', params, true),
    new AccessControlConditionsValidator(
      'encryptFileAndZipWithMetadata',
      params
    ),
    new FileValidator('encryptFileAndZipWithMetadata', params.file),
    new StringValidator(
      'encryptFileAndZipWithMetadata',
      params.readme,
      'readme'
    ),
  ],
};

export type ParamsValidatorsType = typeof paramsValidators;

//////////////////////// VALIDATORS ////////////////////////

interface ParamsValidator {
  validate: () => IEither<void>;
}

class IpfsValidator implements ParamsValidator {
  private fnName: string;
  private params: EncryptToIpfsProps;

  constructor(fnName: string, params: EncryptToIpfsProps) {
    this.fnName = fnName;
    this.params = params;
  }

  validate(): IEither<void> {
    const validators = [
      new FileValidator(this.fnName, this.params.file),
      new StringValidator(this.fnName, this.params.string),
    ];

    for (const validator of validators) {
      const validationResponse = validator.validate();
      if (validationResponse.type === EITHER_TYPE.ERROR) {
        return validationResponse;
      }
    }

    const { file, string, infuraId, infuraSecretKey } = this.params;

    if (string === undefined && file === undefined)
      return ELeft({
        message: `Either string or file must be provided`,
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    if (!infuraId || !infuraSecretKey)
      return ELeft({
        message:
          'Please provide your Infura Project Id and Infura API Key Secret to add the encrypted metadata on IPFS',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    if (string !== undefined && file !== undefined)
      return ELeft({
        message: 'Provide only either a string or file to encrypt',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    return ERight(undefined);
  }
}

class StringValidator implements ParamsValidator {
  private fnName: string;
  private paramName: string;
  private checkIsHex: boolean;
  private str?: string;

  constructor(
    fnName: string,
    str?: string,
    paramName: string = 'string',
    checkIsHex: boolean = false
  ) {
    this.fnName = fnName;
    this.paramName = paramName;
    this.checkIsHex = checkIsHex;
    this.str = str;
  }

  validate(): IEither<void> {
    if (!this.str) {
      return ELeft({
        message: 'string is undefined',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
    }

    if (
      !checkType({
        value: this.str,
        allowedTypes: ['String'],
        paramName: this.paramName,
        functionName: this.fnName,
      })
    )
      return ELeft({
        message: `${this.paramName} is not a string`,
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    if (this.checkIsHex && !isHexString(this.str)) {
      return ELeft({
        message: `${this.paramName} is not a valid hex string`,
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
    }

    return ERight(undefined);
  }
}

class AuthMethodValidator implements ParamsValidator {
  private fnName: string;
  private authMethods?: Object[];

  constructor(fnName: string, authMethods?: Object[]) {
    this.fnName = fnName;
    this.authMethods = authMethods;
  }

  validate(): IEither<void> {
    const { fnName, authMethods } = this;

    if (
      authMethods &&
      authMethods.length > 0 &&
      !checkType({
        value: authMethods,
        allowedTypes: ['Array'],
        paramName: 'authMethods',
        functionName: this.fnName,
      })
    )
      return ELeft({
        message: `authMethods is not an array`,
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    return ERight(undefined);
  }
}

interface ExecuteJsValidatorProps {
  code?: string;
  ipfsId?: string;
}

class ExecuteJsValidator implements ParamsValidator {
  private fnName: string;
  private params: ExecuteJsValidatorProps;

  constructor(fnName: string, params: ExecuteJsValidatorProps) {
    this.fnName = fnName;
    this.params = params;
  }

  validate(): IEither<void> {
    const { code, ipfsId } = this.params;

    // -- validate: either 'code' or 'ipfsId' must exists
    if (!code && !ipfsId) {
      return ELeft({
        message: 'You must pass either code or ipfsId',
        errorKind: LIT_ERROR.PARAMS_MISSING_ERROR.kind,
        errorCode: LIT_ERROR.PARAMS_MISSING_ERROR.name,
      });
    }

    // -- validate: 'code' and 'ipfsId' can't exists at the same time
    if (code && ipfsId) {
      return ELeft({
        message: "You cannot have both 'code' and 'ipfs' at the same time",
        errorKind: LIT_ERROR.PARAMS_MISSING_ERROR.kind,
        errorCode: LIT_ERROR.PARAMS_MISSING_ERROR.name,
      });
    }

    return ERight(undefined);
  }
}

class FileValidator implements ParamsValidator {
  private fnName: string;
  private file?: AcceptedFileType;

  constructor(fnName: string, file?: AcceptedFileType) {
    this.fnName = fnName;
    this.file = file;
  }

  validate(): IEither<void> {
    if (!this.file) {
      return ELeft({
        message: 'You must pass file param',
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    if (
      !checkType({
        value: this.file,
        allowedTypes: ['Blob', 'File'],
        paramName: 'file',
        functionName: this.fnName,
      })
    )
      return ELeft({
        message: 'File param is not a valid Blob or File object',
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });

    return ERight(undefined);
  }
}

export interface AuthMaterialValidatorProps {
  authSig?: AuthSig;
  sessionSigs?: SessionSigs;
  chain?: string;
}

class AuthMaterialValidator implements ParamsValidator {
  private fnName: string;
  private authMaterial: AuthMaterialValidatorProps;
  private checkIfAuthSigRequiresChainParam: boolean;

  constructor(
    fnName: string,
    params: AuthMaterialValidatorProps,
    checkIfAuthSigRequiresChainParam: boolean = false
  ) {
    this.fnName = fnName;
    this.authMaterial = params;
    this.checkIfAuthSigRequiresChainParam = checkIfAuthSigRequiresChainParam;
  }

  validate(): IEither<void> {
    const { authSig, sessionSigs } = this.authMaterial;

    if (authSig && !is(authSig, 'Object', 'authSig', this.fnName))
      return ELeft({
        message: 'authSig is not an object',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    if (this.checkIfAuthSigRequiresChainParam) {
      if (!this.authMaterial.chain)
        return ELeft({
          message: 'You must pass chain param',
          errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
          errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
        });

      if (
        authSig &&
        !checkIfAuthSigRequiresChainParam(
          authSig,
          this.authMaterial.chain,
          this.fnName
        )
      )
        return ELeft({
          message: 'authSig is not valid',
          errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
          errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
        });
    }

    if (sessionSigs && !is(sessionSigs, 'Object', 'sessionSigs', this.fnName))
      return ELeft({
        message: 'sessionSigs is not an object',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    if (!sessionSigs && !authSig)
      return ELeft({
        message: 'You must pass either authSig or sessionSigs',
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });

    // -- validate: if sessionSig and authSig exists
    if (sessionSigs && authSig)
      return ELeft({
        message: 'You cannot have both authSig and sessionSigs',
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });

    return ERight(undefined);
  }
}

export interface AccessControlConditionsValidatorProps {
  accessControlConditions?: AccessControlConditions;
  evmContractConditions?: EvmContractConditions;
  solRpcConditions?: SolRpcConditions;
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;
}

class AccessControlConditionsValidator implements ParamsValidator {
  private fnName: string;
  private conditions: AccessControlConditionsValidatorProps;

  constructor(fnName: string, params: AccessControlConditionsValidatorProps) {
    this.fnName = fnName;
    this.conditions = params;
  }

  validate(): IEither<void> {
    const {
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
    } = this.conditions;

    if (
      accessControlConditions &&
      !is(
        accessControlConditions,
        'Array',
        'accessControlConditions',
        this.fnName
      )
    )
      return ELeft({
        message: 'accessControlConditions is not an array',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
    if (
      evmContractConditions &&
      !is(evmContractConditions, 'Array', 'evmContractConditions', this.fnName)
    )
      return ELeft({
        message: 'evmContractConditions is not an array',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    if (
      solRpcConditions &&
      !is(solRpcConditions, 'Array', 'solRpcConditions', this.fnName)
    )
      return ELeft({
        message: 'solRpcConditions is not an array',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    if (
      unifiedAccessControlConditions &&
      !is(
        unifiedAccessControlConditions,
        'Array',
        'unifiedAccessControlConditions',
        this.fnName
      )
    )
      return ELeft({
        message: 'unifiedAccessControlConditions is not an array',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });

    if (
      !accessControlConditions &&
      !evmContractConditions &&
      !solRpcConditions &&
      !unifiedAccessControlConditions
    )
      return ELeft({
        message:
          'You must pass either accessControlConditions, evmContractConditions, solRpcConditions or unifiedAccessControlConditions',
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });

    return ERight(undefined);
  }
}
