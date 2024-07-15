import { LitCidRepository } from './types';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = Object.freeze({
  signTransaction: Object.freeze({
    evm: 'QmdYUhPCCK5hpDWMK1NiDLNLG6RZQy61QE4J7dBm1Y2nbA',
    solana: 'QmSi9GL2weCFEP1SMAUw5PDpZRr436Zt3tLUNrSECPA5dT',
  }),
  signMessage: Object.freeze({
    // evm: 'QmTMGcyp77NeppGaqF2DmE1F8GXTSxQYzXCrbE7hNudUWx',
    evm: 'QmTbyRQJTK83nsuFizZZsSLtTgbK7jgLZYbEKRtUAQEwAX',
    // solana: 'QmUxnWS8VU9QwZRdyfwsEtvhJZcvcdrannjokgZoA1sesy',
    solana: 'QmNfC9oEsj72hEvLSviDMYG97omne2XBs3mn3SXsRAsJBq',
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

export { LIT_ACTION_CID_REPOSITORY };
