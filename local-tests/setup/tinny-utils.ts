import { importer } from 'ipfs-unixfs-importer';
import { Buffer } from 'buffer';

/**
 * Converts a string to an IPFS hash.
 * @param input - The input string to convert.
 * @returns A Promise that resolves to the IPFS hash.
 * @throws An error if the generated hash does not start with 'Qm'.
 */
export async function stringToIpfsHash(input: string): Promise<string> {
  // Convert the input string to a Buffer
  const content = Buffer.from(input);

  // Import the content to create an IPFS file
  const files = importer([{ content }], {} as any, { onlyHash: true });

  // Get the first (and only) file result
  const result = (await files.next()).value;

  const ipfsHash = (result as any).cid.toString();
  if (!ipfsHash.startsWith('Qm')) {
    throw new Error('Generated hash does not start with Qm');
  }

  return ipfsHash;
}
