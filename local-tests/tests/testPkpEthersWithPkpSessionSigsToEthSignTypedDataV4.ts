import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  SignTypedDataVersion,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4
 * ✅ NETWORK=manzano yarn test:local --filter=testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4
 * ✅ NETWORK=localchain yarn test:local --filter=testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4
 */
export const testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4 = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    controllerSessionSigs: pkpSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- eth_signTypedData_v3 parameters
  try {
    const msgParams = {
      domain: {
        chainId: 80001,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    };

    const signature = await ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_signTypedData_v4',
        params: [alice.pkp.ethAddress, JSON.stringify(msgParams)],
      },
    });

    const recoveredAddr = recoverTypedSignature({
      data: msgParams as any,
      signature: signature,
      version: SignTypedDataVersion.V4,
    });

    if (signature.length !== 132) {
      throw new Error('❌ signature should be 132 characters long');
    }

    if (recoveredAddr.toLowerCase() !== alice.pkp.ethAddress.toLowerCase()) {
      throw new Error(
        `❌ recoveredAddr ${recoveredAddr} should be ${alice.pkp.ethAddress}`
      );
    }
  } catch (e) {
    throw new Error(`❌ ${e.toString()}`);
  }
};
