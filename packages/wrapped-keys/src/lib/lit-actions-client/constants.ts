import { LitCidRepository, LitCidRepositoryCommon } from './types';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = Object.freeze({
  signTransaction: Object.freeze({
    evm: 'QmSr9TLHUFcGMrQQrNXRsYxcgaBFtcCqWi4sgbevbhmrhv',
    solana: 'QmS223QiJkPfncUhY2HGQmme7LRgg93NBy8tU1fgGFUUzu',
  }),
  signMessage: Object.freeze({
    evm: 'QmXi9iqJvXrHoUGSo5WREonrruDhzQ7cFr7Cry3wX2hmue',
    solana: 'QmcEJGVqRYtVukjm2prCPT7Fs66GpaqZwmZoxEHMHor6Jz',
  }),
  generateEncryptedKey: Object.freeze({
    evm: 'QmPzycC9bN4QfhVWy7ggL4u9Gr1vQz3Gx4MYh4vvpvqBzc',
    solana: 'QmYrmzhh7ZoK8LoZ854DmfdRacmZgpVz9c3kW6u5htcdc5',
  }),
  exportPrivateKey: Object.freeze({
    solana: 'QmUJ74pTUqeeHzDGdfwCph1vJVNJ1rRzJdvMiTjS1BMwYj',
    evm: 'QmUJ74pTUqeeHzDGdfwCph1vJVNJ1rRzJdvMiTjS1BMwYj',
  }),
});

const LIT_ACTION_CID_REPOSITORY_COMMON: LitCidRepositoryCommon = Object.freeze({
  batchGenerateEncryptedKeys: 'QmTMCnEd5M45EVSBvayc8gAvFsNYRnPjf5sfbtR44bWt68',
});

export { LIT_ACTION_CID_REPOSITORY, LIT_ACTION_CID_REPOSITORY_COMMON };
