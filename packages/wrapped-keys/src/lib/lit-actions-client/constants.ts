import { LitCidRepository, LitCidRepositoryCommon } from './types';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = Object.freeze({
  signTransaction: Object.freeze({
    evm: 'QmRpAgGKEmgeBRhqdC2EH17QUt6puwsbm8Z2nNneVN4uJG',
    solana: 'QmR1nPG2tnmC72zuCEMZUZrrMEkbDiMPNHW45Dsm2n7xnk',
  }),
  signMessage: Object.freeze({
    evm: 'QmXi9iqJvXrHoUGSo5WREonrruDhzQ7cFr7Cry3wX2hmue',
    solana: 'QmcEJGVqRYtVukjm2prCPT7Fs66GpaqZwmZoxEHMHor6Jz',
  }),
  generateEncryptedKey: Object.freeze({
    evm: 'QmeD6NYCWhUCLgxgpkgSguaKjwnpCnJ6Yf8SdsyPpK4eKK',
    solana: 'QmPkVD3hEjMi1T5zQuvdrFCXaGTEMHNdAhAL4WHkqxijrQ',
  }),
  exportPrivateKey: Object.freeze({
    evm: 'QmUJ74pTUqeeHzDGdfwCph1vJVNJ1rRzJdvMiTjS1BMwYj',
    solana: 'QmUJ74pTUqeeHzDGdfwCph1vJVNJ1rRzJdvMiTjS1BMwYj',
  }),
});

const LIT_ACTION_CID_REPOSITORY_COMMON: LitCidRepositoryCommon = Object.freeze({
  batchGenerateEncryptedKeys: 'QmR8Zs7ctSEctxBrSnAYhMXFXCC1ub8K1xvMn5Js3NCSAA',
  triaAuthAndBatchGenerateEncryptedKeys: 'xxx',
});

export { LIT_ACTION_CID_REPOSITORY, LIT_ACTION_CID_REPOSITORY_COMMON };
