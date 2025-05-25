import { importer } from 'ipfs-unixfs-importer';

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

  // Convert the input string to a Uint8Array
  const content = new TextEncoder().encode(input);

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
