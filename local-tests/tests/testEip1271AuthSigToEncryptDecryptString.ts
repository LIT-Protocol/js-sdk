import { AuthSig, BaseSiweMessage, ILitNodeClient } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@lit-protocol/misc';
import { encryptString, decryptToString } from '@lit-protocol/encryption';
import { CENTRALISATION_BY_NETWORK } from '@lit-protocol/constants';
import { createSiweMessage, generateAuthSig } from '@lit-protocol/auth-helpers';
import { hashMessage } from 'ethers/lib/utils';
import { ethers } from 'ethers';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testEip1271AuthSigToEncryptDecryptString
 * ✅ NETWORK=datil-test yarn test:local --filter=testEip1271AuthSigToEncryptDecryptString
 * ✅ NETWORK=custom yarn test:local --filter=testEip1271AuthSigToEncryptDecryptString
 */
export const testEip1271AuthSigToEncryptDecryptString = async (
  devEnv: TinnyEnvironment
) => {
  const dataToEncrypt = 'Decrypted from EIP1271 AuthSig';
  const contractAddress = '0x88105De2349f59767278Fd15c0858f806c08d615';
  const abi = [
    "function setTempOwner(address _tempOwner) external",
    "function getTempOwner() external view returns (address)",
    "function isValidSignature(bytes32 _hash, bytes calldata _signature) external view returns (bytes4)"
  ];

  const alice = await devEnv.createRandomPerson();
  if (CENTRALISATION_BY_NETWORK[devEnv.network] === 'decentralised') {
    // The capacity credits NFT owner automatically uses the capacity credits
    // to pay for the encryption
    await alice.mintCapacityCreditsNFT();
  }

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

  log('encryptRes:', encryptRes);

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

  const siweSignature = await alice.wallet.signMessage(siweMessage);
  console.log('siweSignature: ', siweSignature);

  // Internally generate from wallet.signMessage
  const hash = hashMessage(siweMessage);
  const hashUint8Array = ethers.utils.arrayify(hash);
  console.log('hash:', hash);
  console.log('hashUint8Array: ', hashUint8Array); // Match it against the hash done on the nodes before calling verifySignature()

  // Test from the contract
  const contract = new ethers.Contract(contractAddress, abi, alice.wallet);

  console.log("1. Setting temp owner...");
  const setTempOwnerTx = await contract.setTempOwner(alice.wallet.address);
  await setTempOwnerTx.wait();
  console.log("Set temp owner transaction hash: ", setTempOwnerTx.hash);

  const tempOwner = await contract.getTempOwner();
  if (tempOwner.toLowerCase() !== alice.wallet.address.toLowerCase()) {
    throw new Error(`Expected temp owner to be ${alice.wallet.address} but got ${tempOwner}`);
  }

  console.log("2. Checking isValidSignature...");
  try {
    const isValid = await contract.isValidSignature(hash, siweSignature);
    if (isValid !== "0x1626ba7e") {
      throw new Error(`Expected isValidSignature to be 0x1626ba7e but got ${isValid}`);
    }
  } catch (error) {
    console.error("Error calling isValidSignature:", error);
    throw error;
  }

  const eip1271AuthSig: AuthSig = {
    address: contractAddress,
    sig: siweSignature,
    derivedVia: "EIP1271",
    signedMessage: siweMessage,
  };

  // log(eip1271AuthSig);

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

  console.log('✅ decryptRes:', decryptRes);
};
