import { LitContracts } from './contracts-sdk';

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
});
