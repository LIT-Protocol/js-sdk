export const pkpNftMetadata = {
  address: '0x4f7dBAfD2D9fF2bD4b2B00D470eCbe673e49c4D3',
  abi: [
    {
      inputs: [],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [
        {
          internalType: 'bytes',
          name: 'buffer',
          type: 'bytes',
        },
      ],
      name: 'bytesToHex',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          internalType: 'bytes',
          name: 'pubKey',
          type: 'bytes',
        },
        {
          internalType: 'address',
          name: 'ethAddress',
          type: 'address',
        },
      ],
      name: 'tokenURI',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
  ],
};
