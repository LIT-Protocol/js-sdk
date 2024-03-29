export const MultisenderData = {
  date: '2023-10-02T18:22:36.000Z',
  address: '0xCEdE8DA2693E8B3Ac550D248E07d4EB00C4a0a91',
  contractName: 'Multisender',
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address[]',
          name: '_recipients',
          type: 'address[]',
        },
      ],
      name: 'sendEth',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address[]',
          name: '_recipients',
          type: 'address[]',
        },
        {
          internalType: 'address',
          name: 'tokenContract',
          type: 'address',
        },
      ],
      name: 'sendTokens',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'tokenContract',
          type: 'address',
        },
      ],
      name: 'withdrawTokens',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
};
