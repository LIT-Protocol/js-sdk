/**
 * Conditional assertions that work both in test environments (with expect)
 * and standalone package environments (with simple assertions)
 */

// Check if expect is available (test environment)
const hasExpect = typeof expect !== 'undefined';

export const assert = {
  toBeDefined: (value: any, message?: string) => {
    if (hasExpect) {
      expect(value).toBeDefined();
    } else {
      if (value === undefined || value === null) {
        throw new Error(
          message || `Expected value to be defined but got ${value}`
        );
      }
    }
  },

  toBe: (actual: any, expected: any, message?: string) => {
    if (hasExpect) {
      expect(actual).toBe(expected);
    } else {
      if (actual !== expected) {
        throw new Error(message || `Expected ${actual} to be ${expected}`);
      }
    }
  },

  toEqual: (actual: any, expected: any, message?: string) => {
    if (hasExpect) {
      expect(actual).toEqual(expected);
    } else {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          message ||
            `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(
              expected
            )}`
        );
      }
    }
  },

  toMatch: (actual: string, pattern: RegExp, message?: string) => {
    if (hasExpect) {
      expect(actual).toMatch(pattern);
    } else {
      if (!pattern.test(actual)) {
        throw new Error(message || `Expected ${actual} to match ${pattern}`);
      }
    }
  },

  toBeGreaterThan: (actual: number, expected: number, message?: string) => {
    if (hasExpect) {
      expect(actual).toBeGreaterThan(expected);
    } else {
      if (actual <= expected) {
        throw new Error(
          message || `Expected ${actual} to be greater than ${expected}`
        );
      }
    }
  },

  toBeInstanceOf: (actual: any, expected: any, message?: string) => {
    if (hasExpect) {
      expect(actual).toBeInstanceOf(expected);
    } else {
      if (!(actual instanceof expected)) {
        throw new Error(
          message || `Expected ${actual} to be instance of ${expected.name}`
        );
      }
    }
  },
};
