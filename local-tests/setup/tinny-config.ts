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

  /**
   * Ignore setup steps. Usually when you run to quickly run a single test.
   */
  NO_SETUP: boolean;

  /**
   * If runnnig no localchain this flag will stop the running testnet when the test
   * run has finished. Which is when all pending task promises have settled.
   */
  STOP_TESTNET: boolean;

  /**
   * url for Testnet manager intigration
   */
  TESTNET_MANAGER_URL: string;

  /**
   * Path to the Lit Node Binary to use,
   * if flagging to not use the binary path this option will be ignored.
   * see {@link USE_LIT_NODE_BINARY}
   */
  LIT_NODE_BINARY_PATH: string;

  /**
   * Path to lit action binary to use,
   * if flagging not to use the binary path this option will be ignored
   *
   */
  LIT_ACTION_BINARY_PATH: string;

  /**
   * Flag to indicate if the provided binary path should be used
   * or if the testnet should be built from source before starting.
   */
  USE_LIT_BINARIES: boolean;
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
