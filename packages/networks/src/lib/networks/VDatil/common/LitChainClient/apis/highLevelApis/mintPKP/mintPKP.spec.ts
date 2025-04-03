import {
  datilDevNetworkContext,
  DatilDevNetworkContext,
} from '../../../../../../vDatil/datil-dev/networkContext';
import { mintPKP } from './mintPKP';

describe('mintPKP', () => {
  let networkCtx: DatilDevNetworkContext;

  beforeAll(() => {
    networkCtx = datilDevNetworkContext;
  });

  test('should mint PKP with customAuthMethodId and return correct data format', async () => {
    const res = await mintPKP(
      {
        authMethod: {
          authMethodType: 1,
          accessToken: '0x',
        },
        scopes: ['sign-anything'],
        customAuthMethodId: 'app-id-xxx:user-id-yyy',
      },
      networkCtx
    );

    // Check response structure
    expect(res).toHaveProperty('hash');
    expect(res).toHaveProperty('receipt');
    expect(res).toHaveProperty('data');
    expect(res.data).toHaveProperty('tokenId');
    expect(res.data).toHaveProperty('pubkey');
    expect(res.data).toHaveProperty('ethAddress');

    // Verify data types
    expect(typeof res.data.tokenId).toBe('bigint');
    expect(typeof res.data.pubkey).toBe('string');
    expect(typeof res.data.ethAddress).toBe('string');
    expect(res.data.pubkey).toMatch(/^0x/);
    expect(res.data.ethAddress).toMatch(/^0x/);
  });

  test('show auto-convert native authMethod to authMethodId when customAuthMethodId is omitted', async () => {
    const eoaAuthSig = {
      sig: '',
      derivedVia: 'web3.eth.personal.sign',
      signedMessage:
        'I am creating an account to use Lit Protocol at 2022-04-12T09:23:31.290Z',
      address: '0x7e7763BE1379Bb48AFEE4F5c232Fb67D7c03947F',
    };

    const res = await mintPKP(
      {
        authMethod: {
          authMethodType: 1,
          accessToken: JSON.stringify(eoaAuthSig),
        },
        scopes: ['sign-anything'],
      },
      networkCtx
    );

    // Find relevant events in decoded logs
    const permittedAuthMethodScopeAddedEvent = res.decodedLogs.find(
      (log) => log.eventName === 'PermittedAuthMethodScopeAdded'
    );
    const permittedAuthMethodAddedEvent = res.decodedLogs.find(
      (log) => log.eventName === 'PermittedAuthMethodAdded'
    );

    expect(permittedAuthMethodScopeAddedEvent?.args.id).toBe(
      '0x4cb822e6f51d9723f22b9374c4ef7d41ae2b1a5463738516aeb117ff387ba51a'
    );
    expect(permittedAuthMethodAddedEvent?.args.id).toBe(
      '0x4cb822e6f51d9723f22b9374c4ef7d41ae2b1a5463738516aeb117ff387ba51a'
    );
  });
});
