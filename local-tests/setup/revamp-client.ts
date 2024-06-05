import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_NETWORK } from './tinny-config';
import { TinnyEnvironment } from './tinny-environment';
import { TinnyPerson } from './tinny-person';

export class RevampEnvironmentParams {
  network: LIT_NETWORK;
}

export class RevampEnvironment {
  private tinnyEnvironment: TinnyEnvironment;

  public litNodeClient: LitNodeClient;

  constructor(params: RevampEnvironmentParams) {
    this.tinnyEnvironment = new TinnyEnvironment(params.network, {
      SETUP_LIT_NODE_CLIENT: true,
      SETUP_CAPACITY_DELEGATION_AUTHSIG: false,
      SETUP_BARE_AUTHSIG: false,
    });
  }

  async init() {
    await this.tinnyEnvironment.init();
    this.litNodeClient = this.tinnyEnvironment.litNodeClient;
  }

  async getWorld() {
    return this.tinnyEnvironment.world;
  }

  async createNewPerson(name: string, privateKey: string) {
    const envConfig = this.tinnyEnvironment.getEnvConfig();
    const person = new TinnyPerson({
      privateKey,
      envConfig,
    });

    await person.spawn();

    this.tinnyEnvironment.world.set(name, person);

    return person;
  }
}

(async () => {
  const revampEnvironment = new RevampEnvironment({
    network: LIT_NETWORK.LOCALCHAIN,
  });

  await revampEnvironment.init();

  const alice = await revampEnvironment.createNewPerson(
    'Alice',
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  );

  console.log(alice.authSig);

  process.exit();
})();
