import { AuthSig, BaseSiweMessage, ILitNodeClient } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@lit-protocol/misc';
import { encryptString, decryptToString } from '@lit-protocol/encryption';
import { CENTRALISATION_BY_NETWORK } from '@lit-protocol/constants';
import { createSiweMessage } from '@lit-protocol/auth-helpers';
import { joinSignature } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { createHash } from 'crypto';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testShaEip1271AuthSigToEncryptDecryptString
 * ✅ NETWORK=datil-test yarn test:local --filter=testShaEip1271AuthSigToEncryptDecryptString
 * ✅ NETWORK=custom yarn test:local --filter=testShaEip1271AuthSigToEncryptDecryptString
 */
export const testShaEip1271AuthSigToEncryptDecryptString = async (
  devEnv: TinnyEnvironment
) => {
  const dataToEncrypt = 'Decrypted from EIP1271 AuthSig';
  const contractAddress = '0x88105De2349f59767278Fd15c0858f806c08d615';
  const deployerAddress = '0x0b1C5E9E82393AD5d1d1e9a498BF7bAAC13b31Ee'; // No purpose other than to be a random address
  const abi = [
    'function setTempOwner(address _tempOwner) external',
    'function getTempOwner() external view returns (address)',
    'function isValidSignature(bytes32 _hash, bytes calldata _signature) external view returns (bytes4)',
  ];

  const alice = await devEnv.createRandomPerson();

  let accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: contractAddress,
  });
  accs[0].chain = 'yellowstone'; // Contract deployed on Yellowstone

  const encryptRes = await encryptString(
    {
      accessControlConditions: accs,
      dataToEncrypt,
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  // log('encryptRes:', encryptRes);

  if (!encryptRes.ciphertext) {
    throw new Error(`Expected "ciphertext" in encryptRes`);
  }

  if (!encryptRes.dataToEncryptHash) {
    throw new Error(`Expected "dataToEncryptHash" to in encryptRes`);
  }

  // Craft the SiweMessage to be hashed & signed
  const siweMessage = await createSiweMessage<BaseSiweMessage>({
    nonce: await devEnv.litNodeClient.getLatestBlockhash(),
    walletAddress: alice.wallet.address,
  });

  // Explicitly SHA256 hash the SIWE message
  const hash = createHash('sha256').update(siweMessage).digest();
  const hashHex = '0x' + hash.toString('hex');
  const hashUint8Array = ethers.utils.arrayify(hashHex);
  log('hash:', hashHex);
  log('hashUint8Array: ', hashUint8Array); // Match it against the hash done on the nodes before calling verifySignature()

  const siweSignature = joinSignature(
    alice.wallet._signingKey().signDigest(hashHex)
  );
  log('siweSignature: ', siweSignature);

  const eip1271AuthSig: AuthSig = {
    address: contractAddress,
    sig: siweSignature,
    derivedVia: 'EIP1271_SHA256',
    signedMessage: siweMessage,
  };

  // log(eip1271AuthSig);

  // Test from the contract
  const contract = new ethers.Contract(contractAddress, abi, alice.wallet);
  const setDeployerAsTempOwnerTx = await contract.setTempOwner(deployerAddress);
  await setDeployerAsTempOwnerTx.wait();

  log(
    '0. isValidSignature should FAIL since Alice (AuthSig.sig) is not the tempOwner yet'
  );
  try {
    const isValid = await contract.isValidSignature(hash, siweSignature);
    if (isValid === '0x1626ba7e') {
      throw new Error(
        `Expected isValidSignature to be 0xffffffff but got ${isValid}`
      );
    }
  } catch (error) {
    log('Error calling isValidSignature:', error);
    throw error;
  }

  try {
    const _decryptRes = await decryptToString(
      {
        accessControlConditions: accs,
        ciphertext: encryptRes.ciphertext,
        dataToEncryptHash: encryptRes.dataToEncryptHash,
        authSig: eip1271AuthSig,
        chain: 'yellowstone', // Deployed chain
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );
  } catch (error) {
    if (
      !error.message.includes('NodeContractAuthsigUnauthorized') ||
      !error.message.includes('Access control failed for Smart contract') ||
      !error.message.includes(
        'validation error: Authsig failed for contract 0x88105De2349f59767278Fd15c0858f806c08d615.  Return value was ffffffff.'
      )
    ) {
      throw new Error(
        `Expected error message to contain specific EIP1271 validation failure, but got: ${error}`
      );
    }
  }

  // Should PASS now
  log('1. Setting temp owner...');
  const setTempOwnerTx = await contract.setTempOwner(alice.wallet.address);
  await setTempOwnerTx.wait();
  log('Set tempOwner transaction hash: ', setTempOwnerTx.hash);

  const tempOwner = await contract.getTempOwner();
  if (tempOwner.toLowerCase() !== alice.wallet.address.toLowerCase()) {
    throw new Error(
      `Expected temp owner to be ${alice.wallet.address} but got ${tempOwner}`
    );
  }

  log('2. Checking isValidSignature...');
  try {
    const isValid = await contract.isValidSignature(hash, siweSignature);
    if (isValid !== '0x1626ba7e') {
      throw new Error(
        `Expected isValidSignature to be 0x1626ba7e but got ${isValid}`
      );
    }
  } catch (error) {
    log('Error calling isValidSignature:', error);
    throw error;
  }

  // -- Decrypt the encrypted string
  const decryptRes = await decryptToString(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      authSig: eip1271AuthSig,
      chain: 'yellowstone', // Deployed chain
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  if (decryptRes !== dataToEncrypt) {
    throw new Error(
      `Expected decryptRes to be ${dataToEncrypt} but got ${decryptRes}`
    );
  }

  log('✅ decryptRes:', decryptRes);
};
