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
      const pollRes = await fetch(
        this._processEnvs.TESTNET_MANAGER_URL + '/test/poll/testnet/' + this._id
      );
      const res: TestNetResponse<TestNetState> = await pollRes.json();
      if (pollRes.status != 200) {
        throw new ShivaError(res); // throw the response as an error
      }
      state = res.body;
      console.log('found state to be', res);

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
  public getTestnetConfig() {
    return fetch(
      this._processEnvs.TESTNET_MANAGER_URL +
        '/test/get/info/testnet/' +
        this._id
    )
      .then((res: Response) => {
        if (res.status === 200 || res.status === 500) {
          return res.json();
        } else {
          return res.text();
        }
      })
      .then((res: TestNetResponse<boolean>) => {
        // if we find the type of the eror is not an object we throw wrapped in a geenric error type
        if (typeof res === 'string') {
          throw new Error(res);
        }
        if (res.errors != null) {
          throw new ShivaError(res);
        }
        console.log('Stopped random peer: ', res);
      });
  }

  /**
   * Will wait for the NEXT epoch and return a resposne when the epoch has fully transitioned.
   * The return time is directly proportional to the epoch transition time config and where the network is with the current epoch.
   */
  public transitionEpochAndWait() {
    return fetch(
      this._processEnvs.TESTNET_MANAGER_URL +
        '/test/action/transition/epoch/wait/' +
        this._id
    )
      .then((res: Response) => {
        if (res.status === 200 || res.status === 500) {
          return res.json();
        } else {
          return res.text();
        }
      })
      .then((res: TestNetResponse<boolean>) => {
        // if we find the type of the eror is not an object we throw wrapped in a geenric error type
        if (typeof res === 'string') {
          throw new Error(res);
        }
        if (res.errors != null) {
          throw new ShivaError(res);
        }
        console.log('Stopped random peer: ', res);
      });
  }

  /**
   * Stops a random peer and waits for the next epoc to transiton.
   * The return time is directly proportional to the epoch transition time config and where the network is with the current epoch.
   */
  public stopRandomNetworkPeerAndWaitForNextEpoch() {
    return fetch(
      this._processEnvs.TESTNET_MANAGER_URL +
        '/test/action/stop/random/wait/' +
        this._id
    )
      .then((res: Response) => {
        if (res.status === 200 || res.status === 500) {
          return res.json();
        } else {
          return res.text();
        }
      })
      .then((res: TestNetResponse<boolean>) => {
        // if we find the type of the eror is not an object we throw wrapped in a geenric error type
        if (typeof res === 'string') {
          throw new Error(res);
        }
        if (res.errors != null) {
          throw new ShivaError(res);
        }
        console.log('Stopped random peer: ', res);
      });
  }

  /*
    Stops the testnet
  */
  public stopTestnet() {
    console.log('stopping testnet with id:', this._id);
    return fetch(
      this._processEnvs.TESTNET_MANAGER_URL + '/test/delete/testnet/' + this._id
    )
      .then((res: Response) => {
        if (res.status === 200) {
          return res.json();
        } else {
          return res.text();
        }
      })
      .then((res: TestNetResponse<boolean>) => {
        // if we find the type of the eror is not an object we throw wrapped in a geenric error type
        if (typeof res === 'string') {
          throw new Error(res);
        }
        if (res.errors != null) {
          throw new ShivaError(res);
        }
        console.log('Stopped random peer: ', res);
      });
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

      let createTestnet: TestNetResponse<void>;
      try {
        createTestnet =
          (await createTestnetResp.json()) as TestNetResponse<void>;
      } catch (err) {
        let message = await createTestnetResp.text();
        console.error('Error while creating testnet instance:', message);
        throw new Error(message);
      }
      // if we get a 500 status and the JSON parsed we know that we should
      if (createTestnetResp.status === 500) {
        throw new ShivaError(createTestnet); // throw the object as an error if the status was not 200 and we could parse as JSON
      }

      this._clients.set(
        createTestnet.testnetId,
        new TestnetClient(createTestnet.testnetId, this.processEnvs)
      );

      return this._clients.get(createTestnet.testnetId);
    }
  }
}
