// @ts-ignore - set global variable for testing
global.jestTesting = true;

import * as LITCONFIG from 'lit.config.json';
import { PKPWalletConnect } from './pkp-walletconnect';
import { PKPClient } from '@lit-protocol/pkp-client';

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
