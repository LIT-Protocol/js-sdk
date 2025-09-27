/**
 * Generated Contract Method Signatures for naga-staging
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

const signatures = {
  "Staking": {
    "address": "0x781C6d227dA4D058890208B68DDA1da8f6EBbE54",
    "methods": {
      "getActiveUnkickedValidatorStructsAndCounts": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "realmId",
            "type": "uint256"
          }
        ],
        "name": "getActiveUnkickedValidatorStructsAndCounts",
        "outputs": [
          {
            "components": [
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
                "name": "rewardEpochNumber",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "nextRewardEpochNumber",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "endTime",
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
              },
              {
                "internalType": "uint256",
                "name": "startTime",
                "type": "uint256"
              }
            ],
            "internalType": "struct LibStakingStorage.Epoch",
            "name": "",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "components": [
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
              },
              {
                "internalType": "uint256",
                "name": "lastActiveEpoch",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "commissionRate",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "lastRewardEpoch",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "lastRealmId",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "delegatedStakeAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "delegatedStakeWeight",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "lastRewardEpochClaimedFixedCostRewards",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "lastRewardEpochClaimedCommission",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "operatorAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "uniqueDelegatingStakerCount",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "registerAttestedWalletDisabled",
                "type": "bool"
              }
            ],
            "internalType": "struct LibStakingStorage.Validator[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    },
    "events": [
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "facetAddress",
                "type": "address"
              },
              {
                "internalType": "enum IDiamond.FacetCutAction",
                "name": "action",
                "type": "uint8"
              },
              {
                "internalType": "bytes4[]",
                "name": "functionSelectors",
                "type": "bytes4[]"
              }
            ],
            "indexed": false,
            "internalType": "struct IDiamond.FacetCut[]",
            "name": "_diamondCut",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_init",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "_calldata",
            "type": "bytes"
          }
        ],
        "name": "DiamondCut",
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
            "internalType": "uint256",
            "name": "dataType",
            "type": "uint256"
          }
        ],
        "name": "ClearOfflinePhaseData",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "dataType",
            "type": "uint256"
          }
        ],
        "name": "CountOfflinePhaseData",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newDevopsAdmin",
            "type": "address"
          }
        ],
        "name": "DevopsAdminSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "realmId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newEpochEndTime",
            "type": "uint256"
          }
        ],
        "name": "EpochEndTimeSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "realmId",
            "type": "uint256"
          },
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
            "name": "realmId",
            "type": "uint256"
          },
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
            "name": "reason",
            "type": "uint256"
          },
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
            "indexed": false,
            "internalType": "address",
            "name": "stakerAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "recordId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "stakerAddressClient",
            "type": "address"
          }
        ],
        "name": "StakeRecordCreated",
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
            "internalType": "enum LibStakingStorage.States",
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
            "indexed": true,
            "internalType": "address",
            "name": "staker",
            "type": "address"
          }
        ],
        "name": "ValidatorBanned",
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
        "name": "ValidatorKickedFromNextEpoch",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "staker",
            "type": "address"
          }
        ],
        "name": "ValidatorRejoinedNextEpoch",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "stakerAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "rewards",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "fromEpoch",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "toEpoch",
            "type": "uint256"
          }
        ],
        "name": "FixedCostRewardsClaimed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "userStakerAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "recordId",
            "type": "uint256"
          }
        ],
        "name": "StakeRecordRemoved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "stakerAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "recordId",
            "type": "uint256"
          }
        ],
        "name": "StakeRecordUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "stakerAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "recordId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "rewards",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "fromEpoch",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "toEpoch",
            "type": "uint256"
          }
        ],
        "name": "StakeRewardsClaimed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newTrustedForwarder",
            "type": "address"
          }
        ],
        "name": "TrustedForwarderSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "stakerAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "rewards",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "fromEpoch",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "toEpoch",
            "type": "uint256"
          }
        ],
        "name": "ValidatorCommissionClaimed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "stakerAddress",
            "type": "address"
          }
        ],
        "name": "ValidatorRegistered",
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
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "identifier",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "hashed",
            "type": "bytes32"
          }
        ],
        "name": "KeySetConfigSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "identifier",
            "type": "string"
          }
        ],
        "name": "KeySetConfigUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "realmId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "epochNumber",
            "type": "uint256"
          }
        ],
        "name": "AdvancedEpoch",
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
            "indexed": true,
            "internalType": "address",
            "name": "attestedAddress",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
              }
            ],
            "indexed": true,
            "internalType": "struct LibStakingStorage.UncompressedK256Key",
            "name": "attestedPubKey",
            "type": "tuple"
          }
        ],
        "name": "AttestedWalletRegistered",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "reason",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "tolerance",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "intervalSecs",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "kickPenaltyPercent",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "kickPenaltyDemerits",
                "type": "uint256"
              }
            ],
            "indexed": false,
            "internalType": "struct LibStakingStorage.ComplaintConfig",
            "name": "config",
            "type": "tuple"
          }
        ],
        "name": "ComplaintConfigSet",
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
          },
          {
            "indexed": false,
            "internalType": "uint256[]",
            "name": "newKeyTypes",
            "type": "uint256[]"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newMinimumValidatorCount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newMaxConcurrentRequests",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newMaxPresignCount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newMinPresignCount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newPeerCheckingIntervalSecs",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newMaxPresignConcurrency",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "newRpcHealthcheckEnabled",
            "type": "bool"
          }
        ],
        "name": "ConfigSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "message",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "DebugEvent",
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
            "name": "epochNumber",
            "type": "uint256"
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
            "indexed": true,
            "internalType": "address",
            "name": "reporter",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "validatorToKickStakerAddress",
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
            "indexed": false,
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "realmId",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "major",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "minor",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "patch",
                "type": "uint256"
              }
            ],
            "indexed": false,
            "internalType": "struct LibStakingStorage.Version",
            "name": "version",
            "type": "tuple"
          }
        ],
        "name": "VersionRequirementsUpdated",
        "type": "event"
      }
    ]
  },
  "PubkeyRouter": {
    "address": "0x280E5c534629FBdD4dC61c85695143B6ACc4790b",
    "methods": {
      "deriveEthAddressFromPubkey": {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "pubkey",
            "type": "bytes"
          }
        ],
        "name": "deriveEthAddressFromPubkey",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      "ethAddressToPkpId": {
        "inputs": [
          {
            "internalType": "address",
            "name": "ethAddress",
            "type": "address"
          }
        ],
        "name": "ethAddressToPkpId",
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
      "getEthAddress": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getEthAddress",
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
      "getPubkey": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getPubkey",
        "outputs": [
          {
            "internalType": "bytes",
            "name": "",
            "type": "bytes"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    },
    "events": [
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "facetAddress",
                "type": "address"
              },
              {
                "internalType": "enum IDiamond.FacetCutAction",
                "name": "action",
                "type": "uint8"
              },
              {
                "internalType": "bytes4[]",
                "name": "functionSelectors",
                "type": "bytes4[]"
              }
            ],
            "indexed": false,
            "internalType": "struct IDiamond.FacetCut[]",
            "name": "_diamondCut",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_init",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "_calldata",
            "type": "bytes"
          }
        ],
        "name": "DiamondCut",
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
            "name": "newResolverAddress",
            "type": "address"
          }
        ],
        "name": "ContractResolverAddressSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "message",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "DebugEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "pubkey",
            "type": "bytes"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "stakingContract",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "keyType",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "derivedKeyId",
            "type": "bytes32"
          }
        ],
        "name": "PubkeyRoutingDataSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "stakingContract",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "bytes",
                "name": "pubkey",
                "type": "bytes"
              },
              {
                "internalType": "uint256",
                "name": "keyType",
                "type": "uint256"
              }
            ],
            "indexed": false,
            "internalType": "struct IPubkeyRouter.RootKey",
            "name": "rootKey",
            "type": "tuple"
          }
        ],
        "name": "RootKeySet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ToggleEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newTrustedForwarder",
            "type": "address"
          }
        ],
        "name": "TrustedForwarderSet",
        "type": "event"
      }
    ]
  },
  "PKPNFT": {
    "address": "0x991d56EdC98a0DAeb93E91F70588598f79875701",
    "methods": {
      "claimAndMint": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "realmId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "keyType",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "keySetId",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "derivedKeyId",
            "type": "bytes32"
          },
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
              },
              {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
              }
            ],
            "internalType": "struct IPubkeyRouter.Signature[]",
            "name": "signatures",
            "type": "tuple[]"
          },
          {
            "internalType": "address",
            "name": "stakingContractAddress",
            "type": "address"
          }
        ],
        "name": "claimAndMint",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      "mintCost": {
        "inputs": [],
        "name": "mintCost",
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
      "mintNext": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "keyType",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "keySetId",
            "type": "string"
          }
        ],
        "name": "mintNext",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      "safeTransferFrom": {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "tokenOfOwnerByIndex": {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "tokenOfOwnerByIndex",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    },
    "events": [
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "facetAddress",
                "type": "address"
              },
              {
                "internalType": "enum IDiamond.FacetCutAction",
                "name": "action",
                "type": "uint8"
              },
              {
                "internalType": "bytes4[]",
                "name": "functionSelectors",
                "type": "bytes4[]"
              }
            ],
            "indexed": false,
            "internalType": "struct IDiamond.FacetCut[]",
            "name": "_diamondCut",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_init",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "_calldata",
            "type": "bytes"
          }
        ],
        "name": "DiamondCut",
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
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approved",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newResolverAddress",
            "type": "address"
          }
        ],
        "name": "ContractResolverAddressSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "newFreeMintSigner",
            "type": "address"
          }
        ],
        "name": "FreeMintSignerSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "version",
            "type": "uint8"
          }
        ],
        "name": "Initialized",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newMintCost",
            "type": "uint256"
          }
        ],
        "name": "MintCostSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "pubkey",
            "type": "bytes"
          }
        ],
        "name": "PKPMinted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newTrustedForwarder",
            "type": "address"
          }
        ],
        "name": "TrustedForwarderSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Withdrew",
        "type": "event"
      }
    ]
  },
  "PKPHelper": {
    "address": "0xe51357Cc58E8a718423CBa09b87879Ff7B18d279",
    "methods": {
      "claimAndMintNextAndAddAuthMethodsWithTypes": {
        "inputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "keyType",
                "type": "uint256"
              },
              {
                "internalType": "bytes32",
                "name": "derivedKeyId",
                "type": "bytes32"
              },
              {
                "components": [
                  {
                    "internalType": "bytes32",
                    "name": "r",
                    "type": "bytes32"
                  },
                  {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                  },
                  {
                    "internalType": "uint8",
                    "name": "v",
                    "type": "uint8"
                  }
                ],
                "internalType": "struct IPubkeyRouter.Signature[]",
                "name": "signatures",
                "type": "tuple[]"
              }
            ],
            "internalType": "struct LibPKPNFTStorage.ClaimMaterial",
            "name": "claimMaterial",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "keyType",
                "type": "uint256"
              },
              {
                "internalType": "bytes[]",
                "name": "permittedIpfsCIDs",
                "type": "bytes[]"
              },
              {
                "internalType": "uint256[][]",
                "name": "permittedIpfsCIDScopes",
                "type": "uint256[][]"
              },
              {
                "internalType": "address[]",
                "name": "permittedAddresses",
                "type": "address[]"
              },
              {
                "internalType": "uint256[][]",
                "name": "permittedAddressScopes",
                "type": "uint256[][]"
              },
              {
                "internalType": "uint256[]",
                "name": "permittedAuthMethodTypes",
                "type": "uint256[]"
              },
              {
                "internalType": "bytes[]",
                "name": "permittedAuthMethodIds",
                "type": "bytes[]"
              },
              {
                "internalType": "bytes[]",
                "name": "permittedAuthMethodPubkeys",
                "type": "bytes[]"
              },
              {
                "internalType": "uint256[][]",
                "name": "permittedAuthMethodScopes",
                "type": "uint256[][]"
              },
              {
                "internalType": "bool",
                "name": "addPkpEthAddressAsPermittedAddress",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "sendPkpToItself",
                "type": "bool"
              }
            ],
            "internalType": "struct PKPHelper.AuthMethodData",
            "name": "authMethodData",
            "type": "tuple"
          }
        ],
        "name": "claimAndMintNextAndAddAuthMethodsWithTypes",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      "mintNextAndAddAuthMethods": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "keyType",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "keySetId",
            "type": "string"
          },
          {
            "internalType": "uint256[]",
            "name": "permittedAuthMethodTypes",
            "type": "uint256[]"
          },
          {
            "internalType": "bytes[]",
            "name": "permittedAuthMethodIds",
            "type": "bytes[]"
          },
          {
            "internalType": "bytes[]",
            "name": "permittedAuthMethodPubkeys",
            "type": "bytes[]"
          },
          {
            "internalType": "uint256[][]",
            "name": "permittedAuthMethodScopes",
            "type": "uint256[][]"
          },
          {
            "internalType": "bool",
            "name": "addPkpEthAddressAsPermittedAddress",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "sendPkpToItself",
            "type": "bool"
          }
        ],
        "name": "mintNextAndAddAuthMethods",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      }
    },
    "events": [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newResolverAddress",
            "type": "address"
          }
        ],
        "name": "ContractResolverAddressSet",
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
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "previousAdminRole",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "newAdminRole",
            "type": "bytes32"
          }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleGranted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleRevoked",
        "type": "event"
      }
    ]
  },
  "PKPPermissions": {
    "address": "0x5632B35374DD73205B5aeBBcA3ecB02B3dc8B5fe",
    "methods": {
      "addPermittedAction": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "ipfsCID",
            "type": "bytes"
          },
          {
            "internalType": "uint256[]",
            "name": "scopes",
            "type": "uint256[]"
          }
        ],
        "name": "addPermittedAction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "addPermittedAddress": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "uint256[]",
            "name": "scopes",
            "type": "uint256[]"
          }
        ],
        "name": "addPermittedAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "addPermittedAuthMethod": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "authMethodType",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "id",
                "type": "bytes"
              },
              {
                "internalType": "bytes",
                "name": "userPubkey",
                "type": "bytes"
              }
            ],
            "internalType": "struct LibPKPPermissionsStorage.AuthMethod",
            "name": "authMethod",
            "type": "tuple"
          },
          {
            "internalType": "uint256[]",
            "name": "scopes",
            "type": "uint256[]"
          }
        ],
        "name": "addPermittedAuthMethod",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "addPermittedAuthMethodScope": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          },
          {
            "internalType": "uint256",
            "name": "scopeId",
            "type": "uint256"
          }
        ],
        "name": "addPermittedAuthMethodScope",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "getPermittedActions": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getPermittedActions",
        "outputs": [
          {
            "internalType": "bytes[]",
            "name": "",
            "type": "bytes[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "getPermittedAddresses": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getPermittedAddresses",
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
      "getPermittedAuthMethodScopes": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          },
          {
            "internalType": "uint256",
            "name": "maxScopeId",
            "type": "uint256"
          }
        ],
        "name": "getPermittedAuthMethodScopes",
        "outputs": [
          {
            "internalType": "bool[]",
            "name": "",
            "type": "bool[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "getPermittedAuthMethods": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getPermittedAuthMethods",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "authMethodType",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "id",
                "type": "bytes"
              },
              {
                "internalType": "bytes",
                "name": "userPubkey",
                "type": "bytes"
              }
            ],
            "internalType": "struct LibPKPPermissionsStorage.AuthMethod[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "getTokenIdsForAuthMethod": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          }
        ],
        "name": "getTokenIdsForAuthMethod",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "isPermittedAction": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "ipfsCID",
            "type": "bytes"
          }
        ],
        "name": "isPermittedAction",
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
      "isPermittedAddress": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "isPermittedAddress",
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
      "removePermittedAction": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "ipfsCID",
            "type": "bytes"
          }
        ],
        "name": "removePermittedAction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "removePermittedAddress": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "removePermittedAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "removePermittedAuthMethod": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          }
        ],
        "name": "removePermittedAuthMethod",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "removePermittedAuthMethodScope": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          },
          {
            "internalType": "uint256",
            "name": "scopeId",
            "type": "uint256"
          }
        ],
        "name": "removePermittedAuthMethodScope",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    },
    "events": [
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "facetAddress",
                "type": "address"
              },
              {
                "internalType": "enum IDiamond.FacetCutAction",
                "name": "action",
                "type": "uint8"
              },
              {
                "internalType": "bytes4[]",
                "name": "functionSelectors",
                "type": "bytes4[]"
              }
            ],
            "indexed": false,
            "internalType": "struct IDiamond.FacetCut[]",
            "name": "_diamondCut",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_init",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "_calldata",
            "type": "bytes"
          }
        ],
        "name": "DiamondCut",
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
            "name": "newResolverAddress",
            "type": "address"
          }
        ],
        "name": "ContractResolverAddressSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "userPubkey",
            "type": "bytes"
          }
        ],
        "name": "PermittedAuthMethodAdded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          }
        ],
        "name": "PermittedAuthMethodRemoved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "scopeId",
            "type": "uint256"
          }
        ],
        "name": "PermittedAuthMethodScopeAdded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "authMethodType",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "id",
            "type": "bytes"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "scopeId",
            "type": "uint256"
          }
        ],
        "name": "PermittedAuthMethodScopeRemoved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "group",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "root",
            "type": "bytes32"
          }
        ],
        "name": "RootHashUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newTrustedForwarder",
            "type": "address"
          }
        ],
        "name": "TrustedForwarderSet",
        "type": "event"
      }
    ]
  },
  "PaymentDelegation": {
    "address": "0x700DB831292541C640c5Dbb9AaE1697faE188513",
    "methods": {
      "delegatePayments": {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "delegatePayments",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "delegatePaymentsBatch": {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "users",
            "type": "address[]"
          }
        ],
        "name": "delegatePaymentsBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "getPayers": {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getPayers",
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
      "getPayersAndRestrictions": {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "users",
            "type": "address[]"
          }
        ],
        "name": "getPayersAndRestrictions",
        "outputs": [
          {
            "internalType": "address[][]",
            "name": "",
            "type": "address[][]"
          },
          {
            "components": [
              {
                "internalType": "uint128",
                "name": "totalMaxPrice",
                "type": "uint128"
              },
              {
                "internalType": "uint256",
                "name": "requestsPerPeriod",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "periodSeconds",
                "type": "uint256"
              }
            ],
            "internalType": "struct LibPaymentDelegationStorage.Restriction[][]",
            "name": "",
            "type": "tuple[][]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "getRestriction": {
        "inputs": [
          {
            "internalType": "address",
            "name": "payer",
            "type": "address"
          }
        ],
        "name": "getRestriction",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint128",
                "name": "totalMaxPrice",
                "type": "uint128"
              },
              {
                "internalType": "uint256",
                "name": "requestsPerPeriod",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "periodSeconds",
                "type": "uint256"
              }
            ],
            "internalType": "struct LibPaymentDelegationStorage.Restriction",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "getUsers": {
        "inputs": [
          {
            "internalType": "address",
            "name": "payer",
            "type": "address"
          }
        ],
        "name": "getUsers",
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
      "setRestriction": {
        "inputs": [
          {
            "components": [
              {
                "internalType": "uint128",
                "name": "totalMaxPrice",
                "type": "uint128"
              },
              {
                "internalType": "uint256",
                "name": "requestsPerPeriod",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "periodSeconds",
                "type": "uint256"
              }
            ],
            "internalType": "struct LibPaymentDelegationStorage.Restriction",
            "name": "r",
            "type": "tuple"
          }
        ],
        "name": "setRestriction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "undelegatePayments": {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "undelegatePayments",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "undelegatePaymentsBatch": {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "users",
            "type": "address[]"
          }
        ],
        "name": "undelegatePaymentsBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    },
    "events": [
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "facetAddress",
                "type": "address"
              },
              {
                "internalType": "enum IDiamond.FacetCutAction",
                "name": "action",
                "type": "uint8"
              },
              {
                "internalType": "bytes4[]",
                "name": "functionSelectors",
                "type": "bytes4[]"
              }
            ],
            "indexed": false,
            "internalType": "struct IDiamond.FacetCut[]",
            "name": "_diamondCut",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_init",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "_calldata",
            "type": "bytes"
          }
        ],
        "name": "DiamondCut",
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
            "indexed": true,
            "internalType": "address",
            "name": "payer",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint128",
                "name": "totalMaxPrice",
                "type": "uint128"
              },
              {
                "internalType": "uint256",
                "name": "requestsPerPeriod",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "periodSeconds",
                "type": "uint256"
              }
            ],
            "indexed": false,
            "internalType": "struct LibPaymentDelegationStorage.Restriction",
            "name": "restriction",
            "type": "tuple"
          }
        ],
        "name": "RestrictionSet",
        "type": "event"
      }
    ]
  },
  "Ledger": {
    "address": "0x658F5ED32aE5EFBf79F7Ba36A9FA770FeA7662c8",
    "methods": {
      "withdraw": {
        "inputs": [
          {
            "internalType": "int256",
            "name": "amount",
            "type": "int256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "balance": {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "balance",
        "outputs": [
          {
            "internalType": "int256",
            "name": "",
            "type": "int256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "deposit": {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      "depositForUser": {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "depositForUser",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      "latestWithdrawRequest": {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "latestWithdrawRequest",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct LibLedgerStorage.WithdrawRequest",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "requestWithdraw": {
        "inputs": [
          {
            "internalType": "int256",
            "name": "amount",
            "type": "int256"
          }
        ],
        "name": "requestWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      "stableBalance": {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "stableBalance",
        "outputs": [
          {
            "internalType": "int256",
            "name": "",
            "type": "int256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      "userWithdrawDelay": {
        "inputs": [],
        "name": "userWithdrawDelay",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    },
    "events": [
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "facetAddress",
                "type": "address"
              },
              {
                "internalType": "enum IDiamond.FacetCutAction",
                "name": "action",
                "type": "uint8"
              },
              {
                "internalType": "bytes4[]",
                "name": "functionSelectors",
                "type": "bytes4[]"
              }
            ],
            "indexed": false,
            "internalType": "struct IDiamond.FacetCut[]",
            "name": "_diamondCut",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_init",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "_calldata",
            "type": "bytes"
          }
        ],
        "name": "DiamondCut",
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
            "indexed": true,
            "internalType": "address",
            "name": "node_address",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "batch_id",
            "type": "uint256"
          }
        ],
        "name": "BatchCharged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Deposit",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "depositor",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "DepositForUser",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "FoundationRewardsWithdrawn",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "percentage",
            "type": "uint256"
          }
        ],
        "name": "LitFoundationSplitPercentageSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RewardWithdraw",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "delay",
            "type": "uint256"
          }
        ],
        "name": "RewardWithdrawDelaySet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RewardWithdrawRequest",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newTrustedForwarder",
            "type": "address"
          }
        ],
        "name": "TrustedForwarderSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "int256",
            "name": "amount",
            "type": "int256"
          }
        ],
        "name": "UserCharged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "delay",
            "type": "uint256"
          }
        ],
        "name": "UserWithdrawDelaySet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "int256",
            "name": "amount",
            "type": "int256"
          }
        ],
        "name": "Withdraw",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "int256",
            "name": "amount",
            "type": "int256"
          }
        ],
        "name": "WithdrawRequest",
        "type": "event"
      }
    ]
  },
  "PriceFeed": {
    "address": "0xB76744dC73AFC416e8cDbB7023ca89C862B86F05",
    "methods": {
      "getNodesForRequest": {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "realmId",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "productIds",
            "type": "uint256[]"
          }
        ],
        "name": "getNodesForRequest",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "components": [
              {
                "components": [
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
                  },
                  {
                    "internalType": "uint256",
                    "name": "lastActiveEpoch",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "commissionRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "lastRewardEpoch",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "lastRealmId",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "delegatedStakeAmount",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "delegatedStakeWeight",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "lastRewardEpochClaimedFixedCostRewards",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "lastRewardEpochClaimedCommission",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "operatorAddress",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "uniqueDelegatingStakerCount",
                    "type": "uint256"
                  },
                  {
                    "internalType": "bool",
                    "name": "registerAttestedWalletDisabled",
                    "type": "bool"
                  }
                ],
                "internalType": "struct LibStakingStorage.Validator",
                "name": "validator",
                "type": "tuple"
              },
              {
                "internalType": "uint256[]",
                "name": "prices",
                "type": "uint256[]"
              }
            ],
            "internalType": "struct LibPriceFeedStorage.NodeInfoAndPrices[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    },
    "events": [
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "facetAddress",
                "type": "address"
              },
              {
                "internalType": "enum IDiamond.FacetCutAction",
                "name": "action",
                "type": "uint8"
              },
              {
                "internalType": "bytes4[]",
                "name": "functionSelectors",
                "type": "bytes4[]"
              }
            ],
            "indexed": false,
            "internalType": "struct IDiamond.FacetCut[]",
            "name": "_diamondCut",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_init",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "_calldata",
            "type": "bytes"
          }
        ],
        "name": "DiamondCut",
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
            "internalType": "uint256",
            "name": "newPrice",
            "type": "uint256"
          }
        ],
        "name": "BaseNetworkPriceSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newPrice",
            "type": "uint256"
          }
        ],
        "name": "MaxNetworkPriceSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "newTrustedForwarder",
            "type": "address"
          }
        ],
        "name": "TrustedForwarderSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "stakingAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "usagePercent",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256[]",
            "name": "newPrices",
            "type": "uint256[]"
          }
        ],
        "name": "UsageSet",
        "type": "event"
      }
    ]
  }
};

module.exports = {
  signatures
};
