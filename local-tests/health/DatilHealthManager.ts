import { getEoaSessionSigs } from "local-tests/setup/session-sigs/get-eoa-session-sigs";
import { getPkpSessionSigs } from "local-tests/setup/session-sigs/get-pkp-session-sigs";
import { TinnyEnvironment } from "local-tests/setup/tinny-environment"
import { TinnyPerson } from "local-tests/setup/tinny-person";
import { LIT_ABILITY } from '@lit-protocol/constants';
import { ILitNodeClient } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { encryptString, decryptToString } from '@lit-protocol/encryption';

export class DatilHealthManager {

  env: TinnyEnvironment;
  alice: TinnyPerson;
  eoaSessionSigs: any;

  constructor(){
    this.env = new TinnyEnvironment();
  }

  async init(){
    await this.env.init();
  }

  // ========== Person Creation ==========
  // create a person
  // this action contains chain & rpc interactions
  // best to cache it, but for the time being, we will create a new person for each test, since we are only running this test
  // once in every 30 minutes.
  async initPerson(){
    this.alice = await this.env.createNewPerson("Alice");
    this.eoaSessionSigs = await getEoaSessionSigs(this.env, this.alice);
  }

  validatePrerequisites(){
    if(!this.alice){
      throw new Error("❌ Person not initialized");
    }
    if(!this.eoaSessionSigs){
      throw new Error("❌ EOA Session Sigs not initialized");
    }
  }


  // ========== Endpoint Tests ==========
  handshakeTest = async () => {
    try{
      await this.env.setupLitNodeClient();
    }catch(e){
      console.error("❌ Failed to setup Lit Node Client");
      throw e;
    }
  }

  pkpSignTest = async () => {
    this.validatePrerequisites();
    try{
      await this.env.litNodeClient.pkpSign({
        toSign: this.alice.loveLetter,
        pubKey: this.alice.pkp.publicKey,
        sessionSigs: this.eoaSessionSigs,
      })
    }catch(e){
      console.error("❌ Failed to run pkpSign");
      throw e;
    }
  }

  signSessionKeyTest = async () => {
    this.validatePrerequisites();
    try{
      await getPkpSessionSigs(this.env, this.alice);
    }catch(e){
      console.error("❌ Failed to run signSessionKey");
      throw e;
    }
  }

  executeJsTest = async () => {
    this.validatePrerequisites();
    try{
      await this.env.litNodeClient.executeJs({
        sessionSigs: this.eoaSessionSigs,
        code: `(async () => {
          const sigShare = await LitActions.signEcdsa({
            toSign: dataToSign,
            publicKey,
            sigName: "sig",
          });
        })();`,
        jsParams: {
          dataToSign: this.alice.loveLetter,
          publicKey: this.alice.pkp.publicKey,
        }
      })
    }catch(e){
      console.error("❌ Failed to run executeJs");
      throw e;
    }
  }

  decryptTest = async () => {
    this.validatePrerequisites();
    try{
      // Set access control conditions for encrypting and decrypting
      const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
        userAddress: this.alice.wallet.address,
      });

      // First encrypt some test data
      const encryptRes = await encryptString(
        {
          accessControlConditions: accs,
          dataToEncrypt: 'Hello world',
        },
        this.env.litNodeClient as unknown as ILitNodeClient
      );

      if (!encryptRes.ciphertext) {
        throw new Error(`Expected "ciphertext" in encryptRes`);
      }

      if (!encryptRes.dataToEncryptHash) {
        throw new Error(`Expected "dataToEncryptHash" in encryptRes`);
      }

      // Generate resource string for the encrypted data
      const accsResourceString =
        await LitAccessControlConditionResource.generateResourceString(
          accs,
          encryptRes.dataToEncryptHash
        );

      // Get session sigs with decryption capability
      const eoaSessionSigs = await getEoaSessionSigs(this.env, this.alice, [
        {
          resource: new LitAccessControlConditionResource(accsResourceString),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
      ]);

      // Decrypt the encrypted string
      const decryptRes = await decryptToString(
        {
          accessControlConditions: accs,
          ciphertext: encryptRes.ciphertext,
          dataToEncryptHash: encryptRes.dataToEncryptHash,
          sessionSigs: eoaSessionSigs,
          chain: 'ethereum',
        },
        this.env.litNodeClient as unknown as ILitNodeClient
      );

      if (decryptRes !== 'Hello world') {
        throw new Error(
          `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
        );
      }
    }catch(e){
      console.error("❌ Failed to run decrypt");
      throw e;
    }
  }
}