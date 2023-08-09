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
} from '@lit-protocol/types';

const version = '0.0.544';
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
    throw new Error(`Invalid operation ID: ${operationId}`);
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

  if (typeof input === 'string') {
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
    Otp = 'otp',
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
    7: ProviderType.Otp,
    8: ProviderType.Apple,
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
  const authMethodName = getProviderMap()[
    authMethodType
  ].toLowerCase() as AuthKeys;

  return authMethodName;
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
  'lit-opt-token',
  'lit-discord-token',
  'lit-google-token',
  'lit-webauthn-token',
  'lit-ethwallet-token',
];

export const getStoredAuthData = (): Array<LitAuthMethod> => {
  const storedAuthData: Array<LitAuthMethod> = [];

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
          storedAuthData.push(authMethod);
        } catch (e) {
          // Handle the error if needed
        }
      }
    }
  }

  return storedAuthData;
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

export const clearSessions = () => {
  log.start('clearSessions');

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

  log.end('clearSessions');
};

export const LitMessages = {
  persistentStorageWarning: `❗️❗️❗️ IMPORTANT ❗️❗️ ❗️
  
Please note that we DO NOT pin your data on IPFS using the Helia client. If you want to pin your data, you can either pin the IPFS hash yourself or use a different persistent storage provider.\n`,
  persistentStorageExample: `Please define a persistent storage provider using when instantiating the Lit SDK

Examples:

// -- Pinata
loadLit({
  persistentStorage: {
    provider: 'pinata',
    options: {
      JWT: 'your-jwt-token',
    },
  },
});

// -- Infura
loadLit({
  persistentStorage: {
    provider: 'infura',
    options: {
      API_KEY: 'your-api-key',
      API_KEY_SECRET: 'your-api-key-secret',
    },
  },
});`,
};

/**
 * Waits for the 'ready' event to be emitted before resolving.
 *
 * @returns {Promise<void>}
 */
export async function waitForReadyEvent(): Promise<void> {
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
