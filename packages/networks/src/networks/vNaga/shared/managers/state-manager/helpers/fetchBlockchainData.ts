import { EthBlockhashInfo } from '@lit-protocol/types';

export const fetchBlockchainData = async () => {
  try {
    const resp = await fetch(
      'https://block-indexer.litgateway.com/get_most_recent_valid_block'
    );
    if (!resp.ok) {
      throw new Error(`Primary fetch failed with status: ${resp.status}`); // Or a custom error
    }

    const blockHashBody: EthBlockhashInfo = await resp.json();
    const { blockhash, timestamp } = blockHashBody;

    if (!blockhash || !timestamp) {
      throw new Error('Invalid data from primary blockhash source');
    }

    return blockhash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(String(error));
  }
};
