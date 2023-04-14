import { BigNumber, ethers } from 'ethers';
import { LitContracts } from './contracts-sdk';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import crypto, { createHash } from 'crypto';
Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
    subtle: {
      digest: (algorithm: string, data: Uint8Array) => {
        return new Promise((resolve, reject) =>
          resolve(
            createHash(algorithm.toLowerCase().replace('-', ''))
              .update(data)
              .digest()
          )
        );
      },
    },
  },
});

import { PKPWallet } from '@lit-protocol/pkp-ethers.js-node';
import { hexlify } from 'ethers/lib/utils';
jest.setTimeout(20000);
describe('contractsSdk', () => {
  let litContracts: LitContracts;
  let litContracts_NoArgs: LitContracts;
  let litContracts_privateKeySigner: LitContracts;
  let litContracts_pkpWallet: LitContracts;

  const TOKEN_ID =
    '23933281609834613302513783695742993326101587503243653262183802787866132322861';
  const PKP_ETH_ADDRESS = '0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1';

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
    const PKP_PUBKEY =
      '0x0439e24fbe3332dd2abe3073f663a58fc74674095e5834ebbe7a86fd52f1cbe54b8268d6426fbd66a6979d787b6848b750f3a64a6354da4616f93a3031f3d44e95';
    const CONTROLLER_AUTHSIG = {
      sig: '0x8c4b3b2a2f8f0b33ad8092719a604e94ffd2d938c115741e7155cdea3653fca75285ed2499ec1c6f60ab4b1e5e9fab2d4e6cf36abf32fe515d67de152736dfcd1b',
      derivedVia: 'web3.eth.personal.sign',
      signedMessage:
        'localhost:3000 wants you to sign in with your Ethereum account:\n0x5B8A8d043f2235a29E4b063c20299050931832Dc\n\n\nURI: http://localhost:3000/\nVersion: 1\nChain ID: 80001\nNonce: McW3494o8EuALAzJn\nIssued At: 2022-12-06T18:09:09.646Z\nExpiration Time: 2022-12-13T18:09:09.644Z',
      address: '0x5B8A8d043f2235a29E4b063c20299050931832Dc',
    };

    // -- init pkp wallet
    const pkpWallet = new PKPWallet({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: 'https://lit-protocol.calderachain.xyz/http',
    });

    await pkpWallet.init();

    // -- init contracts
    litContracts_pkpWallet = new LitContracts({ signer: pkpWallet });

    await litContracts_pkpWallet.connect();

    // -- check read
    const mintCost =
      await litContracts_pkpWallet.pkpNftContract.read.mintCost();

    expect(mintCost.toNumber()).toBe(100000000000000);

    // -- check address (should stays the same)
    expect(await pkpWallet.getAddress()).toBe(
      '0x014b9D4B8B369d85E75Ed9e2e6daF28C0d50c364'
    );

    // -- check write
    const tx = await litContracts_pkpWallet.pkpNftContract.read.mintNext(2, {
      value: mintCost,
    });

    expect(tx).toBeDefined();
  });

  it('creates an instance with custom private key signer', async () => {
    const privateKey =
      '0x4cc303e56f1ff14e762a33534d7fbaa8a76e52509fd96373f24045baae99cc38';
    const provider = new ethers.providers.JsonRpcProvider(
      'https://matic-mumbai.chainstacklabs.com'
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
    const PKP_PUBKEY =
      '0x04a23bd3dad3bed2df665b036cc0c9bcb1796ee04d395084b88e38515814d1001420427b5f8e38568c948fe650d544f586112a0dbfc08de5233eb65b4de8959a59';
    const CONTROLLER_AUTHSIG = {
      sig: '0x9fdfd14517e498093efc616f8a0ee7517325ed02b116c71089a9ffca8357613b12b20b06e48bd4f8be6036d9dd6daed1f4848f33ece0ffb971d3470cbee74e521c',
      derivedVia: 'web3.eth.personal.sign',
      signedMessage:
        'demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0xDbfa48A182e0e080CFcB09E8CB38F0A089325727\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: xdaVJQ9dmowmNHbbc\nIssued At: 2023-04-14T07:37:00.272Z\nExpiration Time: 2023-04-21T07:36:57.155Z',
      address: '0xdbfa48a182e0e080cfcb09e8cb38f0a089325727',
    };

    // const go = async () => {
    const pkpWallet = new PKPWallet({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: 'https://rpc-mumbai.maticvigil.com',
    });

    await pkpWallet.init();

    const litContracts = new LitContracts({
      signer: pkpWallet,
    });

    await litContracts.connect();

    const pkpAddress = await pkpWallet.getAddress();

    expect(pkpAddress).toBe('0x014b9D4B8B369d85E75Ed9e2e6daF28C0d50c364');

    const mintCost = await litContracts.pkpNftContract.read.mintCost();

    const mintTx = await litContracts.pkpNftContract.read.mintNext(2, {
      value: mintCost,
    });

    console.log('mintTx:', mintTx);

    expect(mintTx).toBe(1);

  });

  // it('should create an instance without args', async () => {
  //   // Create a new instance of the LitContracts class
  //   litContracts = new LitContracts();
  //   await litContracts.connect();
  //   expect(litContracts).toBeDefined();

  //   const mintCost = await litContracts.pkpNftContract?.mintCost();
  //   let res: any;

  //   try {
  //     res = await litContracts.pkpNftContract?.mintNext(2, { value: mintCost });
  //   } catch (e) {
  //     res = e;
  //   }

  //   // expect res to contains insufficient funds for intrinsic transaction cost
  //   expect(res.toString()).toContain(
  //     'insufficient funds for intrinsic transaction cost'
  //   );
  // });

  // it('should create an instance with custom signer', async () => {
  //   const privateKey =
  //     '0x4cc303e56f1ff14e762a33534d7fbaa8a76e52509fd96373f24045baae99cc38';
  //   const provider = new ethers.providers.JsonRpcProvider(
  //     'https://matic-mumbai.chainstacklabs.com'
  //   );
  //   const signer = new ethers.Wallet(privateKey, provider);
  //   litContracts = new LitContracts({ signer });
  //   await litContracts.connect();

  //   const mintCost = await litContracts.pkpNftContract?.mintCost();
  //   let res: any;

  //   try {
  //     res = await litContracts.pkpNftContract?.mintNext(2, { value: mintCost });
  //   } catch (e) {
  //     res = e;
  //   }

  //   // expect res to contains insufficient funds for intrinsic transaction cost
  //   expect(res.toString()).toContain(
  //     'insufficient funds for intrinsic transaction cost'
  //   );
  // });

  // it('uses default provider when no provider is specified', () => {
  //   expect(litContracts.provider.connection.url).toBe(
  //     'https://matic-mumbai.chainstacklabs.com'
  //   );
  // });

  // // it('uses specified provider when provider is specified', () => {
  // //   const provider = new ethers.providers.JsonRpcProvider(
  // //     'https://example.com'
  // //   );
  // //   litContracts = new LitContracts({ provider });
  // //   expect(litContracts.provider.connection.url).toBe('https://example.com');
  // // });

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
    expect(litContracts.pkpPermissionsContract).toBeDefined();
    expect(litContracts.pubkeyRouterContract).toBeDefined();
    expect(litContracts.rateLimitNftContract).toBeDefined();
    expect(litContracts.stakingContract).toBeDefined();
  });

  // it('litTokenContract should get the totalSupply()', async () => {
  //   let output = await litContracts.litTokenContract.totalSupply();
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
