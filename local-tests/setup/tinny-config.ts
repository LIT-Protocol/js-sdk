import { LitNodeClient } from '@lit-protocol/lit-node-client';

export enum LIT_TESTNET {
  LOCALCHAIN = 'localchain',
  MANZANO = 'manzano',
  CAYENNE = 'cayenne',
}

export interface ProcessEnvs {
  /**
   * Each test is executed in a loop with a maximum number of attempts specified by `devEnv.processEnvs.MAX_ATTEMPTS`.
   */
  MAX_ATTEMPTS: number;

  /**
   * The network to use for testing. This can be one of the following:
   * - `LIT_TESTNET.LOCALCHAIN`
   * - `LIT_TESTNET.MANZANO`
   * - `LIT_TESTNET.CAYENNE`
   */
  NETWORK: LIT_TESTNET;

  /**
   * The number of milliseconds to wait between each request.
   */
  DEBUG: boolean;

  /**
   * Capacity Credits: In order to execute a transaction with Lit, you’ll need to reserve capacity on the network using Capacity Credits. These allow holders to reserve a set number of requests over a desired period of time (by default expiration set to 2 days)
   */
  REQUEST_PER_KILOSECOND: number;

  /**
   * Wait time in milliseconds if no private keys are available.
   */
  WAIT_FOR_KEY_INTERVAL: number;

  /**
   * Time to wait before releasing the key after requesting it.
   */
  TIME_TO_RELEASE_KEY: number;

  /**
   * Run all the tests in a single thread.
   */
  RUN_IN_BAND: boolean;

  /**
   * The interval in milliseconds to run the tests in a single thread.
   */
  RUN_IN_BAND_INTERVAL: number;

  // =========== In most cases you won't need to change the following values ===========
  /**
   * The URL of Lit RPC server. If it's running locally on Anvil, it should be 'http://127.0.0.1:8545'
   */
  LIT_RPC_URL: string;

  /**
   * The URL of the official Lit RPC server. Usually 'https://chain-rpc.litprotocol.com/http' but can be changed if needed
   */
  LIT_OFFICIAL_RPC: string;

  /**
   * This is usually used when you're running tests locally depending how many nodes you are running.
   */
  BOOTSTRAP_URLS: string[];

  /**
   * The list of private keys to use for testing.
   */
  PRIVATE_KEYS: string[];

  /**
   * The list of keys that are currently in use.
   */
  KEY_IN_USE: boolean[];
}

/**
 * Represents the PKP information.
 */
export type PKPInfo = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
};

export interface TinnyEnvConfig {
  rpc: string;
  litNodeClient: LitNodeClient;
  network: LIT_TESTNET;
  processEnvs: ProcessEnvs;
}

export enum LIT_ENDPOINT_VERSION {
  LEGACY = '/',
  V1 = '/v1',
}

export const LIT_ENDPOINT = {
  HANDSHAKE: {
    path: '/web/handshake',
    version: LIT_ENDPOINT_VERSION.LEGACY,
    envName: 'HANDSHAKE',
  },
  SIGN_SESSION_KEY: {
    path: '/web/sign_session_key',
    // version: LIT_ENDPOINT_VERSION.V1,
    version: LIT_ENDPOINT_VERSION.LEGACY,
    envName: 'SIGN_SESSION_KEY',
  },
  EXECUTE_JS: {
    path: '/web/execute',
    // version: LIT_ENDPOINT_VERSION.V1,
    version: LIT_ENDPOINT_VERSION.LEGACY,
    envName: 'EXECUTE_JS',
  },
  PKP_SIGN: {
    path: '/web/pkp/sign',
    // version: LIT_ENDPOINT_VERSION.V1,
    version: LIT_ENDPOINT_VERSION.LEGACY,
    envName: 'PKP_SIGN',
  },
  PKP_CLAIM: {
    path: '/web/pkp/claim',
    version: LIT_ENDPOINT_VERSION.LEGACY,
    envName: 'PKP_CLAIM',
  },
  SIGN_ACCS: {
    path: '/web/signing/access_control_condition',
    version: LIT_ENDPOINT_VERSION.LEGACY,
    envName: 'SIGN_ACCS',
  },
  ENCRYPTION_SIGN: {
    path: '/web/encryption/sign',
    version: LIT_ENDPOINT_VERSION.LEGACY,
    envName: 'ENCRYPTION_SIGN',
  },
  SIGN_ECDSA: {
    path: '/web/signing/signConditionEcdsa',
    version: LIT_ENDPOINT_VERSION.LEGACY,
    envName: 'SIGN_ECDSA',
  },
};
