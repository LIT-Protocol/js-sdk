import { LitCidRepository, LitCidRepositoryCommon } from './types';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = Object.freeze({
  signTransaction: {
    evm: 'QmYTEJyniRRkTxe3D9mmkURXCFBAXWK7TEGk5LxvWSETWn',
    solana: 'QmWUozjthkrjEBGkkEvGTvCaxCaiPMTke6FUpiwhn28k8Z',
  },
  signMessage: {
    evm: 'Qmdm4mGn6A8RmqeiDgRPXFt2yYEKCUMUVimSb5iPJfs31e',
    solana: 'QmS4Y6f2zHriNzioxBbysbuXQbjX7ga468CCyYcuY2AeeH',
  },
  generateEncryptedKey: {
    evm: 'QmfW6g5PJ8SVS56XwDVC5W4gcUnobEempNkR28bj2g99tk',
    solana: 'QmWYcBCZqFmJJzsRfzVRHbPD5Hvuou45sbXPQcQzLbUgKd',
  },
  exportPrivateKey: {
    evm: 'QmfZ8hYEmNFwHraNieSz25dAp65YBoNjAMC2tXm9oaQCt6',
    solana: 'QmfZ8hYEmNFwHraNieSz25dAp65YBoNjAMC2tXm9oaQCt6',
  },
});

const LIT_ACTION_CID_REPOSITORY_COMMON: LitCidRepositoryCommon = Object.freeze({
  batchGenerateEncryptedKeys: 'QmR8Zs7ctSEctxBrSnAYhMXFXCC1ub8K1xvMn5Js3NCSAA',
});

export { LIT_ACTION_CID_REPOSITORY, LIT_ACTION_CID_REPOSITORY_COMMON };
