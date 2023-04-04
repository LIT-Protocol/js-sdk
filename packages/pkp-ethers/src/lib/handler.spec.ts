/**
 * Run this test with:
 * yarn nx run pkp-ethers:test --testFile=handler.spec.ts
 *
 */

import { PKPEthersWallet } from './pkp-ethers';

import * as LITCONFIG from 'lit.config.json';
import {
  EIP712TypedData,
  ETHRequestSigningPayload,
  ETHTxRes,
  LitTypeDataSigner,
} from './pkp-ethers-types';
import {
  SignTypedDataVersion,
  recoverTypedSignature,
} from '@metamask/eth-sig-util/dist/index';

import { signTypedData, ethRequestHandler } from './handler';

import { BigNumber, ethers, Transaction } from 'ethers';

describe('pkp ethers JSON RPC handler', () => {
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpc: LITCONFIG.ETH_RPC_ENDPOINT,
  });

  beforeAll(async () => {
    await pkpEthersWallet.init();
  });

  it('PKPEthersWallet should be defined', () => {
    expect(PKPEthersWallet).toBeDefined();
  });

  describe('signTypedData', () => {
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
        const signature = await ethRequestHandler<string>({
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
      //   const signature = await ethRequestHandler({
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

  describe('signTypedData V3', () => {
    // Typed data to sign
    // Example from https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L1033
    const example = {
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

    describe('[requestHandler] Signed typed data', () => {
      // eth_signTypedData parameters
      // Address - 20 Bytes - Address of the account that will sign the messages.
      // TypedData - Typed structured data to be signed.
      // Reference: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#eth_signtypeddata
      const msgParamStr = JSON.stringify(example);

      const payload: ETHRequestSigningPayload = {
        method: 'eth_signTypedData_v3',
        params: [LITCONFIG.PKP_ADDRESS, msgParamStr],
      };

      it('should sign the typed data', async () => {
        const signature = await ethRequestHandler<string>({
          signer: pkpEthersWallet,
          payload,
        });

        // verify signature
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
    });
  });

  describe('signTypedData V4', () => {
    // Typed data to sign
    // Example from https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L1155
    const example = {
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

    // eth_signTypedData parameters
    // Address - 20 Bytes - Address of the account that will sign the messages.
    // TypedData - Typed structured data to be signed.
    // Reference: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#eth_signtypeddata
    const msgParamStr = JSON.stringify(example);

    const payload: ETHRequestSigningPayload = {
      method: 'eth_signTypedData_v4',
      params: [LITCONFIG.PKP_ADDRESS, msgParamStr],
    };

    // Sign eth_signTypedData_v4 request
    it('should sign the typed data', async () => {
      const signature = await ethRequestHandler<string>({
        signer: pkpEthersWallet,
        payload,
      });

      // verify signature
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
  });

  describe('ethSign', () => {
    // eth_sign parameters
    // Address - 20 Bytes - Address of the account that will sign the messages.
    // Message - 32 Bytes - Message to sign.
    // Reference:

    // Message to sign
    const message = 'Hello world';
    const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

    // eth_sign parameters
    // DATA, 20 Bytes - address
    // DATA, N Bytes - message to sign
    // Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_sign
    const payload: ETHRequestSigningPayload = {
      method: 'eth_sign',
      params: [LITCONFIG.PKP_ADDRESS, hexMsg],
    };

    it('should sign the message', async () => {
      const signature = await ethRequestHandler<string>({
        signer: pkpEthersWallet,
        payload,
      });

      // Verify signature
      const recoveredAddr = ethers.utils.verifyMessage(message, signature);
      console.log(
        'eth_sign verified? ',
        pkpEthersWallet.address.toLowerCase() === recoveredAddr.toLowerCase()
      );
    });
  });

  describe('personalSign', () => {
    // Message to sign
    const message = 'Free the web';
    const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

    // personal_sign parameters
    // DATA, N Bytes - message to sign.
    // DATA, 20 Bytes - address
    // Reference: https://metamask.github.io/api-playground/api-documentation/#personal_sign
    const payload: ETHRequestSigningPayload = {
      method: 'personal_sign',
      params: [hexMsg, LITCONFIG.PKP_ADDRESS],
    };

    it('should sign the message', async () => {
      const signature = await ethRequestHandler<string>({
        signer: pkpEthersWallet,
        payload,
      });

      // Verify signature
      const recoveredAddr = ethers.utils.verifyMessage(message, signature);

      expect(LITCONFIG.PKP_ADDRESS.toLowerCase()).toBe(
        recoveredAddr.toLowerCase()
      );
    });
  });

  describe('sendTransaction', () => {
    const pkpEthersWallet = new PKPEthersWallet({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpc: LITCONFIG.ETH_RPC_ENDPOINT,
      debug: false,
    });

    // Transaction to sign and send
    const from = LITCONFIG.PKP_ADDRESS;
    const to = LITCONFIG.PKP_ADDRESS;
    const gasLimit = BigNumber.from('21000');
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
    const payload: ETHRequestSigningPayload = {
      method: 'eth_sendTransaction',
      params: [tx],
    };

    it('should sign and send the transaction', async () => {
      await pkpEthersWallet.init();

      const txRes = await ethRequestHandler<Transaction>({
        signer: pkpEthersWallet,
        payload,
      });

      expect(txRes.hash).toBeDefined();
    });
  });

  describe('signTransaction', () => {
    const pkpEthersWallet = new PKPEthersWallet({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpc: LITCONFIG.ETH_RPC_ENDPOINT,
      debug: false,
    });

    // Transaction to sign and send
    const from = LITCONFIG.PKP_ADDRESS;
    const to = LITCONFIG.PKP_ADDRESS;
    const gasLimit = BigNumber.from('21000');
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

    // eth_signTransaction parameters
    // Transaction - Object
    // Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_signTransaction
    const payload: ETHRequestSigningPayload = {
      method: 'eth_signTransaction',
      params: [tx],
    };

    it('should sign the transaction', async () => {
      await pkpEthersWallet.init();

      const signedTx = await ethRequestHandler<string>({
        signer: pkpEthersWallet,
        payload,
      });

      expect(signedTx).toBeDefined();
    });
  });
});
