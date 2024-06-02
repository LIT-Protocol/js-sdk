/**
 * Sanitise strings in an object by removing double quotes.
 * - remove quotes from the signed data eg '"walup"' => 'walup'
 * @param obj The object to sanitize
 *
 * @returns The sanitized object
 */
export const removeDoubleQuotes = (obj: any) => {
  for (const key of Object.keys(obj)) {
    const value = (obj as any)[key];

    for (const subkey of Object.keys(value)) {
      if (typeof value[subkey] === 'string') {
        value[subkey] = value[subkey].replaceAll('"', '');
      }
    }
  }

  return obj;
};
