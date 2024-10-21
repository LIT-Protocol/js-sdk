import depd from 'depd';

const deprecated = depd('lit-js-sdk:constants:constants');

/**
 * Lit Protocol Network Public Key
 */
export const NETWORK_PUB_KEY =
  '9971e835a1fe1a4d78e381eebbe0ddc84fde5119169db816900de796d10187f3c53d65c1202ac083d099a517f34a9b62';

// you can either pass a "chain" param to lit functions, which it uses to tell which network your sig came from.
// or, you can pass a authSig that has and of these keys in it to tell which network your sig came from.
export const LIT_AUTH_SIG_CHAIN_KEYS = [
  'ethereum',
  'solana',
  'cosmos',
  'kyve',
] as const;

export const AUTH_SIGNATURE_BODY =
  'I am creating an account to use Lit Protocol at {{timestamp}}';

// ========== Chains ==========
export const VMTYPE = {
  EVM: 'EVM',
  SVM: 'SVM',
  CVM: 'CVM',
} as const;
export type VMTYPE_TYPE = keyof typeof VMTYPE;
export type VMTYPE_VALUES = (typeof VMTYPE)[keyof typeof VMTYPE];

const yellowstoneChain = {
  contractAddress: null,
  chainId: 175188,
  extra: true,
  name: 'Chronicle Yellowstone - Lit Protocol Testnet',
  symbol: 'tstLPX',
  decimals: 18,
  rpcUrls: ['https://yellowstone-rpc.litprotocol.com/'] as const,
  blockExplorerUrls: ['https://yellowstone-explorer.litprotocol.com/'] as const,
  type: null,
  vmType: VMTYPE.EVM,
} as const;

/**
 * EVM Chains supported by the LIT protocol.  Each chain includes an optional pre-deployed token contract that you may use for minting LITs.  These are ERC1155 contracts that let you mint any quantity of a given token.  Use the chain name as a key in this object.
 * @constant
 * @type { LITEVMChain }
 * @default
 */
export const LIT_CHAINS: { [key: string]: any } = {
  ethereum: {
    contractAddress: '0xA54F7579fFb3F98bd8649fF02813F575f9b3d353',
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    type: 'ERC1155',
    rpcUrls: [
      'https://eth-mainnet.alchemyapi.io/v2/EuGnkVlzVoEkzdg0lpCarhm8YHOxWVxE',
    ] as const,
    blockExplorerUrls: ['https://etherscan.io'] as const,
    vmType: VMTYPE.EVM,
  },
  polygon: {
    contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrls: ['https://polygon-rpc.com'] as const,
    blockExplorerUrls: ['https://explorer.matic.network'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  fantom: {
    contractAddress: '0x5bD3Fe8Ab542f0AaBF7552FAAf376Fd8Aa9b3869',
    chainId: 250,
    name: 'Fantom',
    symbol: 'FTM',
    decimals: 18,
    rpcUrls: ['https://rpcapi.fantom.network'] as const,
    blockExplorerUrls: ['https://ftmscan.com'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  xdai: {
    contractAddress: '0xDFc2Fd83dFfD0Dafb216F412aB3B18f2777406aF',
    chainId: 100,
    name: 'xDai',
    symbol: 'xDai',
    decimals: 18,
    rpcUrls: ['https://rpc.gnosischain.com'] as const,
    blockExplorerUrls: [' https://blockscout.com/xdai/mainnet'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  bsc: {
    contractAddress: '0xc716950e5DEae248160109F562e1C9bF8E0CA25B',
    chainId: 56,
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    decimals: 18,
    rpcUrls: ['https://bsc-dataseed.binance.org/'] as const,
    blockExplorerUrls: [' https://bscscan.com/'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  arbitrum: {
    contractAddress: '0xc716950e5DEae248160109F562e1C9bF8E0CA25B',
    chainId: 42161,
    name: 'Arbitrum',
    symbol: 'AETH',
    decimals: 18,
    type: 'ERC1155',
    rpcUrls: ['https://arb1.arbitrum.io/rpc'] as const,
    blockExplorerUrls: ['https://arbiscan.io/'] as const,
    vmType: VMTYPE.EVM,
  },
  arbitrumSepolia: {
    contractAddress: null,
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: [
      'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
    ] as const,
    blockExplorerUrls: ['https://sepolia.arbiscan.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  avalanche: {
    contractAddress: '0xBB118507E802D17ECDD4343797066dDc13Cde7C6',
    chainId: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
    type: 'ERC1155',
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'] as const,
    blockExplorerUrls: ['https://snowtrace.io/'] as const,
    vmType: VMTYPE.EVM,
  },
  fuji: {
    contractAddress: '0xc716950e5DEae248160109F562e1C9bF8E0CA25B',
    chainId: 43113,
    name: 'Avalanche FUJI Testnet',
    symbol: 'AVAX',
    decimals: 18,
    type: 'ERC1155',
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'] as const,
    blockExplorerUrls: ['https://testnet.snowtrace.io/'] as const,
    vmType: VMTYPE.EVM,
  },
  harmony: {
    contractAddress: '0xBB118507E802D17ECDD4343797066dDc13Cde7C6',
    chainId: 1666600000,
    name: 'Harmony',
    symbol: 'ONE',
    decimals: 18,
    type: 'ERC1155',
    rpcUrls: ['https://api.harmony.one'] as const,
    blockExplorerUrls: ['https://explorer.harmony.one/'] as const,
    vmType: VMTYPE.EVM,
  },
  mumbai: {
    contractAddress: '0xc716950e5DEae248160109F562e1C9bF8E0CA25B',
    chainId: 80001,
    name: 'Mumbai',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrls: [
      'https://rpc-mumbai.maticvigil.com/v1/96bf5fa6e03d272fbd09de48d03927b95633726c',
    ] as const,
    blockExplorerUrls: ['https://mumbai.polygonscan.com'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  goerli: {
    contractAddress: '0xc716950e5DEae248160109F562e1C9bF8E0CA25B',
    chainId: 5,
    name: 'Goerli',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: [
      'https://goerli.infura.io/v3/96dffb3d8c084dec952c61bd6230af34',
    ] as const,
    blockExplorerUrls: ['https://goerli.etherscan.io'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  cronos: {
    contractAddress: '0xc716950e5DEae248160109F562e1C9bF8E0CA25B',
    chainId: 25,
    name: 'Cronos',
    symbol: 'CRO',
    decimals: 18,
    rpcUrls: ['https://evm-cronos.org'] as const,
    blockExplorerUrls: ['https://cronos.org/explorer/'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  optimism: {
    contractAddress: '0xbF68B4c9aCbed79278465007f20a08Fa045281E0',
    chainId: 10,
    name: 'Optimism',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://mainnet.optimism.io'] as const,
    blockExplorerUrls: ['https://optimistic.etherscan.io'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  celo: {
    contractAddress: '0xBB118507E802D17ECDD4343797066dDc13Cde7C6',
    chainId: 42220,
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
    rpcUrls: ['https://forno.celo.org'] as const,
    blockExplorerUrls: ['https://explorer.celo.org'] as const,
    type: 'ERC1155',
    vmType: VMTYPE.EVM,
  },
  aurora: {
    contractAddress: null,
    chainId: 1313161554,
    name: 'Aurora',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://mainnet.aurora.dev'] as const,
    blockExplorerUrls: ['https://aurorascan.dev'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  eluvio: {
    contractAddress: null,
    chainId: 955305,
    name: 'Eluvio',
    symbol: 'ELV',
    decimals: 18,
    rpcUrls: ['https://host-76-74-28-226.contentfabric.io/eth'] as const,
    blockExplorerUrls: ['https://explorer.eluv.io'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  alfajores: {
    contractAddress: null,
    chainId: 44787,
    name: 'Alfajores',
    symbol: 'CELO',
    decimals: 18,
    rpcUrls: ['https://alfajores-forno.celo-testnet.org'] as const,
    blockExplorerUrls: [
      'https://alfajores-blockscout.celo-testnet.org',
    ] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  xdc: {
    contractAddress: null,
    chainId: 50,
    name: 'XDC Blockchain',
    symbol: 'XDC',
    decimals: 18,
    rpcUrls: ['https://rpc.xinfin.network'] as const,
    blockExplorerUrls: ['https://explorer.xinfin.network'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  evmos: {
    contractAddress: null,
    chainId: 9001,
    name: 'EVMOS',
    symbol: 'EVMOS',
    decimals: 18,
    rpcUrls: ['https://eth.bd.evmos.org:8545'] as const,
    blockExplorerUrls: ['https://evm.evmos.org'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  evmosTestnet: {
    contractAddress: null,
    chainId: 9000,
    name: 'EVMOS Testnet',
    symbol: 'EVMOS',
    decimals: 18,
    rpcUrls: ['https://eth.bd.evmos.dev:8545'] as const,
    blockExplorerUrls: ['https://evm.evmos.dev'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  bscTestnet: {
    contractAddress: null,
    chainId: 97,
    name: 'BSC Testnet',
    symbol: 'BNB',
    decimals: 18,
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'] as const,
    blockExplorerUrls: ['https://testnet.bscscan.com/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  baseGoerli: {
    contractAddress: null,
    chainId: 84531,
    name: 'Base Goerli',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://goerli.base.org'] as const,
    blockExplorerUrls: ['https://goerli.basescan.org'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  baseSepolia: {
    contractAddress: null,
    chainId: 84532,
    name: 'Base Sepolia',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://sepolia.base.org'] as const,
    blockExplorerUrls: ['https://sepolia.basescan.org'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  moonbeam: {
    contractAddress: null,
    chainId: 1284,
    name: 'Moonbeam',
    symbol: 'GLMR',
    decimals: 18,
    rpcUrls: ['https://rpc.api.moonbeam.network'] as const,
    blockExplorerUrls: ['https://moonscan.io'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  moonriver: {
    contractAddress: null,
    chainId: 1285,
    name: 'Moonriver',
    symbol: 'MOVR',
    decimals: 18,
    rpcUrls: ['https://rpc.api.moonriver.moonbeam.network'] as const,
    blockExplorerUrls: ['https://moonriver.moonscan.io'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  moonbaseAlpha: {
    contractAddress: null,
    chainId: 1287,
    name: 'Moonbase Alpha',
    symbol: 'DEV',
    decimals: 18,
    rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'] as const,
    blockExplorerUrls: ['https://moonbase.moonscan.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  filecoin: {
    contractAddress: null,
    chainId: 314,
    name: 'Filecoin',
    symbol: 'FIL',
    decimals: 18,
    rpcUrls: ['https://api.node.glif.io/rpc/v1'] as const,
    blockExplorerUrls: ['https://filfox.info/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  hyperspace: {
    contractAddress: null,
    chainId: 3141,
    name: 'Filecoin Hyperspace testnet',
    symbol: 'tFIL',
    decimals: 18,
    rpcUrls: ['https://api.hyperspace.node.glif.io/rpc/v1'] as const,
    blockExplorerUrls: ['https://hyperspace.filscan.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  sepolia: {
    contractAddress: null,
    chainId: 11155111,
    name: 'Sepolia Testnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'] as const,
    blockExplorerUrls: ['https://sepolia.etherscan.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  scrollAlphaTestnet: {
    contractAddress: null,
    chainId: 534353,
    name: 'Scroll Alpha Testnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://alpha-rpc.scroll.io/l2'] as const,
    blockExplorerUrls: ['https://blockscout.scroll.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  scroll: {
    contractAddress: null,
    chainId: 534352,
    name: 'Scroll',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.scroll.io'] as const,
    blockExplorerUrls: ['https://scrollscan.com/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  zksync: {
    contractAddress: null,
    chainId: 324,
    name: 'zkSync Era Mainnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://mainnet.era.zksync.io'] as const,
    blockExplorerUrls: ['https://explorer.zksync.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  base: {
    contractAddress: null,
    chainId: 8453,
    name: 'Base Mainnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://mainnet.base.org'] as const,
    blockExplorerUrls: ['https://basescan.org'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  lukso: {
    contractAddress: null,
    chainId: 42,
    name: 'Lukso',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.lukso.gateway.fm'] as const,
    blockExplorerUrls: [
      'https://explorer.execution.mainnet.lukso.network/',
    ] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  luksoTestnet: {
    contractAddress: null,
    chainId: 4201,
    name: 'Lukso Testnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.testnet.lukso.network'] as const,
    blockExplorerUrls: [
      'https://explorer.execution.testnet.lukso.network',
    ] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  zora: {
    contractAddress: null,
    chainId: 7777777,
    name: '	Zora',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.zora.energy/'] as const,
    blockExplorerUrls: ['https://explorer.zora.energy'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  zoraGoerli: {
    contractAddress: null,
    chainId: 999,
    name: 'Zora Goerli',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://testnet.rpc.zora.energy'] as const,
    blockExplorerUrls: ['https://testnet.explorer.zora.energy'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  zksyncTestnet: {
    contractAddress: null,
    chainId: 280,
    name: 'zkSync Era Testnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://testnet.era.zksync.dev'] as const,
    blockExplorerUrls: ['https://goerli.explorer.zksync.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  lineaGoerli: {
    contractAddress: null,
    chainId: 59140,
    name: 'Linea Testnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.goerli.linea.build'] as const,
    blockExplorerUrls: ['https://explorer.goerli.linea.build'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  lineaSepolia: {
    contractAddress: null,
    chainId: 59141,
    name: 'Linea Sepolia Testnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.sepolia.linea.build'],
    blockExplorerUrls: ['https://explorer.sepolia.linea.build'],
    type: null,
    vmType: VMTYPE.EVM,
  },

  /**
   * Use this for `>= Datil` network.
   * Chainlist entry for the Chronicle Yellowstone Testnet.
   * https://chainlist.org/chain/175188
   */
  yellowstone: yellowstoneChain,

  chiado: {
    contractAddress: null,
    chainId: 10200,
    name: 'Chiado',
    symbol: 'XDAI',
    decimals: 18,
    rpcUrls: ['https://rpc.chiadochain.net'] as const,
    blockExplorerUrls: ['https://blockscout.chiadochain.net'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  zkEvm: {
    contractAddress: null,
    chainId: 1101,
    name: 'zkEvm',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://zkevm-rpc.com'] as const,
    blockExplorerUrls: ['https://zkevm.polygonscan.com/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  mantleTestnet: {
    contractAddress: null,
    chainId: 5001,
    name: 'Mantle Testnet',
    symbol: 'MNT',
    decimals: 18,
    rpcUrls: ['https://rpc.testnet.mantle.xyz'] as const,
    blockExplorerUrls: ['https://explorer.testnet.mantle.xyz/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  mantle: {
    contractAddress: null,
    chainId: 5000,
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18,
    rpcUrls: ['https://rpc.mantle.xyz'] as const,
    blockExplorerUrls: ['http://explorer.mantle.xyz/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  klaytn: {
    contractAddress: null,
    chainId: 8217,
    name: 'Klaytn',
    symbol: 'KLAY',
    decimals: 18,
    rpcUrls: ['https://klaytn.blockpi.network/v1/rpc/public'] as const,
    blockExplorerUrls: ['https://www.klaytnfinder.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  publicGoodsNetwork: {
    contractAddress: null,
    chainId: 424,
    name: 'Public Goods Network',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.publicgoods.network'] as const,
    blockExplorerUrls: ['https://explorer.publicgoods.network/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  optimismGoerli: {
    contractAddress: null,
    chainId: 420,
    name: 'Optimism Goerli',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://optimism-goerli.publicnode.com'] as const,
    blockExplorerUrls: ['https://goerli-optimism.etherscan.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  waevEclipseTestnet: {
    contractAddress: null,
    chainId: 91006,
    name: 'Waev Eclipse Testnet',
    symbol: 'ecWAEV',
    decimals: 18,
    rpcUrls: ['https://api.evm.waev.eclipsenetwork.xyz'] as const,
    blockExplorerUrls: ['http://waev.explorer.modular.cloud/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  waevEclipseDevnet: {
    contractAddress: null,
    chainId: 91006,
    name: 'Waev Eclipse Devnet',
    symbol: 'ecWAEV',
    decimals: 18,
    rpcUrls: ['https://api.evm.waev.dev.eclipsenetwork.xyz'] as const,
    blockExplorerUrls: ['http://waev.explorer.modular.cloud/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  verifyTestnet: {
    contractAddress: null,
    chainId: 1833,
    name: 'Verify Testnet',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrls: ['https://rpc.verify-testnet.gelato.digital'] as const,
    blockExplorerUrls: ['https://verify-testnet.blockscout.com/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  fuse: {
    contractAddress: null,
    chainId: 122,
    name: 'Fuse',
    symbol: 'FUSE',
    decimals: 18,
    rpcUrls: ['https://rpc.fuse.io/'] as const,
    blockExplorerUrls: ['https://explorer.fuse.io/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  campNetwork: {
    contractAddress: null,
    chainId: 325000,
    name: 'Camp Network',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.camp-network-testnet.gelato.digital'] as const,
    blockExplorerUrls: [
      'https://explorer.camp-network-testnet.gelato.digital/',
    ] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  vanar: {
    contractAddress: null,
    chainId: 78600,
    name: 'Vanar Vanguard',
    symbol: 'VANRY',
    decimals: 18,
    rpcUrls: ['https://rpc-vanguard.vanarchain.com'] as const,
    blockExplorerUrls: ['https://explorer-vanguard.vanarchain.com'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  lisk: {
    contractAddress: null,
    chainId: 1135,
    name: 'Lisk',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://lisk.drpc.org'] as const,
    blockExplorerUrls: ['https://blockscout.lisk.com/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  chilizMainnet: {
    contractAddress: null,
    chainId: 88888,
    name: 'Chiliz Mainnet',
    symbol: 'CHZ',
    decimals: 18,
    rpcUrls: ['https://rpc.ankr.com/chiliz'] as const,
    blockExplorerUrls: ['https://chiliscan.com/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  chilizTestnet: {
    contractAddress: null,
    chainId: 88882,
    name: 'Chiliz Spicy Testnet',
    symbol: 'CHZ',
    decimals: 18,
    rpcUrls: ['https://spicy-rpc.chiliz.com/'] as const,
    blockExplorerUrls: ['https://testnet.chiliscan.com/'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  skaleTestnet: {
    contractAddress: null,
    chainId: 37084624,
    name: 'SKALE Nebula Hub Testnet',
    symbol: 'sFUEL',
    decimals: 18,
    rpcUrls: [
      'https://testnet.skalenodes.com/v1/lanky-ill-funny-testnet',
    ] as const,
    blockExplorerUrls: [
      'https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com',
    ] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  skale: {
    contractAddress: null,
    chainId: 1482601649,
    name: 'SKALE Nebula Hub Mainnet',
    symbol: 'sFUEL',
    decimals: 18,
    rpcUrls: [
      'https://mainnet.skalenodes.com/v1/green-giddy-denebola',
    ] as const,
    blockExplorerUrls: [
      'https://green-giddy-denebola.explorer.mainnet.skalenodes.com',
    ] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  skaleCalypso: {
    contractAddress: null,
    chainId: 1564830818,
    name: 'SKALE Calypso Hub Mainnet',
    symbol: 'sFUEL',
    decimals: 18,
    rpcUrls: ['https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague'],
    blockExplorerUrls: [
      'https://giant-half-dual-testnet.explorer.testnet.skalenodes.com/',
    ],
    type: null,
    vmType: VMTYPE.EVM,
  },
  fhenixHelium: {
    contractAddress: null,
    chainId: 8008135,
    name: 'Fhenix Helium',
    symbol: 'tFHE',
    decimals: 18,
    rpcUrls: ['https://api.helium.fhenix.zone'] as const,
    blockExplorerUrls: ['https://explorer.helium.fhenix.zone'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  hederaTestnet: {
    contractAddress: null,
    chainId: 296,
    name: 'Hedera Testnet',
    symbol: 'HBAR',
    decimals: 8,
    rpcUrls: ['https://testnet.hashio.io/api'] as const,
    blockExplorerUrls: ['https://hashscan.io/testnet/dashboard'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  bitTorrentTestnet: {
    contractAddress: null,
    chainId: 1028,
    name: 'BitTorrent Testnet',
    symbol: 'BTT',
    decimals: 18,
    rpcUrls: ['https://test-rpc.bittorrentchain.io'] as const,
    blockExplorerUrls: ['https://testnet.bttcscan.com'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  storyIlaid: {
    contractAddress: null,
    chainId: 1513,
    name: 'Story Iliad Testnet',
    symbol: 'IP',
    decimals: 18,
    rpcUrls: ['https://testnet.storyrpc.io'] as const,
    blockExplorerUrls: ['https://testnet.storyscan.xyz'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
  campTestnet: {
    contractAddress: null,
    chainId: 325000,
    name: 'Camp Testnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.camp-network-testnet.gelato.digital'] as const,
    blockExplorerUrls: ['https://camp-network-testnet.blockscout.com'] as const,
    type: null,
    vmType: 'EVM',
  },
  hushedNorthstar: {
    contractAddress: null,
    chainId: 42161,
    name: 'Hushed Northstar Devnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://rpc.buildbear.io/yielddev'] as const,
    blockExplorerUrls: ['https://explorer.buildbear.io/yielddev/transactions'] as const,
    type: null,
    vmType: VMTYPE.EVM,
  },
} as const;
export const LIT_EVM_CHAINS = LIT_CHAINS;

/**
 * Object containing information to submit to Metamask
 */
export const METAMASK_CHAIN_INFO = {
  /**
   * Information about the "chronicleYellowstone" chain.
   */
  yellowstone: {
    chainId: LIT_CHAINS['yellowstone'].chainId,
    chainName: LIT_CHAINS['yellowstone'].name,
    nativeCurrency: {
      name: LIT_CHAINS['yellowstone'].symbol,
      symbol: LIT_CHAINS['yellowstone'].symbol,
      decimals: LIT_CHAINS['yellowstone'].decimals,
    },
    rpcUrls: LIT_CHAINS['yellowstone'].rpcUrls,
    blockExplorerUrls: LIT_CHAINS['yellowstone'].blockExplorerUrls,
    iconUrls: ['future'] as const,
  },
} as const;

/**
 * @deprecated Will be removed - Use METAMASK_CHAIN_INFO instead
 * Alias for {@link METAMASK_CHAIN_INFO}. Added for backwards compatibility.
 * See {@link METAMASK_CHAIN_INFO}
 */
export const metamaskChainInfo = new Proxy(METAMASK_CHAIN_INFO, {
  get(target, prop, receiver) {
    deprecated(
      'metamaskChainInfo is deprecated and will be removed in a future version. Use METAMASK_CHAIN_INFO instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

/**
 * Constants representing the available LIT RPC endpoints.
 */
export const LIT_RPC = {
  /**
   * Local Anvil RPC endpoint.
   */
  LOCAL_ANVIL: 'http://127.0.0.1:8545',

  /**
   * Chronicle Yellowstone RPC endpoint - used for >= Datil-test
   * More info: https://app.conduit.xyz/published/view/chronicle-yellowstone-testnet-9qgmzfcohk
   */
  CHRONICLE_YELLOWSTONE: 'https://yellowstone-rpc.litprotocol.com',
} as const;

/**
 * Represents the Lit Network constants.
 */
export const LIT_NETWORK = {
  DatilDev: 'datil-dev',
  DatilTest: 'datil-test',
  Datil: 'datil',
  Custom: 'custom',
} as const;
/**
 * @deprecated Will be removed. - Use LIT_NETWORK instead
 * Alias for LIT_NETWORK. Added for backwards compatibility.
 * See {@link LIT_NETWORK}
 */
export const LitNetwork = new Proxy(LIT_NETWORK, {
  get(target, prop, receiver) {
    deprecated(
      'LitNetwork is deprecated and will be removed in a future version. Use LIT_NETWORK instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});
/**
 * The type representing the keys of the LIT_NETWORK object.
 */
export type LIT_NETWORK_TYPES = keyof typeof LIT_NETWORK;

/**
 * The type representing the values of the LIT_NETWORK object.
 * This should replicate LIT_NETWORKS_KEYS in types package
 */
export type LIT_NETWORK_VALUES = (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK];

/**
 * RPC URL by Network
 *
 * A mapping of network names to their corresponding RPC URLs.
 */
export const RPC_URL_BY_NETWORK: { [key in LIT_NETWORK_VALUES]: string } = {
  'datil-dev': LIT_RPC.CHRONICLE_YELLOWSTONE,
  'datil-test': LIT_RPC.CHRONICLE_YELLOWSTONE,
  datil: LIT_RPC.CHRONICLE_YELLOWSTONE,
  custom: LIT_RPC.LOCAL_ANVIL,
} as const;

/**
 * Mapping of network names to their corresponding relayer URLs.
 */
export const RELAYER_URL_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: string;
} = {
  'datil-dev': 'https://datil-dev-relayer.getlit.dev',
  'datil-test': 'https://datil-test-relayer.getlit.dev',
  datil: 'https://datil-relayer.getlit.dev',
  custom: 'http://localhost:3000',
} as const;

/**
 * Mapping of network values to corresponding Metamask chain info.
 */
export const METAMASK_CHAIN_INFO_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  typeof METAMASK_CHAIN_INFO.yellowstone
> = {
  'datil-dev': METAMASK_CHAIN_INFO.yellowstone,
  'datil-test': METAMASK_CHAIN_INFO.yellowstone,
  datil: METAMASK_CHAIN_INFO.yellowstone,
  custom: METAMASK_CHAIN_INFO.yellowstone,
} as const;

export const HTTP = 'http://';
export const HTTPS = 'https://';

/**
 * Mapping of network values to corresponding http protocol.
 */
export const HTTP_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  typeof HTTP | typeof HTTPS
> = {
  'datil-dev': HTTPS,
  'datil-test': HTTPS,
  datil: HTTPS,
  custom: HTTP, // default, can be changed by config
} as const;

/**
 * Mapping of network values to their corresponding centralisation status.
 */
export const CENTRALISATION_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  'centralised' | 'decentralised' | 'unknown'
> = {
  'datil-dev': 'centralised',
  'datil-test': 'decentralised',
  datil: 'decentralised',
  custom: 'unknown',
} as const;

/**
 * Solana Chains supported by the LIT protocol.  Use the chain name as a key in this object.
 * @constant
 * @type { LITSVMChain }
 * @default
 */
export const LIT_SVM_CHAINS: { [key: string]: any } = {
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    rpcUrls: ['https://api.mainnet-beta.solana.com'] as const,
    blockExplorerUrls: ['https://explorer.solana.com/'] as const,
    vmType: VMTYPE.SVM,
  },
  solanaDevnet: {
    name: 'Solana Devnet',
    symbol: 'SOL',
    decimals: 9,
    rpcUrls: ['https://api.devnet.solana.com'] as const,
    blockExplorerUrls: ['https://explorer.solana.com/'] as const,
    vmType: VMTYPE.SVM,
  },
  solanaTestnet: {
    name: 'Solana Testnet',
    symbol: 'SOL',
    decimals: 9,
    rpcUrls: ['https://api.testnet.solana.com'] as const,
    blockExplorerUrls: ['https://explorer.solana.com/'] as const,
    vmType: VMTYPE.SVM,
  },
} as const;

/**
 * Cosmos Chains supported by the LIT protocol.  Use the chain name as a key in this object.
 * @constant
 * @type { LITCosmosChain }
 * @default
 */
export const LIT_COSMOS_CHAINS: { [key: string]: any } = {
  cosmos: {
    name: 'Cosmos',
    symbol: 'ATOM',
    decimals: 6,
    chainId: 'cosmoshub-4',
    rpcUrls: ['https://lcd-cosmoshub.keplr.app'] as const,
    blockExplorerUrls: ['https://atomscan.com/'] as const,
    vmType: VMTYPE.CVM,
  },
  kyve: {
    name: 'Kyve',
    symbol: 'KYVE',
    decimals: 6,
    chainId: 'korellia',
    rpcUrls: ['https://api.korellia.kyve.network'] as const,
    blockExplorerUrls: ['https://explorer.kyve.network/'] as const,
    vmType: VMTYPE.CVM,
  },
  evmosCosmos: {
    name: 'EVMOS Cosmos',
    symbol: 'EVMOS',
    decimals: 18,
    chainId: 'evmos_9001-2',
    rpcUrls: ['https://rest.bd.evmos.org:1317'] as const,
    blockExplorerUrls: ['https://evmos.bigdipper.live'] as const,
    vmType: VMTYPE.CVM,
  },
  evmosCosmosTestnet: {
    name: 'Evmos Cosmos Testnet',
    symbol: 'EVMOS',
    decimals: 18,
    chainId: 'evmos_9000-4',
    rpcUrls: ['https://rest.bd.evmos.dev:1317'] as const,
    blockExplorerUrls: ['https://testnet.bigdipper.live'] as const,
    vmType: VMTYPE.CVM,
  },
  cheqdMainnet: {
    name: 'Cheqd Mainnet',
    symbol: 'CHEQ',
    decimals: 9,
    chainId: 'cheqd-mainnet-1',
    rpcUrls: ['https://api.cheqd.net'] as const,
    blockExplorerUrls: ['https://explorer.cheqd.io'] as const,
    vmType: VMTYPE.CVM,
  },
  cheqdTestnet: {
    name: 'Cheqd Testnet',
    symbol: 'CHEQ',
    decimals: 9,
    chainId: 'cheqd-testnet-6',
    rpcUrls: ['https://api.cheqd.network'] as const,
    blockExplorerUrls: ['https://testnet-explorer.cheqd.io'] as const,
    vmType: VMTYPE.CVM,
  },
  juno: {
    name: 'Juno',
    symbol: 'JUNO',
    decimals: 6,
    chainId: 'juno-1',
    rpcUrls: ['https://rest.cosmos.directory/juno'] as const,
    blockExplorerUrls: ['https://www.mintscan.io/juno'] as const,
    vmType: VMTYPE.CVM,
  },
} as const;

/**
 * All Chains supported by the LIT protocol.  Use the chain name as a key in this object.
 * @type { LITChain<LITEVMChain | LITSVMChain | LITCosmosChain> }
 */
export const ALL_LIT_CHAINS: { [key: string]: any } = {
  ...LIT_CHAINS,
  ...LIT_SVM_CHAINS,
  ...LIT_COSMOS_CHAINS,
} as const;

/**
 * Local storage key constants
 */
export const LOCAL_STORAGE_KEYS = {
  AUTH_COSMOS_SIGNATURE: 'lit-auth-cosmos-signature',
  AUTH_SIGNATURE: 'lit-auth-signature',
  AUTH_SOL_SIGNATURE: 'lit-auth-sol-signature',
  WEB3_PROVIDER: 'lit-web3-provider',
  KEY_PAIR: 'lit-comms-keypair',
  SESSION_KEY: 'lit-session-key',
  WALLET_SIGNATURE: 'lit-wallet-sig',
} as const;

/**
 * Symmetric key algorithm parameters
 */
export const SYMM_KEY_ALGO_PARAMS = {
  name: 'AES-CBC',
  length: 256,
} as const;

/**
 * Default node URLs for each LIT network
 * Note: Dynamic networks have no default node URLS; they are always
 * loaded from the chain during initialization
 */
export const LIT_NETWORKS: { [key in LIT_NETWORK_VALUES]: string[] } = {
  'datil-dev': [],
  'datil-test': [],
  datil: [],
  custom: [],
} as const;

// ========== Lit Sessions ==========
export const LIT_SESSION_KEY_URI = 'lit:session:' as const;

// ========== Lit Auth Methods ==========

export const AUTH_METHOD_TYPE_IDS = {
  WEBAUTHN: 3,
  DISCORD: 4,
  GOOGLE: 5,
  GOOGLE_JWT: 6,
} as const;

// ========== PKP Client ==========
export const PKP_CLIENT_SUPPORTED_CHAINS = ['eth', 'cosmos'] as const;

// ========== RLI Delegation ==========
export const SIWE_DELEGATION_URI = 'lit:capability:delegation' as const;

// ========== Lit Actions ==========
export const LIT_ACTION_IPFS_HASH =
  'QmUjX8MW6StQ7NKNdaS6g4RMkvN5hcgtKmEi8Mca6oX4t3' as const;

export const LIT_CURVE = {
  BLS: 'BLS',
  EcdsaK256: 'K256',
  EcdsaCaitSith: 'ECDSA_CAIT_SITH', // Legacy alias of K256
  EcdsaCAITSITHP256: 'EcdsaCaitSithP256',
} as const;

export type LIT_CURVE_TYPE = keyof typeof LIT_CURVE;
// This should replicate SigShare.sigType in types package
export type LIT_CURVE_VALUES = (typeof LIT_CURVE)[keyof typeof LIT_CURVE];

// ========== Either Types ==========
export const EITHER_TYPE = {
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
} as const;
export type EITHER_TYPE_TYPE = keyof typeof EITHER_TYPE;
export type EITHER_TYPE_VALUES = (typeof EITHER_TYPE)[keyof typeof EITHER_TYPE];

// ========== Supported PKP Auth Method Types ==========
export const AUTH_METHOD_TYPE = {
  EthWallet: 1,
  LitAction: 2,
  WebAuthn: 3,
  Discord: 4,
  Google: 5,
  GoogleJwt: 6,
  AppleJwt: 8,
  StytchOtp: 9,
  StytchEmailFactorOtp: 10,
  StytchSmsFactorOtp: 11,
  StytchWhatsAppFactorOtp: 12,
  StytchTotpFactorOtp: 13,
} as const;

export type AUTH_METHOD_TYPE_TYPE = keyof typeof AUTH_METHOD_TYPE;
export type AUTH_METHOD_TYPE_VALUES =
  (typeof AUTH_METHOD_TYPE)[keyof typeof AUTH_METHOD_TYPE];
/**
 * @deprecated Will be removed - Use AUTH_METHOD_TYPE instead
 * Alias for AUTH_METHOD_TYPE. Added for backwards compatibility.
 * See {@link AUTH_METHOD_TYPE}
 */
export const AuthMethodType = new Proxy(AUTH_METHOD_TYPE, {
  get(target, prop, receiver) {
    deprecated(
      'AuthMethodType is deprecated and will be removed in a future version. Use AUTH_METHOD_TYPE instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

// ========== Supported PKP Auth Method Scopes ==========
export const AUTH_METHOD_SCOPE = {
  NoPermissions: 0,
  SignAnything: 1,
  PersonalSign: 2,
} as const;

export type AUTH_METHOD_SCOPE_TYPE = keyof typeof AUTH_METHOD_SCOPE;
export type AUTH_METHOD_SCOPE_VALUES =
  (typeof AUTH_METHOD_SCOPE)[keyof typeof AUTH_METHOD_SCOPE];

/**
 * @deprecated Will be removed - Use AUTH_METHOD_SCOPE instead
 * Alias for AUTH_METHOD_SCOPE. Added for backwards compatibility.
 * See {@link AUTH_METHOD_SCOPE}
 */
export const AuthMethodScope = new Proxy(AUTH_METHOD_SCOPE, {
  get(target, prop, receiver) {
    deprecated(
      'AuthMethodScope is deprecated and will be removed in a future version. Use AUTH_METHOD_SCOPE instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

// ========== Supported Provider Types ==========
export const PROVIDER_TYPE = {
  Discord: 'discord',
  Google: 'google',
  EthWallet: 'ethwallet',
  WebAuthn: 'webauthn',
  Apple: 'apple',
  StytchOtp: 'stytchOtp',
  StytchEmailFactorOtp: 'stytchEmailFactorOtp',
  StytchSmsFactorOtp: 'stytchSmsFactorOtp',
  StytchWhatsAppFactorOtp: 'stytchWhatsAppFactorOtp',
  StytchTotpFactor: 'stytchTotpFactor',
} as const;

export type PROVIDER_TYPE_TYPE = keyof typeof PROVIDER_TYPE;
export type PROVIDER_TYPE_VALUES =
  (typeof PROVIDER_TYPE)[keyof typeof PROVIDER_TYPE];
/**
 * @deprecated Will be removed - Use PROVIDER_TYPE instead
 * Alias for PROVIDER_TYPE. Added for backwards compatibility.
 * See {@link PROVIDER_TYPE}
 */
export const ProviderType = new Proxy(PROVIDER_TYPE, {
  get(target, prop, receiver) {
    deprecated(
      'ProviderType is deprecated and will be removed in a future version. Use PROVIDER_TYPE instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

// ========== Supported Staking States ==========
export const STAKING_STATES = {
  Active: 0,
  NextValidatorSetLocked: 1,
  ReadyForNextEpoch: 2,
  Unlocked: 3,
  Paused: 4,
  Restore: 5,
} as const;

export type STAKING_STATES_TYPE = keyof typeof STAKING_STATES;
export type STAKING_STATES_VALUES =
  (typeof STAKING_STATES)[keyof typeof STAKING_STATES];
/**
 * @deprecated Will be removed - Use STAKING_STATES instead
 * Alias for STAKING_STATES. Added for backwards compatibility.
 * See {@link STAKING_STATES}
 */
export const StakingStates = new Proxy(STAKING_STATES, {
  get(target, prop, receiver) {
    deprecated(
      'StakingStates is deprecated and will be removed in a future version. Use STAKING_STATES instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

// ========== Relay Auth Status ==========
export const RELAY_AUTH_STATUS = {
  InProgress: 'InProgress',
  Succeeded: 'Succeeded',
  Failed: 'Failed',
} as const;

export type RELAY_AUTH_STATUS_TYPE = keyof typeof RELAY_AUTH_STATUS;
export type RELAY_AUTH_STATUS_VALUES =
  (typeof RELAY_AUTH_STATUS)[keyof typeof RELAY_AUTH_STATUS];
/**
 * @deprecated Will be removed - Use RELAY_AUTH_STATUS instead
 * Alias for RELAY_AUTH_STATUS. Added for backwards compatibility.
 * See {@link RELAY_AUTH_STATUS}
 */
export const RelayAuthStatus = new Proxy(RELAY_AUTH_STATUS, {
  get(target, prop, receiver) {
    deprecated(
      'RelayAuthStatus is deprecated and will be removed in a future version. Use RELAY_AUTH_STATUS instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

/**
 * Prefixes used for identifying various LIT resources.
 *
 * @description These resource prefixes are also used as valid IRI schemes.
 */
export const LIT_RESOURCE_PREFIX = {
  AccessControlCondition: 'lit-accesscontrolcondition',
  PKP: 'lit-pkp',
  RLI: 'lit-ratelimitincrease',
  LitAction: 'lit-litaction',
} as const;
export type LIT_RESOURCE_PREFIX_TYPE = keyof typeof LIT_RESOURCE_PREFIX;
// This should mimic LitResourcePrefix in types package
export type LIT_RESOURCE_PREFIX_VALUES =
  (typeof LIT_RESOURCE_PREFIX)[keyof typeof LIT_RESOURCE_PREFIX];
/**
 * @deprecated Will be removed - Use LIT_RESOURCE_PREFIX instead
 * Alias for LIT_RESOURCE_PREFIX. Added for backwards compatibility.
 * See {@link LIT_RESOURCE_PREFIX}
 */
export const LitResourcePrefix = new Proxy(LIT_RESOURCE_PREFIX, {
  get(target, prop, receiver) {
    deprecated(
      'LitResourcePrefix is deprecated and will be removed in a future version. Use LIT_RESOURCE_PREFIX instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

/**
 * User-facing abilities that can be granted to a session.
 */
export const LIT_ABILITY = {
  /**
   * This is the ability to process an encryption access control condition.
   * The resource will specify the corresponding hashed key value of the
   * access control condition.
   */
  AccessControlConditionDecryption: 'access-control-condition-decryption',

  /**
   * This is the ability to process a signing access control condition.
   * The resource will specify the corresponding hashed key value of the
   * access control condition.
   */
  AccessControlConditionSigning: 'access-control-condition-signing',

  /**
   * This is the ability to use a PKP for signing purposes. The resource will specify
   * the corresponding PKP token ID.
   */
  PKPSigning: 'pkp-signing',

  /**
   * This is the ability to use a Rate Limit Increase (Capacity Credits NFT) token during
   * authentication with the nodes. The resource will specify the corresponding
   * Capacity Credits NFT token ID.
   */
  RateLimitIncreaseAuth: 'rate-limit-increase-auth',

  /**
   * This is the ability to execute a Lit Action. The resource will specify the
   * corresponding Lit Action IPFS CID.
   */
  LitActionExecution: 'lit-action-execution',
} as const;

export type LIT_ABILITY_TYPE = keyof typeof LIT_ABILITY;
// This should replicate LitAbility in types package
export type LIT_ABILITY_VALUES = (typeof LIT_ABILITY)[keyof typeof LIT_ABILITY];
/**
 * @deprecated Will be removed - Use LIT_ABILITY instead
 * Alias for LIT_ABILITY. Added for backwards compatibility.
 * See {@link LIT_ABILITY}
 */
export const LitAbility = new Proxy(LIT_ABILITY, {
  get(target, prop, receiver) {
    deprecated(
      'LitAbility is deprecated and will be removed in a future version. Use LIT_ABILITY instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

/**
 * LIT specific abilities mapped into the Recap specific terminology
 * of an 'ability'.
 */
export const LIT_RECAP_ABILITY = {
  Decryption: 'Decryption',
  Signing: 'Signing',
  Auth: 'Auth',
  Execution: 'Execution',
} as const;

export type LIT_RECAP_ABILITY_TYPE = keyof typeof LIT_RECAP_ABILITY;
export type LIT_RECAP_ABILITY_VALUES =
  (typeof LIT_RECAP_ABILITY)[keyof typeof LIT_RECAP_ABILITY];
/**
 * @deprecated Will be removed - Use LIT_RECAP_ABILITY instead
 * Alias for LIT_RECAP_ABILITY. Added for backwards compatibility.
 * See {@link LIT_RECAP_ABILITY}
 */
export const LitRecapAbility = new Proxy(LIT_RECAP_ABILITY, {
  get(target, prop, receiver) {
    deprecated(
      'LitRecapAbility is deprecated and will be removed in a future version. Use LIT_RECAP_ABILITY instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

export const LIT_NAMESPACE = {
  Auth: 'Auth',
  Threshold: 'Threshold',
} as const;

export type LIT_NAMESPACE_TYPE = keyof typeof LIT_NAMESPACE;
export type LIT_NAMESPACE_VALUES =
  (typeof LIT_NAMESPACE)[keyof typeof LIT_NAMESPACE];
/**
 * @deprecated Will be removed - Use LIT_NAMESPACE instead
 * Alias for LIT_NAMESPACE. Added for backwards compatibility.
 * See {@link LIT_NAMESPACE}
 */
export const LitNamespace = new Proxy(LIT_NAMESPACE, {
  get(target, prop, receiver) {
    deprecated(
      'LitNamespace is deprecated and will be removed in a future version. Use LIT_NAMESPACE instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

/**
 * SDK Logger levels
 */
export const LOG_LEVEL = {
  INFO: 0,
  DEBUG: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
  TIMING_START: 5,
  TIMING_END: 6,
  OFF: -1,
} as const;

export type LOG_LEVEL_TYPE = keyof typeof LOG_LEVEL;
export type LOG_LEVEL_VALUES = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];
/**
 * @deprecated Will be removed - Use LOG_LEVEL instead
 * Alias for LOG_LEVEL. Added for backwards compatibility.
 * See {@link LOG_LEVEL}
 */
export const LogLevel = new Proxy(LOG_LEVEL, {
  get(target, prop, receiver) {
    deprecated(
      'LogLevel is deprecated and will be removed in a future version. Use LOG_LEVEL instead.'
    );
    return Reflect.get(target, prop, receiver);
  },
});

export const FALLBACK_IPFS_GATEWAYS = [
  'https://flk-ipfs.io/ipfs/',
  'https://litprotocol.mypinata.cloud/ipfs/',
];
