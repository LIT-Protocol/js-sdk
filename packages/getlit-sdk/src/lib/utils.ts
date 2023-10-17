import { version as SDKVersion } from '@lit-protocol/constants';
import {
  AccessControlType,
  AuthKeys,
  DeserialisedMessage,
  EncryptProps,
  EncryptionMetadata,
  LitAuthMethod,
  LitSerializable,
  LitSerialized,
  PKPInfo,
} from './types';
import { p2pkh } from 'bitcoinjs-lib/src/payments/p2pkh';
import { toBech32 } from '@cosmjs/encoding';
import { Secp256k1 } from '@cosmjs/crypto';
import { rawSecp256k1PubkeyToRawAddress } from '@cosmjs/amino';
import {
  EncryptRequestBase,
  IRelayPKP,
  SolRpcConditions,
  EvmContractConditions,
  AccessControlConditions,
  EncryptResponse,
  BaseAuthenticateOptions,
  SessionSig,
  SessionSigs,
} from '@lit-protocol/types';

// @ts-ignore
import * as JSZip from 'jszip/dist/jszip.js';

const version = '0.0.833';
const PREFIX = 'GetLit SDK';
const logBuffer: Array<any[]> = [];

function log(...args: any[]): void {
  args.unshift(`\x1b[34m[${PREFIX} v${version} INFO]\x1b[39m`);
  printLog(args);
}
let operationTimes: { [id: string]: number } = {};

log.info = log;

log.error = (...args: any[]): void => {
  args.unshift(`\x1b[31m[${PREFIX} v${version} ERROR]\x1b[39m`);
  printLog(args);
};

log.throw = (...args: any[]): never => {
  const throwArgs = args;
  args.unshift(`\x1b[31m[${PREFIX} v${version} ERROR]\x1b[39m`);
  printLog(args);
  throw new Error(throwArgs.join(' '));
};

log.warning = (...args: any[]): void => {
  args.unshift(`\x1b[33m[${PREFIX} v${version} WARNING]\x1b[39m`);
  printLog(args);
};

log.success = (...args: any[]): void => {
  args.unshift(`\x1b[32m[${PREFIX} v${version} SUCCESS]\x1b[39m`);
  printLog(args);
};

log.start = (operationId: string, ...args: any[]): void => {
  operationTimes[operationId] = Date.now();
  args.unshift(`\x1b[35m[${PREFIX} v${version}] ## [${operationId}]`);
  args = [...args];
  printLog(args);
};

log.end = (operationId: string, ...args: any[]): void => {
  // Check if the operation ID is valid
  if (!operationTimes.hasOwnProperty(operationId)) {
    throw new Error(
      `Invalid operation ID: ${operationId}. That means "${operationId}" was never started.`
    );
  }

  // Calculate the elapsed time
  const elapsedTime = Date.now() - operationTimes[operationId];

  args.unshift(
    `\x1b[35m[${PREFIX} v${version}] ## [${operationId}] ENDED (${elapsedTime} ms):`
  );
  args = [...args];
  printLog(args);

  // Delete the operation ID from the object so it doesn't grow indefinitely
  delete operationTimes[operationId];
};

const printLog = (args: any[]): void => {
  if (globalThis?.Lit.debug === false) {
    return;
  }

  if (!globalThis) {
    // there is no globalThis, just print the log
    console.log(...args);
    return;
  }

  // check if config is loaded yet
  if (!globalThis?.Lit?.debug) {
    // config isn't loaded yet, push into buffer
    logBuffer.push(args);
    return;
  }

  // config is loaded, and debug is true

  // if there are logs in buffer, print them first and empty the buffer.
  while (logBuffer.length > 0) {
    const bufferedLog = logBuffer.shift() ?? [];
    console.log(...bufferedLog);
  }

  console.log(...args);
};

export { log };

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

export function convertContentToBuffer(content: any): Buffer {
  let bufferContent: Buffer;

  switch (typeof content) {
    case 'string':
      bufferContent = Buffer.from(content, 'utf8');
      break;
    case 'number':
      bufferContent = Buffer.from(content.toString(), 'utf8');
      break;
    case 'boolean':
      bufferContent = Buffer.from(content ? 'true' : 'false', 'utf8');
      break;
    case 'object':
      if (content instanceof ArrayBuffer) {
        bufferContent = Buffer.from(content);
      } else if (ArrayBuffer.isView(content)) {
        bufferContent = Buffer.from(content.buffer);
      } else {
        bufferContent = Buffer.from(JSON.stringify(content), 'utf8');
      }
      break;
    default:
      throw new Error('Unsupported content type for conversion');
  }

  return bufferContent;
}

export function convertSigningMaterial(
  material: LitSerializable
): LitSerialized<number[]> {
  let toSign: number[] = [];
  if (typeof material != 'string') {
    for (let i = 0; i < material.length; i++) {
      toSign.push(material[i] as number);
    }
  } else {
    const encoder = new TextEncoder();
    const uint8Buffer = encoder.encode(material);
    for (let i = 0; i < uint8Buffer.length; i++) {
      toSign.push(uint8Buffer[i]);
    }
  }

  return {
    data: toSign,
    type: typeof material,
  };
}

export function convertEncryptionMaterial(
  material: LitSerializable
): LitSerialized<Uint8Array> {
  if (typeof material != 'string') {
    const toEncrypt = [];
    for (let i = 0; i < material.length; i++) {
      toEncrypt.push(material[i] as number);
    }
    const buf = Buffer.from(toEncrypt);

    return {
      data: new Uint8Array(buf),
      type: typeof material,
    };
  } else {
    return {
      data: new Uint8Array(Buffer.from(material)),
      type: typeof material,
    };
  }
}

export async function convertContentMaterial(
  input: any
): Promise<LitSerialized<Uint8Array>> {
  let result: Uint8Array | null = null;

  // (Browser only)
  if (typeof FileList !== 'undefined' && input instanceof FileList) {
    let zip;

    try {
      zip = new JSZip.default();
    } catch (e) {
      zip = new JSZip();
    }

    for (let i = 0; i < input.length; i++) {
      const file = input.item(i);
      if (file) {
        const fileContent = await file.arrayBuffer();
        zip.file(file.name, fileContent);
      }
    }
    result = await zip.generateAsync({ type: 'uint8array' });
  } else if (typeof input === 'string') {
    result = new TextEncoder().encode(input);
  } else if (input instanceof ArrayBuffer) {
    result = new Uint8Array(input);
  } else if (input instanceof Object) {
    const arrayBuffer = await input.arrayBuffer();
    result = new Uint8Array(arrayBuffer);
  } else if (
    input instanceof Int8Array ||
    input instanceof Uint8Array ||
    input instanceof Uint8ClampedArray ||
    input instanceof Int16Array ||
    input instanceof Uint16Array ||
    input instanceof Int32Array ||
    input instanceof Uint32Array ||
    input instanceof Float32Array ||
    input instanceof Float64Array
  ) {
    result = new Uint8Array(input.buffer);
  }

  if (result === null) {
    throw new Error(`Unsupported data type: ${typeof input}`);
  }

  return {
    data: result,
    type: input.constructor.name,
  };
}

export function deserializeFromType(
  type: 'string' | 'file' | 'blob' | 'arraybuffer' | 'uint8array',
  message: Uint8Array
): DeserialisedMessage {
  const buffer = Buffer.from(message);

  switch (type.toLowerCase()) {
    case 'string':
      log.info('message resolved to typeof string');
      return buffer.toString('utf8');
    case 'blob':
      log.info('message resolved to typeof blob');
      return new Blob([buffer]);
    case 'file':
      log.info('message resolved to typeof file');
      return new File([buffer], 'filename');
    case 'arraybuffer':
      log.info('message resolved to typeof arraybuffer');
      return buffer.buffer;
    case 'uint8array':
      log.info('message resolved to typeof uint8array');
      return new Uint8Array(buffer);
  }

  return message;
}

// console.log(getProviderMap()[1]); // Outputs: 'ethwallet'
// console.log(getProviderMap()['ethwallet']); // Outputs: 1
export const getProviderMap = () => {

  enum ProviderType {
    EthWallet = 'ethwallet',
    WebAuthn = 'webauthn',
    Discord = 'discord',
    Google = 'google',
    OTP = 'otp',
    Apple = 'apple',
  }

  interface ProviderMap {
    [key: number]: ProviderType;
  }

  const _providerMap: ProviderMap = {
    1: ProviderType.EthWallet,
    3: ProviderType.WebAuthn,
    4: ProviderType.Discord,
    6: ProviderType.Google,
    7: ProviderType.OTP,
    8: ProviderType.Apple,
    9: ProviderType.OTP,
  };

  const inverseProviderMap = Object.keys(_providerMap).reduce(
    (obj: any, key) => {
      const keyAsNumber = parseInt(key, 10); // Parse key as a number
      obj[_providerMap[keyAsNumber]] = keyAsNumber;
      return obj;
    },
    {}
  );

  return {
    ..._providerMap,
    ...inverseProviderMap,
  };
};

export const mapAuthMethodTypeToString = (authMethodType: number) => {

  console.log("authMethodType:", authMethodType);

  let authMethodName;

  try {
    authMethodName = getProviderMap()[
      authMethodType
    ].toLowerCase() as AuthKeys;

    return authMethodName;

  } catch (e) {
    log.throw('Failed to map auth method type to string:', e);
  }
};

export const getDerivedAddresses = (
  pkppk: string
): {
  btcAddress: string;
  cosmosAddress: string;
} => {
  let pkBuffer;

  if (pkppk.startsWith('0x')) {
    pkppk = pkppk.slice(2);
  }

  pkBuffer = Buffer.from(pkppk, 'hex');

  const btcAddress = p2pkh({
    pubkey: pkBuffer,
  }).address;

  if (!btcAddress) {
    throw new Error('Invalid public key');
  }

  function getCosmosAddress(pubkeyBuffer: Buffer) {
    return toBech32(
      'cosmos',
      rawSecp256k1PubkeyToRawAddress(Secp256k1.compressPubkey(pubkeyBuffer))
    );
  }

  const cosmosAddress = getCosmosAddress(pkBuffer);

  return {
    btcAddress,
    cosmosAddress,
  };
};

export const isGoogleAuth = () => {
  if (isNode()) {
    log.error('isGoogleAuth() is not supported in NodeJS');
    return;
  }

  const url = window.location.href; // gets the current URL
  const parsedURL = new URL(url);

  const params = parsedURL.searchParams;

  // check if all required query parameters are present
  const requiredParams = ['provider', 'id_token', 'state'];
  for (const param of requiredParams) {
    if (!params.has(param)) {
      return false;
    }
  }

  // if we reach here, the url is valid
  return true;
};

export const isDiscordAuth = () => {
  if (isNode()) {
    log.error('isDiscordAuth() is not supported in NodeJS');
    return;
  }

  const url = window.location.href; // gets the current URL
  const parsedURL = new URL(url);

  const params = parsedURL.searchParams;

  // check if all required query parameters are present
  const requiredParams = ['provider', 'access_token', 'state'];
  for (const param of requiredParams) {
    if (!params.has(param)) {
      return false;
    }
  }

  // if we reach here, the url is valid
  return true;
};

export const enableAutoAuth = () => {
  globalThis.Lit.storage?.setItem('lit-auto-auth', 'true');
};

export const iRelayPKPToPKPInfo = (ipkp: IRelayPKP): PKPInfo => {
  const derivedAddresses = getDerivedAddresses(ipkp.publicKey);

  if (!derivedAddresses.btcAddress || !derivedAddresses.cosmosAddress) {
    return log.throw('failed to derive addresses');
  }

  const _PKPInfo: PKPInfo = {
    tokenId: ipkp.tokenId,
    publicKey: ipkp.publicKey,
    ethAddress: ipkp.ethAddress,
    btcAddress: derivedAddresses.btcAddress,
    cosmosAddress: derivedAddresses.cosmosAddress,
  };

  return _PKPInfo;
};

export const relayResToPKPInfo = (response: any): PKPInfo => {
  log.info('response', response);

  if (
    response.status !== 'Succeeded' ||
    !response.pkpPublicKey ||
    !response.pkpTokenId ||
    !response.pkpEthAddress
  ) {
    return log.throw('failed to mint PKP');
  }

  const derivedAddresses = getDerivedAddresses(response.pkpPublicKey);

  if (!derivedAddresses.btcAddress || !derivedAddresses.cosmosAddress) {
    return log.throw('failed to derive addresses');
  }

  const _PKPInfo: PKPInfo = {
    tokenId: response.pkpTokenId,
    publicKey: response.pkpPublicKey,
    ethAddress: response.pkpEthAddress,
    ...derivedAddresses,
  };

  return _PKPInfo;
};

export const prepareEncryptionMetadata = (
  opts: EncryptProps,
  serializedMessage: LitSerialized<Uint8Array>,
  acc: Partial<EncryptRequestBase>
): EncryptionMetadata => {
  let netwokrInfo = globalThis.Lit.nodeClient?.config.litNetwork;
  globalThis.Lit.nodeClient?.connectedNodes;
  let sdkVersion = SDKVersion;

  let metadata = {
    network: netwokrInfo,
    sdkVersion,
    nodeVersion: '1.0.0', // TODO: network request for node version, or parse header from handshake
    chain: opts.chain ?? 'ethereum',
    ...acc,
    messageType: serializedMessage.type,

    // add extra data to metadata
    ...(opts?.extraData ?? {
      extraData: opts.extraData,
    }),
  };

  log('constructed metadata: ', metadata);
  return metadata;
};

export const resolveACCType = (
  acc: AccessControlType
): Partial<EncryptRequestBase> => {
  let condition = acc[0];
  let keys = Object.keys(condition);
  if (keys.includes('pdaKey')) {
    return { solRpcConditions: acc as SolRpcConditions };
  } else if (keys.includes('functionAbi')) {
    return { evmContractConditions: acc as EvmContractConditions };
  } else if (keys.includes('path')) {
    return { unifiedAccessControlConditions: acc };
  } else if (keys.includes('standardContractType')) {
    return { accessControlConditions: acc as AccessControlConditions };
  }

  throw new Error('Could not resolve access control conditions');
};

export const parseDecryptionMaterialFromCache = (cachedMaterial: string) => {
  const cipherAndMetadata = cachedMaterial.split('|');
  if (cipherAndMetadata.length !== 2) {
    throw new Error(
      'Could not parse encryption material, was this encrypted with the GetLit SDK?'
    );
  }

  let cipherAndHash = cipherAndMetadata[0].replace(/\\/g, '');
  let metadata = cipherAndMetadata[1].replace(/\\/g, '');

  cipherAndHash = JSON.parse(cipherAndHash);
  metadata = JSON.parse(metadata);

  return {
    cipherAndHash: cipherAndHash,
    metadata,
  };
};

export const resolveACC = (opts: EncryptProps): any => {
  switch (typeof opts.accessControlConditions) {
    default:
      log.info(typeof opts.accessControlConditions);
  }
  return;
};

export const authKeysPrefixes = [
  'lit-otp-token',
  'lit-discord-token',
  'lit-google-token',
  'lit-webauthn-token',
  'lit-ethwallet-token',
];

export const getStoredAuthMethods = (): Array<LitAuthMethod> => {
  const storedAuthMethods: Array<LitAuthMethod> = [];

  // Iterate through all the keys in storage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Check if the key starts with any of the authKeys
    if (
      key &&
      authKeysPrefixes.some((authKeysPrefixes) =>
        key.startsWith(authKeysPrefixes)
      )
    ) {
      const str = globalThis.Lit.storage?.getExpirableItem(key);

      if (str) {
        try {
          const authMethod = JSON.parse(str) as LitAuthMethod;
          storedAuthMethods.push(authMethod);
        } catch (e) {
          // Handle the error if needed
        }
      }
    }
  }

  return storedAuthMethods;
};

export const getStoredAuthMethodsWithKeys = (): {
  [key: string]: LitAuthMethod;
} => {
  const storedAuthMethods: { [key: string]: LitAuthMethod } = {};

  // Iterate through all the keys in storage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Check if the key starts with any of the authKeys
    if (
      key &&
      authKeysPrefixes.some((authKeysPrefix) => key.startsWith(authKeysPrefix))
    ) {
      const str = globalThis.Lit.storage?.getExpirableItem(key);

      if (str) {
        try {
          const authMethod = JSON.parse(str) as LitAuthMethod;
          storedAuthMethods[key] = authMethod; // Use the storage key as the key of the object
        } catch (e) {
          // Handle the error if needed
        }
      }
    }
  }

  return storedAuthMethods;
};

// "authType" => google, discord, opt, webauthn, ethwallet
export const getSingleAuthDataByType = (authType: AuthKeys): LitAuthMethod => {
  log.info('authType:', authType);

  const storageKey =
    authType === 'ethwallet' ? 'lit-auth-signature' : `lit-${authType}-token`;

  log.info('storageKey:', storageKey);

  let singleAuthData = globalThis.Lit.storage?.getExpirableItem(storageKey);
  log.info('singleAuthData:', singleAuthData);

  if (!singleAuthData) {
    throw new Error(`No auth data found for "${authType}"`);
  }

  try {
    singleAuthData = JSON.parse(singleAuthData);
    log.info('singleAuthData:', singleAuthData);
  } catch (e) {
    throw new Error(`Failed to parse auth data for "${authType}"`);
  }

  log.info('singleAuthData:', singleAuthData);

  return singleAuthData as unknown as LitAuthMethod;
};

export const getStoredEncryptedData = (): Array<EncryptResponse> => {
  log.start('getStoredEncryptedData');

  // get all storage items that start with "lit-encrypted-"
  const encryptedDataKeys = Object.keys(
    globalThis.Lit.storage?.getAllItems() || {}
  ).filter((key) => {
    return key.startsWith('lit-encrypted-');
  });

  const encryptedData = encryptedDataKeys.map((key) => {
    const str = globalThis.Lit.storage?.getItem(key);

    if (!str) {
      log.info("str doesn't exist");
      return undefined;
    }

    try {
      return JSON.parse(str);
    } catch (e) {
      log.info('error parsing str:', e);
      return undefined;
    }
  });

  log.end('getStoredEncryptedData', encryptedData);
  return encryptedData;
};

export const prepareExportableEncryptedData = () => {
  log.start('prepareExportableEncryptedData');

  const encryptedDataKeys = Object.keys(
    globalThis.Lit.storage?.getAllItems() || {}
  ).filter((key) => {
    return key.startsWith('lit-encrypted-');
  });

  const result: { key: string; data: string }[] = [];

  encryptedDataKeys.forEach((key) => {
    const str = globalThis.Lit.storage?.getItem(key);

    if (!str) {
      log.info(`str ${str} doesn't exist`);
      return;
    }

    // turn data to buffer string
    const data = Buffer.from(str).toString('base64');

    result.push({ key, data });
  });

  log.end('prepareExportableEncryptedData', result);
  return result;
};

export const clearAuthMethodSessions = () => {
  log.start('clearAuthMethodSessions');

  // Iterate through all the keys in storage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // If the key starts with any of the authKeys, remove it
    if (
      key &&
      authKeysPrefixes.some((authKeysPrefixes) =>
        key.startsWith(authKeysPrefixes)
      )
    ) {
      globalThis.Lit.storage?.removeItem(key);
    }
  }

  // also remove lit-auth-signature
  globalThis.Lit.storage?.removeItem('lit-auth-signature');

  log.end('clearAuthMethodSessions');
};

/**
 * This function clears all session data that starts with 'lit-session-sigs-'.
 */
export const clearLitSessionItems = () => {
  log.start('clearLitSessionItems');

  // Iterate through all the keys in storage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // If the key starts with 'lit-session-sigs-', remove it
    if (key && key.startsWith('lit-session-sigs-')) {
      globalThis.Lit.storage?.removeItem(key);
    }
  }

  log.end('clearLitSessionItems');
};

export const LitMessages = {
  persistentStorageWarning: `❗️❗️❗️ IMPORTANT ❗️❗️ ❗️
  
Please note that we DO NOT pin your data on IPFS using the Helia client. If you want to pin your data, you can either pin the IPFS hash yourself or use a different persistent storage provider.\n`,
  persistentStorageExample: `Please define a persistent storage provider using when instantiating the Lit SDK

Examples:

// -- Pinata
loadLit.withPersistentStorage({
    provider: 'pinata',
    options: {
      JWT: 'your-jwt-token',
    },
  },
});

// -- Infura
loadLit.withPersistentStorage({
  provider: 'infura',
  options: {
    API_KEY: 'your-api-key',
    API_KEY_SECRET: 'your-api-key-secret',
  },
},
});`,
  OTPProviderExample: `Please define a Stytch OTP provider using when instantiating the Lit SDK
  
  * You can sign up for a Stytch account at https://stytch.com/. Once you have an account,
  * you can find your project ID and secret at https://stytch.com/dashboard/api-keys.
  * See https://i.imgur.com/fR0oRGW.png for how to get these values
 
  Examples:
  
  // -- Stytch (nodejs)
  loadLit.withOTPProvider({
    provider: 'stytch',
    options: {
      projectId: 'your-project-id',
      secret: 'your-secret';
    },
  )

  // -- Stytch (browser)
  loadLit.withOTPProvider({
    provider: 'stytch',
    options: {
      publicToken: '',
    },
  )
  `,
  usageAnalyticsNotice: `
========================================================================\n
NOTICE: We're collecting anonymous usage data to help improve our product.\n
Your privacy is important to us. We only collect data that helps us understand how our product is being used.\n
None of the collected data can be used to identify you, and we do not share the data with any third parties.\n
If you'd like to opt out of data collection, you can do so by setting the 'collectAnalytics' parameter to 'false' when calling the 'loadLit' function.\n
For example: loadLit({ debug: true, collectAnalytics: false })\n
Thank you for helping us improve our product!\n
========================================================================`,
};

/**
 * Waits for the 'ready' event to be emitted before resolving.
 *
 * @returns {Promise<void>}
 */
export async function waitForLit(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!globalThis.Lit.eventEmitter) {
      return reject(new Error('Emitter is not initialized.'));
    }

    // If already ready, resolve immediately
    if (globalThis.Lit && globalThis.Lit.ready) {
      return resolve();
    }

    const handleReady = (isReady: boolean) => {
      if (isReady) {
        resolve();
      }
    };

    // Listen for 'ready' event
    globalThis.Lit.eventEmitter.on('ready', handleReady);
  });
}

/**
 * Use stored auth methods/data if found
 * If no auth data is provided, it will attempt to get it from the browser.
 * If no auth data is provided and it is not in the browser, it will throw an error.
 * @param fn
 */
export const useStoredAuthMethodsIfFound = (opts?: {
  authMethods?: Array<LitAuthMethod>;
}): any => {

  let authMethods: Array<LitAuthMethod> | undefined = opts?.authMethods;

  if (!authMethods) {
    if (isBrowser()) {
      log.info('getting auth data from browser');
      authMethods = getStoredAuthMethods();
      log.info('auth data from browser', authMethods);

      if (authMethods.length <= 0) {
        throw new Error('no auth data provided in browser');
      }
    } else {
      throw new Error('no auth data provided in nodejs');
    }
  }

  return authMethods;
}

export function isSessionSigs(obj: any): obj is SessionSigs {
  if (typeof obj !== 'object' || obj === null) return false;

  for (let key in obj) {
    if (!isSessionSig(obj[key])) return false;
  }

  return true;
}

export function isSessionSig(obj: any): obj is SessionSig {
  return (
    obj &&
    typeof obj.sig === 'string' &&
    typeof obj.derivedVia === 'string' &&
    typeof obj.signedMessage === 'string' &&
    typeof obj.address === 'string' &&
    (typeof obj.algo === 'string' || obj.algo === undefined)
  );
}

export function isAuthSig(obj: any): obj is SessionSig {
  return (
    obj &&
    typeof obj.sig === 'string' &&
    typeof obj.derivedVia === 'string' &&
    typeof obj.signedMessage === 'string' &&
    typeof obj.address === 'string'
  )
}