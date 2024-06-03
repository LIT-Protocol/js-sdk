import { importer } from 'ipfs-unixfs-importer';
import { Buffer } from 'buffer';

/**
 * Converts a string to an IPFS hash.
 * @param input - The input string to convert.
 * @returns A Promise that resolves to the IPFS hash.
 * @throws An error if the generated hash does not start with 'Qm'.
 */
export async function stringToIpfsHash(input: string): Promise<string> {
  const blockput = {
    put: async (block: any) => {
      return block.cid;
    },
  };

  // Convert the input string to a Buffer
  const content = Buffer.from(input);

  // Import the content to create an IPFS file
  const files = importer([{ content }], blockput as any);

  // Get the first (and only) file result
  const result = (await files.next()).value;

  const ipfsHash = (result as any).cid.toString();

  if (!ipfsHash.startsWith('Qm')) {
    throw new Error('Generated hash does not start with Qm');
  }

  return ipfsHash;
}

export function randomSolanaPrivateKey() {
  const BASE58_ALPHABET =
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const SOLANA_PRIVATE_KEY_LENGTH = 88;

  let result = '';
  const charactersLength = BASE58_ALPHABET.length;
  for (let i = 0; i < SOLANA_PRIVATE_KEY_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += BASE58_ALPHABET.charAt(randomIndex);
  }
  return result;
}
