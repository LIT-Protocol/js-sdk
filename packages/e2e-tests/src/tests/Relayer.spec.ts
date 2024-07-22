import { TinnyEnvironment } from '../../setup/tinny-environment';
import {
  EthWalletProvider,
  LitAuthClient,
} from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';

try {
  jest.setTimeout(100_000);
} catch (e) {
  // ... continue execution
}

describe('Relayer', () => {
  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    devEnv = new TinnyEnvironment();
    await devEnv.init();
  });

  afterAll(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('Fetch PKPS', async () => {
    const alice = await devEnv.createRandomPerson();

    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: 'test-api-key',
      },
      litNodeClient: devEnv.litNodeClient,
    });

    // -- test fetch pkps
    const ethWalletProvider = litAuthClient.initProvider<EthWalletProvider>(
      ProviderType.EthWallet
    );

    const pkps = await ethWalletProvider.fetchPKPsThroughRelayer(
      alice.authMethod!
    );

    expect(pkps.length).toBeGreaterThan(0);
  });
});
