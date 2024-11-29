import { InvalidEthBlockhash } from '@lit-protocol/constants';

import { LitCore } from './lit-core';

describe('LitCore', () => {
  let core: LitCore;

  describe('getLatestBlockhash', () => {
    let originalFetch: typeof fetch;
    let originalDateNow: typeof Date.now;
    const mockBlockhashUrl = 'https://block-indexer-url.com/get_most_recent_valid_block';

    beforeEach(() => {
      core = new LitCore({
        litNetwork: 'custom',
      });
      core['_blockHashUrl'] = mockBlockhashUrl;
      originalFetch = fetch;
      originalDateNow = Date.now;
    });

    afterEach(() => {
      global.fetch = originalFetch;
      Date.now = originalDateNow;
      jest.clearAllMocks();
    });

    it('should return cached blockhash if still valid', async () => {
      // Setup
      const mockBlockhash = '0x1234';
      const currentTime = 1000000;
      core.latestBlockhash = mockBlockhash;
      core.lastBlockHashRetrieved = currentTime;
      Date.now = jest.fn().mockReturnValue(currentTime + 15000); // 15 seconds later
      global.fetch = jest.fn();

      // Execute
      const result = await core.getLatestBlockhash();

      // Assert
      expect(result).toBe(mockBlockhash);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch new blockhash when cache is expired', async () => {
      // Setup
      const mockBlockhash = '0x5678';
      const currentTime = 1000000;
      core.latestBlockhash = '0x1234';
      core.lastBlockHashRetrieved = currentTime - 31000; // 31 seconds ago currentTime
      const blockNumber = 12345;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ blockhash: mockBlockhash, timestamp: currentTime, blockNumber }),
      });
      Date.now = jest.fn().mockReturnValue(currentTime);

      // Execute
      const result = await core.getLatestBlockhash();

      // Assert
      expect(result).toBe(mockBlockhash);
      expect(fetch).toHaveBeenCalledWith(mockBlockhashUrl);
    });

    it('should throw error when blockhash is not available', async () => {
      // Setup
      core.latestBlockhash = null;
      core.lastBlockHashRetrieved = null;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
      });
      core['_getProviderWithFallback'] = jest.fn(() => Promise.resolve(null));

      // Execute & Assert
      await expect(core.getLatestBlockhash()).rejects.toThrow(InvalidEthBlockhash);
    });

    it('should handle fetch failure and use fallback RPC', async () => {
      // Setup
      const mockBlockhash = '0xabc';
      const currentTime = 1000000;
      Date.now = jest.fn().mockReturnValue(currentTime);
      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));
      const mockProvider = {
        getBlockNumber: jest.fn().mockResolvedValue(12345),
        getBlock: jest.fn().mockResolvedValue({
          hash: mockBlockhash,
          number: 12345,
          timestamp: currentTime
        }),
      };
      jest.spyOn(core as any, '_getProviderWithFallback').mockResolvedValue({
        ...mockProvider,
      });

      // Execute
      const result = await core.getLatestBlockhash();

      // Assert
      expect(fetch).toHaveBeenCalledWith(mockBlockhashUrl);
      expect(mockProvider.getBlock).toHaveBeenCalledWith(-1); // safety margin
      expect(result).toBe(mockBlockhash);
    });

    it('should handle empty blockhash response with fallback RPC URLs', async () => {
      // Setup
      const mockBlockhash = '0xabc';
      const currentTime = 1000000;
      Date.now = jest.fn().mockReturnValue(currentTime);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          blockhash: null,
          blockNumber: null
        }),
      });
      const mockProvider = {
        getBlockNumber: jest.fn().mockResolvedValue(12345),
        getBlock: jest.fn().mockResolvedValue({
          hash: mockBlockhash,
          number: 12345,
          timestamp: currentTime
        }),
      };
      jest.spyOn(core as any, '_getProviderWithFallback').mockResolvedValue({
        ...mockProvider,
      });

      // Execute
      const result = await core.getLatestBlockhash();

      // Assert
      expect(fetch).toHaveBeenCalledWith(mockBlockhashUrl);
      expect(mockProvider.getBlock).toHaveBeenCalledWith(-1); // safety margin
      expect(result).toBe(mockBlockhash);
    });

    it('should handle network timeouts gracefully', async () => {
      // Setup
      const currentTime = 1000000;
      Date.now = jest.fn().mockReturnValue(currentTime);

      global.fetch = jest.fn().mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 1000)
        )
      );

      const mockProvider = {
        getBlockNumber: jest.fn().mockResolvedValue(12345),
        getBlock: jest.fn().mockResolvedValue(null), // Provider also fails
      };

      jest.spyOn(core as any, '_getProviderWithFallback').mockResolvedValue({
        ...mockProvider,
      });

      // Execute & Assert
      await expect(() => core.getLatestBlockhash()).rejects.toThrow(
        InvalidEthBlockhash
      );
    });
  });

});
