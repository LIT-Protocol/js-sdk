/**
 * The global ethers library (5.7.0) is available on Lit Action (Unbundled)
 */
import { ethers } from 'ethers';

export function generateEthereumPrivateKey() {
  const wallet = ethers.Wallet.createRandom();

  return {
    privateKey: wallet.privateKey.toString(),
    publicKey: wallet.publicKey,
  };
}
