import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { TinnyEnvironment, AccessControlConditions } from '@lit-protocol/tinny';
import { ILitNodeClient } from '@lit-protocol/types';

try {
  jest.setTimeout(100_000);
} catch (e) {
  // ... continue execution
}

describe('Sol AuthSig', () => {
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

  it('DecryptString', async () => {
    const accs = AccessControlConditions.getSolBasicAccessControlConditions({
      userAddress: devEnv.bareSolAuthSig?.address,
    });

    const encryptRes = await LitJsSdk.encryptString(
      {
        solRpcConditions: accs,
        dataToEncrypt: 'Hello world',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );

    // -- Expected output:´
    // {
    //   ciphertext: "pSP1Rq4xdyLBzSghZ3DtTtHp2UL7/z45U2JDOQho/WXjd2ntr4IS8BJfqJ7TC2U4CmktrvbVT3edoXJgFqsE7vy9uNrBUyUSTuUdHLfDVMIgh4a7fqMxsdQdkWZjHign3JOaVBihtOjAF5VthVena28D",
    //   dataToEncryptHash: "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
    // }

    // -- assertions
    expect(encryptRes.ciphertext).toBeDefined();

    expect(encryptRes.dataToEncryptHash).toBeDefined();

    // -- Decrypt the encrypted string
    const decryptRes = await LitJsSdk.decryptToString(
      {
        solRpcConditions: accs,
        ciphertext: encryptRes.ciphertext,
        dataToEncryptHash: encryptRes.dataToEncryptHash,
        authSig: devEnv.bareSolAuthSig,
        chain: 'solana',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );

    expect(decryptRes).toEqual('Hello world');
  });
});
