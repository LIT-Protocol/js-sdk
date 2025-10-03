"use strict";

module.exports = {
  "data": [
    {
      "name": "Staking",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0xDf6939412875982977F510D8aA3401D6f3a8d646",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotAddFunctionToDiamondThatAlreadyExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotAddSelectorsToZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveFunctionThatDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionThatDoesNotExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotReplaceFunctionsFromFacetWithZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint8",
                  "name": "_action",
                  "type": "uint8"
                }
              ],
              "name": "IncorrectFacetCutAction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_initializationContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "InitializationFunctionReverted",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_contractAddress",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "_message",
                  "type": "string"
                }
              ],
              "name": "NoBytecodeAtAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "NoSelectorsProvidedForFacetForCut",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_user",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_contractOwner",
                  "type": "address"
                }
              ],
              "name": "NotContractOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "RemoveFacetAddressMustBeZeroAddress",
              "type": "error"
            },
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
                  "internalType": "struct IDiamond.FacetCut[]",
                  "name": "_diamondCut",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "_init",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "diamondCut",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_functionSelector",
                  "type": "bytes4"
                }
              ],
              "name": "facetAddress",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "facetAddress_",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facetAddresses",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "facetAddresses_",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facet",
                  "type": "address"
                }
              ],
              "name": "facetFunctionSelectors",
              "outputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_facetFunctionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facets",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "facetAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes4[]",
                      "name": "functionSelectors",
                      "type": "bytes4[]"
                    }
                  ],
                  "internalType": "struct IDiamondLoupe.Facet[]",
                  "name": "facets_",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "owner_",
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
                  "name": "_newOwner",
                  "type": "address"
                }
              ],
              "name": "transferOwnership",
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
              "name": "RealmIdNotFound",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "getAllUnkickedValidators",
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
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "getCurrentRealmIdForStakerAddress",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "getRealmIdForStakerAddress",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "getShadowRealmIdForStakerAddress",
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
                  "name": "nodeAddress",
                  "type": "address"
                }
              ],
              "name": "isRecentValidator",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "isValidatorInCurrentEpoch",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "isValidatorInCurrentOrNextEpoch",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "isValidatorInNextEpoch",
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
                  "name": "nodeAddress",
                  "type": "address"
                }
              ],
              "name": "nodeAddressToStakerAddressAcrossRealms",
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
              "name": "numRealms",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "validator_by_staker_address",
              "outputs": [
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
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "CallerNotOwner",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "CallerNotOwnerOrDevopsAdmin",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "CannotModifyUnfrozen",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "CannotStakeZero",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidNewSharePrice",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidSlashPercentage",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "timeLock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "minTimeLock",
                  "type": "uint256"
                }
              ],
              "name": "MinTimeLockNotMet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LibStakingStorage.States",
                  "name": "state",
                  "type": "uint8"
                }
              ],
              "name": "MustBeInNextValidatorSetLockedOrReadyForNextEpochState",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NoEmptyStakingSlot",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "StakeAmountNotMet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "validator",
                  "type": "address"
                },
                {
                  "internalType": "address[]",
                  "name": "validatorsInNextEpoch",
                  "type": "address[]"
                }
              ],
              "name": "ValidatorIsNotInNextEpoch",
              "type": "error"
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
              "inputs": [],
              "name": "addRealm",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
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
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "adminRejoinValidator",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "validatorAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "disabled",
                  "type": "bool"
                }
              ],
              "name": "adminSetValidatorRegisterAttestedWalletDisabled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "validatorsForCurrentEpoch",
                  "type": "address[]"
                }
              ],
              "name": "adminSetValidatorsInCurrentEpoch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "validatorsForNextEpoch",
                  "type": "address[]"
                }
              ],
              "name": "adminSetValidatorsInNextEpoch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "source_realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "target_realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "target_validators",
                  "type": "address[]"
                }
              ],
              "name": "adminSetupShadowSplicing",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "adminSlashValidator",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "userStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operatorStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "timeLock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "adminStakeForUser",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "userStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operatorStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "stakeId",
                  "type": "uint256"
                }
              ],
              "name": "adminUnfreezeForUser",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "decreaseRewardPool",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "dataType",
                  "type": "uint256"
                }
              ],
              "name": "emitClearOfflinePhaseData",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "dataType",
                  "type": "uint256"
                }
              ],
              "name": "emitCountOfflinePhaseData",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "increaseRewardPool",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "removeRealm",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
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
                  "internalType": "struct LibStakingStorage.ComplaintConfig",
                  "name": "config",
                  "type": "tuple"
                }
              ],
              "name": "setComplaintConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "tokenRewardPerTokenPerEpoch",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "keyTypes",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minimumValidatorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "rewardEpochDuration",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxTimeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minTimeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "bmin",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "bmax",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "k",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "p",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "enableStakeAutolock",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "tokenPrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "profitMultiplier",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "usdCostPerMonth",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxEmissionRate",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minStakeAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxStakeAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minSelfStake",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minSelfStakeTimelock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minValidatorCountToClampMinimumThreshold",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minThresholdToClampAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.GlobalConfig",
                  "name": "newConfig",
                  "type": "tuple"
                }
              ],
              "name": "setConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newResolverAddress",
                  "type": "address"
                }
              ],
              "name": "setContractResolver",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newThreshold",
                  "type": "uint256"
                }
              ],
              "name": "setDemeritRejoinThreshold",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newDevopsAdmin",
                  "type": "address"
                }
              ],
              "name": "setDevopsAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "newEpochEndTime",
                  "type": "uint256"
                }
              ],
              "name": "setEpochEndTime",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
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
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "enum LibStakingStorage.States",
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
                  "name": "realmId",
                  "type": "uint256"
                },
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
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
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
                      "name": "maxConsoleLogLength",
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
                    },
                    {
                      "internalType": "bool",
                      "name": "asyncActionsEnabled",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.LitActionConfig",
                  "name": "newConfig",
                  "type": "tuple"
                }
              ],
              "name": "setLitActionConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newTimeout",
                  "type": "uint256"
                }
              ],
              "name": "setPendingRejoinTimeout",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "validatorsToSet",
                  "type": "address[]"
                }
              ],
              "name": "setPermittedValidators",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "permittedValidatorsOn",
                  "type": "bool"
                }
              ],
              "name": "setPermittedValidatorsOn",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "maxConcurrentRequests",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxPresignCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minPresignCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "peerCheckingIntervalSecs",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxPresignConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "rpcHealthcheckEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minEpochForRewards",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "permittedValidatorsOn",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.RealmConfig",
                  "name": "newConfig",
                  "type": "tuple"
                }
              ],
              "name": "setRealmConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newTotalSupply",
                  "type": "uint256"
                }
              ],
              "name": "setTokenTotalSupplyStandIn",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "CallerNotContract",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "CannotMigrateFromValidator",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "CannotWithdrawFrozen",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "checkpoint",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "currentEpoch",
                  "type": "uint256"
                }
              ],
              "name": "CheckpointAheadOfCurrentEpoch",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "InsufficientSelfStake",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidRatio",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NewTimeLockMustBeGreaterThanCurrent",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "RewardsMustBeClaimed",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "slahedAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "slashedRealmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "senderAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "senderRealmId",
                  "type": "uint256"
                }
              ],
              "name": "SlashingMustOccurInSameRealm",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "stakedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "minimumStake",
                  "type": "uint256"
                }
              ],
              "name": "StakeMustBeGreaterThanMinimumStake",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "stakeRecordId",
                  "type": "uint256"
                }
              ],
              "name": "StakeRecordNotFound",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "TimeLockNotMet",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "TooSoonToWithdraw",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "validatorAddress",
                  "type": "address"
                }
              ],
              "name": "ValidatorNotRegistered",
              "type": "error"
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
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
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
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "checkStakingAmounts",
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
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxNumberOfEpochsToClaim",
                  "type": "uint256"
                }
              ],
              "name": "claimFixedCostRewards",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "stakeRecordId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxNumberOfEpochsToClaim",
                  "type": "uint256"
                }
              ],
              "name": "claimStakeRewards",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxNumberOfEpochsToClaim",
                  "type": "uint256"
                }
              ],
              "name": "claimValidatorCommission",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getMaximumStake",
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
              "name": "getMinimumSelfStake",
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
              "name": "getMinimumStake",
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
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "rewardEpochNumber",
                  "type": "uint256"
                }
              ],
              "name": "getRewardEpoch",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "epochEnd",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalStakeWeight",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalStakeRewards",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "validatorFixedCostRewards",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "validatorCommission",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "slope",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "validatorSharePrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "stakeAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "validatorSharePriceAtLastUpdate",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "initial",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.RewardEpoch",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "rewardEpochNumber",
                  "type": "uint256"
                }
              ],
              "name": "getRewardEpochView",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "epochEnd",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalStakeWeight",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalStakeRewards",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "validatorFixedCostRewards",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "validatorCommission",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "slope",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "validatorSharePrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "stakeAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "validatorSharePriceAtLastUpdate",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "initial",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.RewardEpoch",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getTrustedForwarder",
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
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "stakeRecordId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "additionalAmount",
                  "type": "uint256"
                }
              ],
              "name": "increaseStakeRecordAmount",
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
                },
                {
                  "internalType": "uint256",
                  "name": "stakeRecordId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "additionalTimeLock",
                  "type": "uint256"
                }
              ],
              "name": "increaseStakeRecordTimelock",
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
                },
                {
                  "internalType": "uint256",
                  "name": "rewardEpochNumber",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "isInitial",
                  "type": "bool"
                }
              ],
              "name": "initializeRewardEpoch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operatorAddressToMigrateFrom",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "stakeRecordId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "operatorAddressToMigrateTo",
                  "type": "address"
                }
              ],
              "name": "migrateStakeRecord",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "forwarder",
                  "type": "address"
                }
              ],
              "name": "setTrustedForwarder",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "rate",
                  "type": "uint256"
                }
              ],
              "name": "setValidatorCommissionRate",
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
                },
                {
                  "internalType": "uint256",
                  "name": "stakeRecordId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "ratio",
                  "type": "uint256"
                }
              ],
              "name": "splitStakeRecord",
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
                  "internalType": "uint256",
                  "name": "timeLock",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "operatorStakerAddress",
                  "type": "address"
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
                  "internalType": "address",
                  "name": "operatorStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "stakeId",
                  "type": "uint256"
                }
              ],
              "name": "unfreezeStake",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operatorStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "stakeRecordId",
                  "type": "uint256"
                }
              ],
              "name": "withdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
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
              "inputs": [
                {
                  "internalType": "string",
                  "name": "identifier",
                  "type": "string"
                }
              ],
              "name": "deleteKeySet",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "uint32",
                      "name": "minimumThreshold",
                      "type": "uint32"
                    },
                    {
                      "internalType": "uint32",
                      "name": "monetaryValue",
                      "type": "uint32"
                    },
                    {
                      "internalType": "bool",
                      "name": "completeIsolation",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "identifier",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "realms",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "curves",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "counts",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "address[]",
                      "name": "recoveryPartyMembers",
                      "type": "address[]"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.KeySetConfig",
                  "name": "update",
                  "type": "tuple"
                }
              ],
              "name": "setKeySet",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "ActiveValidatorsCannotLeave",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "CannotKickBelowCurrentValidatorThreshold",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakingAddress",
                  "type": "address"
                }
              ],
              "name": "CannotRejoinBecauseBanned",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakingAddress",
                  "type": "address"
                }
              ],
              "name": "CannotRejoinUntilNextEpochBecauseKicked",
              "type": "error"
            },
            {
              "inputs": [
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
              "name": "CannotReuseCommsKeys",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "CannotVoteTwice",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "CannotWithdrawZero",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "nodeAddress",
                  "type": "address"
                }
              ],
              "name": "CouldNotMapNodeAddressToStakerAddress",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidAttestedAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LibStakingStorage.States",
                  "name": "state",
                  "type": "uint8"
                }
              ],
              "name": "MustBeInActiveOrUnlockedOrPausedState",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LibStakingStorage.States",
                  "name": "state",
                  "type": "uint8"
                }
              ],
              "name": "MustBeInActiveOrUnlockedState",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LibStakingStorage.States",
                  "name": "state",
                  "type": "uint8"
                }
              ],
              "name": "MustBeInNextValidatorSetLockedOrReadyForNextEpochOrRestoreState",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LibStakingStorage.States",
                  "name": "state",
                  "type": "uint8"
                }
              ],
              "name": "MustBeInNextValidatorSetLockedState",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LibStakingStorage.States",
                  "name": "state",
                  "type": "uint8"
                }
              ],
              "name": "MustBeInReadyForNextEpochState",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "MustBeValidatorInNextEpochToKick",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "currentTimestamp",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "epochEndTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "timeout",
                  "type": "uint256"
                }
              ],
              "name": "NotEnoughTimeElapsedForTimeoutSinceLastEpoch",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "currentTimestamp",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "epochEndTime",
                  "type": "uint256"
                }
              ],
              "name": "NotEnoughTimeElapsedSinceLastEpoch",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "validatorCount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "minimumValidatorCount",
                  "type": "uint256"
                }
              ],
              "name": "NotEnoughValidatorsInNextEpoch",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "currentReadyValidatorCount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "nextReadyValidatorCount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "minimumValidatorCountToBeReady",
                  "type": "uint256"
                }
              ],
              "name": "NotEnoughValidatorsReadyForNextEpoch",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "currentEpochNumber",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "receivedEpochNumber",
                  "type": "uint256"
                }
              ],
              "name": "SignaledReadyForWrongEpochNumber",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "senderAddress",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operatorAddress",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "StakerAddressMismatch",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "yourBalance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "requestedWithdrawlAmount",
                  "type": "uint256"
                }
              ],
              "name": "TryingToWithdrawMoreThanStaked",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "staker",
                  "type": "address"
                }
              ],
              "name": "ValidatorAlreadyInNextValidatorSet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "staker",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "existingRealmId",
                  "type": "uint256"
                }
              ],
              "name": "ValidatorAlreadyInRealm",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "staker",
                  "type": "address"
                }
              ],
              "name": "ValidatorNotInNextEpoch",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "validatorAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "ValidatorNotPermitted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ValidatorRegisterAttestedWalletDisabled",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "valueName",
                  "type": "string"
                }
              ],
              "name": "ValueMustBeNonzero",
              "type": "error"
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "advanceEpoch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LibStakingStorage.States",
                  "name": "state",
                  "type": "uint8"
                }
              ],
              "name": "checkActiveOrUnlockedOrPausedState",
              "outputs": [],
              "stateMutability": "pure",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "exit",
              "outputs": [],
              "stateMutability": "pure",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "attestedAddress",
                  "type": "address"
                }
              ],
              "name": "getAttestedPubKey",
              "outputs": [
                {
                  "internalType": "bytes",
                  "name": "",
                  "type": "bytes"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "validatorToKickStakerAddress",
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "lockValidatorsForNextEpoch",
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
                },
                {
                  "internalType": "address",
                  "name": "attestedAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "attestedPubKey",
                  "type": "bytes"
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
              "name": "registerAttestedWallet",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "requestToJoin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "requestToJoinAsAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "requestToJoinAsForShadowSplicing",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "requestToJoinAsNode",
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "requestToLeaveAsNode",
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
                  "name": "operatorAddress",
                  "type": "address"
                }
              ],
              "name": "setIpPortNodeAddress",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "epochNumber",
                  "type": "uint256"
                }
              ],
              "name": "signalReadyForNextEpoch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
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
            },
            {
              "inputs": [
                {
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
                  "internalType": "struct LibStakingStorage.Version",
                  "name": "version",
                  "type": "tuple"
                }
              ],
              "name": "checkVersion",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getMaxVersion",
              "outputs": [
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
                  "internalType": "struct LibStakingStorage.Version",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getMaxVersionString",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getMinVersion",
              "outputs": [
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
                  "internalType": "struct LibStakingStorage.Version",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getMinVersionString",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
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
                  "internalType": "struct LibStakingStorage.Version",
                  "name": "version",
                  "type": "tuple"
                }
              ],
              "name": "setMaxVersion",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
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
                  "internalType": "struct LibStakingStorage.Version",
                  "name": "version",
                  "type": "tuple"
                }
              ],
              "name": "setMinVersion",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "InvalidTimeLock",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NodeAddressNotFoundForStaker",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "stakeAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "stakeWeight",
                      "type": "uint256"
                    },
                    {
                      "internalType": "address[]",
                      "name": "validatorsInCurrentEpoch",
                      "type": "address[]"
                    },
                    {
                      "internalType": "uint256",
                      "name": "actualEpochLength",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.RewardEpochGlobalStats",
                  "name": "globalStats",
                  "type": "tuple"
                }
              ],
              "name": "calculateRewardsPerDay",
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
                  "name": "timeLock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "calculateStakeWeight",
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
                  "name": "reason",
                  "type": "uint256"
                }
              ],
              "name": "complaintConfig",
              "outputs": [
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
                  "internalType": "struct LibStakingStorage.ComplaintConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "contractResolver",
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
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "countOfCurrentValidatorsReadyForNextEpoch",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "countOfNextValidatorsReadyForNextEpoch",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "currentValidatorCountForConsensus",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "epoch",
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
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getActiveUnkickedValidatorCount",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getActiveUnkickedValidatorStructs",
              "outputs": [
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
            },
            {
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
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getActiveUnkickedValidators",
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
              "name": "getAllReserveValidators",
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
              "name": "getAllValidators",
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
                  "internalType": "address",
                  "name": "validatorAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                }
              ],
              "name": "getDelegatedStakersWithUnfreezingStakes",
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
                  "internalType": "address",
                  "name": "validatorAddress",
                  "type": "address"
                }
              ],
              "name": "getDelegatedStakersWithUnfreezingStakesCount",
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
                  "internalType": "string",
                  "name": "identifier",
                  "type": "string"
                }
              ],
              "name": "getKeySet",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint32",
                      "name": "minimumThreshold",
                      "type": "uint32"
                    },
                    {
                      "internalType": "uint32",
                      "name": "monetaryValue",
                      "type": "uint32"
                    },
                    {
                      "internalType": "bool",
                      "name": "completeIsolation",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "identifier",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "realms",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "curves",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "counts",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "address[]",
                      "name": "recoveryPartyMembers",
                      "type": "address[]"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.KeySetConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getKeyTypes",
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
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getKickedValidators",
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
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "getLastStakeRecord",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "id",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "unfreezeStart",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "timeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastUpdateTimestamp",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastRewardEpochClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "initialSharePrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "loaded",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "frozen",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "attributionAddress",
                      "type": "address"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.StakeRecord",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getLitCirc",
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
              "name": "getLowestRewardEpochNumber",
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
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "addresses",
                  "type": "address[]"
                }
              ],
              "name": "getNodeAttestedPubKeyMappings",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "nodeAddress",
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
                      "internalType": "struct LibStakingStorage.UncompressedK256Key",
                      "name": "pubKey",
                      "type": "tuple"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.PubKeyMapping[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
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
              "name": "getNodeDemerits",
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
                  "internalType": "address[]",
                  "name": "addresses",
                  "type": "address[]"
                }
              ],
              "name": "getNodeStakerAddressMappings",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "nodeAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "stakerAddress",
                      "type": "address"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.AddressMapping[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getNonShadowValidators",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getNonShadowValidatorsInCurrentEpochLength",
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
                  "name": "epochNumber",
                  "type": "uint256"
                }
              ],
              "name": "getRewardEpochGlobalStats",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "stakeAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "stakeWeight",
                      "type": "uint256"
                    },
                    {
                      "internalType": "address[]",
                      "name": "validatorsInCurrentEpoch",
                      "type": "address[]"
                    },
                    {
                      "internalType": "uint256",
                      "name": "actualEpochLength",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.RewardEpochGlobalStats",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getRewardEpochNumber",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "getSelfStakeRecordCount",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getShadowValidators",
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
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "recordId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "userStakerAddress",
                  "type": "address"
                }
              ],
              "name": "getStakeRecord",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "id",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "unfreezeStart",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "timeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastUpdateTimestamp",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastRewardEpochClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "initialSharePrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "loaded",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "frozen",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "attributionAddress",
                      "type": "address"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.StakeRecord",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "userStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operatorStakerAddress",
                  "type": "address"
                }
              ],
              "name": "getStakeRecordCount",
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
                  "name": "userStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operatorStakerAddress",
                  "type": "address"
                }
              ],
              "name": "getStakeRecordsForUser",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "id",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "unfreezeStart",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "timeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastUpdateTimestamp",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastRewardEpochClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "initialSharePrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "loaded",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "frozen",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "attributionAddress",
                      "type": "address"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.StakeRecord[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "recordId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "userStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "rewardEpochNumber",
                  "type": "uint256"
                }
              ],
              "name": "getStakeWeightInEpoch",
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
                  "name": "nodeCount",
                  "type": "uint256"
                }
              ],
              "name": "getThreshold",
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
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "id",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "unfreezeStart",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "timeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastUpdateTimestamp",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastRewardEpochClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "initialSharePrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "loaded",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "frozen",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "attributionAddress",
                      "type": "address"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.StakeRecord",
                  "name": "stakeRecord",
                  "type": "tuple"
                },
                {
                  "internalType": "uint256",
                  "name": "rewardEpochNumber",
                  "type": "uint256"
                }
              ],
              "name": "getTimelockInEpoch",
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
              "name": "getTokenContractAddress",
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
              "name": "getTokenPrice",
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
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "id",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "unfreezeStart",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "timeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastUpdateTimestamp",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lastRewardEpochClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "initialSharePrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "loaded",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "frozen",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "attributionAddress",
                      "type": "address"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.StakeRecord",
                  "name": "stakeRecord",
                  "type": "tuple"
                },
                {
                  "internalType": "uint256",
                  "name": "rewardEpochNumber",
                  "type": "uint256"
                }
              ],
              "name": "getTokensStaked",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "getTotalStake",
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
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getTotalStakeByUser",
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
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "userStakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operatorStakerAddress",
                  "type": "address"
                }
              ],
              "name": "getUnfrozenStakeCountForUser",
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
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getValidatorsDelegated",
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
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
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
                  "internalType": "address[]",
                  "name": "stakerAddresses",
                  "type": "address[]"
                }
              ],
              "name": "getValidatorsStructs",
              "outputs": [
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
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getValidatorsStructsInCurrentEpoch",
              "outputs": [
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
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "getValidatorsStructsInNextEpoch",
              "outputs": [
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
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "epochNumber",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "validatorToBeKickedStakerAddress",
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
              "inputs": [],
              "name": "globalConfig",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "tokenRewardPerTokenPerEpoch",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "keyTypes",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minimumValidatorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "rewardEpochDuration",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxTimeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minTimeLock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "bmin",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "bmax",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "k",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "p",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "enableStakeAutolock",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "tokenPrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "profitMultiplier",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "usdCostPerMonth",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxEmissionRate",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minStakeAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxStakeAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minSelfStake",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minSelfStakeTimelock",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minValidatorCountToClampMinimumThreshold",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minThresholdToClampAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.GlobalConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "isActiveShadowValidator",
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
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isActiveValidatorByNodeAddress",
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
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "nodeAddress",
                  "type": "address"
                }
              ],
              "name": "isActiveValidatorByNodeAddressForNextEpoch",
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
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "isActiveValidatorForNextEpoch",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddresses",
                  "type": "address"
                }
              ],
              "name": "isRecentValidator",
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
                  "name": "validator",
                  "type": "address"
                }
              ],
              "name": "isValidatorBanned",
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
              "name": "keySets",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint32",
                      "name": "minimumThreshold",
                      "type": "uint32"
                    },
                    {
                      "internalType": "uint32",
                      "name": "monetaryValue",
                      "type": "uint32"
                    },
                    {
                      "internalType": "bool",
                      "name": "completeIsolation",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "identifier",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "realms",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "curves",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "counts",
                      "type": "uint256[]"
                    },
                    {
                      "internalType": "address[]",
                      "name": "recoveryPartyMembers",
                      "type": "address[]"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.KeySetConfig[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "reason",
                  "type": "uint256"
                }
              ],
              "name": "kickPenaltyPercentByReason",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "litActionsConfig",
              "outputs": [
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
                      "name": "maxConsoleLogLength",
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
                    },
                    {
                      "internalType": "bool",
                      "name": "asyncActionsEnabled",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.LitActionConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "maxStake",
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
              "name": "maxTimeLock",
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
              "name": "minSelfStake",
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
              "name": "minStake",
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
              "name": "minTimeLock",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "nextValidatorCountForConsensus",
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
                  "name": "nodeAddress",
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
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operatorAddress",
                  "type": "address"
                }
              ],
              "name": "operatorAddressToStakerAddress",
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
                  "name": "validator",
                  "type": "address"
                }
              ],
              "name": "permittedRealmsForValidator",
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
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "permittedValidators",
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
                  "name": "base",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "exponent",
                  "type": "uint256"
                }
              ],
              "name": "pow",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "pure",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "realmConfig",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "maxConcurrentRequests",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxPresignCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minPresignCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "peerCheckingIntervalSecs",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxPresignConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "rpcHealthcheckEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minEpochForRewards",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "permittedValidatorsOn",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct LibStakingStorage.RealmConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
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
              "inputs": [
                {
                  "internalType": "address",
                  "name": "staker",
                  "type": "address"
                }
              ],
              "name": "stakerToValidatorsTheyStakedTo",
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
                  "name": "realmId",
                  "type": "uint256"
                }
              ],
              "name": "state",
              "outputs": [
                {
                  "internalType": "enum LibStakingStorage.States",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "stakerAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "stakerInCurrentValidatorSet",
                  "type": "bool"
                }
              ],
              "name": "validatorSelfStakeWillExpire",
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
                  "name": "stakerAddress",
                  "type": "address"
                }
              ],
              "name": "validators",
              "outputs": [
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
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "identifier",
                  "type": "string"
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
                  "internalType": "struct IPubkeyRouter.RootKey[]",
                  "name": "newRootKeys",
                  "type": "tuple[]"
                }
              ],
              "name": "verifyKeySetCounts",
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
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "Multisender",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0xdb65DEa689e55e62f5265505b84bC9c3e69204f8",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
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
              "name": "renounceOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "_recipients",
                  "type": "address[]"
                }
              ],
              "name": "sendEth",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "_recipients",
                  "type": "address[]"
                },
                {
                  "internalType": "address",
                  "name": "tokenContract",
                  "type": "address"
                }
              ],
              "name": "sendTokens",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "_recipients",
                  "type": "address[]"
                },
                {
                  "internalType": "address",
                  "name": "tokenContract",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amountPerRecipient",
                  "type": "uint256"
                }
              ],
              "name": "sendTokensExact",
              "outputs": [],
              "stateMutability": "nonpayable",
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
              "name": "withdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "tokenContract",
                  "type": "address"
                }
              ],
              "name": "withdrawTokens",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "LITToken",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0x5E8db2E7af793f4095c4843C8cBD87C5D8604838",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "cap",
                  "type": "uint256"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "InvalidShortString",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "str",
                  "type": "string"
                }
              ],
              "name": "StringTooLong",
              "type": "error"
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
                  "name": "spender",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
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
                  "name": "delegator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "fromDelegate",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "toDelegate",
                  "type": "address"
                }
              ],
              "name": "DelegateChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "delegate",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "previousBalance",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "newBalance",
                  "type": "uint256"
                }
              ],
              "name": "DelegateVotesChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [],
              "name": "EIP712DomainChanged",
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
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
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
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Unpaused",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "CLOCK_MODE",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DOMAIN_SEPARATOR",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "MINTER_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "PAUSER_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "spender",
                  "type": "address"
                }
              ],
              "name": "allowance",
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
                  "name": "spender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "approve",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "burn",
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
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "burnFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "cap",
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
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "uint32",
                  "name": "pos",
                  "type": "uint32"
                }
              ],
              "name": "checkpoints",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint32",
                      "name": "fromBlock",
                      "type": "uint32"
                    },
                    {
                      "internalType": "uint224",
                      "name": "votes",
                      "type": "uint224"
                    }
                  ],
                  "internalType": "struct ERC20Votes.Checkpoint",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "clock",
              "outputs": [
                {
                  "internalType": "uint48",
                  "name": "",
                  "type": "uint48"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "decimals",
              "outputs": [
                {
                  "internalType": "uint8",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "spender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "subtractedValue",
                  "type": "uint256"
                }
              ],
              "name": "decreaseAllowance",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "delegatee",
                  "type": "address"
                }
              ],
              "name": "delegate",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "delegatee",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "expiry",
                  "type": "uint256"
                },
                {
                  "internalType": "uint8",
                  "name": "v",
                  "type": "uint8"
                },
                {
                  "internalType": "bytes32",
                  "name": "r",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "s",
                  "type": "bytes32"
                }
              ],
              "name": "delegateBySig",
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
              "name": "delegates",
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
              "name": "eip712Domain",
              "outputs": [
                {
                  "internalType": "bytes1",
                  "name": "fields",
                  "type": "bytes1"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "version",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "chainId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "verifyingContract",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256[]",
                  "name": "extensions",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "timepoint",
                  "type": "uint256"
                }
              ],
              "name": "getPastTotalSupply",
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
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "timepoint",
                  "type": "uint256"
                }
              ],
              "name": "getPastVotes",
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
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
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
              "name": "getVotes",
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
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
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
                  "name": "spender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "addedValue",
                  "type": "uint256"
                }
              ],
              "name": "increaseAllowance",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "_amount",
                  "type": "uint256"
                }
              ],
              "name": "mint",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "name",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "nonces",
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
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "numCheckpoints",
              "outputs": [
                {
                  "internalType": "uint32",
                  "name": "",
                  "type": "uint32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "pause",
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
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "spender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "deadline",
                  "type": "uint256"
                },
                {
                  "internalType": "uint8",
                  "name": "v",
                  "type": "uint8"
                },
                {
                  "internalType": "bytes32",
                  "name": "r",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "s",
                  "type": "bytes32"
                }
              ],
              "name": "permit",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
              "name": "symbol",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "totalSupply",
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
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "transfer",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
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
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "transferFrom",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "PubkeyRouter",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0xF6D2F7b57FC5914d05cf75486567a9fDC689F4a1",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotAddFunctionToDiamondThatAlreadyExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotAddSelectorsToZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveFunctionThatDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionThatDoesNotExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotReplaceFunctionsFromFacetWithZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint8",
                  "name": "_action",
                  "type": "uint8"
                }
              ],
              "name": "IncorrectFacetCutAction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_initializationContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "InitializationFunctionReverted",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_contractAddress",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "_message",
                  "type": "string"
                }
              ],
              "name": "NoBytecodeAtAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "NoSelectorsProvidedForFacetForCut",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_user",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_contractOwner",
                  "type": "address"
                }
              ],
              "name": "NotContractOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "RemoveFacetAddressMustBeZeroAddress",
              "type": "error"
            },
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
                  "internalType": "struct IDiamond.FacetCut[]",
                  "name": "_diamondCut",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "_init",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "diamondCut",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_functionSelector",
                  "type": "bytes4"
                }
              ],
              "name": "facetAddress",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "facetAddress_",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facetAddresses",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "facetAddresses_",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facet",
                  "type": "address"
                }
              ],
              "name": "facetFunctionSelectors",
              "outputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_facetFunctionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facets",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "facetAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes4[]",
                      "name": "functionSelectors",
                      "type": "bytes4[]"
                    }
                  ],
                  "internalType": "struct IDiamondLoupe.Facet[]",
                  "name": "facets_",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "owner_",
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
                  "name": "_newOwner",
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
              "name": "CallerNotOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "identifier",
                  "type": "string"
                },
                {
                  "internalType": "bytes32",
                  "name": "hash",
                  "type": "bytes32"
                }
              ],
              "name": "KeySetNotFound",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "curveType",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "count",
                  "type": "uint256"
                }
              ],
              "name": "RootKeyMiscount",
              "type": "error"
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
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakingContract",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "keySetId",
                  "type": "string"
                }
              ],
              "name": "adminResetRootKeys",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakingContract",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "keySetId",
                  "type": "string"
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
                  "internalType": "struct IPubkeyRouter.RootKey[]",
                  "name": "rootKeys",
                  "type": "tuple[]"
                }
              ],
              "name": "adminSetRootKeys",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "realmId",
                  "type": "uint256"
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
                  "internalType": "bytes",
                  "name": "signedMessage",
                  "type": "bytes"
                }
              ],
              "name": "checkNodeSignatures",
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
            {
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
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakingContract",
                  "type": "address"
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
                }
              ],
              "name": "getDerivedPubkey",
              "outputs": [
                {
                  "internalType": "bytes",
                  "name": "",
                  "type": "bytes"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
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
            {
              "inputs": [],
              "name": "getPkpNftAddress",
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
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakingContract",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "keySetId",
                  "type": "string"
                }
              ],
              "name": "getRootKeys",
              "outputs": [
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
                  "internalType": "struct IPubkeyRouter.RootKey[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getRoutingData",
              "outputs": [
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
                    },
                    {
                      "internalType": "bytes32",
                      "name": "derivedKeyId",
                      "type": "bytes32"
                    }
                  ],
                  "internalType": "struct LibPubkeyRouterStorage.PubkeyRoutingData",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getTrustedForwarder",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "isRouted",
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
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "pubkeys",
              "outputs": [
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
                    },
                    {
                      "internalType": "bytes32",
                      "name": "derivedKeyId",
                      "type": "bytes32"
                    }
                  ],
                  "internalType": "struct LibPubkeyRouterStorage.PubkeyRoutingData",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newResolverAddress",
                  "type": "address"
                }
              ],
              "name": "setContractResolver",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "pubkey",
                  "type": "bytes"
                },
                {
                  "internalType": "address",
                  "name": "stakingContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "keyType",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32",
                  "name": "derivedKeyId",
                  "type": "bytes32"
                }
              ],
              "name": "setRoutingData",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "pubkey",
                  "type": "bytes"
                },
                {
                  "internalType": "address",
                  "name": "stakingContract",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "keyType",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32",
                  "name": "derivedKeyId",
                  "type": "bytes32"
                }
              ],
              "name": "setRoutingDataAsAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "forwarder",
                  "type": "address"
                }
              ],
              "name": "setTrustedForwarder",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "stakingContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "identifier",
                  "type": "string"
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
                  "internalType": "struct IPubkeyRouter.RootKey[]",
                  "name": "newRootKeys",
                  "type": "tuple[]"
                }
              ],
              "name": "voteForRootKeys",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "PKPNFT",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0x2b46C57b409F761fb1Ed9EfecA19f97C11FA6d15",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotAddFunctionToDiamondThatAlreadyExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotAddSelectorsToZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveFunctionThatDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionThatDoesNotExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotReplaceFunctionsFromFacetWithZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint8",
                  "name": "_action",
                  "type": "uint8"
                }
              ],
              "name": "IncorrectFacetCutAction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_initializationContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "InitializationFunctionReverted",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_contractAddress",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "_message",
                  "type": "string"
                }
              ],
              "name": "NoBytecodeAtAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "NoSelectorsProvidedForFacetForCut",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_user",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_contractOwner",
                  "type": "address"
                }
              ],
              "name": "NotContractOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "RemoveFacetAddressMustBeZeroAddress",
              "type": "error"
            },
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
                  "internalType": "struct IDiamond.FacetCut[]",
                  "name": "_diamondCut",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "_init",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "diamondCut",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_functionSelector",
                  "type": "bytes4"
                }
              ],
              "name": "facetAddress",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "facetAddress_",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facetAddresses",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "facetAddresses_",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facet",
                  "type": "address"
                }
              ],
              "name": "facetFunctionSelectors",
              "outputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_facetFunctionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facets",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "facetAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes4[]",
                      "name": "functionSelectors",
                      "type": "bytes4[]"
                    }
                  ],
                  "internalType": "struct IDiamondLoupe.Facet[]",
                  "name": "facets_",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
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
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "owner_",
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
                  "name": "_newOwner",
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
              "name": "CallerNotOwner",
              "type": "error"
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
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "approve",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "burn",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
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
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "exists",
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
              "name": "freeMintSigner",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getApproved",
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
            {
              "inputs": [],
              "name": "getNextDerivedKeyId",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getPkpNftMetadataAddress",
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
              "name": "getPkpPermissionsAddress",
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
            },
            {
              "inputs": [],
              "name": "getRouterAddress",
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
              "name": "getStakingAddress",
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
              "name": "getTrustedForwarder",
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
              "name": "initialize",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
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
            {
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
                  "internalType": "bytes",
                  "name": "ipfsCID",
                  "type": "bytes"
                }
              ],
              "name": "mintGrantAndBurnNext",
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
            {
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
            {
              "inputs": [],
              "name": "name",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ownerOf",
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
                  "internalType": "bytes32",
                  "name": "hash",
                  "type": "bytes32"
                }
              ],
              "name": "prefixed",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "pure",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "redeemedFreeMintIds",
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
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
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
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newResolverAddress",
                  "type": "address"
                }
              ],
              "name": "setContractResolver",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newFreeMintSigner",
                  "type": "address"
                }
              ],
              "name": "setFreeMintSigner",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newMintCost",
                  "type": "uint256"
                }
              ],
              "name": "setMintCost",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "forwarder",
                  "type": "address"
                }
              ],
              "name": "setTrustedForwarder",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
              "name": "symbol",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "tokenByIndex",
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
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "tokenURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "totalSupply",
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
                }
              ],
              "name": "transferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "withdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "PKPHelper",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0xca141587f46f003fdf5eD1d504B3Afc2212111b8",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_resolver",
                  "type": "address"
                },
                {
                  "internalType": "enum ContractResolver.Env",
                  "name": "_env",
                  "type": "uint8"
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
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
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
              "name": "claimAndMintNextAndAddAuthMethods",
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
            {
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
            {
              "inputs": [
                {
                  "components": [
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
                  "internalType": "struct LibPKPNFTStorage.ClaimMaterialV2",
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
              "name": "claimAndMintNextAndAddAuthMethodsWithTypesV2",
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
            {
              "inputs": [],
              "name": "contractResolver",
              "outputs": [
                {
                  "internalType": "contract ContractResolver",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "env",
              "outputs": [
                {
                  "internalType": "enum ContractResolver.Env",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getDomainWalletRegistry",
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
              "name": "getPKPNftMetdataAddress",
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
              "name": "getPkpNftAddress",
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
              "name": "getPkpPermissionsAddress",
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
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getStakingAddress",
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
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
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
            },
            {
              "inputs": [
                {
                  "components": [
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
                      "name": "permittedAddressesScopes",
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
                  "internalType": "struct PKPHelper.MintNextAndAddAuthMethodsWithTypesParams",
                  "name": "params",
                  "type": "tuple"
                }
              ],
              "name": "mintNextAndAddAuthMethodsWithTypes",
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
            {
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
                  "internalType": "string[]",
                  "name": "nftMetadata",
                  "type": "string[]"
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
              "name": "mintNextAndAddDomainWalletMetadata",
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
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "",
                  "type": "bytes"
                }
              ],
              "name": "onERC721Received",
              "outputs": [
                {
                  "internalType": "bytes4",
                  "name": "",
                  "type": "bytes4"
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "removePkpMetadata",
              "outputs": [],
              "stateMutability": "nonpayable",
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
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newResolverAddress",
                  "type": "address"
                }
              ],
              "name": "setContractResolver",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "string[]",
                  "name": "nftMetadata",
                  "type": "string[]"
                }
              ],
              "name": "setPkpMetadata",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "transferOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "PKPPermissions",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0x10Ab76aB4A1351cE7FBFBaf6431E5732037DFCF6",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotAddFunctionToDiamondThatAlreadyExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotAddSelectorsToZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveFunctionThatDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionThatDoesNotExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotReplaceFunctionsFromFacetWithZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint8",
                  "name": "_action",
                  "type": "uint8"
                }
              ],
              "name": "IncorrectFacetCutAction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_initializationContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "InitializationFunctionReverted",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_contractAddress",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "_message",
                  "type": "string"
                }
              ],
              "name": "NoBytecodeAtAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "NoSelectorsProvidedForFacetForCut",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_user",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_contractOwner",
                  "type": "address"
                }
              ],
              "name": "NotContractOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "RemoveFacetAddressMustBeZeroAddress",
              "type": "error"
            },
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
                  "internalType": "struct IDiamond.FacetCut[]",
                  "name": "_diamondCut",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "_init",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "diamondCut",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_functionSelector",
                  "type": "bytes4"
                }
              ],
              "name": "facetAddress",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "facetAddress_",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facetAddresses",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "facetAddresses_",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facet",
                  "type": "address"
                }
              ],
              "name": "facetFunctionSelectors",
              "outputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_facetFunctionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facets",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "facetAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes4[]",
                      "name": "functionSelectors",
                      "type": "bytes4[]"
                    }
                  ],
                  "internalType": "struct IDiamondLoupe.Facet[]",
                  "name": "facets_",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "owner_",
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
                  "name": "_newOwner",
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
              "name": "CallerNotOwner",
              "type": "error"
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
            },
            {
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
            {
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
            {
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
            {
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
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256[]",
                  "name": "permittedAuthMethodTypesToAdd",
                  "type": "uint256[]"
                },
                {
                  "internalType": "bytes[]",
                  "name": "permittedAuthMethodIdsToAdd",
                  "type": "bytes[]"
                },
                {
                  "internalType": "bytes[]",
                  "name": "permittedAuthMethodPubkeysToAdd",
                  "type": "bytes[]"
                },
                {
                  "internalType": "uint256[][]",
                  "name": "permittedAuthMethodScopesToAdd",
                  "type": "uint256[][]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "permittedAuthMethodTypesToRemove",
                  "type": "uint256[]"
                },
                {
                  "internalType": "bytes[]",
                  "name": "permittedAuthMethodIdsToRemove",
                  "type": "bytes[]"
                }
              ],
              "name": "batchAddRemoveAuthMethods",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
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
              "name": "getAuthMethodId",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "pure",
              "type": "function"
            },
            {
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
            {
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
              "name": "getPKPPubKeysByAuthMethod",
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
            {
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
            {
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
            {
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
            {
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
            {
              "inputs": [],
              "name": "getPkpNftAddress",
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
            },
            {
              "inputs": [],
              "name": "getRouterAddress",
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
            {
              "inputs": [],
              "name": "getTrustedForwarder",
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
              "name": "getUserPubkeyForAuthMethod",
              "outputs": [
                {
                  "internalType": "bytes",
                  "name": "",
                  "type": "bytes"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
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
            {
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
            {
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
              "name": "isPermittedAuthMethod",
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
              "name": "isPermittedAuthMethodScopePresent",
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
            {
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
            {
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
            {
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
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newResolverAddress",
                  "type": "address"
                }
              ],
              "name": "setContractResolver",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "group",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32",
                  "name": "root",
                  "type": "bytes32"
                }
              ],
              "name": "setRootHash",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "forwarder",
                  "type": "address"
                }
              ],
              "name": "setTrustedForwarder",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "group",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "proof",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32",
                  "name": "leaf",
                  "type": "bytes32"
                }
              ],
              "name": "verifyState",
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
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "group",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "proof",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bool[]",
                  "name": "proofFlags",
                  "type": "bool[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "leaves",
                  "type": "bytes32[]"
                }
              ],
              "name": "verifyStates",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "PKPNFTMetadata",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0x3451a55c12Cb511137C2F048b4E02F1b718Fc5D5",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_resolver",
                  "type": "address"
                },
                {
                  "internalType": "enum ContractResolver.Env",
                  "name": "_env",
                  "type": "uint8"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes",
                  "name": "buffer",
                  "type": "bytes"
                }
              ],
              "name": "bytesToHex",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "pure",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "contractResolver",
              "outputs": [
                {
                  "internalType": "contract ContractResolver",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "env",
              "outputs": [
                {
                  "internalType": "enum ContractResolver.Env",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "removeProfileForPkp",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "removeUrlForPKP",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "imgUrl",
                  "type": "string"
                }
              ],
              "name": "setProfileForPKP",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "url",
                  "type": "string"
                }
              ],
              "name": "setUrlForPKP",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "pubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "address",
                  "name": "ethAddress",
                  "type": "address"
                }
              ],
              "name": "tokenURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "Allowlist",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0x4d2C916AE6d8947246126546a7FdF43fca87905C",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newAdmin",
                  "type": "address"
                }
              ],
              "name": "AdminAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newAdmin",
                  "type": "address"
                }
              ],
              "name": "AdminRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                }
              ],
              "name": "ItemAllowed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                }
              ],
              "name": "ItemNotAllowed",
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
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newAdmin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "allowAll",
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
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "name": "allowedItems",
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
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                }
              ],
              "name": "isAllowed",
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
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newAdmin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
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
                  "internalType": "bool",
                  "name": "_allowAll",
                  "type": "bool"
                }
              ],
              "name": "setAllowAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                }
              ],
              "name": "setAllowed",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                }
              ],
              "name": "setNotAllowed",
              "outputs": [],
              "stateMutability": "nonpayable",
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
            }
          ]
        }
      ]
    },
    {
      "name": "PaymentDelegation",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0x910dab0c9C035319db2958CCfAA9e7C85f380Ab2",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotAddFunctionToDiamondThatAlreadyExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotAddSelectorsToZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveFunctionThatDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionThatDoesNotExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotReplaceFunctionsFromFacetWithZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint8",
                  "name": "_action",
                  "type": "uint8"
                }
              ],
              "name": "IncorrectFacetCutAction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_initializationContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "InitializationFunctionReverted",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_contractAddress",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "_message",
                  "type": "string"
                }
              ],
              "name": "NoBytecodeAtAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "NoSelectorsProvidedForFacetForCut",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_user",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_contractOwner",
                  "type": "address"
                }
              ],
              "name": "NotContractOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "RemoveFacetAddressMustBeZeroAddress",
              "type": "error"
            },
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
                  "internalType": "struct IDiamond.FacetCut[]",
                  "name": "_diamondCut",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "_init",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "diamondCut",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_functionSelector",
                  "type": "bytes4"
                }
              ],
              "name": "facetAddress",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "facetAddress_",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facetAddresses",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "facetAddresses_",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facet",
                  "type": "address"
                }
              ],
              "name": "facetFunctionSelectors",
              "outputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_facetFunctionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facets",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "facetAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes4[]",
                      "name": "functionSelectors",
                      "type": "bytes4[]"
                    }
                  ],
                  "internalType": "struct IDiamondLoupe.Facet[]",
                  "name": "facets_",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "owner_",
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
                  "name": "_newOwner",
                  "type": "address"
                }
              ],
              "name": "transferOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
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
            },
            {
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
            {
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
            {
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
            {
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
            {
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
            {
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
            {
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
            {
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
            {
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
          ]
        }
      ]
    },
    {
      "name": "Ledger",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0xCed2087d0ABA6900e19F09718b8D36Bc91bF07BA",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotAddFunctionToDiamondThatAlreadyExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotAddSelectorsToZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveFunctionThatDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionThatDoesNotExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotReplaceFunctionsFromFacetWithZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint8",
                  "name": "_action",
                  "type": "uint8"
                }
              ],
              "name": "IncorrectFacetCutAction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_initializationContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "InitializationFunctionReverted",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_contractAddress",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "_message",
                  "type": "string"
                }
              ],
              "name": "NoBytecodeAtAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "NoSelectorsProvidedForFacetForCut",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_user",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_contractOwner",
                  "type": "address"
                }
              ],
              "name": "NotContractOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "RemoveFacetAddressMustBeZeroAddress",
              "type": "error"
            },
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
                  "internalType": "struct IDiamond.FacetCut[]",
                  "name": "_diamondCut",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "_init",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "diamondCut",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_functionSelector",
                  "type": "bytes4"
                }
              ],
              "name": "facetAddress",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "facetAddress_",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facetAddresses",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "facetAddresses_",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facet",
                  "type": "address"
                }
              ],
              "name": "facetFunctionSelectors",
              "outputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_facetFunctionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facets",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "facetAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes4[]",
                      "name": "functionSelectors",
                      "type": "bytes4[]"
                    }
                  ],
                  "internalType": "struct IDiamondLoupe.Facet[]",
                  "name": "facets_",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "owner_",
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
                  "name": "_newOwner",
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
              "name": "AmountMustBePositive",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ArrayLengthsMustMatch",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "CallerNotOwner",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InsufficientFunds",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InsufficientWithdrawAmount",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "MustBeNonzero",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NodeNotStakingNode",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "PercentageMustBeLessThan100",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "SessionAlreadyUsed",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ValueExceedsUint128MaxLimit",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "WithdrawalDelayNotPassed",
              "type": "error"
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
            },
            {
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
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "internalType": "int256",
                  "name": "amount",
                  "type": "int256"
                }
              ],
              "name": "chargeUser",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                },
                {
                  "internalType": "int256[]",
                  "name": "amounts",
                  "type": "int256[]"
                },
                {
                  "internalType": "uint64",
                  "name": "batchId",
                  "type": "uint64"
                }
              ],
              "name": "chargeUsers",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "deposit",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
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
            {
              "inputs": [],
              "name": "getStakingAddress",
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
              "name": "getTrustedForwarder",
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
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "latestRewardWithdrawRequest",
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
            {
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
            {
              "inputs": [],
              "name": "litFoundationRewards",
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
              "name": "litFoundationSplitPercentage",
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
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "requestRewardWithdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
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
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "rewardBalance",
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
              "name": "rewardWithdrawDelay",
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
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "setLitFoundationSplitPercentage",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "delay",
                  "type": "uint256"
                }
              ],
              "name": "setRewardWithdrawDelay",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "forwarder",
                  "type": "address"
                }
              ],
              "name": "setTrustedForwarder",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "delay",
                  "type": "uint256"
                }
              ],
              "name": "setUserWithdrawDelay",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
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
            {
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
            },
            {
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
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "withdrawFoundationRewards",
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
              "name": "withdrawRewards",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "PriceFeed",
      "contracts": [
        {
          "network": "naga-dev",
          "address_hash": "0xa5c2B33E8eaa1B51d45C4dEa77A9d77FD50E0fA3",
          "inserted_at": "2025-08-27T16:05:03Z",
          "ABI": [
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotAddFunctionToDiamondThatAlreadyExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotAddSelectorsToZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveFunctionThatDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotRemoveImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionThatDoesNotExists",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_selectors",
                  "type": "bytes4[]"
                }
              ],
              "name": "CannotReplaceFunctionsFromFacetWithZeroAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_selector",
                  "type": "bytes4"
                }
              ],
              "name": "CannotReplaceImmutableFunction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint8",
                  "name": "_action",
                  "type": "uint8"
                }
              ],
              "name": "IncorrectFacetCutAction",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_initializationContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "InitializationFunctionReverted",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_contractAddress",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "_message",
                  "type": "string"
                }
              ],
              "name": "NoBytecodeAtAddress",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "NoSelectorsProvidedForFacetForCut",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_user",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_contractOwner",
                  "type": "address"
                }
              ],
              "name": "NotContractOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facetAddress",
                  "type": "address"
                }
              ],
              "name": "RemoveFacetAddressMustBeZeroAddress",
              "type": "error"
            },
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
                  "internalType": "struct IDiamond.FacetCut[]",
                  "name": "_diamondCut",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "_init",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "_calldata",
                  "type": "bytes"
                }
              ],
              "name": "diamondCut",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_functionSelector",
                  "type": "bytes4"
                }
              ],
              "name": "facetAddress",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "facetAddress_",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facetAddresses",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "facetAddresses_",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_facet",
                  "type": "address"
                }
              ],
              "name": "facetFunctionSelectors",
              "outputs": [
                {
                  "internalType": "bytes4[]",
                  "name": "_facetFunctionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "facets",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "facetAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes4[]",
                      "name": "functionSelectors",
                      "type": "bytes4[]"
                    }
                  ],
                  "internalType": "struct IDiamondLoupe.Facet[]",
                  "name": "facets_",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "_interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
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
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "owner_",
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
                  "name": "_newOwner",
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
              "name": "CallerNotOwner",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "MustBeLessThan100",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "MustBeNonzero",
              "type": "error"
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
            },
            {
              "inputs": [
                {
                  "internalType": "uint256[]",
                  "name": "productIds",
                  "type": "uint256[]"
                }
              ],
              "name": "baseNetworkPrices",
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
            {
              "inputs": [],
              "name": "getLitActionPriceConfigs",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "enum LibPriceFeedStorage.LitActionPriceComponent",
                      "name": "priceComponent",
                      "type": "uint8"
                    },
                    {
                      "internalType": "enum LibPriceFeedStorage.NodePriceMeasurement",
                      "name": "priceMeasurement",
                      "type": "uint8"
                    },
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibPriceFeedStorage.LitActionPriceConfig[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getNodeCapacityConfig",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "pkpSignMaxConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "encSignMaxConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "litActionMaxConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "signSessionKeyMaxConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "globalMaxCapacity",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibPriceFeedStorage.NodeCapacityConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
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
            },
            {
              "inputs": [],
              "name": "getStakingAddress",
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
              "name": "getTrustedForwarder",
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
                  "internalType": "uint256[]",
                  "name": "productIds",
                  "type": "uint256[]"
                }
              ],
              "name": "maxNetworkPrices",
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
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "node",
                  "type": "address"
                },
                {
                  "internalType": "uint256[]",
                  "name": "productIds",
                  "type": "uint256[]"
                }
              ],
              "name": "price",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "stakerAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "productId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "timestamp",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibPriceFeedStorage.NodePriceData[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "productId",
                  "type": "uint256"
                }
              ],
              "name": "prices",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "stakerAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "productId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "timestamp",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibPriceFeedStorage.NodePriceData[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newPrice",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256[]",
                  "name": "productIds",
                  "type": "uint256[]"
                }
              ],
              "name": "setBaseNetworkPrices",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LibPriceFeedStorage.LitActionPriceComponent",
                  "name": "priceComponent",
                  "type": "uint8"
                },
                {
                  "internalType": "enum LibPriceFeedStorage.NodePriceMeasurement",
                  "name": "priceMeasurement",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "new_price",
                  "type": "uint256"
                }
              ],
              "name": "setLitActionPriceConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "enum LibPriceFeedStorage.LitActionPriceComponent",
                      "name": "priceComponent",
                      "type": "uint8"
                    },
                    {
                      "internalType": "enum LibPriceFeedStorage.NodePriceMeasurement",
                      "name": "priceMeasurement",
                      "type": "uint8"
                    },
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibPriceFeedStorage.LitActionPriceConfig[]",
                  "name": "configs",
                  "type": "tuple[]"
                }
              ],
              "name": "setLitActionPriceConfigs",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newPrice",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256[]",
                  "name": "productIds",
                  "type": "uint256[]"
                }
              ],
              "name": "setMaxNetworkPrices",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "pkpSignMaxConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "encSignMaxConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "litActionMaxConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "signSessionKeyMaxConcurrency",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "globalMaxCapacity",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct LibPriceFeedStorage.NodeCapacityConfig",
                  "name": "config",
                  "type": "tuple"
                }
              ],
              "name": "setNodeCapacityConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "forwarder",
                  "type": "address"
                }
              ],
              "name": "setTrustedForwarder",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "usagePercent",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256[]",
                  "name": "productIds",
                  "type": "uint256[]"
                }
              ],
              "name": "setUsage",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "usagePercent",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "productId",
                  "type": "uint256"
                }
              ],
              "name": "usagePercentToPrice",
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
                  "name": "usagePercent",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256[]",
                  "name": "productIds",
                  "type": "uint256[]"
                }
              ],
              "name": "usagePercentToPrices",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        }
      ]
    }
  ],
  "config": {
    "chainId": "175188",
    "rpcUrl": "https://yellowstone-rpc.litprotocol.com",
    "chainName": "yellowstone",
    "litNodeDomainName": "127.0.0.1",
    "litNodePort": 7470,
    "rocketPort": 7470
  }
};