import { LitCidRepository } from './types';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = Object.freeze({
  signTransaction: Object.freeze({
    evm: 'QmSsgmy1N1zFZ5yNPCY7QWQZwrYRLuYUJF1VDygJc7L26o',
    solana: 'QmdkcMmrtqWSQ8VrPr8KwzuzZnAxGJoVDeZP3NKTWCMZCg',
  }),
  signMessage: Object.freeze({
    evm: 'QmWVW51FBH5j3wwaMVy8MR1QyzJgEjuaPh1yqwSGXRCENx',
    solana: 'QmSPcfFhLofjhNDd5ZdVbhw53zmbR8oV4C2585Bm7C8izH',
  }),
  generateEncryptedKey: Object.freeze({
    evm: 'QmaoPMSqcze3NW3KSA75ecWSkcmWT1J7kVr8LyJPCKRvHd',
    solana: 'QmdRBXYLYvcNHrChmsZ2jFDY8dA99CcSdqHo3p1ES3UThL',
  }),
  exportPrivateKey: Object.freeze({
    evm: 'Qmb5ZAm1EZRL7dYTtyYxkPxx4kBmoCjjzcgdrJH9cKMXxR',
    solana: 'Qmb5ZAm1EZRL7dYTtyYxkPxx4kBmoCjjzcgdrJH9cKMXxR',
  }),
});

const FALLBACK_IPFS_GATEWAY = 'https://litprotocol.mypinata.cloud/ipfs/';

const IPFS_HASH_BY_ACTION_PLATFORM = {
  '/signTransaction/evm': `${FALLBACK_IPFS_GATEWAY}${LIT_ACTION_CID_REPOSITORY.signTransaction.evm}`,
  '/signTransaction/solana': `${FALLBACK_IPFS_GATEWAY}${LIT_ACTION_CID_REPOSITORY.signTransaction.solana}`,
  '/signMessage/evm': `${FALLBACK_IPFS_GATEWAY}${LIT_ACTION_CID_REPOSITORY.signMessage.evm}`,
  '/signMessage/solana': `${FALLBACK_IPFS_GATEWAY}${LIT_ACTION_CID_REPOSITORY.signMessage.solana}`,
  '/generateEncryptedKey/evm': `${FALLBACK_IPFS_GATEWAY}${LIT_ACTION_CID_REPOSITORY.generateEncryptedKey.evm}`,
  '/generateEncryptedKey/solana': `${FALLBACK_IPFS_GATEWAY}${LIT_ACTION_CID_REPOSITORY.generateEncryptedKey.solana}`,
  '/exportPrivateKey/evm': `${FALLBACK_IPFS_GATEWAY}${LIT_ACTION_CID_REPOSITORY.exportPrivateKey.evm}`,
  '/exportPrivateKey/solana': `${FALLBACK_IPFS_GATEWAY}${LIT_ACTION_CID_REPOSITORY.exportPrivateKey.solana}`,
} as const;

export { LIT_ACTION_CID_REPOSITORY, IPFS_HASH_BY_ACTION_PLATFORM };
