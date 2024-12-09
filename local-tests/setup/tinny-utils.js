import { importer } from 'ipfs-unixfs-importer';
import { Buffer } from 'buffer';
/**
 * Converts a string to an IPFS hash.
 * @param input - The input string to convert.
 * @returns A Promise that resolves to the IPFS hash.
 * @throws An error if the generated hash does not start with 'Qm'.
 */
export async function stringToIpfsHash(input) {
    const blockput = {
        put: async (block) => {
            return block.cid;
        },
    };
    // Convert the input string to a Buffer
    const content = Buffer.from(input);
    // Import the content to create an IPFS file
    const files = importer([{ content }], blockput);
    // Get the first (and only) file result
    const result = (await files.next()).value;
    const ipfsHash = result.cid.toString();
    if (!ipfsHash.startsWith('Qm')) {
        throw new Error('Generated hash does not start with Qm');
    }
    return ipfsHash;
}
export function randomSolanaPrivateKey() {
    const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const SOLANA_PRIVATE_KEY_LENGTH = 88;
    let result = '';
    const charactersLength = BASE58_ALPHABET.length;
    for (let i = 0; i < SOLANA_PRIVATE_KEY_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += BASE58_ALPHABET.charAt(randomIndex);
    }
    return result;
}
/**
 * Wraps a promise with a timeout.
 * If the promise does not resolve or reject within the specified time, it will be rejected with a "Timed out" error.
 *
 * @param promise - The promise to wrap with a timeout.
 * @param ms - The timeout duration in milliseconds.
 * @returns A new promise that resolves or rejects based on the original promise or the timeout.
 */
export function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), ms));
    return Promise.race([promise, timeout]);
}
function isErrorWithMessage(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string');
}
// eslint-disable-next-line import/prefer-default-export
export function toErrorWithMessage(maybeError) {
    if (isErrorWithMessage(maybeError))
        return maybeError;
    try {
        return new Error(JSON.stringify(maybeError));
    }
    catch {
        // fallback in case there's an error stringifying the maybeError
        // like with circular references for example.
        return new Error(String(maybeError));
    }
}
//# sourceMappingURL=tinny-utils.js.map