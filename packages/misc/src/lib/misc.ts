import {
  ILitError,
  LIT_AUTH_SIG_CHAIN_KEYS,
  LIT_CHAINS,
  LIT_ERROR,
} from '@lit-protocol/constants';

import {
  Chain,
  AuthSig,
  KV,
  NodeClientErrorV0,
  NodeClientErrorV1,
  NodeErrorV0,
  NodeErrorV1,
} from '@lit-protocol/types';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

import { version } from '@lit-protocol/constants';

const logBuffer: Array<Array<any>> = [];

/**
 *
 * Print error message based on Error interface
 *
 * @param { Error } e
 * @returns { void }
 */
export const printError = (e: Error): void => {
  console.log('Error Stack', e.stack);
  console.log('Error Name', e.name);
  console.log('Error Message', e.message);
};

/**
 *
 * Find the element that occurs the most in an array
 *
 * @param { Array<any> } arr
 * @returns { any } the element that appeared the most
 */
export const mostCommonString = (arr: Array<any>): any => {
  return arr
    .sort(
      (a: any, b: any) =>
        arr.filter((v: any) => v === a).length -
        arr.filter((v: any) => v === b).length
    )
    .pop();
};

export const throwError = (e: NodeClientErrorV0 | NodeClientErrorV1): never => {
  if (isNodeClientErrorV1(e)) {
    return throwErrorV1(e);
  } else if (isNodeClientErrorV0(e)) {
    return throwErrorV0(e);
  }
  return throwGenericError(e as any);
};

/**
 *
 * Standardized way to throw error in Lit Protocol projects
 *
 * @deprecated use throwErrorV1
 * @param { ILitError }
 * @property { string } message
 * @property { string } name
 * @property { string } errorCode
 */
export const throwErrorV0 = ({
  message,
  name,
  errorCode,
  error,
}: ILitError): never => {
  const errConstructorFunc = function (
    this: any,
    message: string,
    name: string,
    errorCode: string
  ) {
    this.message = message;
    this.name = name;

    // Map old error codes to new ones if possible.
    this.errorCode = oldErrorToNewErrorMap[errorCode] ?? errorCode;
  };

  throw new (errConstructorFunc as any)(
    message,
    (name = error?.name ?? name),
    (errorCode = error?.code ?? errorCode)
  );
};

// Map for old error codes to new ones
const oldErrorToNewErrorMap: { [key: string]: string } = {
  not_authorized: 'NodeNotAuthorized',
  storage_error: 'NodeStorageError',
};

/**
 *
 * Standardized way to throw error in Lit Protocol projects
 *
 */
export const throwErrorV1 = ({
  errorKind,
  details,
  status,
  message,
  errorCode,
}: NodeClientErrorV1): never => {
  const errConstructorFunc = function (
    this: any,
    errorKind: string,
    status: number,
    details: string[],
    message?: string,
    errorCode?: string
  ) {
    this.message = message;
    this.errorCode = errorCode;
    this.errorKind = errorKind;
    this.status = status;
    this.details = details;
  };

  throw new (errConstructorFunc as any)(
    errorKind,
    status,
    details,
    message,
    errorCode
  );
};

export const throwGenericError = (e: any): never => {
  const errConstructorFunc = function (this: any, message: string) {
    this.message = message;
    this.errorKind = LIT_ERROR.UNKNOWN_ERROR.name;
    this.errorCode = LIT_ERROR.UNKNOWN_ERROR.code;
  };

  throw new (errConstructorFunc as any)(e.message ?? 'Generic Error');
};

export const isNodeClientErrorV1 = (
  nodeError: NodeClientErrorV0 | NodeClientErrorV1
): nodeError is NodeClientErrorV1 => {
  return (
    nodeError.hasOwnProperty('errorCode') &&
    nodeError.hasOwnProperty('errorKind')
  );
};

export const isNodeClientErrorV0 = (
  nodeError: NodeClientErrorV0 | NodeClientErrorV1
): nodeError is NodeClientErrorV0 => {
  return nodeError.hasOwnProperty('errorCode');
};

export const isNodeErrorV1 = (
  nodeError: NodeErrorV0 | NodeErrorV1
): nodeError is NodeErrorV1 => {
  return (
    nodeError.hasOwnProperty('errorCode') &&
    nodeError.hasOwnProperty('errorKind')
  );
};

export const isNodeErrorV0 = (
  nodeError: NodeErrorV0 | NodeErrorV1
): nodeError is NodeErrorV0 => {
  return nodeError.hasOwnProperty('errorCode');
};

declare global {
  var litConfig: any;
  var wasmExport: any;
  var wasmECDSA: any;
}

export const throwRemovedFunctionError = (functionName: string) => {
  throwError({
    message: `This function "${functionName}" has been removed. Please use the old SDK.`,
    errorKind: LIT_ERROR.REMOVED_FUNCTION_ERROR.kind,
    errorCode: LIT_ERROR.REMOVED_FUNCTION_ERROR.name,
  });
};

/**
 *
 * console.log but prepend [Lit-JS-SDK] before the message
 *
 * @param { any } args
 *
 * @returns { void }
 */
export const log = (...args: any): void => {
  // append the prefix
  args.unshift(`[Lit-JS-SDK v${version}]`);

  if (!globalThis) {
    // there is no globalThis, just print the log
    console.log(...args);
    return;
  }

  // check if config is loaded yet
  if (!globalThis?.litConfig) {
    // config isn't loaded yet, push into buffer
    logBuffer.push(args);
    return;
  }

  if (globalThis?.litConfig?.debug !== true) {
    return;
  }
  // config is loaded, and debug is true

  // if there are there are logs in buffer, print them first and empty the buffer.
  while (logBuffer.length > 0) {
    const log = logBuffer.shift() ?? '';
    console.log(...log);
  }

  console.log(...args);
};

/**
 *
 * Get the type of a variable, could be an object instance type.
 * eg Uint8Array instance should return 'Uint8Array` as string
 * or simply a `string` or `int` type
 *
 * @param { any } value
 * @returns { string } type
 */
export const getVarType = (value: any): string => {
  return Object.prototype.toString.call(value).slice(8, -1);
};

/**
 *
 *  Check if the given value is the given type
 *  If not, throw `invalidParamType` error
 *
 * @property { any } value
 * @property { Array<String> } allowedTypes
 * @property { string } paramName
 * @property { string } functionName
 * @property { boolean } throwOnError
 *
 * @returns { Boolean } true/false
 *
 */
export const checkType = ({
  value,
  allowedTypes,
  paramName,
  functionName,
  throwOnError = true,
}: {
  value: any;
  allowedTypes: Array<string> | any;
  paramName: string;
  functionName: string;
  throwOnError?: boolean;
}): boolean => {
  // -- validate
  if (!allowedTypes.includes(getVarType(value))) {
    const message = `Expecting ${allowedTypes.join(
      ' or '
    )} type for parameter named ${paramName} in Lit-JS-SDK function ${functionName}(), but received "${getVarType(
      value
    )}" type instead. value: ${
      value instanceof Object ? JSON.stringify(value) : value
    }`;

    if (throwOnError) {
      throwError({
        message,
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
    }
    return false;
  }

  // -- else
  return true;
};

/**
 *
 * @param { AuthSig } authSig
 * @param { string } chain
 * @param { string } functionName
 *
 * @returns { boolean }
 */
export const checkIfAuthSigRequiresChainParam = (
  authSig: AuthSig,
  chain: string,
  functionName: string
): boolean => {
  log('checkIfAuthSigRequiresChainParam');
  for (const key of LIT_AUTH_SIG_CHAIN_KEYS) {
    if (key in authSig) {
      return true;
    }
  }

  // if we're here, then we need the chain param
  if (
    !checkType({
      value: chain,
      allowedTypes: ['String'],
      paramName: 'chain',
      functionName,
    })
  ) {
    return false;
  }

  return true;
};

/**
 * TODO: Fix "any"
 * Sort object
 *
 * @param { any } obj
 * @returns { any }
 */
export const sortedObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortedObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: any = {};

  // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
  sortedKeys.forEach((key: any) => {
    result[key] = sortedObject(obj[key]);
  });

  return result;
};

/**
 *
 * Convert number to hex
 * @param { number } v
 * @return { string } hex value prexied with 0x
 */
export const numberToHex = (v: number): string => {
  return '0x' + v.toString(16);
};

/**
 *
 *  Check if the given value is the given type
 *  If not, throw `invalidParamType` error
 *
 * @param { any } value
 * @param { string } type
 * @param { string } paramName
 * @param { string } functionName
 * @returns { Boolean } true/false
 */
export const is = (
  value: any,
  type: string,
  paramName: string,
  functionName: string,
  throwOnError = true
) => {
  if (getVarType(value) !== type) {
    let message = `Expecting "${type}" type for parameter named ${paramName} in Lit-JS-SDK function ${functionName}(), but received "${getVarType(
      value
    )}" type instead. value: ${
      value instanceof Object ? JSON.stringify(value) : value
    }`;

    if (throwOnError) {
      throwError({
        message,
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
    }
    return false;
  }

  return true;
};

/**
 * Convert types before sending to Lit Actions as jsParams, some JS types don't serialize well, so we will convert them before sending to the nodes
 *
 * @param { object } params.jsParams The jsParams you are sending
 * @returns { object } The jsParams object, but with any incompatible types automatically converted
 */
export const convertLitActionsParams = (jsParams: object): object => {
  // -- property
  const convertedParams: KV = {};

  // -- execute
  for (const [key, value] of Object.entries(jsParams)) {
    const _key: string = key;
    const _value: any = value;

    // -- get value type
    const varType = getVarType(_value);

    // -- case: Unit8Array
    if (varType === 'Uint8Array') {
      convertedParams[_key] = Array.from(_value);
      // -- case: Object, recurse over any objects
    } else if (varType === 'Object') {
      convertedParams[_key] = convertLitActionsParams(_value);
    }
    // -- default
    else {
      convertedParams[_key] = _value;
    }
  }

  return convertedParams;
};

export const isNode = () => {
  var isNode = false;
  // @ts-ignore
  if (typeof process === 'object') {
    // @ts-ignore
    if (typeof process.versions === 'object') {
      // @ts-ignore
      if (typeof process.versions.node !== 'undefined') {
        isNode = true;
      }
    }
  }
  return isNode;
};
export const isBrowser = () => {
  return isNode() === false;
};

/**
 *
 * Get the number of decimal places in a token
 *
 * @property { string } contractAddress The token contract address
 * @property { string } chain The chain on which the token is deployed
 *
 * @returns { number } The number of decimal places in the token
 */
export const decimalPlaces = async ({
  contractAddress,
  chain,
}: {
  contractAddress: string;
  chain: Chain;
}): Promise<number> => {
  const rpcUrl = LIT_CHAINS[chain].rpcUrls[0] as string;

  const web3 = new JsonRpcProvider(rpcUrl);

  const contract = new Contract(contractAddress, ([
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_spender",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_from",
          "type": "address"
        },
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "balance",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        },
        {
          "name": "_spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "payable": true,
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    }
  ] as any).abi, web3);

  return await contract['decimals']();
};

/**
 *
 * Generate a random path (for testing)
 *
 * @returns { string } The random path
 */
export const genRandomPath = (): string => {
  return (
    '/' +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
