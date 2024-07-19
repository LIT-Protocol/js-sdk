import { expect, jest, test } from '@jest/globals';
import { TinnyEnvironment } from '../../setup/tinny-environment';
import { getEoaSessionSigs } from './../../setup/session-sigs/get-eoa-session-sigs';
import { LIT_TESTNET } from './../../setup/tinny-config';
import { AccessControlConditions } from '../../setup/accs/accs';
import { getLitActionSessionSigs } from '../../setup/session-sigs/get-lit-action-session-sigs';
import { LitAbility, LitAccessControlConditionResource, LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient } from '@lit-protocol/types';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}



describe("LitActionSessionSigs", () => {
    let devEnv: TinnyEnvironment;
    beforeAll(async () => {
      devEnv = new TinnyEnvironment();
      await devEnv.init();
    });
    
    it("ExecuteJsConsole", async () => {
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
        expect(runWithSessionSigs?.r).toBeDefined();
        expect(!runWithSessionSigs?.s).toBeDefined();
        expect(runWithSessionSigs?.dataSigned).toBeDefined();
        
        expect(runWithSessionSigs?.publicKey).toBeDefined();
      
        // signature must start with 0x
        expect(runWithSessionSigs?.signature?.startsWith('0x')).toBeDefined(); 
      
        // recid must be parseable as a number
        expect(isNaN(runWithSessionSigs?.recid!)).toBeFalsy();
    });

    it("DecryptString", async () => {
        devEnv.setUnavailable(LIT_TESTNET.MANZANO);

        const alice = await devEnv.createRandomPerson();
        // set access control conditions for encrypting and decrypting
        const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
          userAddress: alice.authMethodOwnedPkp?.ethAddress!,
        });
    
        const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice);
    
        const encryptRes = await LitJsSdk.encryptString(
          {
            accessControlConditions: accs,
            dataToEncrypt: 'Hello world',
          },
          devEnv.litNodeClient as unknown as ILitNodeClient
        );
    
        console.log('encryptRes:', encryptRes);
    
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
    
        const litActionSessionSigs2 = await getLitActionSessionSigs(devEnv, alice, [
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
    
        if (decryptRes !== 'Hello world') {
          throw new Error(
            `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
          );
        }
    });


    it("Claim Keys", async () => {
        const alice = await devEnv.createRandomPerson();
        const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice, [
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
    });
});