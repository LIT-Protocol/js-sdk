import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_NETWORK, PersonEnvs, SetupEnvs } from './tinny-config';
import { TinnyEnvironment } from './tinny-environment';
import { TinnyPerson } from './tinny-person';
export interface RevampEnvironmentParams {
  network: LIT_NETWORK;
  personConfig?: {
    fundingStrategy?: PersonEnvs['PERSON_FUNDING_STRATEGY'];
    funded?: PersonEnvs['PERSON_FUNDED'];
    initEoaAuthSig?: PersonEnvs['PERSON_INIT_ETH_EOA_AUTHSIG'];
    initEthAuthMethod?: PersonEnvs['PERSON_INIT_EOA_AUTH_METHOD'];
    initContractClient?: PersonEnvs['PERSON_INIT_CONTRACT_CLIENT'];
    mintPkpWithEoaWallet?: PersonEnvs['PERSON_MINT_PKP_WITH_EOA_WALLET'];
    mintPkpWithEthWalletAuthMethod?: PersonEnvs['PERSON_MINT_PKP_WITH_ETH_WALLET_AUTH_METHOD'];
  };
}

export class RevampEnvironment {
  // ========== Private Fields ==========
  private tinnyEnvironment: TinnyEnvironment;

  // ========== Public Fields ==========
  public litNodeClient: LitNodeClient;

  constructor(params: RevampEnvironmentParams) {
    const envConfig: Partial<SetupEnvs> = {
      // -- Setup Envs --
      SETUP_LIT_NODE_CLIENT: true,
      SETUP_CAPACITY_DELEGATION_AUTHSIG: false,
      SETUP_BARE_AUTHSIG: false,
    };

    // -- User Envs --
    envConfig.PERSON_FUNDING_STRATEGY =
      params?.personConfig?.fundingStrategy ?? 'known-private-keys';
    envConfig.PERSON_FUNDED = params?.personConfig?.funded ?? false;
    envConfig.PERSON_INIT_ETH_EOA_AUTHSIG =
      params?.personConfig?.initEoaAuthSig ?? true;
    envConfig.PERSON_INIT_EOA_AUTH_METHOD =
      params?.personConfig?.initEthAuthMethod ?? true;
    envConfig.PERSON_INIT_CONTRACT_CLIENT =
      params?.personConfig?.initContractClient ?? true;
    envConfig.PERSON_MINT_PKP_WITH_EOA_WALLET =
      params?.personConfig?.mintPkpWithEoaWallet ?? true;
    envConfig.PERSON_MINT_PKP_WITH_ETH_WALLET_AUTH_METHOD =
      params?.personConfig?.mintPkpWithEthWalletAuthMethod ?? true;

    this.tinnyEnvironment = new TinnyEnvironment(
      params.network,
      envConfig as SetupEnvs
    );
  }

  async init() {
    await this.tinnyEnvironment.init();
    this.litNodeClient = this.tinnyEnvironment.litNodeClient;
  }

  /**
   * Get the world object where all the people are stored
   */
  async getWorld() {
    return this.tinnyEnvironment.world;
  }

  /**
   * Retrieves a person from the world by their name.
   * @param name - The name of the person to retrieve.
   * @returns The person object if found, or undefined if not found.
   */
  getPerson(name: string) {
    return this.tinnyEnvironment.world.get(name);
  }

  /**
   * Create a new person and add it to the world
   * @param name The name of the person
   * @param privateKey The private key of the person
   * @returns The person object
   */
  async createNewPerson(name: string, privateKey: string) {
    const envConfig = this.tinnyEnvironment.getEnvConfig();

    const person = new TinnyPerson({
      privateKey,
      envConfig,
    });

    await this.tinnyEnvironment.initPerson(person);

    this.tinnyEnvironment.world.set(name, person);

    return person;
  }
}

(async () => {
  // -- environment setup --
  const appEnv = new RevampEnvironment({
    network: LIT_NETWORK.LOCALCHAIN,
  });

  await appEnv.init();

  // In the app environment, create a new person named Alice
  const alice = await appEnv.createNewPerson(
    'Alice',
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  );

  // -- using the person EOA wallet to get a session
  const eoaSession = await alice.getEoaSession();

  // -- using the session to perform actions

  // Action: Execute JS
  const executeJsRes = await alice.useSession(eoaSession).toExecute({
    code: `(async() => {
      console.log('Hello World!');
    })();`,
  });

  console.log('executeJsRes:', executeJsRes);

  // Action: PKP Sign
  const pkpSignRes = await alice
    .useSession(eoaSession)
    .toPkpSign(alice.ethEoaWalletOwnedPkp.publicKey, 'Hello World!');

  console.log('pkpSignRes:', pkpSignRes);

  process.exit();
})();
