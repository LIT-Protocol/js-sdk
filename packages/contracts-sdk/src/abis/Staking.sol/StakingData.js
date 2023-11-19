export const StakingData = {
  date: '2023-11-14T15:45:41Z',
  address: '0x5bFa704aF947b3b0f966e4248DED7bfa6edeF952',
  contractName: 'Staking',
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
      inputs: [],
      name: 'CallerNotOwner',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'stakingAddress',
          type: 'address',
        },
      ],
      name: 'CannotRejoinUntilNextEpochBecauseKicked',
      type: 'error',
    },
    {
      inputs: [
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
      name: 'CannotReuseCommsKeys',
      type: 'error',
    },
    {
      inputs: [],
      name: 'CannotStakeZero',
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
      name: 'CannotVoteTwice',
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
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
      ],
      name: 'CouldNotMapNodeAddressToStakerAddress',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'enum LibStakingStorage.States',
          name: 'state',
          type: 'uint8',
        },
      ],
      name: 'MustBeInActiveOrUnlockedOrPausedState',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'enum LibStakingStorage.States',
          name: 'state',
          type: 'uint8',
        },
      ],
      name: 'MustBeInActiveOrUnlockedState',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'enum LibStakingStorage.States',
          name: 'state',
          type: 'uint8',
        },
      ],
      name: 'MustBeInNextValidatorSetLockedOrReadyForNextEpochOrRestoreState',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'enum LibStakingStorage.States',
          name: 'state',
          type: 'uint8',
        },
      ],
      name: 'MustBeInNextValidatorSetLockedState',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'enum LibStakingStorage.States',
          name: 'state',
          type: 'uint8',
        },
      ],
      name: 'MustBeInReadyForNextEpochState',
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
      name: 'MustBeValidatorInNextEpochToKick',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'currentTimestamp',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'epochEndTime',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'timeout',
          type: 'uint256',
        },
      ],
      name: 'NotEnoughTimeElapsedForTimeoutSinceLastEpoch',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'currentTimestamp',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'epochEndTime',
          type: 'uint256',
        },
      ],
      name: 'NotEnoughTimeElapsedSinceLastEpoch',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'validatorCount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'minimumValidatorCount',
          type: 'uint256',
        },
      ],
      name: 'NotEnoughValidatorsInNextEpoch',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'currentReadyValidatorCount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'nextReadyValidatorCount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'minimumValidatorCountToBeReady',
          type: 'uint256',
        },
      ],
      name: 'NotEnoughValidatorsReadyForNextEpoch',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'currentEpochNumber',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'receivedEpochNumber',
          type: 'uint256',
        },
      ],
      name: 'SignaledReadyForWrongEpochNumber',
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
      inputs: [
        {
          internalType: 'address',
          name: 'validator',
          type: 'address',
        },
        {
          internalType: 'address[]',
          name: 'validatorsInNextEpoch',
          type: 'address[]',
        },
      ],
      name: 'ValidatorIsNotInNextEpoch',
      type: 'error',
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
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newComplaintTolerance',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newComplaintIntervalSecs',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256[]',
          name: 'newKeyTypes',
          type: 'uint256[]',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newMinimumValidatorCount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newMaxConcurrentRequests',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newMaxTripleCount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newMinTripleCount',
          type: 'uint256',
        },
      ],
      name: 'ConfigSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newEpochEndTime',
          type: 'uint256',
        },
      ],
      name: 'EpochEndTimeSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newEpochLength',
          type: 'uint256',
        },
      ],
      name: 'EpochLengthSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newEpochTimeout',
          type: 'uint256',
        },
      ],
      name: 'EpochTimeoutSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'reason',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newKickPenaltyPercent',
          type: 'uint256',
        },
      ],
      name: 'KickPenaltyPercentSet',
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
          name: 'epochNumber',
          type: 'uint256',
        },
      ],
      name: 'ReadyForNextEpoch',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'Recovered',
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
      ],
      name: 'RequestToJoin',
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
      ],
      name: 'RequestToLeave',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'newResolverContractAddress',
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
          indexed: false,
          internalType: 'uint256',
          name: 'newDuration',
          type: 'uint256',
        },
      ],
      name: 'RewardsDurationUpdated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'newStakingTokenAddress',
          type: 'address',
        },
      ],
      name: 'StakingTokenSet',
      type: 'event',
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
          name: 'amountBurned',
          type: 'uint256',
        },
      ],
      name: 'ValidatorKickedFromNextEpoch',
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
      name: 'ValidatorRejoinedNextEpoch',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'reporter',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'validatorStakerAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'reason',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'bytes',
          name: 'data',
          type: 'bytes',
        },
      ],
      name: 'VotedToKickValidatorInNextEpoch',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'validatorStakerAddress',
          type: 'address',
        },
      ],
      name: 'adminKickValidatorInNextEpoch',
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
      name: 'adminRejoinValidator',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'validatorStakerAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amountToPenalize',
          type: 'uint256',
        },
      ],
      name: 'adminSlashValidator',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'advanceEpoch',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'exit',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getReward',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'validatorStakerAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'reason',
          type: 'uint256',
        },
        {
          internalType: 'bytes',
          name: 'data',
          type: 'bytes',
        },
      ],
      name: 'kickValidatorInNextEpoch',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'lockValidatorsForNextEpoch',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
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
          name: 'senderPubKey',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'receiverPubKey',
          type: 'uint256',
        },
      ],
      name: 'requestToJoin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'requestToLeave',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'newTokenRewardPerTokenPerEpoch',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'newComplaintTolerance',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'newComplaintIntervalSecs',
          type: 'uint256',
        },
        {
          internalType: 'uint256[]',
          name: 'newKeyTypes',
          type: 'uint256[]',
        },
        {
          internalType: 'uint256',
          name: 'newMinimumValidatorCount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'newMaxConcurrentRequests',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'newMaxTripleCount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'newMinTripleCount',
          type: 'uint256',
        },
      ],
      name: 'setConfig',
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
          name: 'newEpochEndTime',
          type: 'uint256',
        },
      ],
      name: 'setEpochEndTime',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'newEpochLength',
          type: 'uint256',
        },
      ],
      name: 'setEpochLength',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'enum LibStakingStorage.States',
          name: 'newState',
          type: 'uint8',
        },
      ],
      name: 'setEpochState',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'newEpochTimeout',
          type: 'uint256',
        },
      ],
      name: 'setEpochTimeout',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
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
          name: 'senderPubKey',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'receiverPubKey',
          type: 'uint256',
        },
      ],
      name: 'setIpPortNodeAddressAndCommunicationPubKeys',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'reason',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'newKickPenaltyPercent',
          type: 'uint256',
        },
      ],
      name: 'setKickPenaltyPercent',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'epochNumber',
          type: 'uint256',
        },
      ],
      name: 'signalReadyForNextEpoch',
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
      ],
      name: 'stake',
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
          name: 'senderPubKey',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'receiverPubKey',
          type: 'uint256',
        },
      ],
      name: 'stakeAndJoin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'unlockValidatorsForNextEpoch',
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
      ],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'major',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'minor',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'patch',
              type: 'uint256',
            },
          ],
          internalType: 'struct LibStakingStorage.Version',
          name: 'version',
          type: 'tuple',
        },
      ],
      name: 'checkVersion',
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
      name: 'getMaxVersion',
      outputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'major',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'minor',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'patch',
              type: 'uint256',
            },
          ],
          internalType: 'struct LibStakingStorage.Version',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getMaxVersionString',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getMinVersion',
      outputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'major',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'minor',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'patch',
              type: 'uint256',
            },
          ],
          internalType: 'struct LibStakingStorage.Version',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getMinVersionString',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'major',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'minor',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'patch',
              type: 'uint256',
            },
          ],
          internalType: 'struct LibStakingStorage.Version',
          name: 'version',
          type: 'tuple',
        },
      ],
      name: 'setMaxVersion',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'major',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'minor',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'patch',
              type: 'uint256',
            },
          ],
          internalType: 'struct LibStakingStorage.Version',
          name: 'version',
          type: 'tuple',
        },
      ],
      name: 'setMinVersion',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'config',
      outputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'tokenRewardPerTokenPerEpoch',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'complaintTolerance',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'complaintIntervalSecs',
              type: 'uint256',
            },
            {
              internalType: 'uint256[]',
              name: 'keyTypes',
              type: 'uint256[]',
            },
            {
              internalType: 'uint256',
              name: 'minimumValidatorCount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'maxConcurrentRequests',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'maxTripleCount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'minTripleCount',
              type: 'uint256',
            },
          ],
          internalType: 'struct LibStakingStorage.Config',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'contractResolver',
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
      name: 'countOfCurrentValidatorsReadyForNextEpoch',
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
      name: 'countOfNextValidatorsReadyForNextEpoch',
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
      inputs: [],
      name: 'getKeyTypes',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]',
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
      name: 'getNodeStakerAddressMappings',
      outputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'nodeAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'stakerAddress',
              type: 'address',
            },
          ],
          internalType: 'struct LibStakingStorage.AddressMapping[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getStakingBalancesAddress',
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
      name: 'getValidatorsInCurrentEpochLength',
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
      name: 'getValidatorsInNextEpoch',
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
      name: 'getValidatorsStructsInCurrentEpoch',
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
      name: 'getValidatorsStructsInNextEpoch',
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
      inputs: [
        {
          internalType: 'uint256',
          name: 'epochNumber',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'validatorStakerAddress',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'voterStakerAddress',
          type: 'address',
        },
      ],
      name: 'getVotingStatusToKickValidator',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
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
      name: 'isActiveValidator',
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
      name: 'isActiveValidatorByNodeAddress',
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
      name: 'isReadyForNextEpoch',
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
          internalType: 'uint256',
          name: 'reason',
          type: 'uint256',
        },
      ],
      name: 'kickPenaltyPercentByReason',
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
      name: 'nextValidatorCountForConsensus',
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
          name: 'nodeAddress',
          type: 'address',
        },
      ],
      name: 'nodeAddressToStakerAddress',
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
          name: 'stakerAddress',
          type: 'address',
        },
      ],
      name: 'readyForNextEpoch',
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
          name: 'stakerAddress',
          type: 'address',
        },
      ],
      name: 'shouldKickValidator',
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
      name: 'state',
      outputs: [
        {
          internalType: 'enum LibStakingStorage.States',
          name: '',
          type: 'uint8',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'stakerAddress',
          type: 'address',
        },
      ],
      name: 'validators',
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
          internalType: 'struct LibStakingStorage.Validator',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
};
