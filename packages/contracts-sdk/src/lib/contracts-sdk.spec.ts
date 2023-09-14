import { BigNumber, ethers } from 'ethers';
import { LitContracts } from './contracts-sdk';

import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';

import * as LITCONFIG from 'lit.config.json';

try{
  jest.setTimeout(60000);
}catch(e){
  // 
}

describe('contractsSdk', () => {
  let litContracts: LitContracts;
  let litContracts_NoArgs: LitContracts;
  let litContracts_privateKeySigner: LitContracts;
  let litContracts_pkpWallet: LitContracts;

  beforeEach(() => {
    // Create a new instance of the LitContracts class before each test
    litContracts = new LitContracts();
    jest.setTimeout(10000);
  });

  it('creates an instance without args [Random Private Key Signer]', async () => {
    litContracts_NoArgs = new LitContracts();
    await litContracts_NoArgs.connect();

    expect(litContracts_NoArgs).toBeDefined();

    // -- check read
    const mintCost = (
      await litContracts_NoArgs.pkpNftContract.read.mintCost()
    ).toNumber();

    expect(mintCost).toBe(1);
  });

  it('[Random Private Key Signer] should fail on write attemp', async () => {
    let tx;

    try {
      tx = await litContracts_NoArgs.pkpNftContract.read.mintNext(2, {
        value: 100000000000000,
      });
    } catch (e) {}
    expect(tx).toBeUndefined();
  });

  it('should create an instance with a private key', async () => {
    const privateKey =
      '0xada150c6c8be33c47db2725ee7e789d932ef5121820d75359a32427438f2a379';

    litContracts_privateKeySigner = new LitContracts({ privateKey });
    await litContracts_privateKeySigner.connect();

    expect(litContracts_privateKeySigner).toBeDefined();

    // -- check address (should stays the same)
    expect(await litContracts_privateKeySigner.signer.getAddress()).toBe(
      '0x30F1Bb983e8D27646E294d4f570a4FAA7Ca096a6'
    );

    // -- check type
    expect(litContracts_privateKeySigner.signer).toBeInstanceOf(ethers.Wallet);

    // -- check read
    const mintCost = (
      await litContracts_privateKeySigner.pkpNftContract.read.mintCost()
    ).toNumber();

    expect(mintCost).toBe(1);
  });

  it('should create an instance with PKP wallet', async () => {
    // -- prepare
    const PKP_PUBKEY = LITCONFIG.PKP_PUBKEY;

    const CONTROLLER_AUTHSIG = LITCONFIG.CONTROLLER_AUTHSIG;

    expect(PKP_PUBKEY).toBeDefined();
    expect(CONTROLLER_AUTHSIG).toBeDefined();

    // -- init pkp wallet
    const pkpWallet = new PKPEthersWallet({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      rpc: LITCONFIG.CHRONICLE_RPC,
    });

    await pkpWallet.init();

    // pkpWallet has to be a signer
    expect(pkpWallet._isSigner).toBe(true);

    // -- init contracts
    litContracts_pkpWallet = new LitContracts({
      signer: pkpWallet,
    });

    await litContracts_pkpWallet.connect();

    // -- check read
    const mintCost =
      await litContracts_pkpWallet.pkpNftContract.read.mintCost();

    expect(mintCost.toNumber()).toBe(1);

    // -- check address (should stays the same)
    expect(await pkpWallet.getAddress()).toBe(LITCONFIG.PKP_ETH_ADDRESS);

    // -- check write
    if (LITCONFIG.test.sendRealTxThatCostsMoney) {
      const tx = await litContracts_pkpWallet.pkpNftContractUtil.write.mint();

      expect(tx).toBeDefined();
    }
  });
  it('creates an instance with custom private key signer', async () => {
    const privateKey =
      '0x4cc303e56f1ff14e762a33534d7fbaa8a76e52509fd96373f24045baae99cc38';
    const provider = new ethers.providers.JsonRpcProvider(
      LITCONFIG.CHRONICLE_RPC
    );
    const signer = new ethers.Wallet(privateKey, provider);
    litContracts_privateKeySigner = new LitContracts({ signer });
    await litContracts_privateKeySigner.connect();

    expect(litContracts_privateKeySigner).toBeDefined();

    const mintCost = (
      await litContracts_privateKeySigner.pkpNftContract.read.mintCost()
    ).toNumber();

    expect(mintCost).toBe(1);
  });

  it('should create an instance with PKP', async () => {
    jest.setTimeout(100000);

    const pkpWallet = new PKPEthersWallet({
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      rpc: LITCONFIG.CHRONICLE_RPC,
    });

    await pkpWallet.init();

    const litContracts = new LitContracts({
      signer: pkpWallet,
    });

    await litContracts.connect();

    const pkpAddress = await pkpWallet.getAddress();

    expect(pkpAddress).toBe(LITCONFIG.PKP_ETH_ADDRESS);

    const mintCost = await litContracts.pkpNftContract.read.mintCost();

    expect(mintCost.toString()).toBe('1');
  });

  // it('should create an instance without args', async () => {
  //   // Create a new instance of the LitContracts class
  //   litContracts = new LitContracts();
  //   await litContracts.connect();
  //   expect(litContracts).toBeDefined();

  //   const mintCost = await litContracts.pkpNftContract.read.mintCost();
  //   let res: any;

  //   try {
  //     res = await litContracts.pkpNftContract?.write.mintNext(2, {
  //       value: mintCost,
  //     });
  //   } catch (e) {
  //     res = e;
  //   }

  //   // expect res to contains insufficient funds for intrinsic transaction cost
  //   expect(res.toString()).toContain(
  //     'insufficient funds for intrinsic transaction cost'
  //   );
  // });

  it('should create an instance with custom signer', async () => {
    const privateKey =
      '0x4cc303e56f1ff14e762a33534d7fbaa8a76e52509fd96373f24045baae99cc38';
    const provider = new ethers.providers.JsonRpcProvider(
      LITCONFIG.CHRONICLE_RPC
    );
    const signer = new ethers.Wallet(privateKey, provider);
    litContracts = new LitContracts({ signer });
    await litContracts.connect();

    const mintCost = await litContracts.pkpNftContract?.read.mintCost();
    let res: any;

    try {
      res = await litContracts.pkpNftContract?.write.mintNext(2, {
        value: mintCost,
      });
    } catch (e) {
      res = e;
    }

    // expect res to contains insufficient funds for intrinsic transaction cost
    expect(res.toString()).toContain('Error');
  });

  it('uses specified provider when provider is specified', () => {
    const provider = new ethers.providers.JsonRpcProvider(
      LITCONFIG.CHRONICLE_RPC
    );
    litContracts = new LitContracts({ provider });
    expect(litContracts.provider.connection.url).toBe(LITCONFIG.CHRONICLE_RPC);
  });

  // it('initializes contract instances with the correct provider', () => {
  //   // Test that the contract instances have been correctly initialized
  //   // with the correct provider
  //   expect(litContracts.accessControlConditionsContract?.provider).toBe(
  //     litContracts.provider
  //   );
  //   expect(litContracts.litTokenContract?.provider).toBe(litContracts.provider);
  //   // Repeat this for all other contract instances...
  // });

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

  // it('litTokenContract should get the totalSupply()', async () => {
  //   let output = await litContracts.litTokenContract.read.totalSupply();
  //   let converted = BigNumber.from(output).toString();
  //   expect(converted).toBe('1000000000000000000000000000');
  // });

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
  //   let output = (
  //     await litContracts.pkpNftContract.getUnmintedRoutedTokenIdCount(
  //       BigNumber.from('0')
  //     )
  //   ).toString();

  //   expect(output).toBe('0');
  // });

  // it('pkpContract mintCost', async () => {
  //   let output = (await litContracts.pkpNftContract.read.mintCost()).toString();

  //   expect(output).toBe('100000000000000');
  // });

  // it('pkpContract ownerOf', async () => {
  //   let output = (
  //     await litContracts.pkpNftContract.ownerOf(
  //       BigNumber.from(
  //         '38350640033302067025725861340690983594840943860586799982363890572232824285614'
  //       )
  //     )
  //   ).toString();

  //   expect(output).toBe(PKP_ETH_ADDRESS);
  // });

  // it('pkpContract pkpPermissions', async () => {
  //   let output = (
  //     await litContracts.pkpNftContract.pkpPermissions()
  //   ).toString();

  //   expect(output).toBe('0x274d0C69fCfC40f71E57f81E8eA5Bd786a96B832');
  // });

  // it('gets RateLimitNft contractBalance()', async () => {
  //   let output = (
  //     await litContracts.rateLimitNftContract.contractBalance()
  //   ).toString();

  //   expect(output).toBe('97345767225660000');
  // });

  // it('gets defaultRateLimitWindowMilliseconds()', async () => {
  //   let output = (
  //     await litContracts.rateLimitNftContract.defaultRateLimitWindowMilliseconds()
  //   ).toString();

  //   expect(output).toBe('3600000');
  // });

  // it('gets name() for RLI Contract', async () => {
  //   let output = await litContracts.rateLimitNftContract.name();

  //   expect(output).toBe('Rate Limit Increases on Lit Protocol');
  // });

  // it('gets name() of PKPNFT Contract', async () => {
  //   let output = await litContracts.pkpNftContract.name();

  //   expect(output).toBe('Programmable Keypair');
  // });

  // it('gets tokens by address', async () => {
  //   let output = await litContracts.pkpNftContractUtil.read.getTokensByAddress(
  //     PKP_ETH_ADDRESS
  //   );

  //   // expect output to be an array
  //   expect(Array.isArray(output)).toBe(true);
  // });

  // it('gets the x latest amount of tokens', async () => {
  //   let output = await litContracts.pkpNftContractUtil.read.getTokens(2);

  //   // expect output to be an array
  //   expect(output.length).toBe(2);
  // });

  // it('gets pkpPermissions getPermittedAddresses()', async () => {
  //   let output =
  //     await litContracts.pkpPermissionsContract.getPermittedAddresses(TOKEN_ID);

  //   // expect output to be an array
  //   expect(Array.isArray(output)).toBe(true);
  // });

  // it('gets pkpPermissions getPermittedActions()', async () => {
  //   let output = await litContracts.pkpPermissionsContract.getPermittedActions(
  //     TOKEN_ID
  //   );

  //   // expect output to be an array
  //   expect(Array.isArray(output)).toBe(true);
  // });

  // it('gets pkpPermissions isPermittedAction', async () => {
  //   let output =
  //     await litContracts.pkpPermissionsContractUtil.read.isPermittedAction(
  //       TOKEN_ID,
  //       'QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW'
  //     );

  //   // expect output to be an array
  //   expect(output).toBe(true);
  // });

  // it('gets pkpPermssions isPermittedAddress', async () => {
  //   let output =
  //     await litContracts.pkpPermissionsContractUtil.read.isPermittedAddress(
  //       TOKEN_ID,
  //       PKP_ETH_ADDRESS
  //     );

  //   // expect output to be an array
  //   expect(output).toBe(true);
  // });

  // it('gets rateLimit getTokensByOwnerAddress', async () => {

  //   jest.setTimeout(10000);

  //   let output =
  //     await litContracts.rateLimitNftContractUtil.read.getTokensByOwnerAddress(
  //       PKP_ETH_ADDRESS
  //     );

  //   // expect output to be an array
  //   expect(Array.isArray(output)).toBe(true);
  // });
});
