// @ts-expect-error - set global variable for testing
global.jestTesting = true;

import { Core } from '@walletconnect/core';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { ethers } from 'ethers';

import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { AuthCallbackParams, AuthSig } from '@lit-protocol/types';

import { PKPWalletConnect } from './pkp-walletconnect';

const wallet = ethers.Wallet.createRandom();

jest.setTimeout(120000);

jest.mock('@walletconnect/core');
jest.mock('@walletconnect/web3wallet');

describe('PKPWalletConnect', () => {
  let pkpEthersWallet: PKPEthersWallet;
  let pkpWalletConnect: PKPWalletConnect;

  beforeAll(() => {
    const litNodeClient = new LitNodeClient({ litNetwork: 'localhost' });

    pkpEthersWallet = new PKPEthersWallet({
      litNodeClient,
      pkpPubKey: wallet.publicKey,
      authContext: {
        getSessionSigsProps: {
          authNeededCallback: async function (
            params: AuthCallbackParams
          ): Promise<AuthSig> {
            const toSign = await createSiweMessageWithRecaps({
              uri: params.uri!,
              expiration: params.expiration!,
              resources: params.resourceAbilityRequests!,
              walletAddress: wallet.address,
              nonce: await litNodeClient.getLatestBlockhash(),
              litNodeClient,
            });

            return await generateAuthSig({
              signer: wallet,
              toSign,
            });
          },
          resourceAbilityRequests: [
            {
              resource: new LitPKPResource('*'),
              ability: LitAbility.PKPSigning,
            },
          ],
        },
      },
    });

    pkpWalletConnect = new PKPWalletConnect(true);
  });

  describe('getPKPEthersWallets', () => {
    it('should return the current list of PKPEthersWallets', () => {
      expect(pkpWalletConnect.getPKPEthersWallets()).toEqual([]);
      pkpWalletConnect.addPKPEthersWallet(pkpEthersWallet);
      expect(pkpWalletConnect.getPKPEthersWallets()).toEqual([pkpEthersWallet]);
    });
  });

  describe('with a PKPEthersWallet', () => {
    beforeAll(async () => {
      pkpWalletConnect.addPKPEthersWallet(pkpEthersWallet);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('getAccounts', () => {
      it('should return an array of addresses for the given chain', async () => {
        const result = await pkpWalletConnect.getAccounts('eip155');
        expect(result).toEqual([wallet.address]);
      });
    });

    describe('getAccountsWithPrefix', () => {
      it('should return an array of addresses with prefix for the given chain', async () => {
        const result = await pkpWalletConnect.getAccountsWithPrefix('eip155:1');
        expect(result).toEqual([`eip155:1:${wallet.address}`]);
      });
    });

    describe('checkIfChainIsSupported', () => {
      it('should return false for unsupported chains', () => {
        const result =
          pkpWalletConnect.checkIfChainIsSupported('cosmos:cosmoshub-1');
        expect(result).toBe(false);
      });

      it('should return true for supported chains', () => {
        const result = pkpWalletConnect.checkIfChainIsSupported('eip155:1');
        expect(result).toBe(true);
      });
    });

    describe('findPKPEthersWalletByRequestParams', () => {
      it('should return null if no PKPEthersWallet has an address found within the request params', async () => {
        const request = {
          method: 'personal_sign',
          params: ['0xdeadbeaf', '0x9b2055d370f73ec7d8a03e965129118dc8f5bf83'],
        };
        const result =
          await pkpWalletConnect.findPKPEthersWalletByRequestParams(request);
        expect(result).toBeNull();
      });

      it('should return the PKPEthersWallet if its address is found within the request params', async () => {
        const request = {
          method: 'personal_sign',
          params: ['0xdeadbeaf', wallet.address],
        };
        const result =
          await pkpWalletConnect.findPKPEthersWalletByRequestParams(request);
        expect(result).toEqual(pkpEthersWallet);
      });
    });

    describe('addPKPEthersWallet', () => {
      it('should add the PKPEthersWallet if it is not already in the list', () => {
        pkpWalletConnect.addPKPEthersWallet(pkpEthersWallet);
        expect(pkpWalletConnect.getPKPEthersWallets()).toEqual([
          pkpEthersWallet,
        ]);
      });

      it('should not add the PKPEthersWallet if it is already in the list', () => {
        pkpWalletConnect.addPKPEthersWallet(pkpEthersWallet);
        pkpWalletConnect.addPKPEthersWallet(pkpEthersWallet);
        expect(pkpWalletConnect.getPKPEthersWallets()).toEqual([
          pkpEthersWallet,
        ]);
      });
    });
  });

  const coreMock = {
    relayUrl: 'wss://relay.walletconnect.com',
  };

  const web3WalletMock = {
    engine: {
      signClient: jest.fn(),
    },
    pair: jest.fn(),
    approveSession: jest.fn(),
    rejectSession: jest.fn(),
  };

  const config = {
    projectId: 'fcd184b860ea5998892e079adfbaf92f',
    metadata: {
      name: 'Test Wallet',
      description: 'Test Wallet',
      url: '#',
      icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
  };

  beforeEach(() => {
    (Core as unknown as jest.Mock).mockImplementation(() => coreMock);
    (Web3Wallet.init as jest.Mock).mockResolvedValue(web3WalletMock);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initWalletConnect', () => {
    it('should initialize WalletConnect', async () => {
      await pkpWalletConnect.initWalletConnect(config);

      expect(pkpWalletConnect.getSignClient()).toBeDefined();
    });
  });

  describe('pair', () => {
    it('should pair with a WalletConnect client', async () => {
      const uri = 'wc:1234';
      await pkpWalletConnect.pair({ uri });

      expect(web3WalletMock.pair).toHaveBeenCalledWith({ uri });
    });
  });

  describe('approveSessionProposal', () => {
    const buildEIP155SessionApprovalParams = (
      eip155SessionProposal: SignClientTypes.EventArguments['session_proposal']
    ) => {
      const requiredChains =
        eip155SessionProposal.params.requiredNamespaces['eip155']?.chains || [];
      const optionalChains =
        eip155SessionProposal.params.optionalNamespaces['eip155']?.chains || [];

      const namespaces = {
        eip155: {
          accounts: [
            ...new Set([
              ...requiredChains.map((chain) => `${chain}:${wallet.address}`),
              ...optionalChains.map((chain) => `${chain}:${wallet.address}`),
            ]),
          ],
          chains: [...new Set([...requiredChains, ...optionalChains])],
          methods: pkpWalletConnect.filterUnsupportedMethods([
            ...(eip155SessionProposal.params.requiredNamespaces['eip155']
              ?.methods || []),
            ...(eip155SessionProposal.params.optionalNamespaces['eip155']
              ?.methods || []),
          ]),
          events: [
            ...new Set([
              ...(eip155SessionProposal.params.requiredNamespaces['eip155']
                ?.events || []),
              ...(eip155SessionProposal.params.optionalNamespaces['eip155']
                ?.events || []),
            ]),
          ],
        },
      };

      return {
        id: eip155SessionProposal.id,
        namespaces,
        relayProtocol: eip155SessionProposal.params.relays[0].protocol,
      };
    };

    it('should approve a valid session proposal removing the unsupported methods and chains', async () => {
      const sessionProposal = {
        id: 1718305417150143,
        params: {
          id: 1718305417150143,
          pairingTopic:
            '87fecc33cf6d087c4a3f3d49dea484b4c9bc227079a5aa495a59aad72a83b6ac',
          expiry: 1718305725,
          requiredNamespaces: {
            eip155: {
              methods: ['eth_sendTransaction', 'personal_sign'],
              chains: ['eip155:11155111', 'eip155:1'],
              events: ['chainChanged', 'accountsChanged'],
            },
          },
          optionalNamespaces: {
            eip155: {
              methods: [
                'eth_signTransaction',
                'eth_sign',
                'eth_signTypedData',
                'eth_signTypedData_v4',
                'wallet_getCapabilities',
                'wallet_sendCalls',
                'wallet_getCallsStatus',
              ],
              chains: ['eip155:11155111', 'eip155:1'],
              events: [],
            },
            cosmos: {
              methods: ['cosmos_sendTransaction'],
              chains: ['cosmos:cosmoshub-1'],
              events: ['chainChanged', 'accountsChanged'],
            },
          },
          relays: [
            {
              protocol: 'irn',
            },
          ],
          proposer: {
            publicKey:
              '16ce2bbba695a47507ac0345c4e467a089030c4202db3079bd320e5962a0757a',
            metadata: config.metadata,
          },
          expiryTimestamp: 1718305717,
        },
        verifyContext: {
          verified: {
            verifyUrl: '',
            validation: 'VALID',
            origin: 'https://react-app.walletconnect.com',
          },
        },
      } as SignClientTypes.EventArguments['session_proposal'];
      const sessionApprovalParams =
        buildEIP155SessionApprovalParams(sessionProposal);

      const approveSessionSpy = jest.spyOn(web3WalletMock, 'approveSession');

      await pkpWalletConnect.approveSessionProposal(sessionProposal);

      expect(approveSessionSpy).toBeCalledWith(sessionApprovalParams);
    });

    it('should approve a valid session proposal with only optional chains', async () => {
      const sessionProposal = {
        id: 1718305417150143,
        params: {
          id: 1718305417150143,
          pairingTopic:
            '87fecc33cf6d087c4a3f3d49dea484b4c9bc227079a5aa495a59aad72a83b6ac',
          expiry: 1718305725,
          requiredNamespaces: {},
          optionalNamespaces: {
            eip155: {
              methods: [
                'eth_sendTransaction',
                'personal_sign',
                'eth_signTransaction',
                'eth_sign',
                'eth_signTypedData',
                'eth_signTypedData_v4',
                'wallet_getCapabilities',
                'wallet_sendCalls',
                'wallet_getCallsStatus',
              ],
              chains: ['eip155:11155111', 'eip155:1'],
              events: ['chainChanged', 'accountsChanged'],
            },
          },
          relays: [
            {
              protocol: 'irn',
            },
          ],
          proposer: {
            publicKey:
              '16ce2bbba695a47507ac0345c4e467a089030c4202db3079bd320e5962a0757a',
            metadata: config.metadata,
          },
          expiryTimestamp: 1718305717,
        },
        verifyContext: {
          verified: {
            verifyUrl: '',
            validation: 'VALID',
            origin: 'https://react-app.walletconnect.com',
          },
        },
      } as SignClientTypes.EventArguments['session_proposal'];
      const sessionApprovalParams =
        buildEIP155SessionApprovalParams(sessionProposal);

      const approveSessionSpy = jest.spyOn(web3WalletMock, 'approveSession');

      await pkpWalletConnect.approveSessionProposal(sessionProposal);

      expect(approveSessionSpy).toBeCalledWith(sessionApprovalParams);
    });

    it('should reject a session proposal with unsupported required chains', async () => {
      const sessionProposal = {
        id: 1718305417150143,
        params: {
          id: 1718305417150143,
          pairingTopic:
            '87fecc33cf6d087c4a3f3d49dea484b4c9bc227079a5aa495a59aad72a83b6ac',
          expiry: 1718305725,
          requiredNamespaces: {
            eip155: {
              methods: ['eth_sendTransaction', 'personal_sign'],
              chains: ['eip155:11155111', 'eip155:1'],
              events: ['chainChanged', 'accountsChanged'],
            },
            cosmos: {
              methods: ['cosmos_sendTransaction'],
              chains: ['cosmos:cosmoshub-1'],
              events: ['chainChanged', 'accountsChanged'],
            },
          },
          optionalNamespaces: {
            eip155: {
              methods: [
                'eth_signTransaction',
                'eth_sign',
                'eth_signTypedData',
                'eth_signTypedData_v4',
                'wallet_getCapabilities',
                'wallet_sendCalls',
                'wallet_getCallsStatus',
              ],
              chains: ['eip155:11155111', 'eip155:1'],
              events: [],
            },
          },
          relays: [
            {
              protocol: 'irn',
            },
          ],
          proposer: {
            publicKey:
              '16ce2bbba695a47507ac0345c4e467a089030c4202db3079bd320e5962a0757a',
            metadata: config.metadata,
          },
          expiryTimestamp: 1718305717,
        },
        verifyContext: {
          verified: {
            verifyUrl: '',
            validation: 'VALID',
            origin: 'https://react-app.walletconnect.com',
          },
        },
      } as SignClientTypes.EventArguments['session_proposal'];

      const rejectSessionSpy = jest.spyOn(web3WalletMock, 'rejectSession');

      await pkpWalletConnect.approveSessionProposal(sessionProposal);

      expect(rejectSessionSpy).toBeCalledWith({
        id: sessionProposal.id,
        reason: getSdkError(
          'UNSUPPORTED_CHAINS',
          `cosmos:cosmoshub-1 is not supported`
        ),
      });
    });

    it('should reject a session proposal with unsupported required methods', async () => {
      const pkpUnsupportedMethods = [
        'wallet_getCapabilities',
        'wallet_sendCalls',
        'wallet_getCallsStatus',
      ];
      const sessionProposal = {
        id: 1718305417150143,
        params: {
          id: 1718305417150143,
          pairingTopic:
            '87fecc33cf6d087c4a3f3d49dea484b4c9bc227079a5aa495a59aad72a83b6ac',
          expiry: 1718305725,
          requiredNamespaces: {
            eip155: {
              methods: [
                'eth_sendTransaction',
                'personal_sign',
                'eth_signTransaction',
                'eth_sign',
                'eth_signTypedData',
                'eth_signTypedData_v4',
                ...pkpUnsupportedMethods, // Required but unsupported methods
              ],
              chains: ['eip155:11155111', 'eip155:1'],
              events: ['chainChanged', 'accountsChanged'],
            },
          },
          optionalNamespaces: {},
          relays: [
            {
              protocol: 'irn',
            },
          ],
          proposer: {
            publicKey:
              '16ce2bbba695a47507ac0345c4e467a089030c4202db3079bd320e5962a0757a',
            metadata: config.metadata,
          },
          expiryTimestamp: 1718305717,
        },
        verifyContext: {
          verified: {
            verifyUrl: '',
            validation: 'VALID',
            origin: 'https://react-app.walletconnect.com',
          },
        },
      } as SignClientTypes.EventArguments['session_proposal'];

      const rejectSessionSpy = jest.spyOn(web3WalletMock, 'rejectSession');

      await pkpWalletConnect.approveSessionProposal(sessionProposal);

      expect(rejectSessionSpy).toBeCalledWith({
        id: sessionProposal.id,
        reason: getSdkError(
          'UNSUPPORTED_METHODS',
          `Unsupported methods: ${pkpUnsupportedMethods.join(', ')}`
        ),
      });
    });
  });
});
