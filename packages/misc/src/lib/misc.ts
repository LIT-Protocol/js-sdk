import { LitNodeClientConfig } from '@lit-protocol/types';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import Ajv, { JSONSchemaType } from 'ajv';

import {
  ABI_ERC20,
  InvalidArgumentException,
  InvalidParamType,
  LIT_AUTH_SIG_CHAIN_KEYS,
  LIT_CHAINS,
  LIT_NETWORK,
  LIT_NETWORK_VALUES,
  LOG_LEVEL,
  LOG_LEVEL_VALUES,
  NetworkError,
  RELAYER_URL_BY_NETWORK,
  RemovedFunctionError,
  UnknownError,
  WrongNetworkException,
} from '@lit-protocol/constants';
import { LogManager } from '@lit-protocol/logger';
import {
  Chain,
  AuthSig,
  NodeErrorV3,
  ClaimResult,
  MintCallback,
  RelayClaimProcessor,
} from '@lit-protocol/types';

const logBuffer: any[][] = [];
const ajv = new Ajv();

// Module scoped variable to store the LitNodeClientConfig passed to LitCore
let litConfig: LitNodeClientConfig | undefined;

export const setMiscLitConfig = (config: LitNodeClientConfig | undefined) => {
  litConfig = config;
};

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
export const mostCommonString = <T>(arr: T[]): T | undefined => {
  return arr
    .sort(
      (a: T, b: T) =>
        arr.filter((v: T) => v === a).length -
        arr.filter((v: T) => v === b).length
    )
    .pop();
};

export const findMostCommonResponse = (responses: object[]): object => {
  const result: Record<string, any> = {};

  // Aggregate all values for each key across all responses
  const keys = new Set(responses.flatMap(Object.keys));

  for (const key of keys) {
    const values = responses.map(
      (response: Record<string, any>) => response[key]
    );

    // Filter out undefined values before processing
    const filteredValues = values.filter(
      (value) => value !== undefined && value !== ''
    );

    if (filteredValues.length === 0) {
      result[key] = undefined; // or set a default value if needed
    } else if (
      typeof filteredValues[0] === 'object' &&
      !Array.isArray(filteredValues[0])
    ) {
      // Recursive case for objects
      result[key] = findMostCommonResponse(filteredValues);
    } else {
      // Most common element from filtered values
      result[key] = mostCommonString(filteredValues);
    }
  }

  return result;
};

declare global {
  var wasmExport: any;
  var wasmECDSA: any;
  var logger: any;
  var logManager: any;
}

export const throwRemovedFunctionError = (functionName: string) => {
  throw new RemovedFunctionError(
    {
      info: {
        functionName,
      },
    },
    `This function "${functionName}" has been removed. Please use the old SDK.`
  );
};

export const bootstrapLogManager = (
  id: string,
  level: LOG_LEVEL_VALUES = LOG_LEVEL.DEBUG
) => {
  if (!globalThis.logManager) {
    globalThis.logManager = LogManager.Instance;
    globalThis.logManager.withConfig({
      condenseLogs: true,
    });
    globalThis.logManager.setLevel(level);
  }

  globalThis.logger = globalThis.logManager.get(id);
};

export const getLoggerbyId = (id: string) => {
  return globalThis.logManager.get(id);
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
  if (!globalThis) {
    // there is no globalThis, just print the log
    console.log(...args);
    return;
  }

  // check if config is loaded yet
  if (!litConfig) {
    // config isn't loaded yet, push into buffer
    logBuffer.push(args);
    return;
  }

  // if there are there are logs in buffer, print them first and empty the buffer.
  while (logBuffer.length > 0) {
    const log = logBuffer.shift() ?? '';
    globalThis?.logger && globalThis?.logger.debug(...log);
  }

  globalThis?.logger && globalThis?.logger.debug(...args);
};

export const logWithRequestId = (id: string, ...args: any) => {
  if (!globalThis) {
    // there is no globalThis, just print the log
    console.log(...args);
    return;
  }

  // check if config is loaded yet
  if (!litConfig) {
    // config isn't loaded yet, push into buffer
    logBuffer.push(args);
    return;
  }

  // if there are there are logs in buffer, print them first and empty the buffer.
  while (logBuffer.length > 0) {
    const log = logBuffer.shift() ?? '';
    globalThis?.logger &&
      globalThis.logManager.get(globalThis.logger.category, id).debug(...log);
  }

  globalThis?.logger &&
    globalThis.logManager.get(globalThis.logger.category, id).debug(...args);
};

export const logErrorWithRequestId = (id: string, ...args: any) => {
  if (!globalThis) {
    // there is no globalThis, just print the log
    console.log(...args);
    return;
  }

  // check if config is loaded yet
  if (!litConfig) {
    // config isn't loaded yet, push into buffer
    logBuffer.push(args);
    return;
  }

  // if there are there are logs in buffer, print them first and empty the buffer.
  while (logBuffer.length > 0) {
    const log = logBuffer.shift() ?? '';
    globalThis?.logger &&
      globalThis.logManager.get(globalThis.logger.category, id).error(...log);
  }

  globalThis?.logger &&
    globalThis.logManager.get(globalThis.logger.category, id).error(...args);
};

export const logError = (...args: any) => {
  if (!globalThis) {
    // there is no globalThis, just print the log
    console.log(...args);
    return;
  }

  // check if config is loaded yet
  if (!litConfig) {
    // config isn't loaded yet, push into buffer
    logBuffer.push(args);
    return;
  }

  // if there are there are logs in buffer, print them first and empty the buffer.
  while (logBuffer.length > 0) {
    const log = logBuffer.shift() ?? '';
    globalThis?.logger &&
      globalThis.logManager.get(globalThis.logger.category).error(...log);
  }

  globalThis?.logger &&
    globalThis.logManager.get(globalThis.logger.category).error(...args);
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
  allowedTypes: string[] | any;
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
      throw new InvalidParamType(
        {
          info: {
            allowedTypes,
            value,
            paramName,
            functionName,
          },
        },
        message
      );
    }
    return false;
  }

  // -- else
  return true;
};

/**
 * Check if the given value complies with the given schema
 * If not, throw `invalidParamType` error
 *
 * @param { any } value
 * @param { JSONSchemaType<any> } schema
 * @param { string } paramName
 * @param { string } functionName
 * @param { boolean } throwOnError
 *
 * @returns { Boolean } true/false
 */
export const checkSchema = (
  value: any,
  schema: JSONSchemaType<any>,
  paramName: string,
  functionName: string,
  throwOnError: boolean = true
): boolean => {
  let validate = schema.$id ? ajv.getSchema(schema.$id) : undefined;
  if (!validate) {
    validate = ajv.compile(schema);
  }

  const validates = validate(value);

  const message = `FAILED schema validation for parameter named ${paramName} in Lit-JS-SDK function ${functionName}(). Value: ${
    value instanceof Object ? JSON.stringify(value) : value
  }. Errors: ${JSON.stringify(validate.errors)}`;

  if (!validates) {
    if (throwOnError) {
      throw new InvalidParamType(
        {
          info: {
            value,
            paramName,
            functionName,
          },
        },
        message
      );
    }
    return false;
  }

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
  sortedKeys.forEach((key) => {
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
 * @param { boolean } throwOnError
 * @returns { Boolean } true/false
 */
export const is = (
  value: any,
  type: string,
  paramName: string,
  functionName: string,
  throwOnError: boolean = true
): boolean => {
  if (getVarType(value) !== type) {
    const message = `Expecting "${type}" type for parameter named ${paramName} in Lit-JS-SDK function ${functionName}(), but received "${getVarType(
      value
    )}" type instead. value: ${
      value instanceof Object ? JSON.stringify(value) : value
    }`;

    if (throwOnError) {
      throw new InvalidParamType(
        {
          info: {
            value,
            paramName,
            functionName,
          },
        },
        message
      );
    }
    return false;
  }

  return true;
};

export const isNode = () => {
  let isNode = false;
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

  const web3 = new JsonRpcProvider({
    url: rpcUrl,
    skipFetchSetup: true,
  });

  const contract = new Contract(contractAddress, (ABI_ERC20 as any).abi, web3);

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

/**
 * Checks if the given LIT_NETWORK value is supported.
 * @param litNetwork - The Lit Network value to check.
 * @throws {Error} - Throws an error if the Lit Network value is not supported.
 */
export function isSupportedLitNetwork(
  litNetwork: LIT_NETWORK_VALUES
): asserts litNetwork is LIT_NETWORK_VALUES {
  const supportedNetworks = Object.values(LIT_NETWORK);

  if (!supportedNetworks.includes(litNetwork)) {
    throw new WrongNetworkException(
      {
        info: {
          litNetwork,
          supportedNetworks,
        },
      },
      `Unsupported LitNetwork! (${supportedNetworks.join('|')}) are supported.`
    );
  }
}

export const defaultMintClaimCallback: MintCallback<
  RelayClaimProcessor
> = async (
  params: ClaimResult<RelayClaimProcessor>,
  network: LIT_NETWORK_VALUES = LIT_NETWORK.NagaDev
): Promise<string> => {
  isSupportedLitNetwork(network);

  const AUTH_CLAIM_PATH = '/auth/claim';

  const relayUrl: string = params.relayUrl || RELAYER_URL_BY_NETWORK[network];

  if (!relayUrl) {
    throw new InvalidArgumentException(
      {
        info: {
          network,
          relayUrl,
        },
      },
      'No relayUrl provided and no default relayUrl found for network'
    );
  }

  const relayUrlWithPath = relayUrl + AUTH_CLAIM_PATH;

  const response = await fetch(relayUrlWithPath, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'api-key': params.relayApiKey
        ? params.relayApiKey
        : '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
      'Content-Type': 'application/json',
    },
  });

  if (response.status < 200 || response.status >= 400) {
    const errResp = (await response.json()) ?? '';
    const errStmt = `An error occurred requesting "/auth/claim" endpoint ${JSON.stringify(
      errResp
    )}`;
    console.warn(errStmt);
    throw new NetworkError(
      {
        info: {
          response,
          errResp,
        },
      },
      `An error occurred requesting "/auth/claim" endpoint`
    );
  }

  const body = await response.json();
  return body.requestId;
};

/**
 * Adds a '0x' prefix to a string if it doesn't already have one.
 * @param str - The input string.
 * @returns The input string with a '0x' prefix.
 */
export const hexPrefixed = (str: string): `0x${string}` => {
  if (str.startsWith('0x')) {
    return str as `0x${string}`;
  }

  return ('0x' + str) as `0x${string}`;
};

/**
 * Removes the '0x' prefix from a hexadecimal string if it exists.
 *
 * @param str - The input string.
 * @returns The input string with the '0x' prefix removed, if present.
 */
export const removeHexPrefix = (str: string) => {
  if (str.startsWith('0x')) {
    return str.slice(2);
  }

  return str;
};

/**
 * getEnv - Determine the debug status based on environment variables or URL query parameters.
 *
 * @function
 * @export
 * @param {Object} [options={}] - Configuration options for determining debug status.
 * @param {string} [options.nodeEnvVar='DEBUG'] - The Node.js environment variable to check.
 * @param {string} [options.urlQueryParam='dev'] - The URL query parameter to check in a browser environment.
 * @param {string} [options.urlQueryValue='debug=true'] - The expected value of the URL query parameter to enable debugging.
 * @param {boolean} [options.defaultValue=false] - The default boolean value to return if no debug conditions are met.
 * @returns {boolean} - True if debug conditions are met, otherwise returns the provided defaultValue.
 *
 * @example
 * // Usage in Node.js environment
 * process.env.DEBUG = 'true';
 * console.log(getEnv()); // Outputs: true
 *
 * @example
 * // Usage in Browser environment with URL: http://example.com?dev=debug=true
 * console.log(getEnv()); // Outputs: true
 */
export function getEnv({
  nodeEnvVar = 'DEBUG',
  urlQueryParam = 'dev',
  urlQueryValue = 'debug=true',
  defaultValue = false,
} = {}) {
  // Node.js environment
  if (isNode()) {
    return process.env[nodeEnvVar] === 'true';
  }
  // Browser environment
  else if (isBrowser()) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(urlQueryParam) === urlQueryValue;
  }
  // Default
  return defaultValue;
}

export function sendRequest(
  url: string,
  req: RequestInit,
  requestId: string
): Promise<Response> {
  return fetch(url, req)
    .then(async (response) => {
      const isJson = response.headers
        .get('content-type')
        ?.includes('application/json');

      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        // get error message from body or default to response status
        const error = data || response.status;
        return Promise.reject(error);
      }

      return data;
    })
    .catch((error: NodeErrorV3) => {
      logErrorWithRequestId(
        requestId,
        `Something went wrong, internal id for request: lit_${requestId}. Please provide this identifier with any support requests. ${
          error?.message || error?.details
            ? `Error is ${error.message} - ${error.details}`
            : ''
        }`
      );
      return Promise.reject(error);
    });
}

/**
 * Attempts to normalize a string by unescaping it until it can be parsed as a JSON object,
 * then stringifies it exactly once. If the input is a regular string that does not represent
 * a JSON object or array, the function will return it as is without modification.
 * This function is designed to handle cases where strings might be excessively escaped due
 * to multiple layers of encoding, ensuring that JSON data is stored in a consistent and
 * predictable format, and regular strings are left unchanged.
 *
 * @param input The potentially excessively escaped string.
 * @return A string that is either the JSON.stringify version of the original JSON object
 *         or the original string if it does not represent a JSON object or array.
 */
export function normalizeAndStringify(input: string): string {
  try {
    // Directly return the string if it's not in a JSON format
    if (!input.startsWith('{') && !input.startsWith('[')) {
      return input;
    }

    // Attempt to parse the input as JSON
    const parsed = JSON.parse(input);

    // If parsing succeeds, return the stringified version of the parsed JSON
    return JSON.stringify(parsed);
  } catch (error) {
    // If parsing fails, it might be due to extra escaping
    const unescaped = input.replace(/\\(.)/g, '$1');

    // If unescaping doesn't change the string, return it as is
    if (input === unescaped) {
      return input;
    }

    // Otherwise, recursively call the function with the unescaped string
    return normalizeAndStringify(unescaped);
  }
}

/**
 * Retrieves the IP address associated with a given domain.
 * @param domain - The domain for which to retrieve the IP address.
 * @returns A Promise that resolves to the IP address.
 * @throws If no IP address is found or if the domain name is invalid.
 */
export async function getIpAddress(domain: string): Promise<string> {
  const apiURL = `https://dns.google/resolve?name=${domain}&type=A`;

  try {
    const response = await fetch(apiURL);
    const data = await response.json();

    if (data.Answer && data.Answer.length > 0) {
      return data.Answer[0].data;
    } else {
      throw new UnknownError(
        {
          info: {
            domain,
            apiURL,
          },
        },
        'No IP Address found or bad domain name'
      );
    }
  } catch (error: any) {
    throw new UnknownError(
      {
        info: {
          domain,
          apiURL,
        },
        cause: error,
      },
      'message' in error ? error.message : String(error)
    );
  }
}
