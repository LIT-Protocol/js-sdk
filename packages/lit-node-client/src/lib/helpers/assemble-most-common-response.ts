import { mostCommonValue } from '@lit-protocol/core';

export const assembleMostCommonResponse = (responses: object[]): object => {
  const result: Record<string, any> = {};

  // Aggregate all values for each key across all responses
  const keys = new Set(responses.flatMap(Object.keys));

  for (const key of keys) {
    const values = responses.map(
      (response: Record<string, any>) => response[key]
    );

    // Filter out undefined first and unmatching type values after before processing
    const definedValues = values.filter(
      (value) => value !== undefined && value !== ''
    );
    const valuesType = mostCommonValue(
      definedValues.map((value) => typeof value)
    );
    const filteredValues = values.filter(
      (value) => typeof value === valuesType
    );

    if (filteredValues.length === 0) {
      result[key] = undefined; // or set a default value if needed
    } else if (valuesType === 'object' && !Array.isArray(filteredValues[0])) {
      // Recursive case for objects
      result[key] = assembleMostCommonResponse(filteredValues);
    } else {
      // Most common element from filtered values
      result[key] = mostCommonValue(filteredValues);
    }
  }

  return result;
};
