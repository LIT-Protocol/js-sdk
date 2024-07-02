import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testPkpEthersWithEoaSessionSigsToEthSignTypedData
 * ✅ NETWORK=manzano yarn test:local --filter=testPkpEthersWithEoaSessionSigsToEthSignTypedData
 * ✅ NETWORK=localchain yarn test:local --filter=testPkpEthersWithEoaSessionSigsToEthSignTypedData
 */
export const testPkpEthersWithEoaSessionSigsToEthSignTypedData = async (
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

  // -- eth_signTypedData parameters
  try {
    // Example from https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L1033
    const msgParams = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 80001,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    };

    const signature = await ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_signTypedData',
        params: [alice.pkp.ethAddress, JSON.stringify(msgParams)],
      },
    });

    // https://docs.ethers.io/v5/api/utils/signing-key/#utils-verifyTypedData
    const recoveredAddr = ethers.utils.verifyTypedData(
      msgParams.domain,
      { Person: msgParams.types.Person, Mail: msgParams.types.Mail },
      msgParams.message,
      signature
    );

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
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
