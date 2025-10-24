import { createLitClient } from '@lit-protocol/lit-client';
import { nagaTest } from '@lit-protocol/networks';
import { keccak256, stringToBytes } from 'viem';

const IPFS_CID = 'QmcA9npUnrzsmvx9sfmZDnEnPAEbMA5kp4tnkueYqiJKZv';
const EXPECTED_DERIVED_PUBKEY =
  '0x044e8f8e87e6192869a369b774fd9feba4607df95057eb58981626bd108f77d50674e587cc48c8a0a8c69ad650825ee1adf5f31acb4075e9327e625cd880a1dfdb';

describe('Derived Pubkey Ticket', () => {
  test('should derive pubkey', async () => {
    const derivedKeyId = keccak256(stringToBytes(`lit_action_${IPFS_CID}`));
    const litClient = await createLitClient({
      network: nagaTest,
    });
    const ctx = await litClient.utils.getDerivedKeyId(derivedKeyId);
    expect(ctx).toBe(EXPECTED_DERIVED_PUBKEY);
  });
});
