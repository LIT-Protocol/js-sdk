import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import { isBrowser, isNode } from '@litprotocol-dev/shared-utils';
import * as ethModule from './eth';
import {
  getChainId,
  getMustResign,
  getRPCUrls,
  connectWeb3,
  disconnectWeb3,
  checkAndSignEVMAuthMessage,
  signMessageAsync,
  decimalPlaces,
} from './eth';
import { ethers } from 'ethers';

describe('eth.ts', () => {
  it('should convert chain hex to chane name', async () => {
    const test = ethModule.chainHexIdToChainName('0x1');

    expect(test).toBe('ethereum');
  });

  it('should convert chain hex to chane name', async () => {
    const test = ethModule.chainHexIdToChainName('0x89');

    expect(test).toBe('polygon');
  });

  it('should return error if string doesnt include 0x', async () => {
    console.log = jest.fn();

    try {
      ethModule.chainHexIdToChainName('2329');
    } catch (e) {
      console.log(e);
    }

    expect((console.log as any).mock.calls[0][0].errorCode).toBe(
      'wrong_param_format_exception'
    );
  });

  it('should return error if chain hex id not found', async () => {
    console.log = jest.fn();

    try {
      ethModule.chainHexIdToChainName('0x9999');
    } catch (e) {
      console.log(e);
    }

    expect((console.log as any).mock.calls[0][0].errorCode).toBe(
      'unsupported_chain'
    );
  });

  it('should get RPCS Urls in the correct format', async () => {
    const rpcUrls = ethModule.getRPCUrls();

    expect(rpcUrls).toStrictEqual({
      '1': 'https://eth-mainnet.alchemyapi.io/v2/EuGnkVlzVoEkzdg0lpCarhm8YHOxWVxE',
      '10': 'https://mainnet.optimism.io',
      '100': 'https://rpc.gnosischain.com',
      '1313161554': 'https://mainnet.aurora.dev',
      '137': 'https://polygon-rpc.com',
      '1666600000': 'https://api.harmony.one',
      '25': 'https://evm-cronos.org',
      '250': 'https://rpcapi.fantom.network',
      '3': 'https://ropsten.infura.io/v3/96dffb3d8c084dec952c61bd6230af34',
      '4': 'https://rinkeby.infura.io/v3/96dffb3d8c084dec952c61bd6230af34',
      '42': 'https://kovan.infura.io/v3/ddf1ca3700f34497bca2bf03607fde38',
      '42161': 'https://arb1.arbitrum.io/rpc',
      '42220': 'https://forno.celo.org',
      '43113': 'https://api.avax-test.network/ext/bc/C/rpc',
      '43114': 'https://api.avax.network/ext/bc/C/rpc',
      '44787': 'https://alfajores-forno.celo-testnet.org',
      '5': 'https://goerli.infura.io/v3/96dffb3d8c084dec952c61bd6230af34',
      '50': 'https://rpc.xinfin.network',
      '56': 'https://bsc-dataseed.binance.org/',
      '80001':
        'https://rpc-mumbai.maticvigil.com/v1/96bf5fa6e03d272fbd09de48d03927b95633726c',
      '9000': 'https://eth.bd.evmos.dev:8545',
      '9001': 'https://eth.bd.evmos.org:8545',
      '955305': 'https://host-76-74-28-226.contentfabric.io/eth',
    });
  });

  it('should getChainId', async () => {
    // @ts-ignore
    const OUTPUT = await getChainId('ethereum', null);

    expect(OUTPUT.result.error.code).toBe('wrong_network');
  });

  it('should getMustResign', async () => {
    // @ts-ignore
    const test = getMustResign('ethereum', null);

    expect(test).toBe(true);
  });

  it('should getRPCUrls', async () => {
    // @ts-ignore
    const test = getRPCUrls('ethereum', null);

    expect(test[1]).toStrictEqual(
      'https://eth-mainnet.alchemyapi.io/v2/EuGnkVlzVoEkzdg0lpCarhm8YHOxWVxE'
    );
    expect(test[10]).toStrictEqual('https://mainnet.optimism.io');
  });

  it('should FAIL to connectWeb3() as NodeJS is not supported.', async () => {
    const OUTPUT = await connectWeb3({ chainId: 1 });

    expect(OUTPUT.account).toBe(null);
    expect(OUTPUT.web3).toBe(null);
  });

  it('should FAIL to disconnectWeb3() as NodeJS is not supported.', async () => {
    const OUTPUT = disconnectWeb3();

    expect(OUTPUT).toBe(undefined);
  });

  it('should FAIL to checkAndSignEVMAuthMessage() as NodeJS is not supported.', async () => {
    const OUTPUT = await checkAndSignEVMAuthMessage({
      chain: 'ethereum',
    });

    expect(OUTPUT.address).toBe('');
    expect(OUTPUT.derivedVia).toBe('');
    expect(OUTPUT.signedMessage).toBe('');
  });

  it('should FAIL to signAndSaveAuthMessage() as NodeJS is not supported.', async () => {
    const OUTPUT = await ethModule.signAndSaveAuthMessage({
      web3: {} as any,
      account: '',
      chainId: 1,
      resources: [],
    });

    expect(OUTPUT.sig).toBe('');
  });

  it('should FAIL to signMessage() as NodeJS is not supported.', async () => {
    const OUTPUT = await ethModule.signMessage({
      web3: {} as any,
      account: '',
      body: '',
    });

    expect(OUTPUT.address).toBe('');
  });

  it('should FAIL to signMessageAsync() as NodeJS is not supported.', async () => {
    const OUTPUT = await signMessageAsync({} as any, '', '');

    expect(OUTPUT).toBe(null);
  });

  it('should FAIL to signMessageAsync() as NodeJS is not supported.', async () => {
    const OUTPUT = await signMessageAsync({} as any, '', '');

    expect(OUTPUT).toBe(null);
  });

//   it('should FAIL to decimalPlaces() as NodeJS is not supported.', async () => {

//     let httpProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/EuGnkVlzVoEkzdg0lpCarhm8YHOxWVxE");
    
//     // const OUTPUT = await decimalPlaces({
//     //     contractAddress: '0x594E1dA675e2a17866B7E3D80c96Cb396f2A4ccD',
//     //     chain: 'ethereum',
//     // });

//     const contract = new ethers.Contract(
//         '0xA54F7579fFb3F98bd8649fF02813F575f9b3d353',
//         [
//             {
//               "constant": true,
//               "inputs": [],
//               "name": "name",
//               "outputs": [
//                 {
//                   "name": "",
//                   "type": "string"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "view",
//               "type": "function"
//             },
//             {
//               "constant": false,
//               "inputs": [
//                 {
//                   "name": "_spender",
//                   "type": "address"
//                 },
//                 {
//                   "name": "_value",
//                   "type": "uint256"
//                 }
//               ],
//               "name": "approve",
//               "outputs": [
//                 {
//                   "name": "",
//                   "type": "bool"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "nonpayable",
//               "type": "function"
//             },
//             {
//               "constant": true,
//               "inputs": [],
//               "name": "totalSupply",
//               "outputs": [
//                 {
//                   "name": "",
//                   "type": "uint256"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "view",
//               "type": "function"
//             },
//             {
//               "constant": false,
//               "inputs": [
//                 {
//                   "name": "_from",
//                   "type": "address"
//                 },
//                 {
//                   "name": "_to",
//                   "type": "address"
//                 },
//                 {
//                   "name": "_value",
//                   "type": "uint256"
//                 }
//               ],
//               "name": "transferFrom",
//               "outputs": [
//                 {
//                   "name": "",
//                   "type": "bool"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "nonpayable",
//               "type": "function"
//             },
//             {
//               "constant": true,
//               "inputs": [],
//               "name": "decimals",
//               "outputs": [
//                 {
//                   "name": "",
//                   "type": "uint8"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "view",
//               "type": "function"
//             },
//             {
//               "constant": true,
//               "inputs": [
//                 {
//                   "name": "_owner",
//                   "type": "address"
//                 }
//               ],
//               "name": "balanceOf",
//               "outputs": [
//                 {
//                   "name": "balance",
//                   "type": "uint256"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "view",
//               "type": "function"
//             },
//             {
//               "constant": true,
//               "inputs": [],
//               "name": "symbol",
//               "outputs": [
//                 {
//                   "name": "",
//                   "type": "string"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "view",
//               "type": "function"
//             },
//             {
//               "constant": false,
//               "inputs": [
//                 {
//                   "name": "_to",
//                   "type": "address"
//                 },
//                 {
//                   "name": "_value",
//                   "type": "uint256"
//                 }
//               ],
//               "name": "transfer",
//               "outputs": [
//                 {
//                   "name": "",
//                   "type": "bool"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "nonpayable",
//               "type": "function"
//             },
//             {
//               "constant": true,
//               "inputs": [
//                 {
//                   "name": "_owner",
//                   "type": "address"
//                 },
//                 {
//                   "name": "_spender",
//                   "type": "address"
//                 }
//               ],
//               "name": "allowance",
//               "outputs": [
//                 {
//                   "name": "",
//                   "type": "uint256"
//                 }
//               ],
//               "payable": false,
//               "stateMutability": "view",
//               "type": "function"
//             },
//             {
//               "payable": true,
//               "stateMutability": "payable",
//               "type": "fallback"
//             },
//             {
//               "anonymous": false,
//               "inputs": [
//                 {
//                   "indexed": true,
//                   "name": "owner",
//                   "type": "address"
//                 },
//                 {
//                   "indexed": true,
//                   "name": "spender",
//                   "type": "address"
//                 },
//                 {
//                   "indexed": false,
//                   "name": "value",
//                   "type": "uint256"
//                 }
//               ],
//               "name": "Approval",
//               "type": "event"
//             },
//             {
//               "anonymous": false,
//               "inputs": [
//                 {
//                   "indexed": true,
//                   "name": "from",
//                   "type": "address"
//                 },
//                 {
//                   "indexed": true,
//                   "name": "to",
//                   "type": "address"
//                 },
//                 {
//                   "indexed": false,
//                   "name": "value",
//                   "type": "uint256"
//                 }
//               ],
//               "name": "Transfer",
//               "type": "event"
//             }
//           ],
//           httpProvider,
//     );

//     const dec = await contract['decimals']()


//     expect(dec).toBe(1);
//   });
});
