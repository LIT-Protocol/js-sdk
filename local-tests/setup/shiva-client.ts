export interface ShivaEnvs {
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

export class TestnetClient {
  private _id: string;
  private _info: any;
  private _processEnvs: ShivaEnvs;
  private _currentState: string;

  constructor(id: string, envs: ShivaEnvs) {
    this._processEnvs = envs;
    this._id = id;
  }

  /**
   * Polls a given testnet for the ACTIVE state
   * polls on a 500 milisecond interval
   */
  public async pollTestnetForActive() {
    let state = 'Busy';
    while (state != 'Active') {
      const pollRes = await fetch(
        this._processEnvs.TESTNET_MANAGER_URL + '/test/poll/testnet/' + this._id
      );
      const res = await pollRes.json();
      state = res.body;
      console.log('found state to be', res);
      if (state != 'Active') {
        await new Promise<void>((res, _) => {
          setTimeout(() => {
            res();
          }, 500);
        });
      }
    }
  }

  /**
   * returns the config for a given testnet
   * struct reference for config
   * pub struct TestNetInfo {
      pub contract_addresses: ContractAddresses,
      pub validator_addresses: Vec<String>,
      pub epoch_length: i32,
    }
   */
  public getTestnetConfig() {
    return fetch(
      this._processEnvs.TESTNET_MANAGER_URL +
        '/test/get/info/testnet/' +
        this._id
    )
      .then((res: Response) => {
        return res.json();
      })
      .then((info: any) => {
        this._info = info.body;
        this._currentState = info.lastStateObserved;
        console.log('setting testnet info: ', this._info);
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
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((body: any) => {
        console.log('Stopped random peer: ', body);
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
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((body: any) => {
        console.log('validator kick response: ', body);
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
        return res.json();
      })
      .then((body: any) => {
        console.log('shutdown respone: ', body);
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
      `./../../../lit-assets/rust/lit-node/target/debug/lit_node`,
    LIT_ACTION_BINARY_PATH:
      process.env['LIT_ACTION_BINARY_PATH'] ||
      `./../../../lit-assets/rust/lit-actions/target/debug/lit_actions`,
  };

  constructor() {
    this._clients = new Map();
  }

  /**
     * Used to start an instance of a lit network through the Lit Testnet Manager
     * if an isntance exists, we will just take it as we optimistically assume it will not be shut down in the test life time.
     * If an instance does not exist then we create one
     * struct reference
        pub struct TestNetCreateRequest {
        pub node_count: usize,
        pub polling_interval: String,
        pub epoch_length: i32,
        pub custom_build_path: Option<String>,
        pub lit_action_server_custom_build_path: Option<String>,
        pub existing_config_path: Option<String>,
        pub which: Option<String>,
        pub ecdsa_round_timeout: Option<String>,
        pub enable_rate_limiting: Option<String>,
       }
   */
  async startTestnetManager(): Promise<TestnetClient> {
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
      let body: Record<string, any> = {
        nodeCount: 6,
        pollingInterval: '2000',
        epochLength: 100,
      };

      if (this.processEnvs.USE_LIT_BINARIES) {
        body.customBuildPath = this.processEnvs.LIT_NODE_BINARY_PATH;
        body.litActionServerCustomBuildPath =
          this.processEnvs.LIT_ACTION_BINARY_PATH;
      }
      console.log('Testnet create args: ', body);
      const createTestnetResp = await fetch(
        this.processEnvs.TESTNET_MANAGER_URL + '/test/create/testnet',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const createTestnet = await createTestnetResp.json();
      this._clients.set(
        createTestnet.testnetId,
        new TestnetClient(createTestnet.testnetId, this.processEnvs)
      );

      return this._clients.get(createTestnet.testnetId);
    }
  }
}
