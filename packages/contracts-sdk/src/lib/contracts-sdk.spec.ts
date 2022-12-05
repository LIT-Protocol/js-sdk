import { BigNumber, ethers } from 'ethers';
import { LitContracts } from './contracts-sdk';

describe('contractsSdk', () => {
  let litContracts: LitContracts;

  beforeEach(() => {
    // Create a new instance of the LitContracts class before each test
    litContracts = new LitContracts();
  });

  it('uses default provider when no provider is specified', () => {
    expect(litContracts.provider.connection.url).toBe(
      'https://rpc-mumbai.matic.today'
    );
  });

  it('uses specified provider when provider is specified', () => {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://example.com'
    );
    litContracts = new LitContracts({ provider });
    expect(litContracts.provider.connection.url).toBe('https://example.com');
  });

  it('initializes contract instances with the correct provider', () => {
    // Test that the contract instances have been correctly initialized
    // with the correct provider
    expect(litContracts.accessControlConditionsContract.provider).toBe(
      litContracts.provider
    );
    expect(litContracts.litTokenContract.provider).toBe(litContracts.provider);
    // Repeat this for all other contract instances...
  });

  it('assigns contract instances to the correct class properties', () => {
    // Test that the contract instances have been correctly assigned
    // to the corresponding class properties
    expect(litContracts.accessControlConditionsContract).toBeDefined();
    expect(litContracts.litTokenContract).toBeDefined();
    // Repeat this for all other contract instances...
  });

  it('Test that the accessControlConditionsContract, litTokenContract, and other contract properties are properly initialized with the expected values.', () => {
    expect(litContracts.accessControlConditionsContract).toBeDefined();
    expect(litContracts.litTokenContract).toBeDefined();
    expect(litContracts.multisenderContract).toBeDefined();
    expect(litContracts.pkpHelperContract).toBeDefined();
    expect(litContracts.pkpNftContract).toBeDefined();
    expect(litContracts.pkppermissionsContract).toBeDefined();
    expect(litContracts.pubkeyRouterContract).toBeDefined();
    expect(litContracts.rateLimitNftContract).toBeDefined();
    expect(litContracts.stakingContract).toBeDefined();
  });

  it('litTokenContract should get the totalSupply()', async () => {
    let output = await litContracts.litTokenContract.totalSupply();
    output = output.toString();

    expect(output).toBe('1000000000000000000000000000');
  });

  // it('pkpContract getEthAddress ', async () => {
  //   let output = await litContracts.pkpNftContract.getEthAddress(
  //     BigNumber.from(
  //       '38350640033302067025725861340690983594840943860586799982363890572232824285614'
  //     )
  //   );

  //   expect(output).toBe('0x0b3cAeB7BDFDD19515DBDD0Edd2322AaDbE79C75');
  // });

  // it('pkpContract getPubKey', async () => {
  //   let output = await litContracts.pkpNftContract.getPubkey(
  //     BigNumber.from(
  //       '38350640033302067025725861340690983594840943860586799982363890572232824285614'
  //     )
  //   );

  //   expect(output).toBe(
  //     '0x043dc9883e112faf8320a539d30661b03fbf38766463a580cc7ace19f23bdb221bc56cb7669ff9529522c7288a37a7b8e0baaea029f2a9cce0690fcb8110413a00'
  //   );
  // });

  // it('pkpContract getUnmintedRoutedTokenIdCount', async () => {
  //   let output =
  //     (await litContracts.pkpNftContract.getUnmintedRoutedTokenIdCount(BigNumber.from(
  //       '0'
  //     ))).toString();

  //   expect(output).toBe('0');
  // });

  it('pkpContract mintCost', async () => {
    let output = (await litContracts.pkpNftContract.mintCost()).toString();

    expect(output).toBe('100000000000000');
  });

  // it('pkpContract ownerOf', async () => {
  //   let output =
  //     (await litContracts.pkpNftContract.ownerOf(BigNumber.from(
  //       '38350640033302067025725861340690983594840943860586799982363890572232824285614'
  //     ))).toString();

  //   expect(output).toBe('0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1');
  // });

  // it('pkpContract pkpPermissions', async () => {
  //   let output = (await litContracts.pkpNftContract.pkpPermissions()).toString();

  //   expect(output).toBe('0x274d0C69fCfC40f71E57f81E8eA5Bd786a96B832');
  // })

  it('gets RateLimitNft contractBalance()', async () => {
    let output = (
      await litContracts.rateLimitNftContract.contractBalance()
    ).toString();

    expect(output).toBe('97345767225660000');
  });

  it('gets defaultRateLimitWindowMilliseconds()', async () => {
    let output = (
      await litContracts.rateLimitNftContract.defaultRateLimitWindowMilliseconds()
    ).toString();

    expect(output).toBe('3600000');
  });

  it('gets name() for RLI Contract', async () => {
    let output = await litContracts.rateLimitNftContract.name();

    expect(output).toBe('Rate Limit Increases on Lit Protocol');
  });

  it('gets name() of PKPNFT Contract', async () => {
    let output = await litContracts.pkpNftContract.name();

    expect(output).toBe('Programmable Keypair');
  });

  it('gets tokens by address', async () => {
    let output = await litContracts.pkpNftContractUtil.read.getTokensByAddress(
      '0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1'
    );

    // expect output to be an array
    expect(Array.isArray(output)).toBe(true);
  });

  it('gets the x latest amount of tokens', async () => {
    let output = await litContracts.pkpNftContractUtil.read.getTokens(2);

    // expect output to be an array
    expect(output.length).toBe(2);
  });

  it('should mint', async () => {
    const mintCost = await litContracts.pkpNftContract.mintCost();
    let output = await litContracts.pkpNftContractUtil.write.mint(mintCost);

    // expect output to be an array
    expect(output).toBeDefined();

  })
});
