import { LitActionCodeRepository, LitCidRepository } from './types';
import * as exportPrivateKey from '../generated/litActions/common/exportPrivateKey';
import * as generateEncryptedEthereumPrivateKey from '../generated/litActions/ethereum/generateEncryptedEthereumPrivateKey';
import * as signMessageWithEthereumEncryptedKey from '../generated/litActions/ethereum/signMessageWithEthereumEncryptedKey';
import * as signTransactionWithEthereumEncryptedKey from '../generated/litActions/ethereum/signTransactionWithEthereumEncryptedKey';
import * as generateEncryptedSolanaPrivateKey from '../generated/litActions/solana/generateEncryptedSolanaPrivateKey';
import * as signMessageWithSolanaEncryptedKey from '../generated/litActions/solana/signMessageWithSolanaEncryptedKey';
import * as signTransactionWithSolanaEncryptedKey from '../generated/litActions/solana/signTransactionWithSolanaEncryptedKey';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = Object.freeze({
  signTransaction: Object.freeze({
    evm: 'QmRWGips9G3pHXNa3viGFpAyh1LwzrR35R4xMiG61NuHpS',
    solana: 'QmPZR6FnTPMYpzKxNNHt4xRckDsAoQz76cxkLhJArSoe4w',
  }),
  signMessage: Object.freeze({
    evm: 'QmNy5bHvgaN2rqo4kMU71jtgSSxDES6HSDgadBV29pfcRu',
    solana: 'Qma1nRZN5eriT1a7Uffbiek5jsksvWCCqHuE1x1nk9zaAq',
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

const LIT_ACTION_CODE_REPOSITORY: LitActionCodeRepository = Object.freeze({
  signTransaction: Object.freeze({
    evm: signTransactionWithEthereumEncryptedKey.code,
    solana: signTransactionWithSolanaEncryptedKey.code,
  }),
  signMessage: Object.freeze({
    evm: signMessageWithEthereumEncryptedKey.code,
    solana: signMessageWithSolanaEncryptedKey.code,
  }),
  generateEncryptedKey: Object.freeze({
    evm: generateEncryptedEthereumPrivateKey.code,
    solana: generateEncryptedSolanaPrivateKey.code,
  }),
  exportPrivateKey: Object.freeze({
    evm: exportPrivateKey.code,
    solana: exportPrivateKey.code,
  }),
});

export { LIT_ACTION_CODE_REPOSITORY, LIT_ACTION_CID_REPOSITORY };
