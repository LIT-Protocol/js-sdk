import { getLitActionSessionSigs } from "../../setup/session-sigs/get-lit-action-session-sigs";
import { AccessControlConditions } from "../../setup/accs/accs";
import { LIT_TESTNET } from "../../setup/tinny-config";
import { TinnyEnvironment } from "../../setup/tinny-environment";
import { ILitNodeClient } from "@lit-protocol/types";
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { getEoaSessionSigsWithCapacityDelegations } from "../../setup/session-sigs/get-eoa-session-sigs";

describe("Lit Action Ops", () => {
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

    it("Broadcast and Collect", async () => {
        devEnv.setUnavailable(LIT_TESTNET.MANZANO);

        const alice = await devEnv.createRandomPerson();
        // set access control conditions for encrypting and decrypting
        const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
          userAddress: alice.authMethodOwnedPkp?.ethAddress!,
        });
      
        const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice);
      
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
        devEnv.releasePrivateKeyFromUser(alice);
      
        const response = res?.response;
        expect(response).toBeDefined();       
    });


    it("Decrypt And Combine", async () => {
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
      
        devEnv.releasePrivateKeyFromUser(alice);
      
        expect(res?.response).toEqual('Hello world') 
    });


    it("Sign and Combine ECDSA", async () => {
        const alice = await devEnv.createRandomPerson();
        const bob = await devEnv.createRandomPerson();
      
        const appOwnersCapacityDelegationAuthSig = (
          await devEnv.litNodeClient?.createCapacityDelegationAuthSig({
            dAppOwnerWallet: alice.wallet!,
          })
        )?.capacityDelegationAuthSig;
      
        // 3. Bob gets the capacity delegation authSig from somewhere and uses it to get session sigs
        const bobsSessionSigs = await getEoaSessionSigsWithCapacityDelegations(
          devEnv,
          bob.wallet,
          appOwnersCapacityDelegationAuthSig!
        );
      
        // -- printing out the recaps from the session sigs
        const bobsSingleSessionSig =
          bobsSessionSigs![devEnv.litNodeClient?.config.bootstrapUrls[0]!];
      
        console.log('bobsSingleSessionSig:', bobsSingleSessionSig);
      
        const regex = /urn:recap:[\w+\/=]+/g;
      
        const recaps = bobsSingleSessionSig.signedMessage.match(regex) || [];
      
        recaps.forEach((r) => {
          const encodedRecap = r.split(':')[2];
          const decodedRecap = Buffer.from(encodedRecap, 'base64').toString();
          console.log(decodedRecap);
        });
      
        // 4. Bob can now execute JS code using the capacity credits NFT
        // 5. Bob can now execute JS code using the capacity credits NFT
        const res = await devEnv.litNodeClient?.executeJs({
          sessionSigs: bobsSessionSigs,
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
            publicKey: bob.pkp?.publicKey,
          },
        });
      
        devEnv.releasePrivateKeyFromUser(alice);
        devEnv.releasePrivateKeyFromUser(bob);
      
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
    });
});