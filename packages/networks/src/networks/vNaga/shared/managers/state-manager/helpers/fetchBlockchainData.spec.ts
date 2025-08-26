import { fetchBlockchainData } from './fetchBlockchainData';

describe('fetchBlockchainData', () => {
  it('should fetch the latest blockhash', async () => {
    const blockhash = await fetchBlockchainData();
    console.log('blockhash', blockhash);
    expect(blockhash).toBeDefined();
  });
});
