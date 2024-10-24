/**
 * Param Validators is an abstraction of validating params of a function, each validator
 * returns a boolean value indicating whether the validation is passed or not.
 */

import { isHexString } from 'ethers/lib/utils';

import {
  EITHER_TYPE,
  ELeft,
  ERight,
  IEither,
  InvalidArgumentException,
  InvalidBooleanException,
  InvalidParamType,
  ParamsMissingError,
} from '@lit-protocol/constants';
import {
  AcceptedFileType,
  AccessControlConditions,
  AuthMethod,
  DecryptFromJsonProps,
  DecryptRequest,
  EncryptUint8ArrayRequest,
  EncryptFileRequest,
  EncryptRequest,
  EncryptStringRequest,
  EncryptToJsonPayload,
  EncryptToJsonProps,
  EvmContractConditions,
  JsonExecutionSdkParams,
  SessionSigsOrAuthSig,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

import { checkIfAuthSigRequiresChainParam, checkType, is, log } from './misc';
import { isValidBooleanExpression } from './utils';

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

export const paramsValidators: Record<
  string,
  (params: any) => ParamsValidator[]
> = {
  // ========== NO AUTH MATERIAL NEEDED FOR CLIENT SIDE ENCRYPTION ==========
  encrypt: (params: EncryptRequest) => [
    new AccessControlConditionsValidator('encrypt', params),
  ],

  encryptUint8Array: (params: EncryptUint8ArrayRequest) => [
    new AccessControlConditionsValidator('encryptUint8Array', params),
    new Uint8ArrayValidator('encryptUint8Array', params.dataToEncrypt),
  ],

  encryptFile: (params: EncryptFileRequest) => [
    new AccessControlConditionsValidator('encryptFile', params),
    new FileValidator('encryptFile', params.file),
  ],

  encryptString: (params: EncryptStringRequest) => [
    new AccessControlConditionsValidator('encryptString', params),
    new StringValidator('encryptString', params.dataToEncrypt, 'dataToEncrypt'),
  ],

  encryptToJson: (params: EncryptToJsonProps) => [
    new AccessControlConditionsValidator('encryptToJson', params),
    new EncryptToJsonValidator('encryptToJson', params),
  ],

  // ========== REQUIRED AUTH MATERIAL VALIDATORS ==========
  executeJs: (params: JsonExecutionSdkParams) => [
    new AuthMaterialValidator('executeJs', params),
    new ExecuteJsValidator('executeJs', params),
  ],

  decrypt: (params: DecryptRequest) => [
    new AccessControlConditionsValidator('decrypt', params),
    new AuthMaterialValidator('decrypt', params, true),
    new StringValidator('decrypt', params.ciphertext, 'ciphertext'),
  ],

  decryptFromJson: (params: DecryptFromJsonProps) => [
    new AuthMaterialValidator('decryptFromJson', params),
    new DecryptFromJsonValidator('decryptFromJson', params.parsedJsonData),
  ],
};

export type ParamsValidatorsType = typeof paramsValidators;

//////////////////////// VALIDATORS ////////////////////////

interface ParamsValidator {
  validate: () => IEither<void>;
}

class EncryptToJsonValidator implements ParamsValidator {
  private fnName: string;
  private readonly params: EncryptToJsonProps;

  constructor(fnName: string, params: EncryptToJsonProps) {
    this.fnName = fnName;
    this.params = params;
  }

  validate(): IEither<void> {
    const { file, string } = this.params;

    if (string === undefined && file === undefined)
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'string',
              value: string,
              functionName: this.fnName,
            },
          },
          'Either string or file must be provided'
        )
      );

    if (string !== undefined && file !== undefined)
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'string',
              value: string,
              functionName: this.fnName,
            },
          },
          'Provide only a "string" or "file" to encrypt; you cannot provide both'
        )
      );

    return ERight(undefined);
  }
}

class DecryptFromJsonValidator implements ParamsValidator {
  private readonly fnName: string;
  private readonly params: EncryptToJsonPayload;

  constructor(fnName: string, params: EncryptToJsonPayload) {
    this.fnName = fnName;
    this.params = params;
  }

  validate(): IEither<void> {
    const validators = [new StringValidator(this.fnName, this.params.dataType)];

    for (const validator of validators) {
      const validationResponse = validator.validate();
      if (validationResponse.type === EITHER_TYPE.ERROR) {
        return validationResponse;
      }
    }

    const { dataType } = this.params;

    if (dataType !== 'string' && dataType !== 'file')
      return ELeft(
        new InvalidArgumentException(
          {
            info: {
              functionName: this.fnName,
              dataType,
            },
          },
          `dataType of %s is not valid. Must be 'string' or 'file'.`,
          dataType
        )
      );

    return ERight(undefined);
  }
}

class Uint8ArrayValidator implements ParamsValidator {
  private readonly fnName: string;
  private readonly paramName: string;
  private readonly uint8array?: Uint8Array;

  constructor(
    fnName: string,
    uint8array?: Uint8Array,
    paramName: string = 'uint8array'
  ) {
    this.fnName = fnName;
    this.paramName = paramName;
    this.uint8array = uint8array;
  }

  validate(): IEither<void> {
    if (!this.uint8array) {
      return ELeft(new InvalidParamType({}, 'uint8array is undefined'));
    }

    if (
      !checkType({
        value: this.uint8array,
        allowedTypes: ['Uint8Array'],
        paramName: this.paramName,
        functionName: this.fnName,
      })
    )
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: this.paramName,
              value: this.uint8array,
              functionName: this.fnName,
            },
          },
          '%s is not a Uint8Array',
          this.paramName
        )
      );

    return ERight(undefined);
  }
}

class StringValidator implements ParamsValidator {
  private readonly fnName: string;
  private readonly paramName: string;
  private readonly checkIsHex: boolean;
  private readonly str?: string;

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
      return ELeft(new InvalidParamType({}, 'str is undefined'));
    }

    if (
      !checkType({
        value: this.str,
        allowedTypes: ['String'],
        paramName: this.paramName,
        functionName: this.fnName,
      })
    )
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: this.paramName,
              value: this.str,
              functionName: this.fnName,
            },
          },
          '%s is not a string',
          this.paramName
        )
      );

    if (this.checkIsHex && !isHexString(this.str)) {
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: this.paramName,
              value: this.str,
              functionName: this.fnName,
            },
          },
          '%s is not a valid hex string',
          this.paramName
        )
      );
    }

    return ERight(undefined);
  }
}

class AuthMethodValidator implements ParamsValidator {
  private readonly fnName: string;
  private authMethods?: AuthMethod[];

  constructor(fnName: string, authMethods?: AuthMethod[]) {
    this.fnName = fnName;
    this.authMethods = authMethods;
  }

  validate(): IEither<void> {
    const { authMethods } = this;

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
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'authMethods',
              value: authMethods,
              functionName: this.fnName,
            },
          },
          'authMethods is not an array'
        )
      );

    return ERight(undefined);
  }
}

interface ExecuteJsValidatorProps {
  code?: string;
  ipfsId?: string;
}

class ExecuteJsValidator implements ParamsValidator {
  private fnName: string;
  private readonly params: ExecuteJsValidatorProps;

  constructor(fnName: string, params: ExecuteJsValidatorProps) {
    this.fnName = fnName;
    this.params = params;
  }

  validate(): IEither<void> {
    const { code, ipfsId } = this.params;

    // -- validate: either 'code' or 'ipfsId' must exists
    if (!code && !ipfsId) {
      return ELeft(
        new ParamsMissingError(
          {
            info: {
              functionName: this.fnName,
              params: this.params,
            },
          },
          'You must pass either code or ipfsId'
        )
      );
    }

    // -- validate: 'code' and 'ipfsId' can't exists at the same time
    if (code && ipfsId) {
      return ELeft(
        new ParamsMissingError(
          {
            info: {
              functionName: this.fnName,
              params: this.params,
            },
          },
          "You cannot have both 'code' and 'ipfs' at the same time"
        )
      );
    }

    return ERight(undefined);
  }
}

class FileValidator implements ParamsValidator {
  private readonly fnName: string;
  private readonly file?: AcceptedFileType;

  constructor(fnName: string, file?: AcceptedFileType) {
    this.fnName = fnName;
    this.file = file;
  }

  validate(): IEither<void> {
    if (!this.file) {
      return ELeft(
        new InvalidArgumentException(
          {
            info: {
              functionName: this.fnName,
              file: this.file,
            },
          },
          'You must pass file param'
        )
      );
    }

    const allowedTypes = ['Blob', 'File', 'Uint8Array'];
    if (
      !checkType({
        value: this.file,
        allowedTypes,
        paramName: 'file',
        functionName: this.fnName,
      })
    )
      return ELeft(
        new InvalidArgumentException(
          {
            info: {
              functionName: this.fnName,
              file: this.file,
              allowedTypes,
            },
          },
          'File param is not a valid Blob or File object'
        )
      );

    return ERight(undefined);
  }
}

export interface AuthMaterialValidatorProps extends SessionSigsOrAuthSig {
  chain?: string;
}

class AuthMaterialValidator implements ParamsValidator {
  private readonly fnName: string;
  private readonly authMaterial: AuthMaterialValidatorProps;
  private readonly checkIfAuthSigRequiresChainParam: boolean;

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
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'authSig',
              value: authSig,
              functionName: this.fnName,
            },
          },
          'authSig is not an object'
        )
      );

    if (this.checkIfAuthSigRequiresChainParam) {
      if (!this.authMaterial.chain)
        return ELeft(
          new InvalidArgumentException(
            {
              info: {
                functionName: this.fnName,
                chain: this.authMaterial.chain,
              },
            },
            'You must pass chain param'
          )
        );

      if (
        authSig &&
        !checkIfAuthSigRequiresChainParam(
          authSig,
          this.authMaterial.chain,
          this.fnName
        )
      )
        return ELeft(
          new InvalidParamType(
            {
              info: {
                param: 'authSig',
                value: authSig,
                functionName: this.fnName,
              },
            },
            'authSig is not valid'
          )
        );
    }

    if (sessionSigs && !is(sessionSigs, 'Object', 'sessionSigs', this.fnName))
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'sessionSigs',
              value: sessionSigs,
              functionName: this.fnName,
            },
          },
          'sessionSigs is not an object'
        )
      );

    if (!sessionSigs && !authSig)
      return ELeft(
        new InvalidArgumentException(
          {
            info: {
              functionName: this.fnName,
              sessionSigs,
              authSig,
            },
          },
          'You must pass either authSig or sessionSigs'
        )
      );

    // -- validate: if sessionSig and authSig exists
    if (sessionSigs && authSig)
      return ELeft(
        new InvalidArgumentException(
          {
            info: {
              functionName: this.fnName,
              sessionSigs,
              authSig,
            },
          },
          'You cannot have both authSig and sessionSigs'
        )
      );

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
  private readonly fnName: string;
  private readonly conditions: AccessControlConditionsValidatorProps;

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
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'accessControlConditions',
              value: accessControlConditions,
              functionName: this.fnName,
            },
          },
          '%s is not an array',
          'accessControlConditions'
        )
      );
    if (
      evmContractConditions &&
      !is(evmContractConditions, 'Array', 'evmContractConditions', this.fnName)
    )
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'evmContractConditions',
              value: evmContractConditions,
              functionName: this.fnName,
            },
          },
          '%s is not an array',
          'evmContractConditions'
        )
      );

    if (
      solRpcConditions &&
      !is(solRpcConditions, 'Array', 'solRpcConditions', this.fnName)
    )
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'solRpcConditions',
              value: solRpcConditions,
              functionName: this.fnName,
            },
          },
          '%s is not an array',
          'solRpcConditions'
        )
      );

    if (
      unifiedAccessControlConditions &&
      !is(
        unifiedAccessControlConditions,
        'Array',
        'unifiedAccessControlConditions',
        this.fnName
      )
    )
      return ELeft(
        new InvalidParamType(
          {
            info: {
              param: 'unifiedAccessControlConditions',
              value: unifiedAccessControlConditions,
              functionName: this.fnName,
            },
          },
          '%s is not an array',
          'unifiedAccessControlConditions'
        )
      );

    if (
      !accessControlConditions &&
      !evmContractConditions &&
      !solRpcConditions &&
      !unifiedAccessControlConditions
    )
      return ELeft(
        new InvalidArgumentException(
          {
            info: {
              functionName: this.fnName,
              conditions: this.conditions,
            },
          },
          'You must pass either accessControlConditions, evmContractConditions, solRpcConditions or unifiedAccessControlConditions'
        )
      );

    if (
      accessControlConditions &&
      !isValidBooleanExpression(accessControlConditions)
    )
      return ELeft(
        new InvalidBooleanException(
          {
            info: {
              functionName: this.fnName,
              accessControlConditions,
            },
          },
          'Invalid boolean Access Control Conditions'
        )
      );

    if (
      evmContractConditions &&
      !isValidBooleanExpression(evmContractConditions)
    )
      return ELeft(
        new InvalidBooleanException(
          {
            info: {
              functionName: this.fnName,
              evmContractConditions,
            },
          },
          'Invalid boolean EVM Access Control Conditions'
        )
      );

    if (solRpcConditions && !isValidBooleanExpression(solRpcConditions))
      return ELeft(
        new InvalidBooleanException(
          {
            info: {
              functionName: this.fnName,
              solRpcConditions,
            },
          },
          'Invalid boolean Solana Access Control Conditions'
        )
      );

    if (
      unifiedAccessControlConditions &&
      !isValidBooleanExpression(unifiedAccessControlConditions)
    )
      return ELeft(
        new InvalidBooleanException(
          {
            info: {
              functionName: this.fnName,
              unifiedAccessControlConditions,
            },
          },
          'Invalid boolean Unified Access Control Conditions'
        )
      );

    return ERight(undefined);
  }
}
