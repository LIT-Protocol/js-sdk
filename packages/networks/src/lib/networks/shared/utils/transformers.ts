import { Hex } from "viem";

/**
 * Ensures a hex string has '0x' prefix
 * @param value - The hex string to check
 * @returns The hex string with '0x' prefix
 */
export function hexPrefixed(value: string): Hex {
  return value.startsWith("0x") ? (value as Hex) : (`0x${value}` as Hex);
}

/**
 * Safely converts a value to BigInt, returns 0n if conversion fails
 */
export function safeBigInt(value: string | number): bigint {
  try {
    if (typeof value === "string" && value.trim() === "") return 0n;
    return BigInt(value);
  } catch {
    return 0n;
  }
}

/**
 * @example
 * const obj = ['a', 'b', 'c']
 * ObjectMapFromArray(obj) // { a: 'a', b: 'b', c: 'c' }
 */
export const ObjectMapFromArray = <T extends readonly string[]>(arr: T) => {
  return arr.reduce(
    (acc, scope) => ({ ...acc, [scope]: scope }),
    {} as { [K in T[number]]: K }
  );
};

/**
 * Generates an array of validator URLs based on the given validator structs and network configurations.
 *
 * @property {ValidatorStruct[]} activeValidatorStructs - Array of validator structures containing IP and port information.
 * @returns {string[]} Array of constructed validator URLs.
 *
 * @example
 * // Example input
 * const activeValidatorStructs = [
 *   { ip: 3232235777, port: 443 }, // IP: 192.168.1.1
 *   { ip: 3232235778, port: 80 },  // IP: 192.168.1.2
 * ];
 *
 * // Example output
 * const urls = generateValidatorURLs(activeValidatorStructs);
 * console.log(urls);
 * Output: [
 *   "192.168.1.1:443",
 *   "192.168.1.2:80"
 * ]
 */
export function generateValidatorURLs(
  ipAndPorts: {
    ip: number;
    port: number;
  }[]
): string[] {
  return ipAndPorts.map((item) => {
    const ip = intToIP(item.ip);
    const port = item.port;
    return `${ip}:${port}`;
  });
}

/**
 * Converts an integer IP address to a string representation of the IP address.
 *
 * @param ip - The integer IP address to convert.
 * @returns The string representation of the IP address.
 */
export const intToIP = (ip: number) => {
  // Convert integer to binary string and pad with leading zeros to make it 32-bit
  const binaryString = ip.toString(2).padStart(32, "0");
  // Split into octets and convert each one to decimal
  const ipArray = [];
  for (let i = 0; i < 32; i += 8) {
    ipArray.push(parseInt(binaryString.substring(i, i + 8), 2));
  }
  // Join the octets with dots to form the IP address
  return ipArray.join(".");
};