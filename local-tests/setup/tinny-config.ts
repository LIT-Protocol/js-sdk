import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContractResolverContext } from '@lit-protocol/types';

export enum LIT_TESTNET {
  LOCALCHAIN = 'localchain',
  MANZANO = 'manzano',
  CAYENNE = 'cayenne',
  DATIL_DEV = 'datil-dev',
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
   * - `LIT_TESTNET.DATIL_DEV`
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
  contractContext?: LitContractResolverContext;
}
