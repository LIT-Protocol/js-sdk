import { expect, jest } from '@jest/globals';

import {
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import {
  LIT_TESTNET,
  AccessControlConditions,
  TinnyEnvironment,
  TinnyPerson,
  getLitActionSessionSigs,
  getEoaSessionSigs,
  getPkpSessionSigs,
  getLitActionSessionSigsUsingIpfsId,
} from '@lit-protocol/tinny';
import {
  ILitNodeClient,
  LitResourceAbilityRequest,
  SessionSigsMap,
} from '@lit-protocol/types';

try {
  jest.setTimeout(100_000);
} catch (e) {
  // ... continue execution
}

describe('SessionSigs', () => {
  let devEnv: TinnyEnvironment;
  let alice: TinnyPerson;
  beforeAll(async () => {
    //@ts-expect-error defined in global
    devEnv = global.devEnv;
  });

  beforeEach(async () => {
    alice = await devEnv.createRandomPerson();
  });

  afterEach(() => {
    alice && devEnv.releasePrivateKeyFromUser(alice);
  });

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  describe('DecryptString', () => {
    it('LitAction Session', async () => {
      await decryptString(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await decryptString(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await decryptString(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await decryptString(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('Claim Key', () => {
    it('LitAction Session', async () => {
      await executeJsClaimKey(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsClaimKey(
        devEnv,
        alice,
        getLitActionSessionSigsUsingIpfsId
      );
    });

    it('EOA Wallet', async () => {
      await executeJsClaimKey(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsClaimKey(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('Claim Key Multiple', () => {
    it('LitAction Session', async () => {
      await executeJsClaimKeys(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsClaimKeys(
        devEnv,
        alice,
        getLitActionSessionSigsUsingIpfsId
      );
    });

    it('EOA Wallet', async () => {
      await executeJsClaimKeys(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsClaimKeys(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('ExecuteJS JSON Response', () => {
    it('LitAction Session', async () => {
      await executeJsJSONResponse(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsJSONResponse(
        devEnv,
        alice,
        getLitActionSessionSigsUsingIpfsId
      );
    });

    it('EOA Wallet', async () => {
      await executeJsJSONResponse(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsJSONResponse(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('PKP Sign', () => {
    it('LitAction Session', async () => {
      await pkpSign(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await pkpSign(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await pkpSign(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await pkpSign(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('ExecuteJS Signing', () => {
    it('LitAction Session', async () => {
      await executeJsSigning(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsSigning(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await executeJsSigning(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsSigning(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('ExecuteJS Signing Parallel', () => {
    it('LitAction Session', async () => {
      await executeJsSigningParallel(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsSigningParallel(
        devEnv,
        alice,
        getLitActionSessionSigsUsingIpfsId
      );
    });

    it('EOA Wallet', async () => {
      await executeJsSigningParallel(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsSigningParallel(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('Broadcast And Collect', () => {
    it('LitAction Session', async () => {
      await broadcastAndCollect(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await broadcastAndCollect(
        devEnv,
        alice,
        getLitActionSessionSigsUsingIpfsId
      );
    });

    it('EOA Wallet', async () => {
      await broadcastAndCollect(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await broadcastAndCollect(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('Decrypt And Combine', () => {
    it('LitAction Session', async () => {
      await decryptAndCombine(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await decryptAndCombine(
        devEnv,
        alice,
        getLitActionSessionSigsUsingIpfsId
      );
    });

    it('EOA Wallet', async () => {
      await decryptAndCombine(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await decryptAndCombine(devEnv, alice, getPkpSessionSigs);
    });
  });

  describe('Sign And Combine ECDSA', () => {
    it('LitAction Session', async () => {
      await signAndCombine(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await signAndCombine(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await signAndCombine(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await signAndCombine(devEnv, alice, getPkpSessionSigs);
    });
  });
});

const executeJsClaimKeys = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const litActionSessionSigs = await generator(devEnv, alice, [
    {
      resource: new LitPKPResource('*'),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ]);

  const res = await devEnv.litNodeClient?.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
    Lit.Actions.claimKey({keyId: "foo"});
    Lit.Actions.claimKey({keyId: "bar"});
  })();`,
  });

  // Expected output:
  // {
  //   claims: {
  //     bar: {
  //       signatures: [
  //         {
  //           r: "0x7ee7b329462acb08d1dd1d3fba17f8ac76263454e2582bc0d5f36c74f4aaac68",
  //           s: "0x1b20cd8ac8ab1efdcf500d7ff100229deee42ce44b6420619c609a694af33aad",
  //           v: 28,
  //         }, {
  //           r: "0x2bd6db983d5f5dd239b4fe27b087acf0547e49a69e6c62b8e1435d3890a5d4c5",
  //           s: "0x15a8a80b2a5bf16e9c155bfe9d5da1109847334b8a0a74a9ce277cdfc6b05fdd",
  //           v: 28,
  //         }, {
  //           r: "0x9294c656bdb6764fca46e431dc4b15c653e6347a41eb657d23145d93a1fa19d0",
  //           s: "0x7afe0be470e9393dda32c356a9a262f7794a59f8e75e551bdb7634beb3a0a114",
  //           v: 28,
  //         }
  //       ],
  //       derivedKeyId: "0961c21c8a46c4992003a7b7af9449c15f772a269633ae3242f6ed146708a819",
  //     },
  //     foo: {
  //       signatures: [
  //         {
  //           r: "0xc39c073d69c8878bf06c813af9d090b41e15319abc9677e20f07085c96451e98",
  //           s: "0x6ef6a3d4b365119f4a9613a89fd57af01c4a350a20222935581be306b4c8aba4",
  //           v: 27,
  //         }, {
  //           r: "0xa2473911de4b252349cadde340de121ce3195929cd1ebb4c717f3d9d65c67988",
  //           s: "0x597a45d27a3100fa0bb144644f6bdec62c8a827f35427814cea64f8d3d9a9fa8",
  //           v: 27,
  //         }, {
  //           r: "0x97c393fb1f733b946bfaafdbb13c46192f4cf5ad2b2a9fcf9ff0355a7a2dc5fa",
  //           s: "0x152737c1b0aba904182bb5ac70e3a99ba4301b631df55bd21b91d705eb5ef4d2",
  //           v: 27,
  //         }
  //       ],
  //       derivedKeyId: "7698c828a5e4ae6dd6f98ae72fcb5a96bc83f53fa6a09c614e28ceab8198d5ca",
  //     },
  //   },
  //   signatures: {},
  //   decryptions: [],
  //   response: undefined,
  //   logs: "",
  // }

  // assertions
  expect(res?.claims?.['foo']).toBeDefined();
  expect(res?.claims?.['foo']?.derivedKeyId).toBeDefined();

  expect(res?.claims?.['foo'].signatures).toBeDefined();

  res?.claims?.['foo'].signatures.forEach((sig) => {
    expect(!sig.r).toBeDefined();
    expect(!sig.s).toBeDefined();
    expect(!sig.v).toBeDefined();
  });

  expect(res?.claims?.['bar']).toBeDefined();
  expect(res?.claims?.['bar']?.derivedKeyId).toBeDefined();

  expect(res?.claims?.['bar'].signatures).toBeDefined();

  res?.claims?.['bar'].signatures.forEach((sig) => {
    expect(!sig.r).toBeDefined();
    expect(!sig.s).toBeDefined();
    expect(!sig.v).toBeDefined();
  });
};

const executeJsClaimKey = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const litActionSessionSigs = await generator(devEnv, alice);

  const res = await devEnv.litNodeClient?.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
    Lit.Actions.claimKey({keyId: "foo"});
  })();`,
  });

  devEnv.releasePrivateKeyFromUser(alice);

  // Expected output:
  // {
  //   claims: {
  //     bar: {
  //       signatures: [
  //         {
  //           r: "0x7ee7b329462acb08d1dd1d3fba17f8ac76263454e2582bc0d5f36c74f4aaac68",
  //           s: "0x1b20cd8ac8ab1efdcf500d7ff100229deee42ce44b6420619c609a694af33aad",
  //           v: 28,
  //         }, {
  //           r: "0x2bd6db983d5f5dd239b4fe27b087acf0547e49a69e6c62b8e1435d3890a5d4c5",
  //           s: "0x15a8a80b2a5bf16e9c155bfe9d5da1109847334b8a0a74a9ce277cdfc6b05fdd",
  //           v: 28,
  //         }, {
  //           r: "0x9294c656bdb6764fca46e431dc4b15c653e6347a41eb657d23145d93a1fa19d0",
  //           s: "0x7afe0be470e9393dda32c356a9a262f7794a59f8e75e551bdb7634beb3a0a114",
  //           v: 28,
  //         }
  //       ],
  //       derivedKeyId: "0961c21c8a46c4992003a7b7af9449c15f772a269633ae3242f6ed146708a819",
  //     }
  //   },
  //   signatures: {},
  //   decryptions: [],
  //   response: undefined,
  //   logs: "",
  // }

  expect(res?.claims?.['foo']).toBeDefined();
  expect(res?.claims?.['foo']?.derivedKeyId).toBeDefined();

  expect(res?.claims?.['foo'].signatures).toBeDefined();

  res?.claims?.['foo'].signatures.forEach((sig) => {
    expect(!sig.r).toBeDefined();
    expect(!sig.s).toBeDefined();
    expect(!sig.v).toBeDefined();
  });
};

const pkpSign = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const litActionSessionSigs = await generator(devEnv, alice);

  const res = await devEnv.litNodeClient?.pkpSign({
    toSign: alice.loveLetter,
    pubKey: alice.authMethodOwnedPkp?.publicKey as string,
    sessionSigs: litActionSessionSigs as SessionSigsMap,
  });

  // -- Expected output:
  // {
  //   r: "ab2cef959db920d56f001c3b05637ee49af4c4441f2867ea067c413594a4c87b",
  //   s: "4bf11e17b4bb618aa6ed75cbf0406e6babfd953c5b201da697077c5fbf5b542e",
  //   recid: 1,
  //   signature: "0xab2cef959db920d56f001c3b05637ee49af4c4441f2867ea067c413594a4c87b4bf11e17b4bb618aa6ed75cbf0406e6babfd953c5b201da697077c5fbf5b542e1c",
  //   publicKey: "04400AD53C2F8BA11EBC69F05D1076D5BEE4EAE668CD66BABADE2E0770F756FDEEFC2C1D20F9A698EA3FEC6E9C944FF9FAFC2DC339B8E9392AFB9CC8AE75C5E5EC",
  //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  // }

  expect(res?.r).toBeDefined();
  expect(res?.s).toBeDefined();
  expect(res?.dataSigned).toBeDefined();
  expect(res?.publicKey).toBeDefined();
};

const executeJsJSONResponse = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const litActionSessionSigs = await generator(devEnv, alice);

  const res = await devEnv.litNodeClient?.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
    console.log('hello world')

    LitActions.setResponse({
      response: JSON.stringify({hello: 'world'})
    });

  })();`,
  });

  expect(res?.response).toBeDefined();
  expect(res?.logs).toBeDefined();
  expect(res?.logs.includes('hello world')).toBeTruthy();
  expect(res?.success).toBeTruthy();
};

const executeJsSigning = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const litActionSessionSigs = await generator(devEnv, alice, [
    {
      resource: new LitPKPResource('*'),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ]);

  const res = await devEnv.litNodeClient?.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
    jsParams: {
      dataToSign: alice.loveLetter,
      publicKey: alice.authMethodOwnedPkp?.publicKey,
    },
  });

  expect(res?.signatures?.sig.r).toBeDefined();
  expect(res?.signatures?.sig.s).toBeDefined();
  expect(res?.signatures?.sig.dataSigned).toBeDefined();
  expect(res?.signatures?.sig.publicKey).toBeDefined();
};

const executeJsSigningParallel = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const litActionSessionSigs = await generator(devEnv, alice);

  const fn = async () => {
    return await devEnv.litNodeClient?.executeJs({
      sessionSigs: litActionSessionSigs,
      code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
      jsParams: {
        dataToSign: alice.loveLetter,
        publicKey: alice.authMethodOwnedPkp?.publicKey,
      },
    });
  };

  const res = await Promise.all([fn(), fn(), fn()]);

  res.forEach((r) => {
    expect(r?.signatures?.sig.r).toBeDefined();
    expect(r?.signatures?.sig.s).toBeDefined();
    expect(r?.signatures?.sig.dataSigned).toBeDefined();
    expect(r?.signatures?.sig.publicKey).toBeDefined();
  });
};

const decryptString = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress:
      generator.name === 'getEoaSessionSigs'
        ? alice.wallet.address
        : (alice.authMethodOwnedPkp?.ethAddress as string),
  });

  const encryptRes = await LitJsSdk.encryptString(
    {
      accessControlConditions: accs,
      dataToEncrypt: 'Hello world',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  // -- Expected output:
  // {
  //   ciphertext: "pSP1Rq4xdyLBzSghZ3DtTtHp2UL7/z45U2JDOQho/WXjd2ntr4IS8BJfqJ7TC2U4CmktrvbVT3edoXJgFqsE7vy9uNrBUyUSTuUdHLfDVMIgh4a7fqMxsdQdkWZjHign3JOaVBihtOjAF5VthVena28D",
  //   dataToEncryptHash: "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
  // }

  // -- assertions
  expect(encryptRes.ciphertext).toBeDefined();

  expect(encryptRes.dataToEncryptHash).toBeDefined();

  const accsResourceString =
    await LitAccessControlConditionResource.generateResourceString(
      accs,
      encryptRes.dataToEncryptHash
    );

  const litActionSessionSigs2 = await generator(devEnv, alice, [
    {
      resource: new LitAccessControlConditionResource(accsResourceString),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ]);

  // -- Decrypt the encrypted string
  const decryptRes = await LitJsSdk.decryptToString(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      sessionSigs: litActionSessionSigs2,
      chain: 'ethereum',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  expect(decryptRes).toEqual('Hello world');
};

const broadcastAndCollect = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
) => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const litActionSessionSigs = await generator(devEnv, alice);

  const res = await devEnv.litNodeClient?.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
              let rand = Math.floor(Math.random() * 100);
              const resp = await Lit.Actions.broadcastAndCollect({
                  name: "temperature",
                  value: rand.toString(),
              });
              Lit.Actions.setResponse({
                  response: JSON.stringify(resp)
              });
            })();`,
    jsParams: {},
  });

  const response = res?.response;
  expect(response).toBeDefined();
};

const decryptAndCombine = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
) => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress:
      generator.name === 'getEoaSessionSigs'
        ? (alice.authSig?.address as string)
        : (alice.authMethodOwnedPkp?.ethAddress as string),
  });

  const litActionSessionSigs = await generator(devEnv, alice);

  const encryptRes = await LitJsSdk.encryptString(
    {
      accessControlConditions: accs,
      dataToEncrypt: 'Hello world',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  // -- Expected output:
  // {
  //   ciphertext: "pSP1Rq4xdyLBzSghZ3DtTtHp2UL7/z45U2JDOQho/WXjd2ntr4IS8BJfqJ7TC2U4CmktrvbVT3edoXJgFqsE7vy9uNrBUyUSTuUdHLfDVMIgh4a7fqMxsdQdkWZjHign3JOaVBihtOjAF5VthVena28D",
  //   dataToEncryptHash: "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
  // }

  // -- assertions
  expect(encryptRes.ciphertext).toBeDefined();

  expect(!encryptRes.dataToEncryptHash).toBeDefined();

  const res = await devEnv.litNodeClient?.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
            const resp = await Lit.Actions.decryptAndCombine({
              accessControlConditions,
              ciphertext,
              dataToEncryptHash,
              authSig: null,
              chain: 'ethereum',
            });
            Lit.Actions.setResponse({
                response: resp
            });
          })();`,
    jsParams: {
      accessControlConditions: accs,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      ciphertext: encryptRes.ciphertext,
    },
  });

  expect(res?.response).toEqual('Hello world');
};

const signAndCombine = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
) => {
  const litActionSessionSigs = await generator(devEnv, alice);

  const res = await devEnv.litNodeClient?.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
            const sigShare = await LitActions.signAndCombineEcdsa({
              toSign: dataToSign,
              publicKey,
              sigName: "sig",
            });
            Lit.Actions.setResponse({
                response: sigShare
            });
          })();`,
    jsParams: {
      dataToSign: alice.loveLetter,
      publicKey: alice.pkp?.publicKey,
    },
  });

  /**
    Response format
    {
        "success": true,
        "signedData": {},
        "decryptedData": {},
        "claimData": {},
        "response": "{\"r\":\"026eede14267ca76064a7e22dbe6f9e44d786c7b5917b7d023f45ee4e84ce1ea47\",\"s\":\"22a6048bcb88d724d45bdb6161fefd151483f41d592d167e5c33f42e9fe6dac6\",\"v\":0}",
        "logs": ""
    }
  */

  expect(res?.response).toBeDefined();
  const sig = JSON.parse(res?.response as string);
  expect(sig.r).toBeDefined();
  expect(sig.s).toBeDefined();
  expect(sig.v).toBeDefined();
};
