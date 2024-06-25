import { LitCidRepository } from './types';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = {
  signTransaction: Object.freeze({
    ['evm']: 'QmdYUhPCCK5hpDWMK1NiDLNLG6RZQy61QE4J7dBm1Y2nbA',
    ['solana']: 'QmSi9GL2weCFEP1SMAUw5PDpZRr436Zt3tLUNrSECPA5dT',
  }),
  signMessage: Object.freeze({
    ['evm']: 'QmTMGcyp77NeppGaqF2DmE1F8GXTSxQYzXCrbE7hNudUWx',
    ['solana']: 'QmYQC6cd4EMvyB4XPkfEEAwNXJupRZWU5JsTCUrjey4ovp',
  }),
  generateEncryptedKey: Object.freeze({
    ['evm']: 'QmaoPMSqcze3NW3KSA75ecWSkcmWT1J7kVr8LyJPCKRvHd',
    ['solana']: 'QmdRBXYLYvcNHrChmsZ2jFDY8dA99CcSdqHo3p1ES3UThL',
  }),
};

export { LIT_ACTION_CID_REPOSITORY };
