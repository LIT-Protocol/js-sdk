import { LIT_NETWORKS_KEYS } from '@lit-protocol/types';
import { requestsToDay, requestsToKilosecond, requestsToSecond } from './utils';

describe('conversion', () => {
  describe('requestsToKilosecond', () => {
    test('converts per day to per kilosecond correctly', () => {
      expect(requestsToKilosecond({ requests: 86, period: 'day' })).toBe(1);
    });

    test('converts per second to per kilosecond correctly', () => {
      expect(requestsToKilosecond({ requests: 1, period: 'second' })).toBe(
        1000
      );
    });
  });

  describe('requestsToDay', () => {
    test('converts requests per second to requests per day correctly', () => {
      expect(requestsToDay({ requests: 1, period: 'second' })).toBe(86400);
    });

    test('converts requests per kilosecond to requests per day correctly', () => {
      expect(requestsToDay({ requests: 1, period: 'kilosecond' })).toBe(86);
    });
  });

  describe('requestsToSecond', () => {
    test('converts requests per day to requests per second correctly', () => {
      expect(requestsToSecond({ requests: 86400, period: 'day' })).toBe(1);
    });

    test('converts requests per kilosecond to requests per second correctly', () => {
      expect(requestsToSecond({ requests: 1, period: 'kilosecond' })).toBe(
        1000
      );
    });
  });
});
