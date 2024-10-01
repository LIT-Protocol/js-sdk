import { Keypair } from '@solana/web3.js';

export function generateSolanaPrivateKey() {
  const solanaKeypair = Keypair.generate();

  return {
    privateKey: Buffer.from(solanaKeypair.secretKey).toString('hex'),
    publicKey: solanaKeypair.publicKey.toString(),
  };
}
