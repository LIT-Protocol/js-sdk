import { LitCidRepository, LitCidRepositoryCommon } from './types';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = Object.freeze({
  signTransaction: Object.freeze({
    evm: 'QmdSQqkdGF5EqPCBi4pidkjGQXLNoP5kp8gxGLtgzyiw7L',
    solana: 'QmVeR4rKuyN27gq1JrsoJqjN2GrwZD87Sm2vHzV5MmBxwb',
  }),
  signMessage: Object.freeze({
    evm: 'QmQWwWjJXLiCKi7ZpfwXnGPeXAcjfG1VXjB6CLTb3Xh31X',
    solana: 'QmawpLLPxL6GVKj7QW3PR8us4gNyVEijPpcDzD8Uo95jXR',
  }),
  generateEncryptedKey: Object.freeze({
    evm: 'QmSKi3kMRP7biW6HhNf79vcffMSXDSu7Yr1K653ZoGXsxw',
    solana: 'QmZGd5gPcqTJmeM9Thdguz6DufFkQCa9Qq2oS6L3D6HD8o',
  }),
  exportPrivateKey: Object.freeze({
    evm: 'QmaCGGq6EqXezgBiwAAbwh2UTeeTZnLaHQxxDcXwRboFXM',
    solana: 'QmaCGGq6EqXezgBiwAAbwh2UTeeTZnLaHQxxDcXwRboFXM',
  }),
});

const LIT_ACTION_CID_REPOSITORY_COMMON: LitCidRepositoryCommon = Object.freeze({
  batchGenerateEncryptedKeys: 'QmUDB7jZfCMwh9CuQZZ4YDmrJnNdPq9NGdqHzmQE3RggSr',
});

export { LIT_ACTION_CID_REPOSITORY, LIT_ACTION_CID_REPOSITORY_COMMON };
