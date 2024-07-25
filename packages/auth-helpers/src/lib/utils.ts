/**
 * Formats the resource ID to a 32-byte hex string.
 * @param resource The identifier for the resource. This should be the PKP token ID.
 * @returns A 32-byte hex string representing the resource ID.
 * @throws Will throw an error if the input exceeds 64 characters.
 */
export function formaPKPResource(resource: string): string {
  // Remove the '0x' prefix if present
  let fixedResource = resource.startsWith('0x') ? resource.slice(2) : resource;

  // Throw an error if the resource length exceeds 64 characters
  if (fixedResource.length > 64) {
    throw new Error('Resource ID exceeds 64 characters (32 bytes) in length.');
  }

  // Regex to validate hex strings
  const hexRegex = /^[0-9A-Fa-f]+$/;

  // Ensure the resource is a valid hex string and not a wildcard '*'
  if (fixedResource !== '*' && hexRegex.test(fixedResource)) {
    // Pad the resource ID with leading zeros to make it 32 bytes (64 hex characters)
    fixedResource = fixedResource.padStart(64, '0');
  }

  return fixedResource;
}
