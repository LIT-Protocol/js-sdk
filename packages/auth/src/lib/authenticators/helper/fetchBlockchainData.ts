import { EthBlockhashInfo } from '@lit-protocol/types';

const RETRY_ATTEMPTS = 2; // total attempts = RETRY_ATTEMPTS + 1
const RETRY_DELAY_MS = 250;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchBlockchainData = async () => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const resp = await fetch(
        'https://block-indexer.litgateway.com/get_most_recent_valid_block'
      );
      if (!resp.ok) {
        throw new Error(`Primary fetch failed with status: ${resp.status}`);
      }

      const blockHashBody: EthBlockhashInfo = await resp.json();
      const { blockhash, timestamp } = blockHashBody;

      if (!blockhash || !timestamp) {
        throw new Error('Invalid data from primary blockhash source');
      }

      return blockhash;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === RETRY_ATTEMPTS) {
        throw new Error(lastError.message);
      }

      await delay(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw new Error(lastError?.message ?? 'Unknown fetchBlockchainData error');
};
