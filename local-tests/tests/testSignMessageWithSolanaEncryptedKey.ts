import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { signMessageWithSolanaEncryptedKeyLitActionIpfsCid } from '@lit-protocol/wrapped-keys';
import {
  AccessControlConditions,
  ILitNodeClient,
  LitAbility,
} from '@lit-protocol/types';
import { encryptString } from '@lit-protocol/lit-node-client-nodejs';
import { Keypair } from '@solana/web3.js';
import {
  LitAccessControlConditionResource,
  LitActionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from '@lit-protocol/auth-helpers';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ❔ NETWORK=localchain yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 */
export const testSignMessageWithSolanaEncryptedKey = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const solanaKeypair = Keypair.generate();
  const messageToSign = 'This is a test message';
  const decryptionAccessControlConditions: AccessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '=',
        value: await alice.wallet.getAddress(),
      },
    },
  ];

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      accessControlConditions: decryptionAccessControlConditions,
      dataToEncrypt: Buffer.from(solanaKeypair.secretKey).toString('hex'),
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  const sessionSigs = await getEoaSessionSigs(devEnv, alice, [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
    {
      resource: new LitAccessControlConditionResource('*'),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ]);

  const result = await devEnv.litNodeClient.executeJs({
    sessionSigs,
    ipfsId: signMessageWithSolanaEncryptedKeyLitActionIpfsCid,
    jsParams: {
      accessControlConditions: decryptionAccessControlConditions,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
    },
  });

  const signatureIsValidForPublicKey = nacl.sign.detached.verify(
    Buffer.from(messageToSign),
    bs58.decode(result.response as string),
    solanaKeypair.publicKey.toBuffer()
  );

  if (!signatureIsValidForPublicKey)
    throw new Error(
      `signature: ${
        result.response
      } doesn't validate for the Solana public key: ${solanaKeypair.publicKey.toString()}`
    );

  log('✅ testSignMessageWithSolanaEncryptedKey');
};
