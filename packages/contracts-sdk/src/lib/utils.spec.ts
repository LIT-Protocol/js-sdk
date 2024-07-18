import { LIT_NETWORKS_KEYS } from '@lit-protocol/types';
import {
  determineProtocol,
  requestsToDay,
  requestsToKilosecond,
  requestsToSecond,
} from './utils';

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

describe('determineProtocol', () => {
  const networks: LIT_NETWORKS_KEYS[] = [
    'cayenne',
    'datil-dev',
    'datil-test',
    'localhost',
    'custom',
    'habanero',
    'manzano',
  ];

  test.each([
    ['cayenne', 7470, 'http://'],
    ['cayenne', 7479, 'http://'],
    ['cayenne', 8470, 'https://'],
    ['cayenne', 8479, 'https://'],
    ['cayenne', 443, 'https://'],
    ['cayenne', 80, 'http://'],
    ['datil-dev', 7470, 'https://'],
    ['datil-dev', 8470, 'https://'],
    ['datil-dev', 443, 'https://'],
    ['datil-test', 7470, 'https://'],
    ['datil-test', 8470, 'https://'],
    ['datil-test', 443, 'https://'],
    ['localhost', 7470, 'http://'],
    ['localhost', 8470, 'http://'],
    ['localhost', 443, 'http://'],
    ['custom', 7470, 'http://'],
    ['custom', 8470, 'http://'],
    ['custom', 443, 'http://'],
    ['habanero', 7470, 'https://'],
    ['habanero', 8470, 'https://'],
    ['habanero', 443, 'https://'],
    ['manzano', 7470, 'https://'],
    ['manzano', 8470, 'https://'],
    ['manzano', 443, 'https://'],
  ])(
    'should return correct protocol for %s network and port %i',
    (network, port, expected) => {
      expect(determineProtocol(port, network as LIT_NETWORKS_KEYS)).toBe(
        expected
      );
    }
  );

  test('should return https for all non-cayenne networks except localhost and custom', () => {
    const nonCayenneNetworks = networks.filter(
      (n) => n !== 'cayenne' && n !== 'localhost' && n !== 'custom'
    );
    nonCayenneNetworks.forEach((network) => {
      for (let port = 7470; port <= 7479; port++) {
        expect(determineProtocol(port, network)).toBe('https://');
      }
    });
  });

  test('should always return http for localhost and custom networks', () => {
    ['localhost', 'custom'].forEach((network) => {
      for (let port = 7470; port <= 8479; port++) {
        expect(determineProtocol(port, network as LIT_NETWORKS_KEYS)).toBe(
          'http://'
        );
      }
    });
  });

  test('should return https for cayenne network only for ports 8470-8479 and 443', () => {
    for (let port = 7470; port <= 8479; port++) {
      if ((port >= 8470 && port <= 8479) || port === 443) {
        expect(determineProtocol(port, 'cayenne')).toBe('https://');
      } else {
        expect(determineProtocol(port, 'cayenne')).toBe('http://');
      }
    }
  });
});
