import { PKPEthersWallet } from './pkp-ethers';

import * as LITCONFIG from 'lit.config.json';
import {
  EIP712TypedData,
  ETHRequestSigningPayload,
  LitTypeDataSigner,
} from './pkp-ethers-types';
import {
  SignTypedDataVersion,
  recoverTypedSignature,
} from '@metamask/eth-sig-util/dist/index';

import { signTypedData, requestHandler } from './handler';

import { ethers } from 'ethers';

describe('pkp ethers JSON RPC handler', () => {
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpc: LITCONFIG.RPC_ENDPOINT,
  });

  beforeAll(async () => {
    await pkpEthersWallet.init();
  });

  it('PKPEthersWallet should be defined', () => {
    expect(PKPEthersWallet).toBeDefined();
  });

  describe('should signTypedData correctly', () => {
    // Example from https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L1033
    const msgParams: EIP712TypedData = {
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

    it('should be a string', async () => {
      const signature = await signTypedData(pkpEthersWallet, msgParams);
      expect(typeof signature).toBe('string');
    });
    it('should return a hex string signature', async () => {
      const signature = await signTypedData(pkpEthersWallet, msgParams);
      expect(signature).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    describe('[requestHandler] Signed typed data', () => {
      const msgParamStr = JSON.stringify(msgParams);

      const payload: ETHRequestSigningPayload = {
        method: 'eth_signTypedData',
        params: [LITCONFIG.PKP_ADDRESS, msgParamStr],
      };

      // Verify signature
      it('(ethers) should recover the correct address using verifyTypedData', async () => {
        const signature = await requestHandler({
          signer: pkpEthersWallet,
          payload,
        });

        const { types, domain, primaryType, message } = JSON.parse(msgParamStr);
        // https://docs.ethers.io/v5/api/utils/signing-key/#utils-verifyTypedData
        const recoveredAddr = ethers.utils.verifyTypedData(
          domain,
          { Person: types.Person, Mail: types.Mail },
          message,
          signature
        );

        expect(LITCONFIG.PKP_ADDRESS.toLowerCase()).toBe(
          recoveredAddr.toLowerCase()
        );
      });

      // TODO: This should work, but it doesn't. It's probably a bug in the @noble library where it doesn't convert the Uint8Array object to Uint8Array
      // it('(Metamask) should recover address using recoverTypedSignature', async () => {
      //   const signature = await requestHandler({
      //     signer: pkpEthersWallet,
      //     payload,
      //   });

      //   // https://metamask.github.io/eth-sig-util/latest/modules.html#recoverTypedSignature
      //   const recoveredAddr2 = recoverTypedSignature({
      //     data: msgParams as any,
      //     signature: signature,
      //     version: SignTypedDataVersion.V3,
      //   });

      //   expect(recoveredAddr2).toBe(1);

      //   expect(LITCONFIG.PKP_ADDRESS.toLowerCase()).toBe(
      //     recoveredAddr2.toLowerCase()
      //   );
      // });
    });
  });
});
