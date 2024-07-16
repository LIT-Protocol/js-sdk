import { LitContractResolverContext } from '@lit-protocol/types';
import { ethers } from 'ethers';
import {
  TestNetCreateRequest,
  TestNetInfo,
  TestNetResponse,
  TestNetState,
} from './shiva-client.d';

class ShivaError extends Error {
  constructor(shivaResponse: TestNetResponse<any>) {
    let message = `An error occurred on request to testnet with id: ${shivaResponse.testnetId}`;
    for (const error of shivaResponse.errors) {
      message += ' ' + error;
    }

    super(message);
    this.name = 'ShivaError';
    this.message = message;
  }
}

export interface ShivaEnvs {
  /**
   * If runnnig no localchain this flag will stop the running testnet when the test
   * run has finished. Which is when all pending task promises have settled.
   */
  STOP_TESTNET: boolean;

  /**
   * URL for Testnet manager intigration
   */
  TESTNET_MANAGER_URL: string;

  /**
   * Path to the Lit Node Binary to use. Can be configured through an env variable
   * LIT_NODE_BINARY_PATH where the value is the local path to a built Lit Action Binary
   * If flagging to not use the binary path this option will be ignored.
   * See {@link USE_LIT_BINARIES} and {@link LIT_ACTION_BINARY_PATH}
   */
  LIT_NODE_BINARY_PATH: string;

  /**
   * Path to lit action binary to use, Can be defined through env variable
   * LIT_ACTION_BINARY_PATH where the value is the local path to a built Lit Action Binary.
   * If flagging not to use the binary path this option will be ignored
   * See {@link USE_LIT_BINARIES} and {@link LIT_NODE_BINARY_PATH}
   */
  LIT_ACTION_BINARY_PATH: string;

  /**
   * Flag to indicate if the provided binary path should be used
   * or if the testnet should be built from source before starting.
   */
  USE_LIT_BINARIES: boolean;
}

/**
 * Client implementation for a single testnet instance managed by the Shiva tool
 * Is essentially a localchain setup but allows for programmatic operations to be performed
 * on the network from the implementation within this class. Each testnet is a unique network
 */
export class TestnetClient {
  private _id: string;
  private _info: TestNetInfo;
  private _processEnvs: ShivaEnvs;
  private _currentState: TestNetState;

  constructor(id: string, envs: ShivaEnvs) {
    this._processEnvs = envs;
    this._id = id;
  }

  /**
    Returns info on a given testnet instance
    if information cannot be accessed we retured undefined
    @returns TestNetInfo | undefined
  */
  get Info(): TestNetInfo | undefined {
    return this._info;
  }

  get ContractContext(): LitContractResolverContext | undefined {
    const testNetConfig = this.Info;
    if (!testNetConfig) {
      return undefined;
    }

    const contractResolverAbi: string = testNetConfig.contractResolverAbi;
    const contractResolverAddress =
      testNetConfig.contractAddresses[`contractResolver`];
    const networkContext = {
      abi: JSON.parse(contractResolverAbi),
      resolverAddress: contractResolverAddress,
      provider: new ethers.providers.JsonRpcProvider(
        `http://${testNetConfig.rpcUrl}`
      ),
      environment: 0, // test deployment uses env value 0 in test common
    };
    return networkContext;
  }

  /**
   * Polls a given testnet for the ACTIVE state
   * polls on a 500 milisecond interval
   */
  public async pollTestnetForActive(): Promise<string> {
    let state = 'Busy';
    while (state != 'Active' && state != `UNKNOWN`) {
      const res = await fetch(
        this._processEnvs.TESTNET_MANAGER_URL + '/test/poll/testnet/' + this._id
      );
      const stateRes: TestNetResponse<TestNetState> =
        await _processTestnetResponse<TestNetState>(res);
      state = stateRes.body;
      console.log('found state to be', state);

      await new Promise<void>((res, _) => {
        setTimeout(() => {
          res();
        }, 500);
      });
    }

    return state;
  }

  /**
   * Returns the config for a given testnet
   */
  public async getTestnetConfig() {
    const res = await fetch(
      this._processEnvs.TESTNET_MANAGER_URL +
        '/test/get/info/testnet/' +
        this._id
    );

    return _processTestnetResponse<boolean>(res);
  }

  /**
   * Will wait for the NEXT epoch and return a resposne when the epoch has fully transitioned.
   * The return time is directly proportional to the epoch transition time config and where the network is with the current epoch.
   */
  public async transitionEpochAndWait() {
    const res = await fetch(
      this._processEnvs.TESTNET_MANAGER_URL +
        '/test/action/transition/epoch/wait/' +
        this._id
    );

    let transitionEpochAndWaitRes = _processTestnetResponse<boolean>(res);

    return transitionEpochAndWaitRes;
  }

  /**
   * Stops a random peer and waits for the next epoc to transiton.
   * The return time is directly proportional to the epoch transition time config and where the network is with the current epoch.
   */
  public async stopRandomNetworkPeerAndWaitForNextEpoch() {
    const res = await fetch(
      this._processEnvs.TESTNET_MANAGER_URL +
        '/test/action/stop/random/wait/' +
        this._id
    );

    return _processTestnetResponse<boolean>(res);
  }

  /*
    Stops the testnet
  */
  public async stopTestnet() {
    console.log('stopping testnet with id:', this._id);
    const res = await fetch(
      this._processEnvs.TESTNET_MANAGER_URL + '/test/delete/testnet/' + this._id
    );

    return _processTestnetResponse<boolean>(res);
  }
}

export class ShivaClient {
  private _clients: Map<string, TestnetClient>;
  public processEnvs: ShivaEnvs = {
    STOP_TESTNET: process.env[`STOP_TESTNET`] === 'true',
    TESTNET_MANAGER_URL:
      process.env['TESTNET_MANAGER_URL'] || 'http://0.0.0.0:8000',
    USE_LIT_BINARIES: process.env[`USE_LIT_BINARIES`] === `true`,
    LIT_NODE_BINARY_PATH:
      process.env['LIT_NODE_BINARY_PATH'] ||
      `./../../lit-assets/rust/lit-node/target/debug/lit_node`,
    LIT_ACTION_BINARY_PATH:
      process.env['LIT_ACTION_BINARY_PATH'] ||
      `./../../lit-assets/rust/lit-actions/target/debug/lit_actions`,
  };

  constructor() {
    this._clients = new Map();
    console.log('Shiva environment loaded current config: ', this.processEnvs);
  }

  /**
   * Used to start an instance of a lit network through the Lit Testnet Manager
   * if an instance exists, we will just take it as we optimistically assume it will not be shut down in the test life time.
   * If an instance does not exist then we create one
   */
  async startTestnetManager(
    createReq?: TestNetCreateRequest
  ): Promise<TestnetClient> {
    const existingTestnetResp = await fetch(
      this.processEnvs.TESTNET_MANAGER_URL + '/test/get/testnets'
    );
    const existingTestnets: string[] = await existingTestnetResp.json();
    if (existingTestnets.length > 0) {
      this._clients.set(
        existingTestnets[0],
        new TestnetClient(existingTestnets[0], this.processEnvs)
      );
      return this._clients.get(existingTestnets[0]);
    } else {
      console.log(
        'lit node binary path: ',
        this.processEnvs.LIT_NODE_BINARY_PATH
      );
      console.log(
        'lit action server binary path: ',
        this.processEnvs.LIT_ACTION_BINARY_PATH
      );
      let body: Partial<TestNetCreateRequest> = createReq ?? {
        nodeCount: 3,
        pollingInterval: '2000',
        epochLength: 100,
      };

      if (this.processEnvs.USE_LIT_BINARIES) {
        body.customBuildPath = this.processEnvs.LIT_NODE_BINARY_PATH;
        body.litActionServerCustomBuildPath =
          this.processEnvs.LIT_ACTION_BINARY_PATH;
      }
      console.log('Testnet create args: ', body);
      const createTestnetResp: Response = await fetch(
        this.processEnvs.TESTNET_MANAGER_URL + '/test/create/testnet',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const createTestnet = await _processTestnetResponse<void>(
        createTestnetResp
      );

      this._clients.set(
        createTestnet.testnetId,
        new TestnetClient(createTestnet.testnetId, this.processEnvs)
      );

      return this._clients.get(createTestnet.testnetId);
    }
  }
}

async function _processTestnetResponse<T>(
  response: Response
): Promise<TestNetResponse<T>> {
  let createTestnet: TestNetResponse<T>;
  try {
    createTestnet = (await response.json()) as TestNetResponse<T>;
  } catch (err) {
    let message = await response.text();
    throw new Error('Error while performing testnet request: ' + message);
  }

  // if we get a 500 status and the JSON parsed we know that we should
  // throw the custom error type
  if (response.status === 500) {
    throw new ShivaError(createTestnet);
  }

  return createTestnet;
}
