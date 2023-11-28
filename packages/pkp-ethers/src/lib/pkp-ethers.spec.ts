import { PKPEthersWallet } from './pkp-ethers';
import * as LITCONFIG from 'lit.config.json';

describe('PKP-ethers', () => {
  let pkpEthersWallet: PKPEthersWallet;

  beforeAll(async () => {
    console.log('Before All - init pkp ethers wallet');
    pkpEthersWallet = new PKPEthersWallet({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpc: LITCONFIG.CHRONICLE_RPC,
    });
  });

  describe('pkp ethers JSON RPC handler', () => {
    it('PKPEthersWallet should be defined', () => {
      expect(PKPEthersWallet).toBeDefined();
    });
  });
});
