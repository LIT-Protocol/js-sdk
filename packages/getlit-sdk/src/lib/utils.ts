import { ProviderType, version as SDKVersion } from '@lit-protocol/constants';
import { LitSerializable, LitSerialized, PKPInfo } from './types';
import { p2pkh } from 'bitcoinjs-lib/src/payments/p2pkh';
import { toBech32 } from '@cosmjs/encoding';
import { Secp256k1 } from '@cosmjs/crypto';
import { rawSecp256k1PubkeyToRawAddress } from '@cosmjs/amino';
import { AccessControlConditions } from '@lit-protocol/types';

const version = '0.0.138';
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

  if (globalThis?.Lit.debug !== true) {
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
  localStorage.setItem('lit-auto-auth', 'true');
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
  message: LitSerialized<Uint8Array>,
  chain: string,
  acc: AccessControlConditions
) => {
  let netwokrInfo = globalThis.Lit.nodeClient?.config.litNetwork;
  globalThis.Lit.nodeClient?.connectedNodes;
  let sdkVersion = SDKVersion;

  let metadata = {
    network: netwokrInfo,
    sdkVersion,
    nodeVersion: '1.0.0', // TODO: network request for node version, or parse header from hand shake requests.,
    chain,
    accessControlConditions: acc
  };

  log('constructed metadata: ', metadata);
  return metadata;
};
