import { ethers } from 'ethers';
class ShivaError extends Error {
    constructor(shivaResponse) {
        let message = `An error occurred on request to testnet with id: ${shivaResponse.testnetId}`;
        for (const error of shivaResponse.errors) {
            message += ' ' + error;
        }
        super(message);
        this.name = 'ShivaError';
        this.message = message;
    }
}
/**
 * Client implementation for a single testnet instance managed by the Shiva tool
 * Is essentially a local chain setup but allows for programmatic operations to be performed
 * on the network from the implementation within this class. Each testnet is a unique network
 */
export class TestnetClient {
    constructor(id, envs) {
        this._processEnvs = envs;
        this._id = id;
    }
    /**
      Returns info on a given testnet instance
      if information cannot be accessed we retured undefined
      @returns TestNetInfo | undefined
    */
    get Info() {
        return this._info;
    }
    get ContractContext() {
        const testNetConfig = this.Info;
        if (!testNetConfig) {
            return undefined;
        }
        const contractResolverAbi = testNetConfig.contractResolverAbi;
        const contractResolverAddress = testNetConfig.contractAddresses[`contractResolver`];
        const networkContext = {
            abi: JSON.parse(contractResolverAbi),
            resolverAddress: contractResolverAddress,
            provider: new ethers.providers.StaticJsonRpcProvider({
                url: `http://${testNetConfig.rpcUrl}`,
                skipFetchSetup: true,
            }),
            environment: 0, // test deployment uses env value 0 in test common
            contractContext: {
                Allowlist: {},
                Multisender: {},
                Staking: {
                    abi: JSON.parse(testNetConfig.contractAbis.staking),
                },
                StakingBalances: {
                    abi: JSON.parse(testNetConfig.contractAbis.stakingBalances),
                },
                PKPNFT: {
                    abi: JSON.parse(testNetConfig.contractAbis.pkpnft),
                },
                PKPPermissions: {
                    abi: JSON.parse(testNetConfig.contractAbis.pkpPermissions),
                },
                PKPHelper: {
                    abi: JSON.parse(testNetConfig.contractAbis.pkpHelper),
                },
                LITToken: {
                    abi: JSON.parse(testNetConfig.contractAbis.litToken),
                },
                PKPNFTMetadata: {},
                RateLimitNFT: {},
                PubkeyRouter: {},
            },
        };
        return networkContext;
    }
    /**
     * Polls a given testnet for the ACTIVE state
     * polls on a 500 milisecond interval
     */
    async pollTestnetForActive() {
        let state = 'Busy';
        while (state != 'Active' && state != `UNKNOWN`) {
            const res = await fetch(this._processEnvs.TESTNET_MANAGER_URL + '/test/poll/testnet/' + this._id);
            const stateRes = await _processTestnetResponse(res);
            state = stateRes.body;
            console.log('found state to be', state);
            await new Promise((res, _) => {
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
    async getTestnetConfig() {
        const res = await fetch(this._processEnvs.TESTNET_MANAGER_URL +
            '/test/get/info/testnet/' +
            this._id);
        const testnetInfoRes = await _processTestnetResponse(res);
        this._info = testnetInfoRes.body;
        return testnetInfoRes;
    }
    /**
     * Will wait for the NEXT epoch and return a resposne when the epoch has fully transitioned.
     * The return time is directly proportional to the epoch transition time config and where the network is with the current epoch.
     */
    async transitionEpochAndWait() {
        const res = await fetch(this._processEnvs.TESTNET_MANAGER_URL +
            '/test/action/transition/epoch/wait/' +
            this._id);
        let transitionEpochAndWaitRes = _processTestnetResponse(res);
        return transitionEpochAndWaitRes;
    }
    /**
     * Stops a random peer and waits for the next epoc to transiton.
     * The return time is directly proportional to the epoch transition time config and where the network is with the current epoch.
     */
    async stopRandomNetworkPeerAndWaitForNextEpoch() {
        const res = await fetch(this._processEnvs.TESTNET_MANAGER_URL +
            '/test/action/stop/random/wait/' +
            this._id);
        return _processTestnetResponse(res);
    }
    /*
      Stops the testnet
    */
    async stopTestnet() {
        console.log('stopping testnet with id:', this._id);
        const res = await fetch(this._processEnvs.TESTNET_MANAGER_URL + '/test/delete/testnet/' + this._id);
        return _processTestnetResponse(res);
    }
}
export class ShivaClient {
    constructor() {
        this.processEnvs = {
            STOP_TESTNET: process.env[`STOP_TESTNET`] === 'true',
            TESTNET_MANAGER_URL: process.env['TESTNET_MANAGER_URL'] || 'http://0.0.0.0:8000',
            USE_LIT_BINARIES: process.env[`USE_LIT_BINARIES`] === `true`,
            LIT_NODE_BINARY_PATH: process.env['LIT_NODE_BINARY_PATH'] ||
                `./../../lit-assets/rust/lit-node/target/debug/lit_node`,
            LIT_ACTION_BINARY_PATH: process.env['LIT_ACTION_BINARY_PATH'] ||
                `./../../lit-assets/rust/lit-actions/target/debug/lit_actions`,
        };
        this._clients = new Map();
        console.log('Shiva environment loaded current config: ', this.processEnvs);
    }
    /**
     * Used to start an instance of a lit network through the Lit Testnet Manager
     * if an instance exists, we will just take it as we optimistically assume it will not be shut down in the test life time.
     * If an instance does not exist then we create one
     */
    async startTestnetManager(createReq) {
        const existingTestnetResp = await fetch(this.processEnvs.TESTNET_MANAGER_URL + '/test/get/testnets');
        const existingTestnets = await existingTestnetResp.json();
        if (existingTestnets.length > 0) {
            this._clients.set(existingTestnets[0], new TestnetClient(existingTestnets[0], this.processEnvs));
            return this._clients.get(existingTestnets[0]);
        }
        else {
            console.log('lit node binary path: ', this.processEnvs.LIT_NODE_BINARY_PATH);
            console.log('lit action server binary path: ', this.processEnvs.LIT_ACTION_BINARY_PATH);
            let body = createReq ?? {
                nodeCount: 3,
                pollingInterval: '2000',
                epochLength: 90000,
            };
            if (this.processEnvs.USE_LIT_BINARIES) {
                body.customBuildPath = this.processEnvs.LIT_NODE_BINARY_PATH;
                body.litActionServerCustomBuildPath =
                    this.processEnvs.LIT_ACTION_BINARY_PATH;
            }
            console.log('Testnet create args: ', body);
            const createTestnetResp = await fetch(this.processEnvs.TESTNET_MANAGER_URL + '/test/create/testnet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const createTestnet = await _processTestnetResponse(createTestnetResp);
            this._clients.set(createTestnet.testnetId, new TestnetClient(createTestnet.testnetId, this.processEnvs));
            return this._clients.get(createTestnet.testnetId);
        }
    }
}
async function _processTestnetResponse(response) {
    let createTestnet;
    try {
        createTestnet = (await response.json());
    }
    catch (err) {
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
//# sourceMappingURL=shiva-client.js.map