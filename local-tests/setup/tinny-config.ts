import { LIT_NETWORK_VALUES } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContractResolverContext } from '@lit-protocol/types';

/**
 * Represents the configuration options for the process environment.
 */
export interface ProcessEnvs {
  /**
   * Each test is executed in a loop with a maximum number of attempts specified by `devEnv.processEnvs.MAX_ATTEMPTS`.
   */
  MAX_ATTEMPTS: number;

  /**
   * The maximum number of milliseconds to wait for a test to complete.
   */
  TEST_TIMEOUT: number;

  /**
   * The network to use for testing. This can be one of the following:
   * - `LIT_NETWORK.Custom`
   * - `LIT_NETWORK.DatilDev`
   */
  NETWORK: LIT_NETWORK_VALUES;

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
   * The URL of Lit RPC server.
   * - If it's running locally on Anvil, it should be 'http://127.0.0.1:8545'
   * - If it's running on Chronicle, it should be 'https://chain-rpc.litprotocol.com/http'
   * - If it's running on Yellowstone, it should be 'https://yellowstone-rpc.litprotocol.com'
   */
  LIT_RPC_URL: string;

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
   * Use shiva as a test network which will spawn before the test run starts
   */
  USE_SHIVA: boolean;

  /**
   * The network configuration which will be used for `contract context` if provided.
   * it is assumed the context will work with the {@link NETWORK} provided. If the configuration
   * is not for the provided network then there could be undefined behavior.
   * If {@link USE_SHIVA} is set to true then the network configuration will be loaded implicitly and
   * this value will be ignored
   */
  NETWORK_CONFIG: string;

  /**
   * Max prices to be sent to nodes -- an array of strings that will be parsed as bigints
   * in order of PRODUCT_ID's values -- DECRYPTION, SIGN, LIT_ACTION
   */
  DEFAULT_MAX_PRICES: bigint[];
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
  network: LIT_NETWORK_VALUES;
  processEnvs: ProcessEnvs;
  contractContext?: LitContractResolverContext;
}
