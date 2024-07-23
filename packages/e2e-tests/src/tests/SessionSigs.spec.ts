import { expect, jest } from '@jest/globals';
import { TinnyEnvironment } from '../../setup/tinny-environment';

import { LIT_TESTNET } from '../../setup/tinny-config';
import { AccessControlConditions } from '../../setup/accs/accs';

import {
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient, LitResourceAbilityRequest, SessionSigsMap } from '@lit-protocol/types';


import {
  getInvalidLitActionIpfsSessionSigs,
  getInvalidLitActionSessionSigs,
  getLitActionSessionSigs,
  getLitActionSessionSigsUsingIpfsId,
} from '../../setup/session-sigs/get-lit-action-session-sigs';
import { TinnyPerson } from '../../setup/tinny-person';
import { getEoaSessionSigs } from '../../setup/session-sigs/get-eoa-session-sigs';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('SessionSigs', () => {
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

  describe('DecryptString', () => {
    it('LitAction Session', async () => {
      await decryptString(devEnv, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await decryptString(devEnv, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await decryptString(devEnv, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await decryptString(devEnv, getEoaSessionSigs);
    });
  });

  describe('Claim Keys', () => {
    it('LitAction Session', async () => {
      await executeJsCLaimKeys(devEnv, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsCLaimKeys(devEnv, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await executeJsCLaimKeys(devEnv, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsCLaimKeys(devEnv, getEoaSessionSigs);
    });
  });

  describe('Claim Keys Multiple', () => {
    it('LitAction Session', async () => {
      await executeJsCLaimKey(devEnv, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsCLaimKey(devEnv, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await executeJsCLaimKey(devEnv, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsCLaimKey(devEnv, getEoaSessionSigs);
    });
  });
  
  describe('ExecuteJS JSON Response', () => {
    it('LitAction Session', async () => {
      await pkpSign(devEnv, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await pkpSign(devEnv, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await pkpSign(devEnv, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await pkpSign(devEnv, getEoaSessionSigs);
    });
  });

  describe('PKP Sign', () => {
    it('LitAction Session', async () => {
      await pkpSign(devEnv, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await pkpSign(devEnv, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await pkpSign(devEnv, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await pkpSign(devEnv, getEoaSessionSigs);
    });
  });
  describe('ExecuteJS Signing', () => {
    it('LitAction Session', async () => {
      await pkpSign(devEnv, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsSigning(devEnv, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await executeJsSigning(devEnv, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsSigning(devEnv, getEoaSessionSigs);
    });
  });

  describe('ExecteJS Signing Parallel', () => {
    it('LitAction Session', async () => {
      await executeJsSigningParallel(devEnv, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await executeJsSigningParallel(devEnv, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await executeJsSigningParallel(devEnv, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await executeJsSigningParallel(devEnv, getEoaSessionSigs);
    });
  });

  it('Invalid lit action Custom Auth SessionSigs', async () => {
    devEnv.setUnavailable(LIT_TESTNET.MANZANO);

    const alice = await devEnv.createRandomPerson();

    try {
      await getInvalidLitActionSessionSigs(devEnv, alice);
    } catch (e: any) {
      console.log('❌ This error is expected', e);
      if (
        e.message ===
        'There was an error getting the signing shares from the nodes'
      ) {
        console.log(
          '✅ testUseInvalidLitActionCodeToGenerateSessionSigs passed'
        );
      } else {
        throw e;
      }
    } finally {
      devEnv.releasePrivateKeyFromUser(alice);
    }
  });

  it('Invalid Lit Action Custom Auth IPFS SessionSigs', async () => {
    const alice = await devEnv.createRandomPerson();

    try {
      await getInvalidLitActionIpfsSessionSigs(devEnv, alice);
    } catch (e: any) {
      console.log('❌ THIS IS EXPECTED: ', e);

      if (e.message === 'An error related to validation has occured.') {
        console.log(
          '✅ testUseInvalidLitActionIpfsCodeToGenerateSessionSigs is expected to have an error'
        );
      } else {
        throw e;
      }
    } finally {
      devEnv.releasePrivateKeyFromUser(alice);
    }
  });
});

const executeJsCLaimKeys = async (
  devEnv: TinnyEnvironment,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const alice = await devEnv.createRandomPerson();
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
  expect(res?.claims?.['foo']?.derivedKeyId!).toBeDefined();

  expect(res?.claims?.['foo'].signatures).toBeDefined();

  res?.claims?.['foo'].signatures.forEach((sig: any) => {
    expect(!sig.r).toBeDefined();
    expect(!sig.s).toBeDefined();
    expect(!sig.v).toBeDefined();
  });

  expect(res?.claims?.['bar']).toBeDefined();
  expect(res?.claims?.['bar']?.derivedKeyId!).toBeDefined();

  expect(res?.claims?.['bar'].signatures).toBeDefined();

  res?.claims?.['bar'].signatures.forEach((sig: any) => {
    expect(!sig.r).toBeDefined();
    expect(!sig.s).toBeDefined();
    expect(!sig.v).toBeDefined();
  });
};


const executeJsCLaimKey = async (
  devEnv: TinnyEnvironment,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const alice = await devEnv.createRandomPerson();

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

  expect(res?.claims?.['foo']).toBeDefined();
  expect(res?.claims?.['foo']?.derivedKeyId!).toBeDefined();

  expect(res?.claims?.['foo'].signatures).toBeDefined();

  res?.claims?.['foo'].signatures.forEach((sig: any) => {
    expect(!sig.r).toBeDefined();
    expect(!sig.s).toBeDefined();
    expect(!sig.v).toBeDefined();
  });
};


const pkpSign =  async (
  devEnv: TinnyEnvironment,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const alice = await devEnv.createRandomPerson();
  const litActionSessionSigs = await generator(devEnv, alice);

  const res = await devEnv.litNodeClient?.pkpSign({
    toSign: alice.loveLetter,
    pubKey: alice.authMethodOwnedPkp?.publicKey!,
    sessionSigs: litActionSessionSigs!,
  });

  devEnv.releasePrivateKeyFromUser(alice);

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
}

const executeJsJSONResponse =  async (
  devEnv: TinnyEnvironment,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const alice = await devEnv.createRandomPerson();
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

  devEnv.releasePrivateKeyFromUser(alice);

  expect(res?.response).toBeDefined();
  expect(res?.logs).toBeDefined();
  expect(res?.logs.includes('hello world')).toBeTruthy();
  expect(res?.success).toBeTruthy();
}

const executeJsSigning = async (
  devEnv: TinnyEnvironment,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const alice = await devEnv.createRandomPerson();
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

  devEnv.releasePrivateKeyFromUser(alice);

  expect(res?.signatures?.sig.r).toBeDefined();
  expect(res?.signatures?.sig.s).toBeDefined();
  expect(res?.signatures?.sig.dataSigned).toBeDefined();
  expect(res?.signatures?.sig.publicKey).toBeDefined();
}

const executeJsSigningParallel = async (
  devEnv: TinnyEnvironment,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const alice = await devEnv.createRandomPerson();

  const litActionSessionSigs = await generator(devEnv, alice);

  const fn = async (index: number) => {
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

  devEnv.releasePrivateKeyFromUser(alice);

  const res = await Promise.all([fn(1), fn(2), fn(3)]);

  res.forEach((r) => {
    expect(r?.signatures?.sig.r).toBeDefined();
    expect(r?.signatures?.sig.s).toBeDefined();
    expect(r?.signatures?.sig.dataSigned).toBeDefined();
    expect(r?.signatures?.sig.publicKey).toBeDefined();
  });
}



const decryptString = async (
  devEnv: TinnyEnvironment,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const alice = await devEnv.createRandomPerson();
  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress:
      generator.name === 'EOA'
        ? alice.wallet.address
        : alice.authMethodOwnedPkp?.ethAddress!,
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

  devEnv.releasePrivateKeyFromUser(alice);

  expect(decryptRes).toEqual('Hello world');
}