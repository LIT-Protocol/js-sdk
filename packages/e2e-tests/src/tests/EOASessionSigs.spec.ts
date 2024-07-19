import { expect, jest, test } from '@jest/globals';
import { TinnyEnvironment } from '../../setup/tinny-environment';
import { AccessControlConditions } from './../../setup/accs/accs';
import { ILitNodeClient, LitAbility } from '@lit-protocol/types';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { getEoaSessionSigs } from './../../setup/session-sigs/get-eoa-session-sigs';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('EOASessionSignatures', () => {
  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    devEnv = new TinnyEnvironment();
    await devEnv.init();
  });
  it('ExecuteJs Signing', async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

    const res = await devEnv.litNodeClient?.executeJs({
      sessionSigs: eoaSessionSigs,
      code: `(async () => {
            const sigShare = await LitActions.signEcdsa({
              toSign: dataToSign,
              publicKey,
              sigName: "sig",
            });
          })();`,
      jsParams: {
        dataToSign: alice.loveLetter,
        publicKey: alice.pkp?.publicKey,
      },
    });

    devEnv.releasePrivateKeyFromUser(alice);

    // -- Expected output:
    // {
    //   claims: {},
    //   signatures: {
    //     sig: {
    //       r: "63311a761842b41686875862a3fb09975c838afff6ae11c5c3940da458dffe79",
    //       s: "1c25f352b4a8bf15510cecbee4e798270cdf68c45a26cf93dc32d6e03dfc720a",
    //       recid: 0,
    //       signature: "0x63311a761842b41686875862a3fb09975c838afff6ae11c5c3940da458dffe791c25f352b4a8bf15510cecbee4e798270cdf68c45a26cf93dc32d6e03dfc720a1b",
    //       publicKey: "0423F38A7663289FC58841B5F8E068FA43106BC7DDEE38D1F2542C03ABEC45B6733BE2D85A703C7B238865E45DF2175DD2A1736C56F2BAD0A965837F64BB21FB03",
    //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //     },
    //   }

    // -- assertions
    expect(res?.signatures.sig.r).toBeDefined();

    expect(res?.signatures.sig.s).toBeDefined();

    if (!res?.signatures.sig.dataSigned) {
      throw new Error(`Expected "dataSigned" in res.signatures.sig`);
    }

    if (!res?.signatures.sig.publicKey) {
      throw new Error(`Expected "publicKey" in res.signatures.sig`);
    }
  });
  it('ExecuteJs Json Response', async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

    const res = await devEnv.litNodeClient?.executeJs({
      sessionSigs: eoaSessionSigs,
      code: `(async () => {
        console.log('hello world')

        LitActions.setResponse({
            response: JSON.stringify({hello: 'world'})
        });

        })();`,
    });

    devEnv.releasePrivateKeyFromUser(alice);

    // Expected output:
    // {
    //   success: true,
    //   signedData: {},
    //   decryptedData: {},
    //   claimData: {},
    //   response: "{\"hello\":\"world\"}",
    //   logs: "hello world\n",
    // }

    // -- assertions
    expect(res?.response).toBeDefined();
    expect(res?.logs).toBeDefined();
    expect(res?.logs.includes('hello world')).toBeTruthy();
    expect(res?.success).toBeTruthy();
  });

  it('DecryptString', async () => {
    const alice = await devEnv.createRandomPerson();
    // set access control conditions for encrypting and decrypting
    const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
      userAddress: alice.wallet.address,
    });

    const encryptRes = await LitJsSdk.encryptString(
      {
        accessControlConditions: accs,
        dataToEncrypt: 'Hello world',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );

    console.log('encryptRes:', encryptRes);

    // await 5 seconds for the encryption to be mined

    // -- Expected output:
    // {
    //   ciphertext: "pSP1Rq4xdyLBzSghZ3DtTtHp2UL7/z45U2JDOQho/WXjd2ntr4IS8BJfqJ7TC2U4CmktrvbVT3edoXJgFqsE7vy9uNrBUyUSTuUdHLfDVMIgh4a7fqMxsdQdkWZjHign3JOaVBihtOjAF5VthVena28D",
    //   dataToEncryptHash: "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
    // }

    // -- assertions
    if (!encryptRes.ciphertext) {
      throw new Error(`Expected "ciphertext" in encryptRes`);
    }

    if (!encryptRes.dataToEncryptHash) {
      throw new Error(`Expected "dataToEncryptHash" to in encryptRes`);
    }

    const accsResourceString =
      await LitAccessControlConditionResource.generateResourceString(
        accs,
        encryptRes.dataToEncryptHash
      );

    const eoaSessionSigs2 = await getEoaSessionSigs(devEnv, alice, [
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
        sessionSigs: eoaSessionSigs2,
        chain: 'ethereum',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );

    devEnv.releasePrivateKeyFromUser(alice);

    if (decryptRes !== 'Hello world') {
      throw new Error(
        `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
      );
    }
  });

  it("DecryptFile", async () => {
    const alice = await devEnv.createRandomPerson();
    const message = 'Hello world';
    const blob = new Blob([message], { type: 'text/plain' });
    const blobArray = new Uint8Array(await blob.arrayBuffer());
  
    // set access control conditions for encrypting and decrypting
    const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
      userAddress: alice.wallet.address,
    });
  
    const encryptRes = await LitJsSdk.encryptString(
      {
        accessControlConditions: accs,
        dataToEncrypt: 'Hello world',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );
  
    console.log('encryptRes:', encryptRes);
  
    // await 5 seconds for the encryption to be mined
  
    // -- Expected output:
    // {
    //   ciphertext: "pSP1Rq4xdyLBzSghZ3DtTtHp2UL7/z45U2JDOQho/WXjd2ntr4IS8BJfqJ7TC2U4CmktrvbVT3edoXJgFqsE7vy9uNrBUyUSTuUdHLfDVMIgh4a7fqMxsdQdkWZjHign3JOaVBihtOjAF5VthVena28D",
    //   dataToEncryptHash: "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
    // }
  
    // -- assertions
    if (!encryptRes.ciphertext) {
      throw new Error(`Expected "ciphertext" in encryptRes`);
    }
  
    if (!encryptRes.dataToEncryptHash) {
      throw new Error(`Expected "dataToEncryptHash" to in encryptRes`);
    }
  
    const accsResourceString =
      await LitAccessControlConditionResource.generateResourceString(
        accs,
        encryptRes.dataToEncryptHash
      );
  
    const eoaSessionSigs2 = await getEoaSessionSigs(devEnv, alice, [
      {
        resource: new LitAccessControlConditionResource(accsResourceString),
        ability: LitAbility.AccessControlConditionDecryption,
      },
    ]);
  
    // -- Decrypt the encrypted string
    const decriptedFile = await LitJsSdk.decryptToFile(
      {
        accessControlConditions: accs,
        ciphertext: encryptRes.ciphertext,
        dataToEncryptHash: encryptRes.dataToEncryptHash,
        sessionSigs: eoaSessionSigs2,
        chain: 'ethereum',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );
  
    devEnv.releasePrivateKeyFromUser(alice);
  
    if (blobArray.length !== decriptedFile.length) {
      throw new Error(
        `decrypted file should match the original file but received ${decriptedFile}`
      );
    }
    for (let i = 0; i < blobArray.length; i++) {
      if (blobArray[i] !== decriptedFile[i]) {
        throw new Error(`decrypted file should match the original file`);
      }
    }
  
    console.log('decriptedFile:', decriptedFile);
  });

  it("executeJS ClaimKeys", async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
  
    const res = await devEnv.litNodeClient?.executeJs({
      sessionSigs: eoaSessionSigs,
      code: `(async () => {
        Lit.Actions.claimKey({keyId: "foo"});
      })();`,
    });
  
    devEnv.releasePrivateKeyFromUser(alice);
  
    console.log('res:', res);
  
    // Expected output:
    // {
    //   claims: {
    //     foo: {
    //       signatures: [
    //         {
    //           r: "0x31e5dcf6eed3619aa6ff68d0c8f7a4bcf082acc2f12c3d5bcae9b8bbaf883c07",
    //           s: "0x405f671d1c659022105775b18afe805e01eaa1d0799c6b92887baef77dc023f5",
    //           v: 27,
    //         }, {
    //           r: "0xf2e9fe653d9155bd93feb7fe122c07a81769076fe44567c3ea93bb828f87146e",
    //           s: "0x01adf2b2780511f70b0b037360ff4b0c2b8d04657a689af780180bed9e6ea3c5",
    //           v: 27,
    //         }, {
    //           r: "0xfe1dcacd79f53b42b24dae75521f01315f34bbc492233e26083995c82218a3ff",
    //           s: "0x0b708b11704d986b50bce9f648bb5d40e8b9ad87f3a337a213999c7751dc1c0c",
    //           v: 27,
    //         }
    //       ],
    //       derivedKeyId: "22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0",
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
  });

  it("executeJs ClaimKeys Multiple", async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
  
    const res = await devEnv.litNodeClient?.executeJs({
      sessionSigs: eoaSessionSigs,
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
    expect(res?.claims?.['foo'].derivedKeyId).toBeDefined();
  
    expect(res?.claims?.['foo'].signatures).toBeDefined(); 
  
    res?.claims?.['foo'].signatures.forEach((sig: any) => {
      expect(sig.r).toBeDefined();
      expect(sig.s).toBeDefined();
      expect(sig.v).toBeDefined();
    });
  });

  it("consoleLog ExecuteJs", async() => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
  
    const res = await devEnv?.litNodeClient?.executeJs({
      sessionSigs: eoaSessionSigs,
      code: `(async () => {
        console.log('hello world')
      })();`,
    });
  
    devEnv.releasePrivateKeyFromUser(alice);
  
    console.log('res:', res);
  
    // Expected output:
    // {
    //   success: true,
    //   signedData: {},
    //   decryptedData: {},
    //   claimData: {},
    //   response: "",
    //   logs: "hello world\n",
    // }
  
    // -- assertions
    expect(res?.response).toBeDefined();
    expect(res?.logs).toBeDefined(); 
    expect(res?.logs.includes('hello world')).toBeTruthy();
    expect(res?.success).toBeDefined();
  });


  it("ExecuteJs Parallel Sign", async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
  
    const fn = async (index: number) => {
      console.log(`Index: ${index}`);
  
      return await devEnv?.litNodeClient?.executeJs({
        sessionSigs: eoaSessionSigs,
        code: `(async () => {
          const sigShare = await LitActions.signEcdsa({
            toSign: dataToSign,
            publicKey,
            sigName: "sig",
          });
        })();`,
        jsParams: {
          dataToSign: alice.loveLetter,
          publicKey: alice?.pkp?.publicKey,
        },
      });
    };
  
    const res = await Promise.all([fn(1), fn(2), fn(3)]);
    devEnv.releasePrivateKeyFromUser(alice);
    console.log('res:', res);
  
    // -- Expected output:
    // [
    //   {
    //     claims: {},
    //     signatures: {
    //       sig: {
    //         r: "d5bc8b53b9f69604c2dfb2d1d3e6c8b7e01a225346055ee798f5f67fe542a05a",
    //         s: "0153071ac4c7f9b08330361575b109dec07d1c335edeecd85db47398795a00d0",
    //         recid: 0,
    //         signature: "0xd5bc8b53b9f69604c2dfb2d1d3e6c8b7e01a225346055ee798f5f67fe542a05a0153071ac4c7f9b08330361575b109dec07d1c335edeecd85db47398795a00d01b",
    //         publicKey: "0489782A60B39C758DD8405965DC83DE5F1DB9572861EBAB6064090223C3B7F60DD71C6E673D81550E127BE18497BEA8C349E3B91C8170AD572AD0572009797EA5",
    //         dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //       },
    //     },
    //     decryptions: [],
    //     response: undefined,
    //     logs: "",
    //   }, {
    //     claims: {},
    //     signatures: {
    //       sig: {
    //         r: "d2ad9086e810a5fd9b49dc4c2a0e7e2cf417dd79f8e75cc5f7b7b21d1b7ae9bc",
    //         s: "5e28b3321e73bab4177f6a69fec924f9daec294cf89a9a4d9c1a8fad18810bbd",
    //         recid: 1,
    //         signature: "0xd2ad9086e810a5fd9b49dc4c2a0e7e2cf417dd79f8e75cc5f7b7b21d1b7ae9bc5e28b3321e73bab4177f6a69fec924f9daec294cf89a9a4d9c1a8fad18810bbd1c",
    //         publicKey: "0489782A60B39C758DD8405965DC83DE5F1DB9572861EBAB6064090223C3B7F60DD71C6E673D81550E127BE18497BEA8C349E3B91C8170AD572AD0572009797EA5",
    //         dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //       },
    //     },
    //     decryptions: [],
    //     response: undefined,
    //     logs: "",
    //   }, {
    //     claims: {},
    //     signatures: {
    //       sig: {
    //         r: "50f87167ba2c8a92e78c95f34e2683a23c372fcc6d104ef9f4d9050d5e1621f3",
    //         s: "443f5895668e8df6b5d6097a3e9f363923dc2cb83a4734b79359c8213f220fa9",
    //         recid: 0,
    //         signature: "0x50f87167ba2c8a92e78c95f34e2683a23c372fcc6d104ef9f4d9050d5e1621f3443f5895668e8df6b5d6097a3e9f363923dc2cb83a4734b79359c8213f220fa91b",
    //         publicKey: "0489782A60B39C758DD8405965DC83DE5F1DB9572861EBAB6064090223C3B7F60DD71C6E673D81550E127BE18497BEA8C349E3B91C8170AD572AD0572009797EA5",
    //         dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //       },
    //     },
    //     decryptions: [],
    //     response: undefined,
    //     logs: "",
    //   }
    // ]
  
    // -- assertions
    res.forEach((r) => {
      if (!r?.signatures.sig.r) {
        throw new Error(`Expected "r" in res.signatures.sig`);
      }
      if (!r?.signatures.sig.s) {
        throw new Error(`Expected "s" in res.signatures.sig`);
      }
  
      if (!r?.signatures.sig.dataSigned) {
        throw new Error(`Expected "dataSigned" in res.signatures.sig`);
      }
  
      if (!r?.signatures.sig.publicKey) {
        throw new Error(`Expected "publicKey" in res.signatures.sig`);
      }
  
      // -- signatures.sig.signature must start with 0x
      if (!r?.signatures.sig.signature.startsWith('0x')) {
        throw new Error(`Expected "signature" to start with 0x`);
      }
  
      // -- signatures.sig.recid must be parseable as a number
      if (isNaN(r?.signatures.sig.recid)) {
        throw new Error(`Expected "recid" to be parseable as a number`);
      }
    });
  });

  it("PKP Sign", async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
  
    const runWithSessionSigs = await devEnv.litNodeClient?.pkpSign({
      toSign: alice.loveLetter,
      pubKey: alice.pkp?.publicKey!,
      sessionSigs: eoaSessionSigs!,
    });
  
    devEnv.releasePrivateKeyFromUser(alice);
  
    // Expected output:
    // {
    //   r: "25fc0d2fecde8ed801e9fee5ad26f2cf61d82e6f45c8ad1ad1e4798d3b747fd9",
    //   s: "549fe745b4a09536e6e7108d814cf7e44b93f1d73c41931b8d57d1b101833214",
    //   recid: 1,
    //   signature: "0x25fc0d2fecde8ed801e9fee5ad26f2cf61d82e6f45c8ad1ad1e4798d3b747fd9549fe745b4a09536e6e7108d814cf7e44b93f1d73c41931b8d57d1b1018332141c",
    //   publicKey: "04A3CD53CCF63597D3FFCD1DF1E8236F642C7DF8196F532C8104625635DC55A1EE59ABD2959077432FF635DF2CED36CC153050902B71291C4D4867E7DAAF964049",
    //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    // }
  
    // -- assertions
    // r, s, dataSigned, and public key should be present
    if (!runWithSessionSigs?.r) {
      throw new Error(`Expected "r" in runWithSessionSigs`);
    }
    if (!runWithSessionSigs?.s) {
      throw new Error(`Expected "s" in runWithSessionSigs`);
    }
    if (!runWithSessionSigs?.dataSigned) {
      throw new Error(`Expected "dataSigned" in runWithSessionSigs`);
    }
    if (!runWithSessionSigs?.publicKey) {
      throw new Error(`Expected "publicKey" in runWithSessionSigs`);
    }
  
    // signature must start with 0x
    if (!runWithSessionSigs.signature.startsWith('0x')) {
      throw new Error(`Expected "signature" to start with 0x`);
    }
  
    // recid must be parseable as a number
    if (isNaN(runWithSessionSigs.recid)) {
      throw new Error(`Expected "recid" to be parseable as a number`);
    }
  });
});
