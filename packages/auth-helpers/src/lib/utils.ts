import { InvalidArgumentException } from '@lit-protocol/constants';

/**
 * Formats the resource ID to a 32-byte hex string.
 *
 * - Takes out '0x' and makes the string 64 characters long.
 * - Adds zeros to make short strings 64 characters.
 * - Doesn't change valid 64-character hex strings.
 * - Returns '*' as is.
 * - Returns the original if it has bad hex characters.
 * - Doesn't change 64-character strings.
 * - Adds zeros to make short hex strings 64 characters.
 * - Returns the original if it partly matches hex.
 * - Throws an error if the string is too long.
 *
 * @param resource The identifier for the resource. This should be the PKP token ID.
 * @returns A 32-byte hex string representing the resource ID.
 * @throws Will throw an error if the input exceeds 64 characters.
 */
export function formatPKPResource(resource: string): string {
  // Remove the '0x' prefix if present
  let fixedResource = resource.startsWith('0x') ? resource.slice(2) : resource;

  // Throw an error if the resource length exceeds 64 characters
  if (fixedResource.length > 64) {
    throw new InvalidArgumentException(
      {
        info: {
          resource,
        },
      },
      'Resource ID exceeds 64 characters (32 bytes) in length.'
    );
  }

  /**
   * The pattern matches any sequence of 6 characters that are
   * either digits (0-9) or letters A-F (both uppercase and lowercase).
   */
  const hexRegex = /^[0-9A-Fa-f]+$/;

  // Ensure the resource is a valid hex string and not a wildcard '*'
  if (fixedResource !== '*' && hexRegex.test(fixedResource)) {
    // Pad the resource ID with leading zeros to make it 32 bytes (64 hex characters)
    fixedResource = fixedResource.padStart(64, '0');
  }

  return fixedResource;
}
