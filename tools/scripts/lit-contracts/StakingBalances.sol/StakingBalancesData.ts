export const StakingBalancesData = {
  date: '2023-11-14T15:45:41Z',
  address: '0x095251de2aD2A78aDe96F2a11F7feAA7CF93e6B5',
  contractName: 'StakingBalances',
  abi: [
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: '_selector',
          type: 'bytes4',
        },
      ],
      name: 'CannotAddFunctionToDiamondThatAlreadyExists',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes4[]',
          name: '_selectors',
          type: 'bytes4[]',
        },
      ],
      name: 'CannotAddSelectorsToZeroAddress',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: '_selector',
          type: 'bytes4',
        },
      ],
      name: 'CannotRemoveFunctionThatDoesNotExist',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: '_selector',
          type: 'bytes4',
        },
      ],
      name: 'CannotRemoveImmutableFunction',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: '_selector',
          type: 'bytes4',
        },
      ],
      name: 'CannotReplaceFunctionThatDoesNotExists',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: '_selector',
          type: 'bytes4',
        },
      ],
      name: 'CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes4[]',
          name: '_selectors',
          type: 'bytes4[]',
        },
      ],
      name: 'CannotReplaceFunctionsFromFacetWithZeroAddress',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: '_selector',
          type: 'bytes4',
        },
      ],
      name: 'CannotReplaceImmutableFunction',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint8',
          name: '_action',
          type: 'uint8',
        },
      ],
      name: 'IncorrectFacetCutAction',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_initializationContractAddress',
          type: 'address',
        },
        {
          internalType: 'bytes',
          name: '_calldata',
          type: 'bytes',
        },
      ],
      name: 'InitializationFunctionReverted',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_contractAddress',
          type: 'address',
        },
        {
          internalType: 'string',
          name: '_message',
          type: 'string',
        },
      ],
      name: 'NoBytecodeAtAddress',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_facetAddress',
          type: 'address',
        },
      ],
      name: 'NoSelectorsProvidedForFacetForCut',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_user',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_contractOwner',
          type: 'address',
        },
      ],
      name: 'NotContractOwner',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_facetAddress',
          type: 'address',
        },
      ],
      name: 'RemoveFacetAddressMustBeZeroAddress',
      type: 'error',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'facetAddress',
              type: 'address',
            },
            {
              internalType: 'enum IDiamond.FacetCutAction',
              name: 'action',
              type: 'uint8',
            },
            {
              internalType: 'bytes4[]',
              name: 'functionSelectors',
              type: 'bytes4[]',
            },
          ],
          indexed: false,
          internalType: 'struct IDiamond.FacetCut[]',
          name: '_diamondCut',
          type: 'tuple[]',
        },
        {
          indexed: false,
          internalType: 'address',
          name: '_init',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bytes',
          name: '_calldata',
          type: 'bytes',
        },
      ],
      name: 'DiamondCut',
      type: 'event',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'facetAddress',
              type: 'address',
            },
            {
              internalType: 'enum IDiamond.FacetCutAction',
              name: 'action',
              type: 'uint8',
            },
            {
              internalType: 'bytes4[]',
              name: 'functionSelectors',
              type: 'bytes4[]',
            },
          ],
          internalType: 'struct IDiamond.FacetCut[]',
          name: '_diamondCut',
          type: 'tuple[]',
        },
        {
          internalType: 'address',
          name: '_init',
          type: 'address',
        },
        {
          internalType: 'bytes',
          name: '_calldata',
          type: 'bytes',
        },
      ],
      name: 'diamondCut',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: '_functionSelector',
          type: 'bytes4',
        },
      ],
      name: 'facetAddress',
      outputs: [
        {
          internalType: 'address',
          name: 'facetAddress_',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'facetAddresses',
      outputs: [
        {
          internalType: 'address[]',
          name: 'facetAddresses_',
          type: 'address[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_facet',
          type: 'address',
        },
      ],
      name: 'facetFunctionSelectors',
      outputs: [
        {
          internalType: 'bytes4[]',
          name: '_facetFunctionSelectors',
          type: 'bytes4[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'facets',
      outputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'facetAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4[]',
              name: 'functionSelectors',
              type: 'bytes4[]',
            },
          ],
          internalType: 'struct IDiamondLoupe.Facet[]',
          name: 'facets_',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: '_interfaceId',
          type: 'bytes4',
        },
      ],
      name: 'supportsInterface',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
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
          name: 'owner_',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_newOwner',
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
      name: 'ActiveValidatorsCannotLeave',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'aliasAccount',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'stakerAddress',
          type: 'address',
        },
      ],
      name: 'AliasNotOwnedBySender',
      type: 'error',
    },
    {
      inputs: [],
      name: 'CallerNotOwner',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'aliasAccount',
          type: 'address',
        },
      ],
      name: 'CannotRemoveAliasOfActiveValidator',
      type: 'error',
    },
    {
      inputs: [],
      name: 'CannotStakeZero',
      type: 'error',
    },
    {
      inputs: [],
      name: 'CannotWithdrawZero',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'aliasCount',
          type: 'uint256',
        },
      ],
      name: 'MaxAliasCountReached',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
      ],
      name: 'OnlyStakingContract',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amountStaked',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'minimumStake',
          type: 'uint256',
        },
      ],
      name: 'StakeMustBeGreaterThanMinimumStake',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amountStaked',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'maximumStake',
          type: 'uint256',
        },
      ],
      name: 'StakeMustBeLessThanMaximumStake',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'stakerAddress',
          type: 'address',
        },
      ],
      name: 'StakerNotPermitted',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'yourBalance',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'requestedWithdrawlAmount',
          type: 'uint256',
        },
      ],
      name: 'TryingToWithdrawMoreThanStaked',
      type: 'error',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'aliasAccount',
          type: 'address',
        },
      ],
      name: 'AliasAdded',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'aliasAccount',
          type: 'address',
        },
      ],
      name: 'AliasRemoved',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newMaxAliasCount',
          type: 'uint256',
        },
      ],
      name: 'MaxAliasCountSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newMaximumStake',
          type: 'uint256',
        },
      ],
      name: 'MaximumStakeSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newMinimumStake',
          type: 'uint256',
        },
      ],
      name: 'MinimumStakeSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
      ],
      name: 'PermittedStakerAdded',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
      ],
      name: 'PermittedStakerRemoved',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'bool',
          name: 'permittedStakersOn',
          type: 'bool',
        },
      ],
      name: 'PermittedStakersOnChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'newResolverAddress',
          type: 'address',
        },
      ],
      name: 'ResolverContractAddressSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'reward',
          type: 'uint256',
        },
      ],
      name: 'RewardPaid',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'Staked',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newTokenRewardPerTokenPerEpoch',
          type: 'uint256',
        },
      ],
      name: 'TokenRewardPerTokenPerEpochSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'aliasAccount',
          type: 'address',
        },
      ],
      name: 'ValidatorNotRewardedBecauseAlias',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'ValidatorRewarded',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'ValidatorTokensPenalized',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'Withdrawn',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'aliasAccount',
          type: 'address',
        },
      ],
      name: 'addAlias',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
      ],
      name: 'addPermittedStaker',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address[]',
          name: 'stakers',
          type: 'address[]',
        },
      ],
      name: 'addPermittedStakers',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'balanceOf',
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
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'checkStakingAmounts',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'getReward',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getStakingAddress',
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
      name: 'getTokenAddress',
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
      inputs: [
        {
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
      ],
      name: 'isPermittedStaker',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'maximumStake',
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
      name: 'minimumStake',
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
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'penalizeTokens',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'permittedStakersOn',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'aliasAccount',
          type: 'address',
        },
      ],
      name: 'removeAlias',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
      ],
      name: 'removePermittedStaker',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'staker',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'balance',
          type: 'uint256',
        },
      ],
      name: 'restakePenaltyTokens',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'rewardOf',
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
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'rewardValidator',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newResolverAddress',
          type: 'address',
        },
      ],
      name: 'setContractResolver',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'newMaxAliasCount',
          type: 'uint256',
        },
      ],
      name: 'setMaxAliasCount',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'newMaximumStake',
          type: 'uint256',
        },
      ],
      name: 'setMaximumStake',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'newMinimumStake',
          type: 'uint256',
        },
      ],
      name: 'setMinimumStake',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bool',
          name: 'permitted',
          type: 'bool',
        },
      ],
      name: 'setPermittedStakersOn',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'stake',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalStaked',
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
      inputs: [
        {
          internalType: 'uint256',
          name: 'balance',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
      ],
      name: 'transferPenaltyTokens',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'withdraw',
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
          internalType: 'uint256',
          name: 'balance',
          type: 'uint256',
        },
      ],
      name: 'withdrawPenaltyTokens',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
};
