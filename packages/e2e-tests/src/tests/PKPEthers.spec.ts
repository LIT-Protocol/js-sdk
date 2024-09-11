import { expect, jest } from '@jest/globals';
import {
  MessageTypes,
  SignTypedDataVersion,
  TypedMessage,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';
import { ethers } from 'ethers';

import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import {
  TinnyEnvironment,
  getEoaSessionSigs,
  TinnyPerson,
  getLitActionSessionSigs,
  getLitActionSessionSigsUsingIpfsId,
} from '@lit-protocol/tinny';
import {
  AuthCallbackParams,
  AuthSig,
  LitResourceAbilityRequest,
  SessionSigsMap,
} from '@lit-protocol/types';

try {
  jest.setTimeout(100_000);
} catch (e) {
  // ... continue execution
}

describe('PKP Ethers', () => {
  let devEnv: TinnyEnvironment;
  let alice: TinnyPerson;

  beforeAll(async () => {
    devEnv = new TinnyEnvironment();
    await devEnv.init();
  });

  beforeEach(async () => {
    alice = await devEnv.createRandomPerson();
  });

  afterEach(() => {
    alice && devEnv.releasePrivateKeyFromUser(alice);
  });

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
  });

  afterAll(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  describe('Sign Message', () => {
    it('LitAction Session', async () => {
      await signMessage(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await signMessage(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await signMessage(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await signMessage(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('ETH Signing', () => {
    it('LitAction Session', async () => {
      await ethTransaction(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await ethTransaction(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await ethTransaction(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await ethTransaction(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('ETH Personal Signing', () => {
    it('LitAction Session', async () => {
      await ethPersonalSign(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await ethPersonalSign(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await ethPersonalSign(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await ethPersonalSign(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('Sign Transaction', () => {
    it('LitAction Session', async () => {
      await signTransaction(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await signTransaction(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await signTransaction(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await signTransaction(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('Eth Sign Typed Data', () => {
    it('LitAction Session', async () => {
      await signTypedDataV1(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await signTypedDataV1(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await signTypedDataV1(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await signTypedDataV1(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('Sign Typed Data Util', () => {
    it('LitAction Session', async () => {
      await ethTypedDataUtil(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await ethTypedDataUtil(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await ethTypedDataUtil(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await ethTypedDataUtil(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('SignedTypedDataV1', () => {
    it('LitAction Session', async () => {
      await signTypedDataV1(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await signTypedDataV1(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await signTypedDataV1(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await signTypedDataV1(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('SignedTypedDatav3', () => {
    it('LitAction Session', async () => {
      await signTypedDatav3(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await signTypedDatav3(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await signTypedDatav3(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await signTypedDatav3(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('Signed Typed Data v4', () => {
    it('LitAction Session', async () => {
      await signTypedDatav4(devEnv, alice, getLitActionSessionSigs);
    });

    it('LitAction IPFS Session', async () => {
      await signTypedDatav4(devEnv, alice, getLitActionSessionSigsUsingIpfsId);
    });

    it('EOA Wallet', async () => {
      await signTypedDatav4(devEnv, alice, getEoaSessionSigs);
    });

    it('PKP Session', async () => {
      await signTypedDatav4(devEnv, alice, getEoaSessionSigs);
    });
  });

  describe('Sign With AuthContext', () => {
    it('LitAction Session', async () => {
      await signWithAuthContext(devEnv, alice);
    });

    it('LitAction IPFS Session', async () => {
      await signWithAuthContext(devEnv, alice);
    });

    it('EOA Wallet', async () => {
      await signWithAuthContext(devEnv, alice);
    });

    it('PKP Session', async () => {
      await signWithAuthContext(devEnv, alice);
    });
  });
});

const signMessage = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const eoaSessionSigs = await generator(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient!,
    pkpPubKey: alice.pkp?.publicKey as string,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  expect(
    pkpEthersWallet.signMessage(alice.loveLetter)
  ).resolves.not.toThrowError();
};

const ethTransaction = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const eoaSessionSigs = await generator(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient!,
    pkpPubKey: alice.pkp?.publicKey as string,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  // Message to sign
  const message = 'Hello world';
  const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

  // DATA, 20 Bytes - address
  // DATA, N Bytes - message to sign
  // Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_sign
  expect(
    ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_sign',
        params: [alice.pkp?.ethAddress, hexMsg],
      },
    }).then((signature: string) => {
      const recoveredAddr = ethers.utils.verifyMessage(message, signature);
      expect(signature.length).toEqual(132);
      expect(recoveredAddr).toEqual(alice.pkp?.ethAddress);
    })
  ).resolves.not.toThrowError();
};

const signTransaction = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const eoaSessionSigs = await generator(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv?.litNodeClient as LitNodeClient,
    pkpPubKey: alice.pkp?.publicKey as string,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- eth_sendTransaction parameters

  // Transaction to sign and send
  const from = alice.pkp?.ethAddress as string;
  const to = alice.pkp?.ethAddress;
  const gasLimit = ethers.BigNumber.from('21000');
  const value = ethers.BigNumber.from('0');
  const data = '0x';

  // pkp-ethers signer will automatically add missing fields (nonce, chainId, gasPrice, gasLimit)
  const tx = {
    from: from,
    to: to,
    gasLimit,
    value,
    data,
  };

  // eth_sendTransaction parameters
  // Transaction - Object
  // Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_sendTransaction
  // A serialized form of the whole transaction
  ethRequestHandler({
    signer: pkpEthersWallet,
    payload: {
      method: 'eth_signTransaction',
      params: [tx],
    },
  }).then((rawSignedTx: string) => {
    const parsedTransaction = ethers.utils.parseTransaction(rawSignedTx);

    const signature = ethers.utils.joinSignature({
      r: parsedTransaction.r!,
      s: parsedTransaction.s!,
      v: parsedTransaction.v!,
    });

    const rawTx = {
      nonce: parsedTransaction.nonce,
      gasPrice: parsedTransaction.gasPrice,
      gasLimit: parsedTransaction.gasLimit,
      to: parsedTransaction.to,
      value: parsedTransaction.value,
      data: parsedTransaction.data,
      chainId: parsedTransaction.chainId, // Include chainId if the transaction is EIP-155
    };

    const txHash = ethers.utils.keccak256(
      ethers.utils.serializeTransaction(rawTx)
    );

    const { v, r, s } = parsedTransaction;

    const recoveredAddress = ethers.utils.recoverAddress(txHash, {
      r: r!,
      s: s!,
      v: v!,
    });

    // ==================== Post-Validation ====================
    expect(parsedTransaction).toBeDefined();

    expect(signature.length).toEqual(132);

    expect(recoveredAddress.toLowerCase()).toEqual(
      alice.pkp?.ethAddress.toLowerCase()
    );
  });
};

const ethTypedDataUtil = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const eoaSessionSigs = await generator(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv?.litNodeClient as LitNodeClient,
    pkpPubKey: alice.pkp?.publicKey as string,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  // Example from https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L1033
  const msgParams = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 80001,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  };

  expect(
    ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_signTypedData',
        params: [alice?.pkp?.ethAddress, JSON.stringify(msgParams)],
      },
    }).then((signature: string) => {
      // https://docs.ethers.io/v5/api/utils/signing-key/#utils-verifyTypedData
      const recoveredAddr = ethers.utils.verifyTypedData(
        msgParams.domain,
        { Person: msgParams.types.Person, Mail: msgParams.types.Mail },
        msgParams.message,
        signature
      );

      expect(signature.length).toEqual(132);

      expect(recoveredAddr.toLowerCase()).toEqual(
        alice.pkp?.ethAddress.toLowerCase()
      );
    })
  ).resolves;
};

const signTypedDataV1 = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const eoaSessionSigs = await generator(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv?.litNodeClient as LitNodeClient,
    pkpPubKey: alice.pkp?.publicKey as string,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- eth_signTypedData_v1 parameters
  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, Alice!',
    },
    {
      type: 'uint32',
      name: 'A number',
      value: '1337',
    },
  ];

  expect(
    ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_signTypedData_v1',
        params: [msgParams, alice.pkp?.ethAddress],
      },
    }).then((signature: string) => {
      const recoveredAddr = recoverTypedSignature({
        data: msgParams,
        signature: signature,
        version: SignTypedDataVersion.V1,
      });

      // ==================== Post-Validation ====================
      if (signature.length !== 132) {
        throw new Error('❌ signature should be 132 characters long');
      }

      expect(recoveredAddr.toLowerCase()).toEqual(
        alice.pkp?.ethAddress.toLowerCase()
      );
    })
  ).resolves.not.toThrowError();
};

const signTypedDatav3 = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const eoaSessionSigs = await generator(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient as LitNodeClient,
    pkpPubKey: alice.pkp?.publicKey as string,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- eth_signTypedData_v3 parameters

  const msgParams = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 80001,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  };

  expect(
    ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_signTypedData_v3',
        params: [alice.pkp?.ethAddress, JSON.stringify(msgParams)],
      },
    }).then((signature: string) => {
      const recoveredAddr = recoverTypedSignature({
        data: {
          types: msgParams.types,
          domain: msgParams.domain,
          primaryType: msgParams.primaryType as 'Mail',
          message: msgParams.message,
        },
        signature: signature,
        version: SignTypedDataVersion.V3,
      });

      expect(signature.length).toEqual(132);

      expect(recoveredAddr.toLowerCase()).toEqual(
        alice.pkp?.ethAddress.toLowerCase()
      );
    })
  ).resolves;
};

const signTypedDatav4 = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const eoaSessionSigs = await generator(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient as LitNodeClient,
    pkpPubKey: alice.pkp?.publicKey as string,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- eth_signTypedData_v3 parameters

  const msgParams = {
    domain: {
      chainId: 80001,
      name: 'Ether Mail',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1',
    },
    message: {
      contents: 'Hello, Bob!',
      from: {
        name: 'Cow',
        wallets: [
          '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        ],
      },
      to: [
        {
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        },
      ],
    },
    primaryType: 'Mail',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person[]' },
        { name: 'contents', type: 'string' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallets', type: 'address[]' },
      ],
    },
  };

  expect(
    ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_signTypedData_v4',
        params: [alice.pkp?.ethAddress, JSON.stringify(msgParams)],
      },
    }).then((signature: string) => {
      const recoveredAddr = recoverTypedSignature({
        data: msgParams as TypedMessage<MessageTypes>,
        signature: signature,
        version: SignTypedDataVersion.V4,
      });

      expect(signature.length).toEqual(132);

      expect(recoveredAddr.toLowerCase()).toEqual(
        alice.pkp?.ethAddress.toLowerCase()
      );
    })
  ).resolves.not.toThrow();
};

const signWithAuthContext = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson
): Promise<void> => {
  const pkpEthersWallet = new PKPEthersWallet({
    pkpPubKey: alice.pkp?.publicKey as string,
    litNodeClient: devEnv.litNodeClient as LitNodeClient,
    authContext: {
      getSessionSigsProps: {
        authNeededCallback: async function (
          params: AuthCallbackParams
        ): Promise<AuthSig> {
          const toSign = await createSiweMessageWithRecaps({
            uri: params.uri!,
            expiration: params.expiration!,
            resources: params.resourceAbilityRequests!,
            walletAddress: alice.wallet.address,
            nonce: (await devEnv.litNodeClient?.getLatestBlockhash()) as string,
            litNodeClient: devEnv.litNodeClient,
          });

          const authSig = await generateAuthSig({
            signer: alice.wallet,
            toSign,
          });

          return authSig;
        },
        resourceAbilityRequests: [
          {
            resource: new LitPKPResource('*'),
            ability: LitAbility.PKPSigning,
          },
          {
            resource: new LitActionResource('*'),
            ability: LitAbility.LitActionExecution,
          },
        ],
      },
    },
  });

  await pkpEthersWallet.init();

  expect(
    pkpEthersWallet.signMessage(alice.loveLetter).then((signature) => {
      expect(signature).toBeDefined();
      expect(signature.length).toEqual(132);
    })
  ).resolves.not.toThrowError();
};

const ethPersonalSign = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  generator: (
    devEnv: TinnyEnvironment,
    person: TinnyPerson,
    resources?: LitResourceAbilityRequest[]
  ) => Promise<SessionSigsMap | undefined>
): Promise<void> => {
  const pkpSessionSigs = await generator(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient as LitNodeClient,
    pkpPubKey: alice.pkp?.publicKey as string,
    controllerSessionSigs: pkpSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- personal_sign parameters

  // Message to sign
  const message = 'Free the web';
  const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

  // personal_sign parameters
  // DATA, N Bytes - message to sign.
  // DATA, 20 Bytes - address
  // Reference: https://metamask.github.io/api-playground/api-documentation/#personal_sign
  expect(
    ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'personal_sign',
        params: [hexMsg, alice.pkp?.ethAddress],
      },
    }).then((signature: string) => {
      const recoveredAddr = ethers.utils.verifyMessage(message, signature);

      expect(signature.length).toEqual(132);
      expect(recoveredAddr).toEqual(alice.pkp?.ethAddress);
    })
  ).resolves.not.toThrowError();
};
