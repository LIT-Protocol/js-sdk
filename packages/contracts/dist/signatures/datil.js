/**
 * Generated Contract Method Signatures for datil
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

export const signatures = {
  "Staking": {
    "address": "0x21d636d95eE71150c0c3Ffa79268c989a329d1CE",
    "methods": {
      "getActiveUnkickedValidatorStructsAndCounts": {
        "inputs": [],
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
            "name": "newMaxTripleCount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newMinTripleCount",
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
            "name": "newMaxTripleConcurrency",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "newRpcHealthcheckEnabled",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "timeoutMs",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "memoryLimitMb",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "maxCodeLength",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "maxResponseLength",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "maxFetchCount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "maxSignCount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "maxContractCallCount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "maxBroadcastAndCollectCount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "maxCallDepth",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "maxRetries",
                "type": "uint256"
              }
            ],
            "indexed": false,
            "internalType": "struct LibStakingStorage.LitActionConfig",
            "name": "newLitActionConfig",
            "type": "tuple"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "newHeliosEnabled",
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
            "indexed": false,
            "internalType": "uint256",
            "name": "index",
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
    "address": "0xF182d6bEf16Ba77e69372dD096D8B70Bc3d5B475",
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
      }
    ]
  },
  "PKPNFT": {
    "address": "0x487A9D096BB4B7Ac1520Cb12370e31e677B175EA",
    "methods": {
      "claimAndMint": {
        "inputs": [
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
    "address": "0x9123438C2c7c78B53e5081d6d3eA5DFcf51B57f0",
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
    "address": "0x213Db6E1446928E19588269bEF7dFc9187c4829A",
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
    "address": "0xF19ea8634969730cB51BFEe2E2A5353062053C14",
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
  }
};
