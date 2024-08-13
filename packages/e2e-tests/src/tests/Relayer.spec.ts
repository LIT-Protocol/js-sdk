import { ProviderType } from '@lit-protocol/constants';
import {
  EthWalletProvider,
  LitAuthClient,
} from '@lit-protocol/lit-auth-client';
import { TinnyEnvironment } from '@lit-protocol/tinny';

try {
  jest.setTimeout(100_000);
} catch (e) {
  // ... continue execution
}

describe('Relayer', () => {
  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    //@ts-expect-error global defined
    devEnv = global.devEnv;
  });

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(async () => {
    //@ts-expect-error global defined
    await global.devEnv.litNodeClient?.disconnect();
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
