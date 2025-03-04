/**
 * Attempts to normalize a string by unescaping it until it can be parsed as a JSON object,
 * then stringifies it exactly once. If the input is a regular string that does not represent
 * a JSON object or array, the function will return it as is without modification.
 * This function is designed to handle cases where strings might be excessively escaped due
 * to multiple layers of encoding, ensuring that JSON data is stored in a consistent and
 * predictable format, and regular strings are left unchanged.
 *
 * @param input The potentially excessively escaped string.
 * @return A string that is either the JSON.stringify version of the original JSON object
 *         or the original string if it does not represent a JSON object or array.
 */
export function normalizeAndStringify(input: string): string {
  try {
    // Directly return the string if it's not in a JSON format
    if (!input.startsWith('{') && !input.startsWith('[')) {
      return input;
    }

    // Attempt to parse the input as JSON
    const parsed = JSON.parse(input);

    // If parsing succeeds, return the stringified version of the parsed JSON
    return JSON.stringify(parsed);
  } catch (error) {
    // If parsing fails, it might be due to extra escaping
    const unescaped = input.replace(/\\(.)/g, '$1');

    // If unescaping doesn't change the string, return it as is
    if (input === unescaped) {
      return input;
    }

    // Otherwise, recursively call the function with the unescaped string
    return normalizeAndStringify(unescaped);
  }
}
