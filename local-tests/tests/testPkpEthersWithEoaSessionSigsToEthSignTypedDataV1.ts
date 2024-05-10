import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  SignTypedDataVersion,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1
 * ✅ NETWORK=manzano yarn test:local --filter=testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1
 * ✅ NETWORK=localchain yarn test:local --filter=testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1
 */
export const testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1 = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- eth_signTypedData_v1 parameters
  try {
    const msgParams = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ];

    const signature = await ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_signTypedData_v1',
        params: [msgParams, alice.pkp.ethAddress],
      },
    });

    const signatureBytes = ethers.utils.arrayify(signature);

    const recoveredAddr = recoverTypedSignature({
      data: msgParams,
      signature: signatureBytes as any,
      version: SignTypedDataVersion.V1,
    });

    // ==================== Post-Validation ====================
    if (signature.length !== 132) {
      throw new Error('❌ signature should be 132 characters long');
    }

    if (recoveredAddr.toLowerCase() !== alice.pkp.ethAddress.toLowerCase()) {
      throw new Error(
        `❌ recoveredAddr ${recoveredAddr} should be ${alice.pkp.ethAddress}`
      );
    }

    console.log('signature: ', signature);
    console.log('recoveredAddr: ', recoveredAddr);
  } catch (e) {
    throw new Error(`❌ ${e.toString()}`);
  }
};
