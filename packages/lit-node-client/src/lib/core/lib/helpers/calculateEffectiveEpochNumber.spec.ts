import { calculateEffectiveEpochNumber } from './calculateEffectiveEpochNumber';
import { EpochCache } from '../types';

// Constants from the implementation file
const EPOCH_READY_FOR_LOCAL_DEV = 3;
const EPOCH_PROPAGATION_DELAY = 45_000; // 45 seconds in milliseconds

describe('calculateEffectiveEpochNumber', () => {
  let dateNowSpy: jest.SpyInstance;

  afterEach(() => {
    // Restore Date.now() after each test
    if (dateNowSpy) {
      dateNowSpy.mockRestore();
    }
  });

  describe('Invalid Epoch Cache', () => {
    it('should return null if epochCache.currentNumber is null', () => {
      const epochCache: EpochCache = {
        currentNumber: null,
        startTime: 1000000000,
      };
      expect(calculateEffectiveEpochNumber(epochCache)).toBeNull();
    });

    it('should return currentNumber if epochCache.startTime is null and currentNumber is not null', () => {
      const epochCache: EpochCache = { currentNumber: 5, startTime: null };
      expect(calculateEffectiveEpochNumber(epochCache)).toBe(5);
    });

    it('should return null if epochCache.startTime is null and currentNumber is null', () => {
      const epochCache: EpochCache = { currentNumber: null, startTime: null };
      expect(calculateEffectiveEpochNumber(epochCache)).toBeNull();
    });
  });

  describe('Within Propagation Delay', () => {
    it('should return currentNumber - 1 if currentNumber >= EPOCH_READY_FOR_LOCAL_DEV and within delay', () => {
      const currentEpoch = 5;
      const startTimeMs = Date.now(); // Current time in ms
      dateNowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(startTimeMs + EPOCH_PROPAGATION_DELAY / 2); // Halfway through delay

      const epochCache: EpochCache = {
        currentNumber: currentEpoch,
        startTime: Math.floor(startTimeMs / 1000),
      }; // startTime in seconds (integer)
      expect(calculateEffectiveEpochNumber(epochCache)).toBe(currentEpoch - 1);
    });

    it('should return currentNumber - 1 if currentNumber === EPOCH_READY_FOR_LOCAL_DEV and within delay', () => {
      const currentEpoch = EPOCH_READY_FOR_LOCAL_DEV; // 3
      const startTimeMs = Date.now();
      dateNowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(startTimeMs + EPOCH_PROPAGATION_DELAY / 2);

      const epochCache: EpochCache = {
        currentNumber: currentEpoch,
        startTime: Math.floor(startTimeMs / 1000),
      };
      expect(calculateEffectiveEpochNumber(epochCache)).toBe(currentEpoch - 1); // Should be 2
    });

    it('should return currentNumber if currentNumber < EPOCH_READY_FOR_LOCAL_DEV and within delay', () => {
      const currentEpoch = EPOCH_READY_FOR_LOCAL_DEV - 1; // 2
      const startTimeMs = Date.now();
      dateNowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(startTimeMs + EPOCH_PROPAGATION_DELAY / 2);

      const epochCache: EpochCache = {
        currentNumber: currentEpoch,
        startTime: Math.floor(startTimeMs / 1000),
      };
      expect(calculateEffectiveEpochNumber(epochCache)).toBe(currentEpoch); // Should be 2
    });

    it('should return currentNumber - 1 if current time is 1ms before propagation delay ends and currentNumber >= EPOCH_READY_FOR_LOCAL_DEV', () => {
      const currentEpoch = 4;
      const initialTimeMs = Date.now(); // Used to get a realistic base for epochStartTimeInSeconds

      // Derive epochCache.startTime (in seconds, floored) first.
      const epochStartTimeInSeconds = Math.floor(initialTimeMs / 1000);
      const epochCache: EpochCache = {
        currentNumber: currentEpoch,
        startTime: epochStartTimeInSeconds,
      };

      // Now, base the mocked Date.now on the exact start of that second (in ms) plus the delay, minus 1ms.
      // This ensures the mocked "current time" is precisely 1ms before the boundary, relative to the floored epochCache.startTime.
      const mockedNowTimeMs =
        epochStartTimeInSeconds * 1000 + EPOCH_PROPAGATION_DELAY - 1;
      dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(mockedNowTimeMs);

      expect(calculateEffectiveEpochNumber(epochCache)).toBe(currentEpoch - 1);
    });
  });

  describe('Outside Propagation Delay', () => {
    it('should return currentNumber if current time is after propagation delay', () => {
      const currentEpoch = 5;
      const startTimeMs = Date.now();
      dateNowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(startTimeMs + EPOCH_PROPAGATION_DELAY * 2); // Well after delay

      const epochCache: EpochCache = {
        currentNumber: currentEpoch,
        startTime: Math.floor(startTimeMs / 1000),
      };
      expect(calculateEffectiveEpochNumber(epochCache)).toBe(currentEpoch);
    });

    it('should return currentNumber if current time is exactly at the end of propagation delay', () => {
      const currentEpoch = 5;
      const startTimeMs = Date.now();
      // Set current time to exactly when the delay period ends
      dateNowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(startTimeMs + EPOCH_PROPAGATION_DELAY);

      const epochCache: EpochCache = {
        currentNumber: currentEpoch,
        startTime: Math.floor(startTimeMs / 1000),
      };
      expect(calculateEffectiveEpochNumber(epochCache)).toBe(currentEpoch);
    });
  });

  describe('General Cases with Valid Cache', () => {
    it('should return currentNumber when all conditions for subtraction are met except currentNumber is too low', () => {
      const currentEpoch = 1; // Less than EPOCH_READY_FOR_LOCAL_DEV
      const startTimeMs = Date.now();
      dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(startTimeMs + 1000); // Within delay

      const epochCache: EpochCache = {
        currentNumber: currentEpoch,
        startTime: Math.floor(startTimeMs / 1000),
      };
      expect(calculateEffectiveEpochNumber(epochCache)).toBe(currentEpoch);
    });

    it('should return currentNumber when all conditions for subtraction are met except not within delay period', () => {
      const currentEpoch = 4; // Greater than or equal to EPOCH_READY_FOR_LOCAL_DEV
      const startTimeMs = Date.now();
      dateNowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(startTimeMs + EPOCH_PROPAGATION_DELAY + 1000); // Outside delay

      const epochCache: EpochCache = {
        currentNumber: currentEpoch,
        startTime: Math.floor(startTimeMs / 1000),
      };
      expect(calculateEffectiveEpochNumber(epochCache)).toBe(currentEpoch);
    });
  });
});
