import { pkpViem } from './pkp-viem';

describe('pkpViem', () => {
  it('should work', () => {
    expect(pkpViem()).toEqual('pkp-viem');
  });
});
import * as LITCONFIG from 'lit.config.json';
import {
  createWalletClient,
  defineChain,
  http,
  parseEther,
  verifyMessage,
  verifyTypedData,
} from 'viem';

// Define Lit Chronicle
const chronicle = defineChain({
  id: 175177,
  name: 'Chronicle',
  network: 'chronicle',
  nativeCurrency: {
    decimals: 18,
    name: 'LIT',
    symbol: 'LIT',
  },
  rpcUrls: {
    default: {
      http: ['https://chain-rpc.litprotocol.com/http'],
    },
    public: {
      http: ['https://chain-rpc.litprotocol.com/http'],
    },
  },
});

/**TypedData */
//message
const message = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  },
  contents: 'Hello, Bob!',
} as const;

// domain
const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const;

// The named list of all type definitions
const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const;

describe('PKPViemAccount', () => {
  it('should create a viem account', async () => {
    const { PKPViemAccount } = await import('./pkp-viem');

    const account = new PKPViemAccount({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
    });

    expect(account.address).toEqual(LITCONFIG.PKP_ETH_ADDRESS);
  });

  it('should sign message', async () => {
    const { PKPViemAccount } = await import('./pkp-viem');

    const account = new PKPViemAccount({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
    });

    const sig = await account.signMessage({ message: 'Hello World' });

    const isValid = await verifyMessage({
      address: account.address,
      message: 'Hello World',
      signature: sig,
    });
    expect(isValid).toEqual(true);
  });
  it('should sign TypedData', async () => {
    const { PKPViemAccount } = await import('./pkp-viem');
    const account = new PKPViemAccount({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
    });

    const signature = await account.signTypedData({
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      types: {
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
    });

    const isValid = await verifyTypedData({
      address: account.address,
      domain,
      types,
      primaryType: 'Mail',
      message,
      signature: signature,
    });

    expect(isValid).toEqual(true);
  });
  it('should create wallet client and send transaction to itself on Chronicle', async () => {
    const { PKPViemAccount } = await import('./pkp-viem');

    const account = new PKPViemAccount({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
    });

    const walletClient = createWalletClient({
      account: account,
      transport: http(),
      chain: chronicle,
    });

    const hash = await walletClient.sendTransaction({
      account,
      to: account.address,
      value: parseEther('0'),
      chain: walletClient.chain,
    });
    expect(hash).toBeDefined();
  });

  it('should create wallet client and send raw transaction to itself on Chronicle', async () => {
    const { PKPViemAccount } = await import('./pkp-viem');

    const account = new PKPViemAccount({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
    });

    const walletClient = createWalletClient({
      account: account,
      transport: http(),
      chain: chronicle,
    });

    const request = await walletClient.prepareTransactionRequest({
      account,
      to: account.address,
      value: parseEther('0'),
      chain: walletClient.chain,
    });

    const signature = await walletClient.signTransaction(request);

    const hash = await walletClient.sendRawTransaction({
      serializedTransaction: signature,
    });

    expect(hash).toBeDefined();
  });
});
