import { ethers, Contract } from 'ethers';

import { log } from '@lit-protocol/misc';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testPkpEthersWithEoaSessionSigsToContractCall
 * ✅ NETWORK=datil-test yarn test:local --filter=testPkpEthersWithEoaSessionSigsToContractCall
 * ✅ NETWORK=custom yarn test:local --filter=testPkpEthersWithEoaSessionSigsToContractCall
 */
export const testPkpEthersWithEoaSessionSigsToContractCall = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  // Create and initialize PKPEthersWallet
  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    controllerSessionSigs: await getEoaSessionSigs(devEnv, alice),
  });

  await pkpEthersWallet.init();
  console.log("pkpEthersWallet.address:", pkpEthersWallet.address);

  // Minimal ABI for the PKP NFT contract
  const pkpNftAbi = [
    {
      inputs: [{ internalType: 'uint256', name: 'keyType', type: 'uint256' }],
      name: 'mintNext',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'mintCost',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const PKPNFTAddress = '0x487A9D096BB4B7Ac1520Cb12370e31e677B175EA';
  const pkpNftContract = new Contract(PKPNFTAddress, pkpNftAbi, pkpEthersWallet);

  // Get mint cost and fund the PKP wallet
  const mintCost = await pkpNftContract.mintCost();
  const requiredBalance = mintCost.add(ethers.utils.parseEther('0.001')); // mint cost + gas buffer

  await alice.wallet.sendTransaction({
    to: pkpEthersWallet.address,
    value: requiredBalance,
  }).then(tx => tx.wait());

  // Call contract method with explicit gas limit
  const mintTx = await pkpNftContract.mintNext(1, {
    value: mintCost,
    gasLimit: 5000000,
  });

  await mintTx.wait();

  log('✅ testPkpEthersWithEoaSessionSigsToContractCall passed');

  devEnv.releasePrivateKeyFromUser(alice);
};