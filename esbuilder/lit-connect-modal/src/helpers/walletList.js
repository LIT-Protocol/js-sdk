import metaMaskLogo from '../logos/metamask.svg';
import coinbaseLogo from '../logos/coinbase.svg';
import walletConnectLogo from '../logos/walletconnect.svg';

const metaMaskSingle = {
  htmlId: 'lcm-metaMask',
  id: 'metamask',
  logo: metaMaskLogo,
  name: 'MetaMask',
  provider: globalThis.ethereum,
  synopsis: 'Connect your MetaMask Wallet',
  checkIfPresent: () => {
    if (
      typeof globalThis.ethereum !== 'undefined' &&
      globalThis.ethereum.isMetaMask
    ) {
      return true;
    } else {
      return false;
    }
  },
};

const coinbaseSingle = {
  htmlId: 'lcm-coinbase',
  id: 'coinbase',
  logo: coinbaseLogo,
  name: 'Coinbase',
  provider: globalThis.ethereum,
  synopsis: 'Connect your Coinbase Wallet',
  checkIfPresent: () => {
    if (
      typeof globalThis.ethereum !== 'undefined' &&
      globalThis.ethereum.isCoinbaseWallet
    ) {
      return true;
    } else {
      return false;
    }
  },
};

const rawListOfWalletsArray = [
  {
    htmlId: 'lcm-metaMask',
    id: 'metamask',
    logo: metaMaskLogo,
    name: 'MetaMask',
    provider: globalThis.ethereum?.providers?.find((p) => p.isMetaMask),
    synopsis: 'Connect your MetaMask Wallet',
    checkIfPresent: () => {
      return !!globalThis.ethereum?.providers?.find((p) => p.isMetaMask);
    },
  },
  {
    htmlId: 'lcm-coinbase',
    id: 'coinbase',
    logo: coinbaseLogo,
    name: 'Coinbase',
    provider: globalThis.ethereum?.providers?.find((p) => p.isCoinbaseWallet),
    synopsis: 'Connect your Coinbase Wallet',
    checkIfPresent: () => {
      return !!globalThis.ethereum?.providers?.find((p) => p.isCoinbaseWallet);
    },
  },
  {
    htmlId: 'lcm-walletConnect',
    id: 'walletconnect',
    logo: walletConnectLogo,
    name: 'WalletConnect',
    provider: null,
    synopsis: 'Scan with WalletConnect to connect',
  },
];

export { rawListOfWalletsArray, metaMaskSingle, coinbaseSingle };
