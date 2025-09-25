/**
 * Formats a network name by capitalizing words after hyphens
 * @param network The network name to format
 * @returns The formatted network name
 */
export function formatNetworkName(network: string): string {
  return network
    .split('-')
    .map((word, i) =>
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
}
