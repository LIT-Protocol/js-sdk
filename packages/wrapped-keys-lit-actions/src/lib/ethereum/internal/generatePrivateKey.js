/* global ethers */

export function generateEthereumPrivateKey() {
  const wallet = ethers.Wallet.createRandom();

  return {
    privateKey: wallet.privateKey.toString(),
    publicKey: wallet.publicKey,
  };
}
