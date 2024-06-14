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
import * as bs58 from 'bs58';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
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
      dataToEncrypt: bs58.encode(solanaKeypair.secretKey),
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  const sessionSigs = await devEnv.litNodeClient.getSessionSigs({
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
      {
        resource: new LitAccessControlConditionResource('*'),
        ability: LitAbility.AccessControlConditionDecryption,
      },
    ],
    authNeededCallback: async ({ uri, resourceAbilityRequests }) => {
      const toSign = await createSiweMessageWithRecaps({
        uri: uri!,
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
        resources: resourceAbilityRequests!,
        walletAddress: await alice.wallet.getAddress(),
        nonce: await devEnv.litNodeClient!.getLatestBlockhash(),
        litNodeClient: devEnv.litNodeClient,
      });
      return await generateAuthSig({
        signer: alice.wallet,
        toSign,
      });
    },
  });

  const signature = await devEnv.litNodeClient.executeJs({
    sessionSigs,
    ipfsId: signMessageWithSolanaEncryptedKeyLitActionIpfsCid,
    jsParams: {
      accessControlConditions: decryptionAccessControlConditions,
      ciphertext,
      dataToEncryptHash,
      sessionSigs,
      message: messageToSign,
    },
  });
  console.log('signature', signature);

  log('✅ testSignMessageWithSolanaEncryptedKey');
};
