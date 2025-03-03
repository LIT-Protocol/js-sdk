import { mostCommonValue } from '@lit-protocol/core';

export const assembleMostCommonResponse = (responses: object[]): object => {
  const result: Record<string, any> = {};

  // Aggregate all values for each key across all responses
  const keys = new Set(responses.flatMap(Object.keys));

  for (const key of keys) {
    const values = responses.map(
      (response: Record<string, any>) => response[key]
    );

    // Filter out undefined values before processing
    const filteredValues = values.filter(
      (value) => value !== undefined && value !== ''
    );

    if (filteredValues.length === 0) {
      result[key] = undefined; // or set a default value if needed
    } else if (
      typeof filteredValues[0] === 'object' &&
      !Array.isArray(filteredValues[0])
    ) {
      // Recursive case for objects
      result[key] = assembleMostCommonResponse(filteredValues);
    } else {
      // Most common element from filtered values
      result[key] = mostCommonValue(filteredValues);
    }
  }

  return result;
};
