/**
 * Minimum ABI for Staking contract
 */
export const minStakingAbi = [
  {
    inputs: [],
    name: 'currentValidatorCountForConsensus',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getValidatorsInCurrentEpoch',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getKickedValidators',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'addresses',
        type: 'address[]',
      },
    ],
    name: 'getValidatorsStructs',
    outputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'ip',
            type: 'uint32',
          },
          {
            internalType: 'uint128',
            name: 'ipv6',
            type: 'uint128',
          },
          {
            internalType: 'uint32',
            name: 'port',
            type: 'uint32',
          },
          {
            internalType: 'address',
            name: 'nodeAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'reward',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'senderPubKey',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'receiverPubKey',
            type: 'uint256',
          },
        ],
        internalType: 'struct LibStakingStorage.Validator[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'epoch',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'epochLength',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'number',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'endTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'retries',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timeout',
            type: 'uint256',
          },
        ],
        internalType: 'struct LibStakingStorage.Epoch',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'enum LibStakingStorage.States',
        name: 'newState',
        type: 'uint8',
      },
    ],
    name: 'StateChanged',
    type: 'event',
  },
];
