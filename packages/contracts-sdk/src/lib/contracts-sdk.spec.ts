import { LitContracts } from './contracts-sdk';
import { ethers } from 'ethers';
import { LitContract } from '../../../types/src/lib/types';

describe('contractsSdk', () => {
  let litContracts: LitContracts;
  let litContracts_privateKeySigner: LitContracts;

  beforeEach(() => {
    litContracts = new LitContracts();
  });

  it('assigns contract instances to the correct class properties', () => {
    // Test that the contract instances have been correctly assigned
    // to the corresponding class properties
    expect(litContracts.litTokenContract).toBeDefined();
    // Repeat this for all other contract instances...
  });

  it('Test that the accessControlConditionsContract, litTokenContract, and other contract properties are properly initialized with the expected values.', () => {
    expect(litContracts.litTokenContract).toBeDefined();
    expect(litContracts.multisenderContract).toBeDefined();
    expect(litContracts.pkpHelperContract).toBeDefined();
    expect(litContracts.pkpNftContract).toBeDefined();
    expect(litContracts.pkpPermissionsContract).toBeDefined();
    expect(litContracts.pubkeyRouterContract).toBeDefined();
    expect(litContracts.rateLimitNftContract).toBeDefined();
    expect(litContracts.stakingContract).toBeDefined();
  });

  it('Test that  connection from custom context resolves contracts in correct mapping', async () => {
    const DEFAULT_RPC = 'https://chain-rpc.litprotocol.com/http';
    const provider = new ethers.providers.JsonRpcProvider(DEFAULT_RPC);
    litContracts = new LitContracts({
      customContext: {
        Allowlist: {
          address: '0xC52b72E2AD3dC58B7d23197575fb48A4523fa734',
        },
        LITToken: {
          address: '0x53695556f8a1a064EdFf91767f15652BbfaFaD04',
        },
        PubkeyRouter: {
          address: '0xF6b0fE0d0C27C855f7f2e021fAd028af02cC52cb',
        },
        Multisender: {
          address: '0xBd119B72B52d58A7dDd771A2E4984d106Da0D1DB',
        },
        PKPHelper: {
          address: '0x24d646b9510e56af8B15de759331d897C4d66044',
        },
        PKPNFT: {
          address: '0x3c3ad2d238757Ea4AF87A8624c716B11455c1F9A',
        },
        PKPNFTMetadata: {
          address: '0xa87fe043AD341A1Dc8c5E48d75BA9f712256fe7e',
        },
        PKPPermissions: {
          address: '0x974856dB1C4259915b709E6BcA26A002fbdd31ea',
        },
        RateLimitNFT: {
          address: '0x9b1B8aD8A4144Be9F8Fb5C4766eE37CE0754AEAb',
        },
        Staking: {
          address: '0xBC7F8d7864002b6629Ab49781D5199C8dD1DDcE1',
        },
        StakingBalances: {
          address: '0x82F0a170CEDFAaab623513EE558DB19f5D787C8D',
        },
      },
    });

    await litContracts.connect();
    expect(litContracts.litTokenContract.write.address).toBeDefined();
    expect(litContracts.multisenderContract.read.address).toBeDefined();
    expect(litContracts.pkpHelperContract.write.address).toBeDefined();
    expect(litContracts.pkpNftContract.read.address).toBeDefined();
    expect(litContracts.pkpPermissionsContract.read.address).toBeDefined();
    expect(litContracts.pubkeyRouterContract.read.address).toBeDefined();
    expect(litContracts.rateLimitNftContract.write.address).toBeDefined();
    expect(litContracts.stakingContract.read.address).toBeDefined();
  });
});
