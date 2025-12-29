/**
 * Helper to upload Lit Action code to IPFS using Pinata
 */

import { getIpfsId } from '@lit-protocol/lit-client/ipfs';

/**
 * Checks if content exists on IPFS by attempting to fetch it
 * @param ipfsCid - The IPFS CID to check
 * @returns true if the content exists and is accessible, false otherwise
 */
async function checkIfExistsOnIpfs(ipfsCid: string): Promise<boolean> {
  try {
    // Try multiple IPFS gateways for better reliability
    const gateways = [
      `https://ipfs.io/ipfs/${ipfsCid}`,
      `https://cloudflare-ipfs.com/ipfs/${ipfsCid}`,
      `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
    ];

    // Try the first gateway with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(gateways[0], {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response.ok;
  } catch (error) {
    // If fetch fails, assume content doesn't exist or is not accessible
    return false;
  }
}

/**
 * Uploads a Lit Action code string to IPFS via Pinata
 * First computes the expected IPFS CID and checks if it already exists.
 * If it exists, skips the upload and returns the CID.
 *
 * @param litActionCode - The Lit Action code as a string
 * @param filename - Optional filename for the upload (defaults to 'lit-action.js')
 * @returns The IPFS CID (hash) of the uploaded file
 * @throws Error if PINATA_JWT is not set or upload fails
 *
 * @example
 * const code = `(async () => { Lit.Actions.setResponse({ response: 'true' }); })();`;
 * const ipfsCid = await uploadLitActionToIpfs(code);
 * console.log('Uploaded to IPFS:', ipfsCid);
 */
export async function uploadLitActionToIpfs(
  litActionCode: string,
  filename: string = 'lit-action.js'
): Promise<string> {
  try {
    // First, compute the expected IPFS CID
    console.log(`🔍 Computing IPFS CID for ${filename}...`);
    const expectedCid = await getIpfsId(litActionCode);
    console.log(`📋 Computed CID: ${expectedCid}`);

    // Check if this CID already exists on IPFS
    console.log(`🔎 Checking if CID already exists on IPFS...`);
    const exists = await checkIfExistsOnIpfs(expectedCid);

    if (exists) {
      console.log(`✅ Content already exists on IPFS: ${expectedCid}`);
      console.log(`🔗 IPFS URL: https://ipfs.io/ipfs/${expectedCid}`);
      console.log(`⏭️  Skipping upload`);
      return expectedCid;
    }

    console.log(`❌ Content not found on IPFS, uploading...`);

    // Get Pinata JWT from environment variable
    const PINATA_JWT = process.env.PINATA_JWT;
    if (!PINATA_JWT) {
      throw new Error(
        'PINATA_JWT environment variable is not set. Please add it to your .env file.'
      );
    }

    console.log(`📤 Uploading ${filename} to IPFS via Pinata...`);

    const form = new FormData();
    form.append(
      'file',
      new Blob([litActionCode], { type: 'application/javascript' }),
      filename
    );

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to upload to IPFS. HTTP ${response.status}: ${text}`
      );
    }

    const data = await response.json();
    const uploadedCid = data.IpfsHash;

    // Verify the uploaded CID matches the computed CID
    if (uploadedCid !== expectedCid) {
      console.warn(
        `⚠️  Warning: Uploaded CID (${uploadedCid}) doesn't match computed CID (${expectedCid})`
      );
    }

    console.log(`✅ Successfully uploaded to IPFS: ${uploadedCid}`);
    console.log(`🔗 IPFS URL: https://ipfs.io/ipfs/${uploadedCid}`);

    return uploadedCid;
  } catch (error) {
    console.error('❌ Error uploading Lit Action to IPFS:', error);
    throw error;
  }
}

/**
 * Uploads a Lit Action to IPFS and returns the full ipfs:// URL
 * @param litActionCode - The Lit Action code as a string
 * @param filename - Optional filename for the upload
 * @returns The full ipfs:// URL (e.g., 'ipfs://QmXxx...')
 */
export async function uploadLitActionToIpfsWithUrl(
  litActionCode: string,
  filename?: string
): Promise<string> {
  const ipfsCid = await uploadLitActionToIpfs(litActionCode, filename);
  return `ipfs://${ipfsCid}`;
}
