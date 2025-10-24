import React from 'react';

export const AddLitChainButton = () => {
  const addNetwork = () => {
    const params = [
      {
        chainId: '0x2AC60',
        chainName: 'Lit Chain',
        nativeCurrency: {
          name: 'Lit Protocol',
          symbol: 'LITKEY',
          decimals: 18,
        },
        rpcUrls: ['https://lit-chain-rpc.litprotocol.com'],
        blockExplorerUrls: [
          'https://lit-chain-explorer.litprotocol.com',
        ],
      },
    ];

    window.ethereum
      .request({ method: 'wallet_addEthereumChain', params })
      .then(() => console.log('Success'))
      .catch(error => console.log('Error', error.message));
  };

  return (
    <button
      onClick={addNetwork}
      className="px-5 py-2 rounded-md bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold shadow-md hover:from-[#fb923c] hover:to-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-all"
    >
      Add Lit Chain to Metamask
    </button>
  );
}
