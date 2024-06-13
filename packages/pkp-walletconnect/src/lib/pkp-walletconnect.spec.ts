// @ts-ignore - set global variable for testing
global.jestTesting = true;

import { PKPWalletConnect } from './pkp-walletconnect';
import { PKPClient } from '@lit-protocol/pkp-client';

const LITCONFIG = {
  PKP_PUBKEY:
    '04b5caf00c9f5adc9b22ca460b88482bad44ed4fac8ee63014b727cf60efc568dbdfe498a94fbd9cd294d651529f9fe76e057e9736150eea038415b06f64a87939',
  PKP_ETH_ADDRESS: '0xDd66eE5E696911F92e19B8612F711FA508816a6e',
  CONTROLLER_AUTHSIG: {
    sig: '0x137b66529678d1fc58ab5b340ad036082af5b9912f823ba22c2851b8f50990a666ad8f2ab2328e8c94414c0a870163743bde91a5f96e9f967fd45d5e0c17c3911b',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage:
      'localhost wants you to sign in with your Ethereum account:\n0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37\n\nTESTING TESTING 123\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: eoeo0dsvyLL2gcHsC\nIssued At: 2023-11-17T15:04:20.324Z\nExpiration Time: 2215-07-14T15:04:20.323Z',
    address: '0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37',
  },
};

jest.setTimeout(120000);

const PKP_PUBKEY = LITCONFIG.PKP_PUBKEY;
const PKP_ETH_ADDRESS = LITCONFIG.PKP_ETH_ADDRESS;

describe('PKPWalletConnect', () => {
  const pkpClient = new PKPClient({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: PKP_PUBKEY,
    cosmosAddressPrefix: 'cosmos',
  });

  const pkpWalletConnect = new PKPWalletConnect();

  describe('getPKPClients', () => {
    it('should return the current list of PKPClients', () => {
      expect(pkpWalletConnect.getPKPClients()).toEqual([]);
      pkpWalletConnect.addPKPClient(pkpClient);
      expect(pkpWalletConnect.getPKPClients()).toEqual([pkpClient]);
    });
  });

  describe('with a PKPClient', () => {
    beforeAll(async () => {
      await pkpClient.connect();
      pkpWalletConnect.addPKPClient(pkpClient);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('getAccounts', () => {
      it('should return an array of addresses for the given chain', async () => {
        const result = await pkpWalletConnect.getAccounts('eip155');
        expect(result).toEqual([PKP_ETH_ADDRESS]);
      });
    });

    describe('getAccountsWithPrefix', () => {
      it('should return an array of addresses with prefix for the given chain', async () => {
        const result = await pkpWalletConnect.getAccountsWithPrefix('eip155:1');
        expect(result).toEqual([`eip155:1:${PKP_ETH_ADDRESS}`]);
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

    describe('findPKPClientByRequestParams', () => {
      it('should return null if no PKPClient has an address found within the request params', async () => {
        const request = {
          method: 'personal_sign',
          params: ['0xdeadbeaf', '0x9b2055d370f73ec7d8a03e965129118dc8f5bf83'],
        };
        const result = await pkpWalletConnect.findPKPClientByRequestParams(
          request
        );
        expect(result).toBeNull();
      });

      it('should return the PKPClient if its address is found within the request params', async () => {
        const request = {
          method: 'personal_sign',
          params: ['0xdeadbeaf', PKP_ETH_ADDRESS],
        };
        const result = await pkpWalletConnect.findPKPClientByRequestParams(
          request
        );
        expect(result).toEqual(pkpClient);
      });
    });

    describe('addPKPClient', () => {
      it('should add the PKPClient if it is not already in the list', () => {
        pkpWalletConnect.addPKPClient(pkpClient);
        expect(pkpWalletConnect.getPKPClients()).toEqual([pkpClient]);
      });

      it('should not add the PKPClient if it is already in the list', () => {
        pkpWalletConnect.addPKPClient(pkpClient);
        pkpWalletConnect.addPKPClient(pkpClient);
        expect(pkpWalletConnect.getPKPClients()).toEqual([pkpClient]);
      });
    });
  });

  /* Currently gives an SSR error requiring storage middleware.
  >
    To use WalletConnect server side, you'll need to install the "unstorage" dependency. 
    If you are seeing this error during a build / in an SSR environment, you can add "unstorage" as a devDependency to make this error go away.
  <
  describe('initWalletConnect', () => {
    it('should initialize WalletConnect', async () => {
      const config = {
        projectId: 'fcd184b860ea5998892e079adfbaf92f',
        metadata: {
          name: 'Test Wallet',
          description: 'Test Wallet',
          url: '#',
          icons: ['https://walletconnect.com/walletconnect-logo.png'],
        },
      };
      await pkpWalletConnect.initWalletConnect(config);
      expect(pkpWalletConnect.getSignClient()).toBeDefined();
    });
  });
  */
});
