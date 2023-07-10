export const staking = {
  "address": "0x4809A30149958a95b925bb5315cb0F550E166272",
  "abi": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_stakingToken",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEpochLength",
          "type": "uint256"
        }
      ],
      "name": "EpochLengthSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEpochTimeout",
          "type": "uint256"
        }
      ],
      "name": "EpochTimeoutSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newKickPenaltyPercent",
          "type": "uint256"
        }
      ],
      "name": "KickPenaltyPercentSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newMinimumStake",
          "type": "uint256"
        }
      ],
      "name": "MinimumStakeSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "staker",
          "type": "address"
        }
      ],
      "name": "ReadyForNextEpoch",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Recovered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "staker",
          "type": "address"
        }
      ],
      "name": "RequestToJoin",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "staker",
          "type": "address"
        }
      ],
      "name": "RequestToLeave",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "newResolverContractAddress",
          "type": "address"
        }
      ],
      "name": "ResolverContractAddressSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "staker",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        }
      ],
      "name": "RewardPaid",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newDuration",
          "type": "uint256"
        }
      ],
      "name": "RewardsDurationUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "staker",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Staked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "newStakingTokenAddress",
          "type": "address"
        }
      ],
      "name": "StakingTokenSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "enum Staking.States",
          "name": "newState",
          "type": "uint8"
        }
      ],
      "name": "StateChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newTokenRewardPerTokenPerEpoch",
          "type": "uint256"
        }
      ],
      "name": "TokenRewardPerTokenPerEpochSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "staker",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountBurned",
          "type": "uint256"
        }
      ],
      "name": "ValidatorKickedFromNextEpoch",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "reporter",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "validatorStakerAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "reason",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "VotedToKickValidatorInNextEpoch",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "staker",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdrawn",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "validatorStakerAddress",
          "type": "address"
        }
      ],
      "name": "adminKickValidatorInNextEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "validatorStakerAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amountToBurn",
          "type": "uint256"
        }
      ],
      "name": "adminSlashValidator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "advanceEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "epoch",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "epochLength",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "number",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endBlock",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "retries",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timeout",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "exit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getValidatorsInCurrentEpoch",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getValidatorsInNextEpoch",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "epochNumber",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "validatorStakerAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "voterStakerAddress",
          "type": "address"
        }
      ],
      "name": "getVotingStatusToKickValidator",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "isActiveValidator",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isReadyForNextEpoch",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "kickPenaltyPercent",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "validatorStakerAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "reason",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "kickValidatorInNextEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lockValidatorsForNextEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minimumStake",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "nodeAddressToStakerAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pauseEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "readyForNextEpoch",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "ip",
          "type": "uint32"
        },
        {
          "internalType": "uint128",
          "name": "ipv6",
          "type": "uint128"
        },
        {
          "internalType": "uint32",
          "name": "port",
          "type": "uint32"
        },
        {
          "internalType": "address",
          "name": "nodeAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "senderPubKey",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "receiverPubKey",
          "type": "uint256"
        }
      ],
      "name": "requestToJoin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requestToLeave",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "resolverContractAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "rewardOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newEpochLength",
          "type": "uint256"
        }
      ],
      "name": "setEpochLength",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum Staking.States",
          "name": "newState",
          "type": "uint8"
        }
      ],
      "name": "setEpochState",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newEpochTimeout",
          "type": "uint256"
        }
      ],
      "name": "setEpochTimeout",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "ip",
          "type": "uint32"
        },
        {
          "internalType": "uint128",
          "name": "ipv6",
          "type": "uint128"
        },
        {
          "internalType": "uint32",
          "name": "port",
          "type": "uint32"
        },
        {
          "internalType": "address",
          "name": "nodeAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "senderPubKey",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "receiverPubKey",
          "type": "uint256"
        }
      ],
      "name": "setIpPortNodeAddressAndCommunicationPubKeys",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newKickPenaltyPercent",
          "type": "uint256"
        }
      ],
      "name": "setKickPenaltyPercent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newMinimumStake",
          "type": "uint256"
        }
      ],
      "name": "setMinimumStake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newResolverContractAddress",
          "type": "address"
        }
      ],
      "name": "setResolverContractAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newStakingTokenAddress",
          "type": "address"
        }
      ],
      "name": "setStakingToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newTokenRewardPerTokenPerEpoch",
          "type": "uint256"
        }
      ],
      "name": "setTokenRewardPerTokenPerEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "stakerAddress",
          "type": "address"
        }
      ],
      "name": "shouldKickValidator",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "signalReadyForNextEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "stake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "ip",
          "type": "uint32"
        },
        {
          "internalType": "uint128",
          "name": "ipv6",
          "type": "uint128"
        },
        {
          "internalType": "uint32",
          "name": "port",
          "type": "uint32"
        },
        {
          "internalType": "address",
          "name": "nodeAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "senderPubKey",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "receiverPubKey",
          "type": "uint256"
        }
      ],
      "name": "stakeAndJoin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "stakingToken",
      "outputs": [
        {
          "internalType": "contract LITToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "state",
      "outputs": [
        {
          "internalType": "enum Staking.States",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenRewardPerTokenPerEpoch",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalStaked",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unlockValidatorsForNextEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "validatorCountForConsensus",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "validatorStateIsActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "validatorStateIsUnlocked",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "validators",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "ip",
          "type": "uint32"
        },
        {
          "internalType": "uint128",
          "name": "ipv6",
          "type": "uint128"
        },
        {
          "internalType": "uint32",
          "name": "port",
          "type": "uint32"
        },
        {
          "internalType": "address",
          "name": "nodeAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "senderPubKey",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "receiverPubKey",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "validatorsInNextEpochAreLocked",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "votesToKickValidatorsInNextEpoch",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "votes",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}