export declare const nagaTest: {
    readonly data: readonly [{
        readonly name: "Staking";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0x9f3cE810695180C5f693a7cD2a0203A381fd57E1";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotAddFunctionToDiamondThatAlreadyExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotAddSelectorsToZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveFunctionThatDoesNotExist";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionThatDoesNotExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotReplaceFunctionsFromFacetWithZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint8";
                    readonly name: "_action";
                    readonly type: "uint8";
                }];
                readonly name: "IncorrectFacetCutAction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_initializationContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "InitializationFunctionReverted";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_contractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "_message";
                    readonly type: "string";
                }];
                readonly name: "NoBytecodeAtAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "NoSelectorsProvidedForFacetForCut";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_user";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "_contractOwner";
                    readonly type: "address";
                }];
                readonly name: "NotContractOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "RemoveFacetAddressMustBeZeroAddress";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "DiamondCut";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "diamondCut";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_functionSelector";
                    readonly type: "bytes4";
                }];
                readonly name: "facetAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "facetAddress_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facetAddresses";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "facetAddresses_";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facet";
                    readonly type: "address";
                }];
                readonly name: "facetFunctionSelectors";
                readonly outputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_facetFunctionSelectors";
                    readonly type: "bytes4[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facets";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamondLoupe.Facet[]";
                    readonly name: "facets_";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "RealmIdNotFound";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "getAllUnkickedValidators";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getCurrentRealmIdForStakerAddress";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getRealmIdForStakerAddress";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getShadowRealmIdForStakerAddress";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "nodeAddress";
                    readonly type: "address";
                }];
                readonly name: "isRecentValidator";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "isValidatorInCurrentEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "isValidatorInCurrentOrNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "isValidatorInNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "nodeAddress";
                    readonly type: "address";
                }];
                readonly name: "nodeAddressToStakerAddressAcrossRealms";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "numRealms";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "validator_by_staker_address";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "ip";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint128";
                        readonly name: "ipv6";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "port";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "reward";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "senderPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "receiverPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastActiveEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "commissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRealmId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address";
                        readonly name: "operatorAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "uniqueDelegatingStakerCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "registerAttestedWalletDisabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotOwnerOrDevopsAdmin";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotModifyUnfrozen";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotMoveToLockedValidatorStateBeforeEpochEnds";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotStakeZero";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "InvalidNewSharePrice";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "InvalidSlashPercentage";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "timeLock";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "minTimeLock";
                    readonly type: "uint256";
                }];
                readonly name: "MinTimeLockNotMet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "state";
                    readonly type: "uint8";
                }];
                readonly name: "MustBeInNextValidatorSetLockedOrReadyForNextEpochState";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "NoEmptyStakingSlot";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "StakeAmountNotMet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validator";
                    readonly type: "address";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "validatorsInNextEpoch";
                    readonly type: "address[]";
                }];
                readonly name: "ValidatorIsNotInNextEpoch";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "dataType";
                    readonly type: "uint256";
                }];
                readonly name: "ClearOfflinePhaseData";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "dataType";
                    readonly type: "uint256";
                }];
                readonly name: "CountOfflinePhaseData";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newDevopsAdmin";
                    readonly type: "address";
                }];
                readonly name: "DevopsAdminSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newEpochEndTime";
                    readonly type: "uint256";
                }];
                readonly name: "EpochEndTimeSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newEpochLength";
                    readonly type: "uint256";
                }];
                readonly name: "EpochLengthSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newEpochTimeout";
                    readonly type: "uint256";
                }];
                readonly name: "EpochTimeoutSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "reason";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newKickPenaltyPercent";
                    readonly type: "uint256";
                }];
                readonly name: "KickPenaltyPercentSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newResolverContractAddress";
                    readonly type: "address";
                }];
                readonly name: "ResolverContractAddressSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "recordId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "stakerAddressClient";
                    readonly type: "address";
                }];
                readonly name: "StakeRecordCreated";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "Staked";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "newState";
                    readonly type: "uint8";
                }];
                readonly name: "StateChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "ValidatorBanned";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "ValidatorKickedFromNextEpoch";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "ValidatorRejoinedNextEpoch";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "addRealm";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorStakerAddress";
                    readonly type: "address";
                }];
                readonly name: "adminKickValidatorInNextEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "adminRejoinValidator";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bool";
                    readonly name: "disabled";
                    readonly type: "bool";
                }];
                readonly name: "adminSetValidatorRegisterAttestedWalletDisabled";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "validatorsForCurrentEpoch";
                    readonly type: "address[]";
                }];
                readonly name: "adminSetValidatorsInCurrentEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "validatorsForNextEpoch";
                    readonly type: "address[]";
                }];
                readonly name: "adminSetValidatorsInNextEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "source_realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "target_realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "target_validators";
                    readonly type: "address[]";
                }];
                readonly name: "adminSetupShadowSplicing";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "percentage";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "adminSlashValidator";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "userStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "timeLock";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "adminStakeForUser";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "userStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakeId";
                    readonly type: "uint256";
                }];
                readonly name: "adminUnfreezeForUser";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "decreaseRewardPool";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "dataType";
                    readonly type: "uint256";
                }];
                readonly name: "emitClearOfflinePhaseData";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "dataType";
                    readonly type: "uint256";
                }];
                readonly name: "emitCountOfflinePhaseData";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "increaseRewardPool";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "removeRealm";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "reason";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tolerance";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "intervalSecs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "kickPenaltyPercent";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "kickPenaltyDemerits";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.ComplaintConfig";
                    readonly name: "config";
                    readonly type: "tuple";
                }];
                readonly name: "setComplaintConfig";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenRewardPerTokenPerEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "keyTypes";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minimumValidatorCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "rewardEpochDuration";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxTimeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minTimeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "bmin";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "bmax";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "k";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "p";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "enableStakeAutolock";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "tokenPrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "profitMultiplier";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "usdCostPerMonth";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxEmissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minSelfStake";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minSelfStakeTimelock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minValidatorCountToClampMinimumThreshold";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minThresholdToClampAt";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "voteToAdvanceTimeOut";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.GlobalConfig";
                    readonly name: "newConfig";
                    readonly type: "tuple";
                }];
                readonly name: "setConfig";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "setContractResolver";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newThreshold";
                    readonly type: "uint256";
                }];
                readonly name: "setDemeritRejoinThreshold";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newDevopsAdmin";
                    readonly type: "address";
                }];
                readonly name: "setDevopsAdmin";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "newEpochEndTime";
                    readonly type: "uint256";
                }];
                readonly name: "setEpochEndTime";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "newEpochLength";
                    readonly type: "uint256";
                }];
                readonly name: "setEpochLength";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "newState";
                    readonly type: "uint8";
                }];
                readonly name: "setEpochState";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "newEpochTimeout";
                    readonly type: "uint256";
                }];
                readonly name: "setEpochTimeout";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "timeoutMs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "memoryLimitMb";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxCodeLength";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxResponseLength";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxConsoleLogLength";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxFetchCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxSignCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxContractCallCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxBroadcastAndCollectCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxCallDepth";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxRetries";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "asyncActionsEnabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.LitActionConfig";
                    readonly name: "newConfig";
                    readonly type: "tuple";
                }];
                readonly name: "setLitActionConfig";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newTimeout";
                    readonly type: "uint256";
                }];
                readonly name: "setPendingRejoinTimeout";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "validatorsToSet";
                    readonly type: "address[]";
                }];
                readonly name: "setPermittedValidators";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bool";
                    readonly name: "permittedValidatorsOn";
                    readonly type: "bool";
                }];
                readonly name: "setPermittedValidatorsOn";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "maxConcurrentRequests";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxPresignCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minPresignCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "peerCheckingIntervalSecs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxPresignConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "rpcHealthcheckEnabled";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minEpochForRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "permittedValidatorsOn";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.RealmConfig";
                    readonly name: "newConfig";
                    readonly type: "tuple";
                }];
                readonly name: "setRealmConfig";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newTotalSupply";
                    readonly type: "uint256";
                }];
                readonly name: "setTokenTotalSupplyStandIn";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotContract";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotMigrateFromValidator";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotWithdrawFrozen";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "checkpoint";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "currentEpoch";
                    readonly type: "uint256";
                }];
                readonly name: "CheckpointAheadOfCurrentEpoch";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "InsufficientSelfStake";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "InvalidRatio";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "NewTimeLockMustBeGreaterThanCurrent";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "RewardsMustBeClaimed";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "slahedAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "slashedRealmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "senderAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "senderRealmId";
                    readonly type: "uint256";
                }];
                readonly name: "SlashingMustOccurInSameRealm";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakedAmount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "minimumStake";
                    readonly type: "uint256";
                }];
                readonly name: "StakeMustBeGreaterThanMinimumStake";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "stakeRecordId";
                    readonly type: "uint256";
                }];
                readonly name: "StakeRecordNotFound";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "TimeLockNotMet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "TooSoonToWithdraw";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorAddress";
                    readonly type: "address";
                }];
                readonly name: "ValidatorNotRegistered";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "rewards";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "fromEpoch";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "toEpoch";
                    readonly type: "uint256";
                }];
                readonly name: "FixedCostRewardsClaimed";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "userStakerAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "recordId";
                    readonly type: "uint256";
                }];
                readonly name: "StakeRecordRemoved";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "recordId";
                    readonly type: "uint256";
                }];
                readonly name: "StakeRecordUpdated";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "recordId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "rewards";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "fromEpoch";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "toEpoch";
                    readonly type: "uint256";
                }];
                readonly name: "StakeRewardsClaimed";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newTrustedForwarder";
                    readonly type: "address";
                }];
                readonly name: "TrustedForwarderSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "rewards";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "fromEpoch";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "toEpoch";
                    readonly type: "uint256";
                }];
                readonly name: "ValidatorCommissionClaimed";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "ValidatorRegistered";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "Withdrawn";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "balanceOf";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "checkStakingAmounts";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxNumberOfEpochsToClaim";
                    readonly type: "uint256";
                }];
                readonly name: "claimFixedCostRewards";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakeRecordId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxNumberOfEpochsToClaim";
                    readonly type: "uint256";
                }];
                readonly name: "claimStakeRewards";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxNumberOfEpochsToClaim";
                    readonly type: "uint256";
                }];
                readonly name: "claimValidatorCommission";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getMaximumStake";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getMinimumSelfStake";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getMinimumStake";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "rewardEpochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "getRewardEpoch";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "epochEnd";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "totalStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "totalStakeRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "validatorFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "validatorCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "slope";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "validatorSharePrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "stakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "validatorSharePriceAtLastUpdate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "initial";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.RewardEpoch";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "rewardEpochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "getRewardEpochView";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "epochEnd";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "totalStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "totalStakeRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "validatorFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "validatorCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "slope";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "validatorSharePrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "stakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "validatorSharePriceAtLastUpdate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "initial";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.RewardEpoch";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTrustedForwarder";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakeRecordId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "additionalAmount";
                    readonly type: "uint256";
                }];
                readonly name: "increaseStakeRecordAmount";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakeRecordId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "additionalTimeLock";
                    readonly type: "uint256";
                }];
                readonly name: "increaseStakeRecordTimelock";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "rewardEpochNumber";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isInitial";
                    readonly type: "bool";
                }];
                readonly name: "initializeRewardEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "operatorAddressToMigrateFrom";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakeRecordId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorAddressToMigrateTo";
                    readonly type: "address";
                }];
                readonly name: "migrateStakeRecord";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "forwarder";
                    readonly type: "address";
                }];
                readonly name: "setTrustedForwarder";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "rate";
                    readonly type: "uint256";
                }];
                readonly name: "setValidatorCommissionRate";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakeRecordId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "ratio";
                    readonly type: "uint256";
                }];
                readonly name: "splitStakeRecord";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "timeLock";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorStakerAddress";
                    readonly type: "address";
                }];
                readonly name: "stake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "operatorStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakeId";
                    readonly type: "uint256";
                }];
                readonly name: "unfreezeStake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "operatorStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "stakeRecordId";
                    readonly type: "uint256";
                }];
                readonly name: "withdraw";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "bool";
                    readonly name: "exists";
                    readonly type: "bool";
                }, {
                    readonly indexed: false;
                    readonly internalType: "string";
                    readonly name: "identifier";
                    readonly type: "string";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes32";
                    readonly name: "hashed";
                    readonly type: "bytes32";
                }];
                readonly name: "KeySetConfigSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "string";
                    readonly name: "identifier";
                    readonly type: "string";
                }];
                readonly name: "KeySetConfigUpdated";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "identifier";
                    readonly type: "string";
                }];
                readonly name: "deleteKeySet";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "identifier";
                    readonly type: "string";
                }];
                readonly name: "getKeySet";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "minimumThreshold";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "monetaryValue";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "completeIsolation";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "string";
                        readonly name: "identifier";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "description";
                        readonly type: "string";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "realms";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "curves";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "counts";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "recoveryPartyMembers";
                        readonly type: "address[]";
                    }];
                    readonly internalType: "struct LibStakingStorage.KeySetConfig";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "keySets";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "minimumThreshold";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "monetaryValue";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "completeIsolation";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "string";
                        readonly name: "identifier";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "description";
                        readonly type: "string";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "realms";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "curves";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "counts";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "recoveryPartyMembers";
                        readonly type: "address[]";
                    }];
                    readonly internalType: "struct LibStakingStorage.KeySetConfig[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "minimumThreshold";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "monetaryValue";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "completeIsolation";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "string";
                        readonly name: "identifier";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "description";
                        readonly type: "string";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "realms";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "curves";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "counts";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "recoveryPartyMembers";
                        readonly type: "address[]";
                    }];
                    readonly internalType: "struct LibStakingStorage.KeySetConfig";
                    readonly name: "update";
                    readonly type: "tuple";
                }];
                readonly name: "setKeySet";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "identifier";
                    readonly type: "string";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct IPubkeyRouter.RootKey[]";
                    readonly name: "newRootKeys";
                    readonly type: "tuple[]";
                }];
                readonly name: "verifyKeySetCounts";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "ActiveValidatorsCannotLeave";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotKickBelowCurrentValidatorThreshold";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingAddress";
                    readonly type: "address";
                }];
                readonly name: "CannotRejoinBecauseBanned";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingAddress";
                    readonly type: "address";
                }];
                readonly name: "CannotRejoinUntilNextEpochBecauseKicked";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "senderPubKey";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "receiverPubKey";
                    readonly type: "uint256";
                }];
                readonly name: "CannotReuseCommsKeys";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "CannotVoteTwice";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotWithdrawZero";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "nodeAddress";
                    readonly type: "address";
                }];
                readonly name: "CouldNotMapNodeAddressToStakerAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "InvalidAttestedAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "state";
                    readonly type: "uint8";
                }];
                readonly name: "MustBeInActiveOrUnlockedOrPausedState";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "state";
                    readonly type: "uint8";
                }];
                readonly name: "MustBeInActiveOrUnlockedState";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "state";
                    readonly type: "uint8";
                }];
                readonly name: "MustBeInNextValidatorSetLockedOrReadyForNextEpochOrRestoreState";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "state";
                    readonly type: "uint8";
                }];
                readonly name: "MustBeInNextValidatorSetLockedState";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "state";
                    readonly type: "uint8";
                }];
                readonly name: "MustBeInReadyForNextEpochState";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "MustBeValidatorInNextEpochToKick";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "currentTimestamp";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "epochEndTime";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "timeout";
                    readonly type: "uint256";
                }];
                readonly name: "NotEnoughTimeElapsedForTimeoutSinceLastEpoch";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "currentTimestamp";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "epochEndTime";
                    readonly type: "uint256";
                }];
                readonly name: "NotEnoughTimeElapsedSinceLastEpoch";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "validatorCount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "minimumValidatorCount";
                    readonly type: "uint256";
                }];
                readonly name: "NotEnoughValidatorsInNextEpoch";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "currentReadyValidatorCount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nextReadyValidatorCount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "minimumValidatorCountToBeReady";
                    readonly type: "uint256";
                }];
                readonly name: "NotEnoughValidatorsReadyForNextEpoch";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "currentEpochNumber";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "receivedEpochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "SignaledReadyForWrongEpochNumber";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "senderAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "StakerAddressMismatch";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "yourBalance";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "requestedWithdrawlAmount";
                    readonly type: "uint256";
                }];
                readonly name: "TryingToWithdrawMoreThanStaked";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "ValidatorAlreadyInNextValidatorSet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "existingRealmId";
                    readonly type: "uint256";
                }];
                readonly name: "ValidatorAlreadyInRealm";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "ValidatorNotInNextEpoch";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "ValidatorNotPermitted";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "ValidatorRegisterAttestedWalletDisabled";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "valueName";
                    readonly type: "string";
                }];
                readonly name: "ValueMustBeNonzero";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "epochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "AdvancedEpoch";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "attestedAddress";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "x";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "y";
                        readonly type: "uint256";
                    }];
                    readonly indexed: true;
                    readonly internalType: "struct LibStakingStorage.UncompressedK256Key";
                    readonly name: "attestedPubKey";
                    readonly type: "tuple";
                }];
                readonly name: "AttestedWalletRegistered";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "reason";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tolerance";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "intervalSecs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "kickPenaltyPercent";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "kickPenaltyDemerits";
                        readonly type: "uint256";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct LibStakingStorage.ComplaintConfig";
                    readonly name: "config";
                    readonly type: "tuple";
                }];
                readonly name: "ComplaintConfigSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newTokenRewardPerTokenPerEpoch";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256[]";
                    readonly name: "newKeyTypes";
                    readonly type: "uint256[]";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMinimumValidatorCount";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMaxConcurrentRequests";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMaxPresignCount";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMinPresignCount";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newPeerCheckingIntervalSecs";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMaxPresignConcurrency";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bool";
                    readonly name: "newRpcHealthcheckEnabled";
                    readonly type: "bool";
                }];
                readonly name: "ConfigSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "string";
                    readonly name: "message";
                    readonly type: "string";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }];
                readonly name: "DebugEvent";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "epochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "ReadyForNextEpoch";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "token";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "Recovered";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "RequestToJoin";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "RequestToLeave";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newDuration";
                    readonly type: "uint256";
                }];
                readonly name: "RewardsDurationUpdated";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newStakingTokenAddress";
                    readonly type: "address";
                }];
                readonly name: "StakingTokenSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "VoteToAdvanceTimeOutElapsed";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "reporter";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "validatorToKickStakerAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "reason";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }];
                readonly name: "VotedToKickValidatorInNextEpoch";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "advanceEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "state";
                    readonly type: "uint8";
                }];
                readonly name: "checkActiveOrUnlockedOrPausedState";
                readonly outputs: readonly [];
                readonly stateMutability: "pure";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "exit";
                readonly outputs: readonly [];
                readonly stateMutability: "pure";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorToKickStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "reason";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }];
                readonly name: "kickValidatorInNextEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "lockValidatorsForNextEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "attestedAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "attestedPubKey";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "senderPubKey";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "receiverPubKey";
                    readonly type: "uint256";
                }];
                readonly name: "registerAttestedWallet";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "requestToJoin";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "requestToJoinAsAdmin";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "requestToJoinAsForShadowSplicing";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "requestToJoinAsNode";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "requestToLeave";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "requestToLeaveAsNode";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint32";
                    readonly name: "ip";
                    readonly type: "uint32";
                }, {
                    readonly internalType: "uint128";
                    readonly name: "ipv6";
                    readonly type: "uint128";
                }, {
                    readonly internalType: "uint32";
                    readonly name: "port";
                    readonly type: "uint32";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorAddress";
                    readonly type: "address";
                }];
                readonly name: "setIpPortNodeAddress";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "epochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "signalReadyForNextEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "index";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "major";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minor";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "patch";
                        readonly type: "uint256";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct LibStakingStorage.Version";
                    readonly name: "version";
                    readonly type: "tuple";
                }];
                readonly name: "VersionRequirementsUpdated";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "major";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minor";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "patch";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.Version";
                    readonly name: "version";
                    readonly type: "tuple";
                }];
                readonly name: "checkVersion";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getMaxVersion";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "major";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minor";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "patch";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.Version";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getMaxVersionString";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getMinVersion";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "major";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minor";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "patch";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.Version";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getMinVersionString";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "major";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minor";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "patch";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.Version";
                    readonly name: "version";
                    readonly type: "tuple";
                }];
                readonly name: "setMaxVersion";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "major";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minor";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "patch";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.Version";
                    readonly name: "version";
                    readonly type: "tuple";
                }];
                readonly name: "setMinVersion";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "InvalidTimeLock";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "NodeAddressNotFoundForStaker";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "stakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "stakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "validatorsInCurrentEpoch";
                        readonly type: "address[]";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "actualEpochLength";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.RewardEpochGlobalStats";
                    readonly name: "globalStats";
                    readonly type: "tuple";
                }];
                readonly name: "calculateRewardsPerDay";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "timeLock";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "calculateStakeWeight";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "reason";
                    readonly type: "uint256";
                }];
                readonly name: "complaintConfig";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tolerance";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "intervalSecs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "kickPenaltyPercent";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "kickPenaltyDemerits";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.ComplaintConfig";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "contractResolver";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "countOfCurrentValidatorsReadyForNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "countOfNextValidatorsReadyForNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "currentValidatorCountForConsensus";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "epoch";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "epochLength";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "number";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "rewardEpochNumber";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "nextRewardEpochNumber";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "endTime";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "retries";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timeout";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "startTime";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastAdvanceVoteTime";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.Epoch";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getActiveUnkickedValidatorCount";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getActiveUnkickedValidatorStructs";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "ip";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint128";
                        readonly name: "ipv6";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "port";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "reward";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "senderPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "receiverPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastActiveEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "commissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRealmId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address";
                        readonly name: "operatorAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "uniqueDelegatingStakerCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "registerAttestedWalletDisabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getActiveUnkickedValidatorStructsAndCounts";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "epochLength";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "number";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "rewardEpochNumber";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "nextRewardEpochNumber";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "endTime";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "retries";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timeout";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "startTime";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastAdvanceVoteTime";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.Epoch";
                    readonly name: "";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "ip";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint128";
                        readonly name: "ipv6";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "port";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "reward";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "senderPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "receiverPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastActiveEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "commissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRealmId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address";
                        readonly name: "operatorAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "uniqueDelegatingStakerCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "registerAttestedWalletDisabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getActiveUnkickedValidators";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getAllReserveValidators";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getAllValidators";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "attestedAddress";
                    readonly type: "address";
                }];
                readonly name: "getAttestedPubKey";
                readonly outputs: readonly [{
                    readonly internalType: "bytes";
                    readonly name: "";
                    readonly type: "bytes";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "limit";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "offset";
                    readonly type: "uint256";
                }];
                readonly name: "getDelegatedStakersWithUnfreezingStakes";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorAddress";
                    readonly type: "address";
                }];
                readonly name: "getDelegatedStakersWithUnfreezingStakesCount";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getKeyTypes";
                readonly outputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getKickedValidators";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getLastStakeRecord";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "id";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "amount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "unfreezeStart";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastUpdateTimestamp";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimed";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "initialSharePrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "loaded";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "frozen";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "address";
                        readonly name: "attributionAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibStakingStorage.StakeRecord";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getLitCirc";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getLowestRewardEpochNumber";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "addresses";
                    readonly type: "address[]";
                }];
                readonly name: "getNodeAttestedPubKeyMappings";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly components: readonly [{
                            readonly internalType: "uint256";
                            readonly name: "x";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "y";
                            readonly type: "uint256";
                        }];
                        readonly internalType: "struct LibStakingStorage.UncompressedK256Key";
                        readonly name: "pubKey";
                        readonly type: "tuple";
                    }];
                    readonly internalType: "struct LibStakingStorage.PubKeyMapping[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getNodeDemerits";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "addresses";
                    readonly type: "address[]";
                }];
                readonly name: "getNodeStakerAddressMappings";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "address";
                        readonly name: "stakerAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibStakingStorage.AddressMapping[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getNonShadowValidators";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getNonShadowValidatorsInCurrentEpochLength";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "epochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "getRewardEpochGlobalStats";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "stakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "stakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "validatorsInCurrentEpoch";
                        readonly type: "address[]";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "actualEpochLength";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.RewardEpochGlobalStats";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getRewardEpochNumber";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getSelfStakeRecordCount";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getShadowValidators";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "recordId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "userStakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getStakeRecord";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "id";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "amount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "unfreezeStart";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastUpdateTimestamp";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimed";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "initialSharePrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "loaded";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "frozen";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "address";
                        readonly name: "attributionAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibStakingStorage.StakeRecord";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "userStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorStakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getStakeRecordCount";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "userStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorStakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getStakeRecordsForUser";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "id";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "amount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "unfreezeStart";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastUpdateTimestamp";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimed";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "initialSharePrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "loaded";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "frozen";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "address";
                        readonly name: "attributionAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibStakingStorage.StakeRecord[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "recordId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "userStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "rewardEpochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "getStakeWeightInEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "nodeCount";
                    readonly type: "uint256";
                }];
                readonly name: "getThreshold";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "id";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "amount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "unfreezeStart";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastUpdateTimestamp";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimed";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "initialSharePrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "loaded";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "frozen";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "address";
                        readonly name: "attributionAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibStakingStorage.StakeRecord";
                    readonly name: "stakeRecord";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "rewardEpochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "getTimelockInEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTokenContractAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTokenPrice";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "id";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "amount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "unfreezeStart";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastUpdateTimestamp";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimed";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "initialSharePrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "loaded";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "frozen";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "address";
                        readonly name: "attributionAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibStakingStorage.StakeRecord";
                    readonly name: "stakeRecord";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "rewardEpochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "getTokensStaked";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getTotalStake";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "getTotalStakeByUser";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "userStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "operatorStakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getUnfrozenStakeCountForUser";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "getValidatorsDelegated";
                readonly outputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getValidatorsInCurrentEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getValidatorsInNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "stakerAddresses";
                    readonly type: "address[]";
                }];
                readonly name: "getValidatorsStructs";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "ip";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint128";
                        readonly name: "ipv6";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "port";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "reward";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "senderPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "receiverPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastActiveEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "commissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRealmId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address";
                        readonly name: "operatorAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "uniqueDelegatingStakerCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "registerAttestedWalletDisabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getValidatorsStructsInCurrentEpoch";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "ip";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint128";
                        readonly name: "ipv6";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "port";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "reward";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "senderPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "receiverPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastActiveEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "commissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRealmId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address";
                        readonly name: "operatorAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "uniqueDelegatingStakerCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "registerAttestedWalletDisabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "getValidatorsStructsInNextEpoch";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "ip";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint128";
                        readonly name: "ipv6";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "port";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "reward";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "senderPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "receiverPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastActiveEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "commissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRealmId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address";
                        readonly name: "operatorAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "uniqueDelegatingStakerCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "registerAttestedWalletDisabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "epochNumber";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "validatorToBeKickedStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "voterStakerAddress";
                    readonly type: "address";
                }];
                readonly name: "getVotingStatusToKickValidator";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "globalConfig";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenRewardPerTokenPerEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "keyTypes";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minimumValidatorCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "rewardEpochDuration";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxTimeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minTimeLock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "bmin";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "bmax";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "k";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "p";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "enableStakeAutolock";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "tokenPrice";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "profitMultiplier";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "usdCostPerMonth";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxEmissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minSelfStake";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minSelfStakeTimelock";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minValidatorCountToClampMinimumThreshold";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minThresholdToClampAt";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "voteToAdvanceTimeOut";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibStakingStorage.GlobalConfig";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "isActiveShadowValidator";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "isActiveValidator";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "isActiveValidatorByNodeAddress";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "nodeAddress";
                    readonly type: "address";
                }];
                readonly name: "isActiveValidatorByNodeAddressForNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "isActiveValidatorForNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "isReadyForNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddresses";
                    readonly type: "address";
                }];
                readonly name: "isRecentValidator";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validator";
                    readonly type: "address";
                }];
                readonly name: "isValidatorBanned";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "reason";
                    readonly type: "uint256";
                }];
                readonly name: "kickPenaltyPercentByReason";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "litActionsConfig";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "timeoutMs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "memoryLimitMb";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxCodeLength";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxResponseLength";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxConsoleLogLength";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxFetchCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxSignCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxContractCallCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxBroadcastAndCollectCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxCallDepth";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxRetries";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "asyncActionsEnabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.LitActionConfig";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "maxStake";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "maxTimeLock";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "minSelfStake";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "minStake";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "minTimeLock";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "nextValidatorCountForConsensus";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "nodeAddress";
                    readonly type: "address";
                }];
                readonly name: "nodeAddressToStakerAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "operatorAddress";
                    readonly type: "address";
                }];
                readonly name: "operatorAddressToStakerAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validator";
                    readonly type: "address";
                }];
                readonly name: "permittedRealmsForValidator";
                readonly outputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "permittedValidators";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "base";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "exponent";
                    readonly type: "uint256";
                }];
                readonly name: "pow";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "pure";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "readyForNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "realmConfig";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "maxConcurrentRequests";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxPresignCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minPresignCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "peerCheckingIntervalSecs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxPresignConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "rpcHealthcheckEnabled";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minEpochForRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "permittedValidatorsOn";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.RealmConfig";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "shouldKickValidator";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "stakerToValidatorsTheyStakedTo";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }];
                readonly name: "state";
                readonly outputs: readonly [{
                    readonly internalType: "enum LibStakingStorage.States";
                    readonly name: "";
                    readonly type: "uint8";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bool";
                    readonly name: "stakerInCurrentValidatorSet";
                    readonly type: "bool";
                }];
                readonly name: "validatorSelfStakeWillExpire";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "validators";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "ip";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint128";
                        readonly name: "ipv6";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint32";
                        readonly name: "port";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "address";
                        readonly name: "nodeAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "reward";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "senderPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "receiverPubKey";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastActiveEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "commissionRate";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRealmId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeAmount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "delegatedStakeWeight";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedFixedCostRewards";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "lastRewardEpochClaimedCommission";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "address";
                        readonly name: "operatorAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "uniqueDelegatingStakerCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "registerAttestedWalletDisabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "Multisender";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0x077eFcaBFF62391b6fd438034fb21E2484C5B9FF";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "renounceOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "_recipients";
                    readonly type: "address[]";
                }];
                readonly name: "sendEth";
                readonly outputs: readonly [];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "_recipients";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "tokenContract";
                    readonly type: "address";
                }];
                readonly name: "sendTokens";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "_recipients";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "tokenContract";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amountPerRecipient";
                    readonly type: "uint256";
                }];
                readonly name: "sendTokensExact";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "withdraw";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "tokenContract";
                    readonly type: "address";
                }];
                readonly name: "withdrawTokens";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "LITToken";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0x5E8db2E7af793f4095c4843C8cBD87C5D8604838";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "cap";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "constructor";
            }, {
                readonly inputs: readonly [];
                readonly name: "InvalidShortString";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "str";
                    readonly type: "string";
                }];
                readonly name: "StringTooLong";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "spender";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }];
                readonly name: "Approval";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "delegator";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "fromDelegate";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "toDelegate";
                    readonly type: "address";
                }];
                readonly name: "DelegateChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "delegate";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "previousBalance";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newBalance";
                    readonly type: "uint256";
                }];
                readonly name: "DelegateVotesChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [];
                readonly name: "EIP712DomainChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "Paused";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "previousAdminRole";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "newAdminRole";
                    readonly type: "bytes32";
                }];
                readonly name: "RoleAdminChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "RoleGranted";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "RoleRevoked";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "from";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }];
                readonly name: "Transfer";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "Unpaused";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "ADMIN_ROLE";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "CLOCK_MODE";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "DEFAULT_ADMIN_ROLE";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "DOMAIN_SEPARATOR";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "MINTER_ROLE";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "PAUSER_ROLE";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "spender";
                    readonly type: "address";
                }];
                readonly name: "allowance";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "spender";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "approve";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "balanceOf";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "burn";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "burnFrom";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "cap";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint32";
                    readonly name: "pos";
                    readonly type: "uint32";
                }];
                readonly name: "checkpoints";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint32";
                        readonly name: "fromBlock";
                        readonly type: "uint32";
                    }, {
                        readonly internalType: "uint224";
                        readonly name: "votes";
                        readonly type: "uint224";
                    }];
                    readonly internalType: "struct ERC20Votes.Checkpoint";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "clock";
                readonly outputs: readonly [{
                    readonly internalType: "uint48";
                    readonly name: "";
                    readonly type: "uint48";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "decimals";
                readonly outputs: readonly [{
                    readonly internalType: "uint8";
                    readonly name: "";
                    readonly type: "uint8";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "spender";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "subtractedValue";
                    readonly type: "uint256";
                }];
                readonly name: "decreaseAllowance";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "delegatee";
                    readonly type: "address";
                }];
                readonly name: "delegate";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "delegatee";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expiry";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint8";
                    readonly name: "v";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "r";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "s";
                    readonly type: "bytes32";
                }];
                readonly name: "delegateBySig";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "delegates";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "eip712Domain";
                readonly outputs: readonly [{
                    readonly internalType: "bytes1";
                    readonly name: "fields";
                    readonly type: "bytes1";
                }, {
                    readonly internalType: "string";
                    readonly name: "name";
                    readonly type: "string";
                }, {
                    readonly internalType: "string";
                    readonly name: "version";
                    readonly type: "string";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "chainId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "verifyingContract";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "salt";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "extensions";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "timepoint";
                    readonly type: "uint256";
                }];
                readonly name: "getPastTotalSupply";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "timepoint";
                    readonly type: "uint256";
                }];
                readonly name: "getPastVotes";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }];
                readonly name: "getRoleAdmin";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "getVotes";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "grantRole";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "hasRole";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "spender";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "addedValue";
                    readonly type: "uint256";
                }];
                readonly name: "increaseAllowance";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_recipient";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "_amount";
                    readonly type: "uint256";
                }];
                readonly name: "mint";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "name";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }];
                readonly name: "nonces";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "numCheckpoints";
                readonly outputs: readonly [{
                    readonly internalType: "uint32";
                    readonly name: "";
                    readonly type: "uint32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "pause";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "paused";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "spender";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "deadline";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint8";
                    readonly name: "v";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "r";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "s";
                    readonly type: "bytes32";
                }];
                readonly name: "permit";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "renounceRole";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "revokeRole";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "symbol";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "totalSupply";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "transfer";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "from";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "transferFrom";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "unpause";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "PubkeyRouter";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0x054Ddcfef7E9434413ad62A6F37946Bf6B6CFc1A";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotAddFunctionToDiamondThatAlreadyExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotAddSelectorsToZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveFunctionThatDoesNotExist";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionThatDoesNotExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotReplaceFunctionsFromFacetWithZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint8";
                    readonly name: "_action";
                    readonly type: "uint8";
                }];
                readonly name: "IncorrectFacetCutAction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_initializationContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "InitializationFunctionReverted";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_contractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "_message";
                    readonly type: "string";
                }];
                readonly name: "NoBytecodeAtAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "NoSelectorsProvidedForFacetForCut";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_user";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "_contractOwner";
                    readonly type: "address";
                }];
                readonly name: "NotContractOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "RemoveFacetAddressMustBeZeroAddress";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "DiamondCut";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "diamondCut";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_functionSelector";
                    readonly type: "bytes4";
                }];
                readonly name: "facetAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "facetAddress_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facetAddresses";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "facetAddresses_";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facet";
                    readonly type: "address";
                }];
                readonly name: "facetFunctionSelectors";
                readonly outputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_facetFunctionSelectors";
                    readonly type: "bytes4[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facets";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamondLoupe.Facet[]";
                    readonly name: "facets_";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "identifier";
                    readonly type: "string";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "hash";
                    readonly type: "bytes32";
                }];
                readonly name: "KeySetNotFound";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "curveType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "count";
                    readonly type: "uint256";
                }];
                readonly name: "RootKeyMiscount";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "ContractResolverAddressSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "string";
                    readonly name: "message";
                    readonly type: "string";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }];
                readonly name: "DebugEvent";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "pubkey";
                    readonly type: "bytes";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "stakingContract";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "keyType";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes32";
                    readonly name: "derivedKeyId";
                    readonly type: "bytes32";
                }];
                readonly name: "PubkeyRoutingDataSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "stakingContract";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct IPubkeyRouter.RootKey";
                    readonly name: "rootKey";
                    readonly type: "tuple";
                }];
                readonly name: "RootKeySet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "ToggleEvent";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newTrustedForwarder";
                    readonly type: "address";
                }];
                readonly name: "TrustedForwarderSet";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingContract";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }];
                readonly name: "adminResetRootKeys";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingContract";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct IPubkeyRouter.RootKey[]";
                    readonly name: "rootKeys";
                    readonly type: "tuple[]";
                }];
                readonly name: "adminSetRootKeys";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "r";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "bytes32";
                        readonly name: "s";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "uint8";
                        readonly name: "v";
                        readonly type: "uint8";
                    }];
                    readonly internalType: "struct IPubkeyRouter.Signature[]";
                    readonly name: "signatures";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "signedMessage";
                    readonly type: "bytes";
                }];
                readonly name: "checkNodeSignatures";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes";
                    readonly name: "pubkey";
                    readonly type: "bytes";
                }];
                readonly name: "deriveEthAddressFromPubkey";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "pure";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "ethAddress";
                    readonly type: "address";
                }];
                readonly name: "ethAddressToPkpId";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingContract";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "derivedKeyId";
                    readonly type: "bytes32";
                }];
                readonly name: "getDerivedPubkey";
                readonly outputs: readonly [{
                    readonly internalType: "bytes";
                    readonly name: "";
                    readonly type: "bytes";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getEthAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "ethAddresses";
                    readonly type: "address[]";
                }];
                readonly name: "getPkpInfoFromEthAddresses";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "address";
                        readonly name: "ethAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibPubkeyRouterStorage.PkpInfo[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "tokenIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "getPkpInfoFromTokenIds";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "address";
                        readonly name: "ethAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibPubkeyRouterStorage.PkpInfo[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getPkpNftAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getPubkey";
                readonly outputs: readonly [{
                    readonly internalType: "bytes";
                    readonly name: "";
                    readonly type: "bytes";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingContract";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }];
                readonly name: "getRootKeys";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct IPubkeyRouter.RootKey[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getRoutingData";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes32";
                        readonly name: "derivedKeyId";
                        readonly type: "bytes32";
                    }];
                    readonly internalType: "struct LibPubkeyRouterStorage.PubkeyRoutingData";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTrustedForwarder";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "isRouted";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "pubkeys";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes32";
                        readonly name: "derivedKeyId";
                        readonly type: "bytes32";
                    }];
                    readonly internalType: "struct LibPubkeyRouterStorage.PubkeyRoutingData";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "setContractResolver";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "pubkey";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakingContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "keyType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "derivedKeyId";
                    readonly type: "bytes32";
                }];
                readonly name: "setRoutingData";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "pubkey";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakingContract";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "keyType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "derivedKeyId";
                    readonly type: "bytes32";
                }];
                readonly name: "setRoutingDataAsAdmin";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "forwarder";
                    readonly type: "address";
                }];
                readonly name: "setTrustedForwarder";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "identifier";
                    readonly type: "string";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct IPubkeyRouter.RootKey[]";
                    readonly name: "newRootKeys";
                    readonly type: "tuple[]";
                }];
                readonly name: "voteForRootKeys";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "PKPNFT";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0xaf4Dddb07Cdde48042e93eb5bf266b49950bC5BD";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotAddFunctionToDiamondThatAlreadyExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotAddSelectorsToZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveFunctionThatDoesNotExist";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionThatDoesNotExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotReplaceFunctionsFromFacetWithZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint8";
                    readonly name: "_action";
                    readonly type: "uint8";
                }];
                readonly name: "IncorrectFacetCutAction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_initializationContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "InitializationFunctionReverted";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_contractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "_message";
                    readonly type: "string";
                }];
                readonly name: "NoBytecodeAtAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "NoSelectorsProvidedForFacetForCut";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_user";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "_contractOwner";
                    readonly type: "address";
                }];
                readonly name: "NotContractOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "RemoveFacetAddressMustBeZeroAddress";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "DiamondCut";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "diamondCut";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_functionSelector";
                    readonly type: "bytes4";
                }];
                readonly name: "facetAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "facetAddress_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facetAddresses";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "facetAddresses_";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facet";
                    readonly type: "address";
                }];
                readonly name: "facetFunctionSelectors";
                readonly outputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_facetFunctionSelectors";
                    readonly type: "bytes4[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facets";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamondLoupe.Facet[]";
                    readonly name: "facets_";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotOwner";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "approved";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "Approval";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "operator";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bool";
                    readonly name: "approved";
                    readonly type: "bool";
                }];
                readonly name: "ApprovalForAll";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "ContractResolverAddressSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newFreeMintSigner";
                    readonly type: "address";
                }];
                readonly name: "FreeMintSignerSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint8";
                    readonly name: "version";
                    readonly type: "uint8";
                }];
                readonly name: "Initialized";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMintCost";
                    readonly type: "uint256";
                }];
                readonly name: "MintCostSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "pubkey";
                    readonly type: "bytes";
                }];
                readonly name: "PKPMinted";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "from";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "Transfer";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newTrustedForwarder";
                    readonly type: "address";
                }];
                readonly name: "TrustedForwarderSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "Withdrew";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "approve";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }];
                readonly name: "balanceOf";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "burn";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "keyType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "derivedKeyId";
                    readonly type: "bytes32";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "r";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "bytes32";
                        readonly name: "s";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "uint8";
                        readonly name: "v";
                        readonly type: "uint8";
                    }];
                    readonly internalType: "struct IPubkeyRouter.Signature[]";
                    readonly name: "signatures";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakingContractAddress";
                    readonly type: "address";
                }];
                readonly name: "claimAndMint";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "exists";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "freeMintSigner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getApproved";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getEthAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getNextDerivedKeyId";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "ethAddresses";
                    readonly type: "address[]";
                }];
                readonly name: "getPkpInfoFromEthAddresses";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "address";
                        readonly name: "ethAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibPubkeyRouterStorage.PkpInfo[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "pageSize";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "pageIndex";
                    readonly type: "uint256";
                }];
                readonly name: "getPkpInfoFromOwnerAddress";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "address";
                        readonly name: "ethAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibPubkeyRouterStorage.PkpInfo[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "pageSize";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "pageIndex";
                    readonly type: "uint256";
                }];
                readonly name: "getPkpInfoFromOwnerTokenId";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "address";
                        readonly name: "ethAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibPubkeyRouterStorage.PkpInfo[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "tokenIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "getPkpInfoFromTokenIds";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "pubkey";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "address";
                        readonly name: "ethAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibPubkeyRouterStorage.PkpInfo[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getPkpNftMetadataAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getPkpPermissionsAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getPubkey";
                readonly outputs: readonly [{
                    readonly internalType: "bytes";
                    readonly name: "";
                    readonly type: "bytes";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getRouterAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getStakingAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTrustedForwarder";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "initialize";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "operator";
                    readonly type: "address";
                }];
                readonly name: "isApprovedForAll";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "mintCost";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "keyType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "ipfsCID";
                    readonly type: "bytes";
                }];
                readonly name: "mintGrantAndBurnNext";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "keyType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }];
                readonly name: "mintNext";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "name";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "ownerOf";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "hash";
                    readonly type: "bytes32";
                }];
                readonly name: "prefixed";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "pure";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "redeemedFreeMintIds";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "from";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "safeTransferFrom";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "from";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }];
                readonly name: "safeTransferFrom";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "operator";
                    readonly type: "address";
                }, {
                    readonly internalType: "bool";
                    readonly name: "approved";
                    readonly type: "bool";
                }];
                readonly name: "setApprovalForAll";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "setContractResolver";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newFreeMintSigner";
                    readonly type: "address";
                }];
                readonly name: "setFreeMintSigner";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newMintCost";
                    readonly type: "uint256";
                }];
                readonly name: "setMintCost";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "forwarder";
                    readonly type: "address";
                }];
                readonly name: "setTrustedForwarder";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "symbol";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "index";
                    readonly type: "uint256";
                }];
                readonly name: "tokenByIndex";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "index";
                    readonly type: "uint256";
                }];
                readonly name: "tokenOfOwnerByIndex";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "tokenURI";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "totalSupply";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "from";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "transferFrom";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "withdraw";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "PKPHelper";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0x13428A18C0b181344F97ceaC5596F31a9d182e5c";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_resolver";
                    readonly type: "address";
                }, {
                    readonly internalType: "enum ContractResolver.Env";
                    readonly name: "_env";
                    readonly type: "uint8";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "constructor";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "ContractResolverAddressSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "previousAdminRole";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "newAdminRole";
                    readonly type: "bytes32";
                }];
                readonly name: "RoleAdminChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "RoleGranted";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "RoleRevoked";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "DEFAULT_ADMIN_ROLE";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes32";
                        readonly name: "derivedKeyId";
                        readonly type: "bytes32";
                    }, {
                        readonly components: readonly [{
                            readonly internalType: "bytes32";
                            readonly name: "r";
                            readonly type: "bytes32";
                        }, {
                            readonly internalType: "bytes32";
                            readonly name: "s";
                            readonly type: "bytes32";
                        }, {
                            readonly internalType: "uint8";
                            readonly name: "v";
                            readonly type: "uint8";
                        }];
                        readonly internalType: "struct IPubkeyRouter.Signature[]";
                        readonly name: "signatures";
                        readonly type: "tuple[]";
                    }];
                    readonly internalType: "struct LibPKPNFTStorage.ClaimMaterial";
                    readonly name: "claimMaterial";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedIpfsCIDs";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedIpfsCIDScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "permittedAddresses";
                        readonly type: "address[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedAddressScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "permittedAuthMethodTypes";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedAuthMethodIds";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedAuthMethodPubkeys";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedAuthMethodScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "addPkpEthAddressAsPermittedAddress";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "sendPkpToItself";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct PKPHelper.AuthMethodData";
                    readonly name: "authMethodData";
                    readonly type: "tuple";
                }];
                readonly name: "claimAndMintNextAndAddAuthMethods";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes32";
                        readonly name: "derivedKeyId";
                        readonly type: "bytes32";
                    }, {
                        readonly components: readonly [{
                            readonly internalType: "bytes32";
                            readonly name: "r";
                            readonly type: "bytes32";
                        }, {
                            readonly internalType: "bytes32";
                            readonly name: "s";
                            readonly type: "bytes32";
                        }, {
                            readonly internalType: "uint8";
                            readonly name: "v";
                            readonly type: "uint8";
                        }];
                        readonly internalType: "struct IPubkeyRouter.Signature[]";
                        readonly name: "signatures";
                        readonly type: "tuple[]";
                    }];
                    readonly internalType: "struct LibPKPNFTStorage.ClaimMaterial";
                    readonly name: "claimMaterial";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedIpfsCIDs";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedIpfsCIDScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "permittedAddresses";
                        readonly type: "address[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedAddressScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "permittedAuthMethodTypes";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedAuthMethodIds";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedAuthMethodPubkeys";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedAuthMethodScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "addPkpEthAddressAsPermittedAddress";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "sendPkpToItself";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct PKPHelper.AuthMethodData";
                    readonly name: "authMethodData";
                    readonly type: "tuple";
                }];
                readonly name: "claimAndMintNextAndAddAuthMethodsWithTypes";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "string";
                        readonly name: "keySetId";
                        readonly type: "string";
                    }, {
                        readonly internalType: "bytes32";
                        readonly name: "derivedKeyId";
                        readonly type: "bytes32";
                    }, {
                        readonly components: readonly [{
                            readonly internalType: "bytes32";
                            readonly name: "r";
                            readonly type: "bytes32";
                        }, {
                            readonly internalType: "bytes32";
                            readonly name: "s";
                            readonly type: "bytes32";
                        }, {
                            readonly internalType: "uint8";
                            readonly name: "v";
                            readonly type: "uint8";
                        }];
                        readonly internalType: "struct IPubkeyRouter.Signature[]";
                        readonly name: "signatures";
                        readonly type: "tuple[]";
                    }, {
                        readonly internalType: "address";
                        readonly name: "stakingContractAddress";
                        readonly type: "address";
                    }];
                    readonly internalType: "struct LibPKPNFTStorage.ClaimMaterialV2";
                    readonly name: "claimMaterial";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedIpfsCIDs";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedIpfsCIDScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "permittedAddresses";
                        readonly type: "address[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedAddressScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "permittedAuthMethodTypes";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedAuthMethodIds";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedAuthMethodPubkeys";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedAuthMethodScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "addPkpEthAddressAsPermittedAddress";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "sendPkpToItself";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct PKPHelper.AuthMethodData";
                    readonly name: "authMethodData";
                    readonly type: "tuple";
                }];
                readonly name: "claimAndMintNextAndAddAuthMethodsWithTypesV2";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "contractResolver";
                readonly outputs: readonly [{
                    readonly internalType: "contract ContractResolver";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "env";
                readonly outputs: readonly [{
                    readonly internalType: "enum ContractResolver.Env";
                    readonly name: "";
                    readonly type: "uint8";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getDomainWalletRegistry";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getPKPNftMetdataAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getPkpNftAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getPkpPermissionsAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }];
                readonly name: "getRoleAdmin";
                readonly outputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getStakingAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "grantRole";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "hasRole";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "keyType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "permittedAuthMethodTypes";
                    readonly type: "uint256[]";
                }, {
                    readonly internalType: "bytes[]";
                    readonly name: "permittedAuthMethodIds";
                    readonly type: "bytes[]";
                }, {
                    readonly internalType: "bytes[]";
                    readonly name: "permittedAuthMethodPubkeys";
                    readonly type: "bytes[]";
                }, {
                    readonly internalType: "uint256[][]";
                    readonly name: "permittedAuthMethodScopes";
                    readonly type: "uint256[][]";
                }, {
                    readonly internalType: "bool";
                    readonly name: "addPkpEthAddressAsPermittedAddress";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "sendPkpToItself";
                    readonly type: "bool";
                }];
                readonly name: "mintNextAndAddAuthMethods";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "keyType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "string";
                        readonly name: "keySetId";
                        readonly type: "string";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedIpfsCIDs";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedIpfsCIDScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "permittedAddresses";
                        readonly type: "address[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedAddressesScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "permittedAuthMethodTypes";
                        readonly type: "uint256[]";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedAuthMethodIds";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "bytes[]";
                        readonly name: "permittedAuthMethodPubkeys";
                        readonly type: "bytes[]";
                    }, {
                        readonly internalType: "uint256[][]";
                        readonly name: "permittedAuthMethodScopes";
                        readonly type: "uint256[][]";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "addPkpEthAddressAsPermittedAddress";
                        readonly type: "bool";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "sendPkpToItself";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct PKPHelper.MintNextAndAddAuthMethodsWithTypesParams";
                    readonly name: "params";
                    readonly type: "tuple";
                }];
                readonly name: "mintNextAndAddAuthMethodsWithTypes";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "keyType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "string";
                    readonly name: "keySetId";
                    readonly type: "string";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "permittedAuthMethodTypes";
                    readonly type: "uint256[]";
                }, {
                    readonly internalType: "bytes[]";
                    readonly name: "permittedAuthMethodIds";
                    readonly type: "bytes[]";
                }, {
                    readonly internalType: "bytes[]";
                    readonly name: "permittedAuthMethodPubkeys";
                    readonly type: "bytes[]";
                }, {
                    readonly internalType: "uint256[][]";
                    readonly name: "permittedAuthMethodScopes";
                    readonly type: "uint256[][]";
                }, {
                    readonly internalType: "string[]";
                    readonly name: "nftMetadata";
                    readonly type: "string[]";
                }, {
                    readonly internalType: "bool";
                    readonly name: "addPkpEthAddressAsPermittedAddress";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "sendPkpToItself";
                    readonly type: "bool";
                }];
                readonly name: "mintNextAndAddDomainWalletMetadata";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "";
                    readonly type: "bytes";
                }];
                readonly name: "onERC721Received";
                readonly outputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "";
                    readonly type: "bytes4";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "removePkpMetadata";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "renounceOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "renounceRole";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "role";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "revokeRole";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "setContractResolver";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "string[]";
                    readonly name: "nftMetadata";
                    readonly type: "string[]";
                }];
                readonly name: "setPkpMetadata";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "PKPPermissions";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0x7255737630fCFb4914cF51552123eEe9abEc6120";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotAddFunctionToDiamondThatAlreadyExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotAddSelectorsToZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveFunctionThatDoesNotExist";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionThatDoesNotExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotReplaceFunctionsFromFacetWithZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint8";
                    readonly name: "_action";
                    readonly type: "uint8";
                }];
                readonly name: "IncorrectFacetCutAction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_initializationContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "InitializationFunctionReverted";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_contractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "_message";
                    readonly type: "string";
                }];
                readonly name: "NoBytecodeAtAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "NoSelectorsProvidedForFacetForCut";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_user";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "_contractOwner";
                    readonly type: "address";
                }];
                readonly name: "NotContractOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "RemoveFacetAddressMustBeZeroAddress";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "DiamondCut";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "diamondCut";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_functionSelector";
                    readonly type: "bytes4";
                }];
                readonly name: "facetAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "facetAddress_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facetAddresses";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "facetAddresses_";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facet";
                    readonly type: "address";
                }];
                readonly name: "facetFunctionSelectors";
                readonly outputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_facetFunctionSelectors";
                    readonly type: "bytes4[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facets";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamondLoupe.Facet[]";
                    readonly name: "facets_";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotOwner";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "ContractResolverAddressSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "userPubkey";
                    readonly type: "bytes";
                }];
                readonly name: "PermittedAuthMethodAdded";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }];
                readonly name: "PermittedAuthMethodRemoved";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "scopeId";
                    readonly type: "uint256";
                }];
                readonly name: "PermittedAuthMethodScopeAdded";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "scopeId";
                    readonly type: "uint256";
                }];
                readonly name: "PermittedAuthMethodScopeRemoved";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly indexed: true;
                    readonly internalType: "uint256";
                    readonly name: "group";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes32";
                    readonly name: "root";
                    readonly type: "bytes32";
                }];
                readonly name: "RootHashUpdated";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newTrustedForwarder";
                    readonly type: "address";
                }];
                readonly name: "TrustedForwarderSet";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "ipfsCID";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "scopes";
                    readonly type: "uint256[]";
                }];
                readonly name: "addPermittedAction";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "scopes";
                    readonly type: "uint256[]";
                }];
                readonly name: "addPermittedAddress";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "authMethodType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "id";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "userPubkey";
                        readonly type: "bytes";
                    }];
                    readonly internalType: "struct LibPKPPermissionsStorage.AuthMethod";
                    readonly name: "authMethod";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "scopes";
                    readonly type: "uint256[]";
                }];
                readonly name: "addPermittedAuthMethod";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "scopeId";
                    readonly type: "uint256";
                }];
                readonly name: "addPermittedAuthMethodScope";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "permittedAuthMethodTypesToAdd";
                    readonly type: "uint256[]";
                }, {
                    readonly internalType: "bytes[]";
                    readonly name: "permittedAuthMethodIdsToAdd";
                    readonly type: "bytes[]";
                }, {
                    readonly internalType: "bytes[]";
                    readonly name: "permittedAuthMethodPubkeysToAdd";
                    readonly type: "bytes[]";
                }, {
                    readonly internalType: "uint256[][]";
                    readonly name: "permittedAuthMethodScopesToAdd";
                    readonly type: "uint256[][]";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "permittedAuthMethodTypesToRemove";
                    readonly type: "uint256[]";
                }, {
                    readonly internalType: "bytes[]";
                    readonly name: "permittedAuthMethodIdsToRemove";
                    readonly type: "bytes[]";
                }];
                readonly name: "batchAddRemoveAuthMethods";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }];
                readonly name: "getAuthMethodId";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "pure";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getEthAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }];
                readonly name: "getPKPPubKeysByAuthMethod";
                readonly outputs: readonly [{
                    readonly internalType: "bytes[]";
                    readonly name: "";
                    readonly type: "bytes[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getPermittedActions";
                readonly outputs: readonly [{
                    readonly internalType: "bytes[]";
                    readonly name: "";
                    readonly type: "bytes[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getPermittedAddresses";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxScopeId";
                    readonly type: "uint256";
                }];
                readonly name: "getPermittedAuthMethodScopes";
                readonly outputs: readonly [{
                    readonly internalType: "bool[]";
                    readonly name: "";
                    readonly type: "bool[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getPermittedAuthMethods";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "authMethodType";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "id";
                        readonly type: "bytes";
                    }, {
                        readonly internalType: "bytes";
                        readonly name: "userPubkey";
                        readonly type: "bytes";
                    }];
                    readonly internalType: "struct LibPKPPermissionsStorage.AuthMethod[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getPkpNftAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "getPubkey";
                readonly outputs: readonly [{
                    readonly internalType: "bytes";
                    readonly name: "";
                    readonly type: "bytes";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getRouterAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }];
                readonly name: "getTokenIdsForAuthMethod";
                readonly outputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTrustedForwarder";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }];
                readonly name: "getUserPubkeyForAuthMethod";
                readonly outputs: readonly [{
                    readonly internalType: "bytes";
                    readonly name: "";
                    readonly type: "bytes";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "ipfsCID";
                    readonly type: "bytes";
                }];
                readonly name: "isPermittedAction";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "isPermittedAddress";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }];
                readonly name: "isPermittedAuthMethod";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "scopeId";
                    readonly type: "uint256";
                }];
                readonly name: "isPermittedAuthMethodScopePresent";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "ipfsCID";
                    readonly type: "bytes";
                }];
                readonly name: "removePermittedAction";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "removePermittedAddress";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }];
                readonly name: "removePermittedAuthMethod";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "authMethodType";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "id";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "scopeId";
                    readonly type: "uint256";
                }];
                readonly name: "removePermittedAuthMethodScope";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "setContractResolver";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "group";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "root";
                    readonly type: "bytes32";
                }];
                readonly name: "setRootHash";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "forwarder";
                    readonly type: "address";
                }];
                readonly name: "setTrustedForwarder";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "group";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes32[]";
                    readonly name: "proof";
                    readonly type: "bytes32[]";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "leaf";
                    readonly type: "bytes32";
                }];
                readonly name: "verifyState";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "group";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes32[]";
                    readonly name: "proof";
                    readonly type: "bytes32[]";
                }, {
                    readonly internalType: "bool[]";
                    readonly name: "proofFlags";
                    readonly type: "bool[]";
                }, {
                    readonly internalType: "bytes32[]";
                    readonly name: "leaves";
                    readonly type: "bytes32[]";
                }];
                readonly name: "verifyStates";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "PKPNFTMetadata";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0xE77d6EBD151c02e05a4d9645f816F68f55730733";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_resolver";
                    readonly type: "address";
                }, {
                    readonly internalType: "enum ContractResolver.Env";
                    readonly name: "_env";
                    readonly type: "uint8";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "constructor";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes";
                    readonly name: "buffer";
                    readonly type: "bytes";
                }];
                readonly name: "bytesToHex";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "pure";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "contractResolver";
                readonly outputs: readonly [{
                    readonly internalType: "contract ContractResolver";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "env";
                readonly outputs: readonly [{
                    readonly internalType: "enum ContractResolver.Env";
                    readonly name: "";
                    readonly type: "uint8";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "removeProfileForPkp";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }];
                readonly name: "removeUrlForPKP";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "string";
                    readonly name: "imgUrl";
                    readonly type: "string";
                }];
                readonly name: "setProfileForPKP";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "string";
                    readonly name: "url";
                    readonly type: "string";
                }];
                readonly name: "setUrlForPKP";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "tokenId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "pubKey";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "address";
                    readonly name: "ethAddress";
                    readonly type: "address";
                }];
                readonly name: "tokenURI";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "Allowlist";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0x934d3190ff3A92eB1Cfb6CbD3617629322897969";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "constructor";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newAdmin";
                    readonly type: "address";
                }];
                readonly name: "AdminAdded";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newAdmin";
                    readonly type: "address";
                }];
                readonly name: "AdminRemoved";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "key";
                    readonly type: "bytes32";
                }];
                readonly name: "ItemAllowed";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "bytes32";
                    readonly name: "key";
                    readonly type: "bytes32";
                }];
                readonly name: "ItemNotAllowed";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newAdmin";
                    readonly type: "address";
                }];
                readonly name: "addAdmin";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "allowAll";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly name: "allowedItems";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "key";
                    readonly type: "bytes32";
                }];
                readonly name: "isAllowed";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newAdmin";
                    readonly type: "address";
                }];
                readonly name: "removeAdmin";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "renounceOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "_allowAll";
                    readonly type: "bool";
                }];
                readonly name: "setAllowAll";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "key";
                    readonly type: "bytes32";
                }];
                readonly name: "setAllowed";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "key";
                    readonly type: "bytes32";
                }];
                readonly name: "setNotAllowed";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "PaymentDelegation";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0xd1E59c174BcF85012c54086AB600Dd0aB032e88B";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotAddFunctionToDiamondThatAlreadyExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotAddSelectorsToZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveFunctionThatDoesNotExist";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionThatDoesNotExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotReplaceFunctionsFromFacetWithZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint8";
                    readonly name: "_action";
                    readonly type: "uint8";
                }];
                readonly name: "IncorrectFacetCutAction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_initializationContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "InitializationFunctionReverted";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_contractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "_message";
                    readonly type: "string";
                }];
                readonly name: "NoBytecodeAtAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "NoSelectorsProvidedForFacetForCut";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_user";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "_contractOwner";
                    readonly type: "address";
                }];
                readonly name: "NotContractOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "RemoveFacetAddressMustBeZeroAddress";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "DiamondCut";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "diamondCut";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_functionSelector";
                    readonly type: "bytes4";
                }];
                readonly name: "facetAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "facetAddress_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facetAddresses";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "facetAddresses_";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facet";
                    readonly type: "address";
                }];
                readonly name: "facetFunctionSelectors";
                readonly outputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_facetFunctionSelectors";
                    readonly type: "bytes4[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facets";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamondLoupe.Facet[]";
                    readonly name: "facets_";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "payer";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint128";
                        readonly name: "totalMaxPrice";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "requestsPerPeriod";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "periodSeconds";
                        readonly type: "uint256";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct LibPaymentDelegationStorage.Restriction";
                    readonly name: "restriction";
                    readonly type: "tuple";
                }];
                readonly name: "RestrictionSet";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "delegatePayments";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "users";
                    readonly type: "address[]";
                }];
                readonly name: "delegatePaymentsBatch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "getPayers";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "users";
                    readonly type: "address[]";
                }];
                readonly name: "getPayersAndRestrictions";
                readonly outputs: readonly [{
                    readonly internalType: "address[][]";
                    readonly name: "";
                    readonly type: "address[][]";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "uint128";
                        readonly name: "totalMaxPrice";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "requestsPerPeriod";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "periodSeconds";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPaymentDelegationStorage.Restriction[][]";
                    readonly name: "";
                    readonly type: "tuple[][]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "payer";
                    readonly type: "address";
                }];
                readonly name: "getRestriction";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint128";
                        readonly name: "totalMaxPrice";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "requestsPerPeriod";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "periodSeconds";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPaymentDelegationStorage.Restriction";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "payer";
                    readonly type: "address";
                }];
                readonly name: "getUsers";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint128";
                        readonly name: "totalMaxPrice";
                        readonly type: "uint128";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "requestsPerPeriod";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "periodSeconds";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPaymentDelegationStorage.Restriction";
                    readonly name: "r";
                    readonly type: "tuple";
                }];
                readonly name: "setRestriction";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "undelegatePayments";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "users";
                    readonly type: "address[]";
                }];
                readonly name: "undelegatePaymentsBatch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "Ledger";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0xbA0aEB6Bbf58F1B74E896416A20DB5be51C991f2";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotAddFunctionToDiamondThatAlreadyExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotAddSelectorsToZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveFunctionThatDoesNotExist";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionThatDoesNotExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotReplaceFunctionsFromFacetWithZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint8";
                    readonly name: "_action";
                    readonly type: "uint8";
                }];
                readonly name: "IncorrectFacetCutAction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_initializationContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "InitializationFunctionReverted";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_contractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "_message";
                    readonly type: "string";
                }];
                readonly name: "NoBytecodeAtAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "NoSelectorsProvidedForFacetForCut";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_user";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "_contractOwner";
                    readonly type: "address";
                }];
                readonly name: "NotContractOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "RemoveFacetAddressMustBeZeroAddress";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "DiamondCut";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "diamondCut";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_functionSelector";
                    readonly type: "bytes4";
                }];
                readonly name: "facetAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "facetAddress_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facetAddresses";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "facetAddresses_";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facet";
                    readonly type: "address";
                }];
                readonly name: "facetFunctionSelectors";
                readonly outputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_facetFunctionSelectors";
                    readonly type: "bytes4[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facets";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamondLoupe.Facet[]";
                    readonly name: "facets_";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "AmountMustBePositive";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "ArrayLengthsMustMatch";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "InsufficientFunds";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "InsufficientWithdrawAmount";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "MustBeNonzero";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "NodeNotStakingNode";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "PercentageMustBeLessThan100";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "SessionAlreadyUsed";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "ValueExceedsUint128MaxLimit";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "WithdrawalDelayNotPassed";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "node_address";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "batch_id";
                    readonly type: "uint256";
                }];
                readonly name: "BatchCharged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "Deposit";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "depositor";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "DepositForUser";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "FoundationRewardsWithdrawn";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "percentage";
                    readonly type: "uint256";
                }];
                readonly name: "LitFoundationSplitPercentageSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "RewardWithdraw";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "delay";
                    readonly type: "uint256";
                }];
                readonly name: "RewardWithdrawDelaySet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "RewardWithdrawRequest";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newTrustedForwarder";
                    readonly type: "address";
                }];
                readonly name: "TrustedForwarderSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "int256";
                    readonly name: "amount";
                    readonly type: "int256";
                }];
                readonly name: "UserCharged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "delay";
                    readonly type: "uint256";
                }];
                readonly name: "UserWithdrawDelaySet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "int256";
                    readonly name: "amount";
                    readonly type: "int256";
                }];
                readonly name: "Withdraw";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "int256";
                    readonly name: "amount";
                    readonly type: "int256";
                }];
                readonly name: "WithdrawRequest";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "balance";
                readonly outputs: readonly [{
                    readonly internalType: "int256";
                    readonly name: "";
                    readonly type: "int256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }, {
                    readonly internalType: "int256";
                    readonly name: "amount";
                    readonly type: "int256";
                }];
                readonly name: "chargeUser";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "users";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "int256[]";
                    readonly name: "amounts";
                    readonly type: "int256[]";
                }, {
                    readonly internalType: "uint64";
                    readonly name: "batchId";
                    readonly type: "uint64";
                }];
                readonly name: "chargeUsers";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "deposit";
                readonly outputs: readonly [];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "depositForUser";
                readonly outputs: readonly [];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getStakingAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTrustedForwarder";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "latestRewardWithdrawRequest";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "timestamp";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "amount";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibLedgerStorage.WithdrawRequest";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "latestWithdrawRequest";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "timestamp";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "amount";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibLedgerStorage.WithdrawRequest";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "litFoundationRewards";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "litFoundationSplitPercentage";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "requestRewardWithdraw";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "int256";
                    readonly name: "amount";
                    readonly type: "int256";
                }];
                readonly name: "requestWithdraw";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "rewardBalance";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "rewardWithdrawDelay";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "percentage";
                    readonly type: "uint256";
                }];
                readonly name: "setLitFoundationSplitPercentage";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "delay";
                    readonly type: "uint256";
                }];
                readonly name: "setRewardWithdrawDelay";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "forwarder";
                    readonly type: "address";
                }];
                readonly name: "setTrustedForwarder";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "delay";
                    readonly type: "uint256";
                }];
                readonly name: "setUserWithdrawDelay";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "user";
                    readonly type: "address";
                }];
                readonly name: "stableBalance";
                readonly outputs: readonly [{
                    readonly internalType: "int256";
                    readonly name: "";
                    readonly type: "int256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "userWithdrawDelay";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "int256";
                    readonly name: "amount";
                    readonly type: "int256";
                }];
                readonly name: "withdraw";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "withdrawFoundationRewards";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "withdrawRewards";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "PriceFeed";
        readonly contracts: readonly [{
            readonly network: "naga-test";
            readonly address_hash: "0x556955025dD0981Bac684fbDEcE14cDa897d0837";
            readonly inserted_at: "2025-10-30T16:03:28Z";
            readonly ABI: readonly [{
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotAddFunctionToDiamondThatAlreadyExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotAddSelectorsToZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveFunctionThatDoesNotExist";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotRemoveImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionThatDoesNotExists";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_selectors";
                    readonly type: "bytes4[]";
                }];
                readonly name: "CannotReplaceFunctionsFromFacetWithZeroAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_selector";
                    readonly type: "bytes4";
                }];
                readonly name: "CannotReplaceImmutableFunction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint8";
                    readonly name: "_action";
                    readonly type: "uint8";
                }];
                readonly name: "IncorrectFacetCutAction";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_initializationContractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "InitializationFunctionReverted";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_contractAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "string";
                    readonly name: "_message";
                    readonly type: "string";
                }];
                readonly name: "NoBytecodeAtAddress";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "NoSelectorsProvidedForFacetForCut";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_user";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "_contractOwner";
                    readonly type: "address";
                }];
                readonly name: "NotContractOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facetAddress";
                    readonly type: "address";
                }];
                readonly name: "RemoveFacetAddressMustBeZeroAddress";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "DiamondCut";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "enum IDiamond.FacetCutAction";
                        readonly name: "action";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamond.FacetCut[]";
                    readonly name: "_diamondCut";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "_init";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "_calldata";
                    readonly type: "bytes";
                }];
                readonly name: "diamondCut";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_functionSelector";
                    readonly type: "bytes4";
                }];
                readonly name: "facetAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "facetAddress_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facetAddresses";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "facetAddresses_";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_facet";
                    readonly type: "address";
                }];
                readonly name: "facetFunctionSelectors";
                readonly outputs: readonly [{
                    readonly internalType: "bytes4[]";
                    readonly name: "_facetFunctionSelectors";
                    readonly type: "bytes4[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "facets";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "facetAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "bytes4[]";
                        readonly name: "functionSelectors";
                        readonly type: "bytes4[]";
                    }];
                    readonly internalType: "struct IDiamondLoupe.Facet[]";
                    readonly name: "facets_";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bytes4";
                    readonly name: "_interfaceId";
                    readonly type: "bytes4";
                }];
                readonly name: "supportsInterface";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "previousOwner";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "newOwner";
                    readonly type: "address";
                }];
                readonly name: "OwnershipTransferred";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "owner";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "owner_";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "_newOwner";
                    readonly type: "address";
                }];
                readonly name: "transferOwnership";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "MustBeNonzero";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newPrice";
                    readonly type: "uint256";
                }];
                readonly name: "BaseNetworkPriceSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newPrice";
                    readonly type: "uint256";
                }];
                readonly name: "MaxNetworkPriceSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newTrustedForwarder";
                    readonly type: "address";
                }];
                readonly name: "TrustedForwarderSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "stakingAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "usagePercent";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256[]";
                    readonly name: "newPrices";
                    readonly type: "uint256[]";
                }];
                readonly name: "UsageSet";
                readonly type: "event";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "productIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "baseNetworkPrices";
                readonly outputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getLitActionPriceConfigs";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "enum LibPriceFeedStorage.LitActionPriceComponent";
                        readonly name: "priceComponent";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "enum LibPriceFeedStorage.NodePriceMeasurement";
                        readonly name: "priceMeasurement";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "price";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPriceFeedStorage.LitActionPriceConfig[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getNodeCapacityConfig";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "pkpSignMaxConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "encSignMaxConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "litActionMaxConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "signSessionKeyMaxConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "globalMaxCapacity";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPriceFeedStorage.NodeCapacityConfig";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "realmId";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "productIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "getNodesForRequest";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly components: readonly [{
                            readonly internalType: "uint32";
                            readonly name: "ip";
                            readonly type: "uint32";
                        }, {
                            readonly internalType: "uint128";
                            readonly name: "ipv6";
                            readonly type: "uint128";
                        }, {
                            readonly internalType: "uint32";
                            readonly name: "port";
                            readonly type: "uint32";
                        }, {
                            readonly internalType: "address";
                            readonly name: "nodeAddress";
                            readonly type: "address";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "reward";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "senderPubKey";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "receiverPubKey";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "lastActiveEpoch";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "commissionRate";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "lastRewardEpoch";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "lastRealmId";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "delegatedStakeAmount";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "delegatedStakeWeight";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "lastRewardEpochClaimedFixedCostRewards";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "lastRewardEpochClaimedCommission";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "address";
                            readonly name: "operatorAddress";
                            readonly type: "address";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "uniqueDelegatingStakerCount";
                            readonly type: "uint256";
                        }, {
                            readonly internalType: "bool";
                            readonly name: "registerAttestedWalletDisabled";
                            readonly type: "bool";
                        }];
                        readonly internalType: "struct LibStakingStorage.Validator";
                        readonly name: "validator";
                        readonly type: "tuple";
                    }, {
                        readonly internalType: "uint256[]";
                        readonly name: "prices";
                        readonly type: "uint256[]";
                    }];
                    readonly internalType: "struct LibPriceFeedStorage.NodeInfoAndPrices[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getStakingAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTrustedForwarder";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "productIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "maxNetworkPrices";
                readonly outputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "node";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "productIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "price";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "stakerAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "price";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "productId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timestamp";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPriceFeedStorage.NodePriceData[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "productId";
                    readonly type: "uint256";
                }];
                readonly name: "prices";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "stakerAddress";
                        readonly type: "address";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "price";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "productId";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "timestamp";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPriceFeedStorage.NodePriceData[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newPrice";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "productIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "setBaseNetworkPrices";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "enum LibPriceFeedStorage.LitActionPriceComponent";
                    readonly name: "priceComponent";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "enum LibPriceFeedStorage.NodePriceMeasurement";
                    readonly name: "priceMeasurement";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "new_price";
                    readonly type: "uint256";
                }];
                readonly name: "setLitActionPriceConfig";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "enum LibPriceFeedStorage.LitActionPriceComponent";
                        readonly name: "priceComponent";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "enum LibPriceFeedStorage.NodePriceMeasurement";
                        readonly name: "priceMeasurement";
                        readonly type: "uint8";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "price";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPriceFeedStorage.LitActionPriceConfig[]";
                    readonly name: "configs";
                    readonly type: "tuple[]";
                }];
                readonly name: "setLitActionPriceConfigs";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newPrice";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "productIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "setMaxNetworkPrices";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "pkpSignMaxConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "encSignMaxConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "litActionMaxConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "signSessionKeyMaxConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "globalMaxCapacity";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibPriceFeedStorage.NodeCapacityConfig";
                    readonly name: "config";
                    readonly type: "tuple";
                }];
                readonly name: "setNodeCapacityConfig";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "forwarder";
                    readonly type: "address";
                }];
                readonly name: "setTrustedForwarder";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "usagePercent";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "productIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "setUsage";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "usagePercent";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "productId";
                    readonly type: "uint256";
                }];
                readonly name: "usagePercentToPrice";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "usagePercent";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256[]";
                    readonly name: "productIds";
                    readonly type: "uint256[]";
                }];
                readonly name: "usagePercentToPrices";
                readonly outputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }];
        }];
    }];
    readonly config: {
        readonly chainId: "175188";
        readonly rpcUrl: "https://yellowstone-rpc.litprotocol.com";
        readonly chainName: "yellowstone";
        readonly litNodeDomainName: "127.0.0.1";
        readonly litNodePort: 7470;
        readonly rocketPort: 7470;
    };
};
