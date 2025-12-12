export declare const datilTest: {
    readonly data: readonly [{
        readonly name: "StakingBalances";
        readonly contracts: readonly [{
            readonly network: "datil-test";
            readonly address_hash: "0xCa3c64e7D8cA743aeD2B2d20DCA3233f400710E2";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
                readonly name: "ActiveValidatorsCannotLeave";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "aliasAccount";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "AliasNotOwnedBySender";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CallerNotOwner";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "aliasAccount";
                    readonly type: "address";
                }];
                readonly name: "CannotRemoveAliasOfActiveValidator";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotStakeZero";
                readonly type: "error";
            }, {
                readonly inputs: readonly [];
                readonly name: "CannotWithdrawZero";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "aliasCount";
                    readonly type: "uint256";
                }];
                readonly name: "MaxAliasCountReached";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "OnlyStakingContract";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amountStaked";
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
                    readonly name: "amountStaked";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maximumStake";
                    readonly type: "uint256";
                }];
                readonly name: "StakeMustBeLessThanMaximumStake";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "StakerNotPermitted";
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
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "aliasAccount";
                    readonly type: "address";
                }];
                readonly name: "AliasAdded";
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
                    readonly internalType: "address";
                    readonly name: "aliasAccount";
                    readonly type: "address";
                }];
                readonly name: "AliasRemoved";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMaxAliasCount";
                    readonly type: "uint256";
                }];
                readonly name: "MaxAliasCountSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMaximumStake";
                    readonly type: "uint256";
                }];
                readonly name: "MaximumStakeSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMinimumStake";
                    readonly type: "uint256";
                }];
                readonly name: "MinimumStakeSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "PermittedStakerAdded";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "PermittedStakerRemoved";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "bool";
                    readonly name: "permittedStakersOn";
                    readonly type: "bool";
                }];
                readonly name: "PermittedStakersOnChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "address";
                    readonly name: "newResolverAddress";
                    readonly type: "address";
                }];
                readonly name: "ResolverContractAddressSet";
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
                    readonly name: "reward";
                    readonly type: "uint256";
                }];
                readonly name: "RewardPaid";
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
                    readonly internalType: "uint256";
                    readonly name: "newTokenRewardPerTokenPerEpoch";
                    readonly type: "uint256";
                }];
                readonly name: "TokenRewardPerTokenPerEpochSet";
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
                    readonly internalType: "address";
                    readonly name: "aliasAccount";
                    readonly type: "address";
                }];
                readonly name: "ValidatorNotRewardedBecauseAlias";
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
                readonly name: "ValidatorRewarded";
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
                readonly name: "ValidatorTokensPenalized";
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
                    readonly name: "aliasAccount";
                    readonly type: "address";
                }];
                readonly name: "addAlias";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "addPermittedStaker";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "stakers";
                    readonly type: "address[]";
                }];
                readonly name: "addPermittedStakers";
                readonly outputs: readonly [];
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
                    readonly internalType: "address";
                    readonly name: "account";
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
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "getReward";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
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
                readonly name: "getTokenAddress";
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
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "isPermittedStaker";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "maximumStake";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "minimumStake";
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
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "penalizeTokens";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "permittedStakersOn";
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
                    readonly name: "aliasAccount";
                    readonly type: "address";
                }];
                readonly name: "removeAlias";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "removePermittedStaker";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "balance";
                    readonly type: "uint256";
                }];
                readonly name: "restakePenaltyTokens";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "rewardOf";
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
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "rewardValidator";
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
                    readonly name: "newMaxAliasCount";
                    readonly type: "uint256";
                }];
                readonly name: "setMaxAliasCount";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newMaximumStake";
                    readonly type: "uint256";
                }];
                readonly name: "setMaximumStake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newMinimumStake";
                    readonly type: "uint256";
                }];
                readonly name: "setMinimumStake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "permitted";
                    readonly type: "bool";
                }];
                readonly name: "setPermittedStakersOn";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "stake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "stakeForValidator";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "totalStaked";
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
                    readonly name: "balance";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "recipient";
                    readonly type: "address";
                }];
                readonly name: "transferPenaltyTokens";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "withdraw";
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
                    readonly internalType: "uint256";
                    readonly name: "balance";
                    readonly type: "uint256";
                }];
                readonly name: "withdrawPenaltyTokens";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "Staking";
        readonly contracts: readonly [{
            readonly network: "datil-test";
            readonly address_hash: "0xdec37933239846834b3BfD408913Ed3dbEf6588F";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
                readonly name: "CallerNotOwnerOrDevopsAdmin";
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
                readonly name: "MustBeInNextValidatorSetLockedOrReadyForNextEpochState";
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
                    readonly name: "newMaxTripleCount";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMinTripleCount";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newPeerCheckingIntervalSecs";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newMaxTripleConcurrency";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bool";
                    readonly name: "newRpcHealthcheckEnabled";
                    readonly type: "bool";
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
                    }];
                    readonly indexed: false;
                    readonly internalType: "struct LibStakingStorage.LitActionConfig";
                    readonly name: "newLitActionConfig";
                    readonly type: "tuple";
                }, {
                    readonly indexed: false;
                    readonly internalType: "bool";
                    readonly name: "newHeliosEnabled";
                    readonly type: "bool";
                }];
                readonly name: "ConfigSet";
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
                    readonly name: "newStakingTokenAddress";
                    readonly type: "address";
                }];
                readonly name: "StakingTokenSet";
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
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }];
                readonly name: "adminRejoinValidator";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "adminResetEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorStakerAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amountToPenalize";
                    readonly type: "uint256";
                }];
                readonly name: "adminSlashValidator";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "staker";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "adminStakeForValidator";
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
                        readonly internalType: "uint256";
                        readonly name: "DEPRECATED_complaintTolerance";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "DEPRECATED_complaintIntervalSecs";
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
                        readonly name: "maxConcurrentRequests";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxTripleCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minTripleCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "peerCheckingIntervalSecs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxTripleConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "rpcHealthcheckEnabled";
                        readonly type: "bool";
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
                        }];
                        readonly internalType: "struct LibStakingStorage.LitActionConfig";
                        readonly name: "litActionConfig";
                        readonly type: "tuple";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "heliosEnabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Config";
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
                    readonly name: "newEpochLength";
                    readonly type: "uint256";
                }];
                readonly name: "setEpochLength";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
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
                    readonly name: "reason";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "newKickPenaltyPercent";
                    readonly type: "uint256";
                }];
                readonly name: "setKickPenaltyPercent";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
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
                readonly inputs: readonly [];
                readonly name: "CannotStakeZero";
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
                    readonly name: "stakerAddress";
                    readonly type: "address";
                }];
                readonly name: "StakerNotPermitted";
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
                }, {
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "amountBurned";
                    readonly type: "uint256";
                }];
                readonly name: "ValidatorKickedFromNextEpoch";
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
                    readonly name: "validatorStakerAddress";
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
                readonly inputs: readonly [];
                readonly name: "advanceEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "exit";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getReward";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "validatorStakerAddress";
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
                readonly inputs: readonly [];
                readonly name: "lockValidatorsForNextEpoch";
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
                    readonly name: "nodeAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "senderPubKey";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "receiverPubKey";
                    readonly type: "uint256";
                }];
                readonly name: "requestToJoin";
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
                readonly inputs: readonly [];
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
                    readonly name: "nodeAddress";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "senderPubKey";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "receiverPubKey";
                    readonly type: "uint256";
                }];
                readonly name: "setIpPortNodeAddressAndCommunicationPubKeys";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "epochNumber";
                    readonly type: "uint256";
                }];
                readonly name: "signalReadyForNextEpoch";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "stake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }, {
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
                    readonly name: "senderPubKey";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "receiverPubKey";
                    readonly type: "uint256";
                }];
                readonly name: "stakeAndJoin";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "amount";
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
                    readonly internalType: "uint256";
                    readonly name: "index";
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
                readonly inputs: readonly [];
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
                readonly inputs: readonly [];
                readonly name: "getMaxVersionString";
                readonly outputs: readonly [{
                    readonly internalType: "string";
                    readonly name: "";
                    readonly type: "string";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                readonly inputs: readonly [];
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
                    }];
                    readonly internalType: "struct LibStakingStorage.ComplaintConfig";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "config";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "tokenRewardPerTokenPerEpoch";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "DEPRECATED_complaintTolerance";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "DEPRECATED_complaintIntervalSecs";
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
                        readonly name: "maxConcurrentRequests";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxTripleCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "minTripleCount";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "peerCheckingIntervalSecs";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "maxTripleConcurrency";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "rpcHealthcheckEnabled";
                        readonly type: "bool";
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
                        }];
                        readonly internalType: "struct LibStakingStorage.LitActionConfig";
                        readonly name: "litActionConfig";
                        readonly type: "tuple";
                    }, {
                        readonly internalType: "bool";
                        readonly name: "heliosEnabled";
                        readonly type: "bool";
                    }];
                    readonly internalType: "struct LibStakingStorage.Config";
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
                readonly inputs: readonly [];
                readonly name: "countOfCurrentValidatorsReadyForNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "countOfNextValidatorsReadyForNextEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "currentValidatorCountForConsensus";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                    }];
                    readonly internalType: "struct LibStakingStorage.Epoch";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                readonly name: "getKeyTypes";
                readonly outputs: readonly [{
                    readonly internalType: "uint256[]";
                    readonly name: "";
                    readonly type: "uint256[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                readonly inputs: readonly [];
                readonly name: "getStakingBalancesAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getTokenAddress";
                readonly outputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getValidatorsInCurrentEpoch";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getValidatorsInCurrentEpochLength";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                    readonly name: "addresses";
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
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                    }];
                    readonly internalType: "struct LibStakingStorage.Validator[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
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
                    readonly name: "epochNumber";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "address";
                    readonly name: "validatorStakerAddress";
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
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "account";
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
                readonly inputs: readonly [];
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
                readonly inputs: readonly [];
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
                readonly inputs: readonly [];
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
        readonly name: "CloneNet";
        readonly contracts: readonly [{
            readonly network: "datil-test";
            readonly address_hash: "0x1f4233b6C5b84978c458FA66412E4ae6d0561104";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
                    readonly internalType: "address";
                    readonly name: "stakingContractAddress";
                    readonly type: "address";
                }];
                readonly name: "adminAddActiveStakingContract";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingContractAddress";
                    readonly type: "address";
                }];
                readonly name: "adminRemoveActiveStakingContract";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getActiveStakingContracts";
                readonly outputs: readonly [{
                    readonly internalType: "address[]";
                    readonly name: "";
                    readonly type: "address[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "getAllActiveUnkickedValidatorStructsAndCounts";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "address";
                        readonly name: "stakingContractAddress";
                        readonly type: "address";
                    }, {
                        readonly components: readonly [{
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
                            }];
                            readonly internalType: "struct LibStakingStorage.Epoch";
                            readonly name: "epoch";
                            readonly type: "tuple";
                        }, {
                            readonly internalType: "uint256";
                            readonly name: "currentValidatorCountForConsensus";
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
                            }];
                            readonly internalType: "struct LibStakingStorage.Validator[]";
                            readonly name: "activeUnkickedValidators";
                            readonly type: "tuple[]";
                        }];
                        readonly internalType: "struct LibStakingStorage.StakingAggregateDetails";
                        readonly name: "details";
                        readonly type: "tuple";
                    }];
                    readonly internalType: "struct LibStakingStorage.KeyedStakingAggregateDetails[]";
                    readonly name: "";
                    readonly type: "tuple[]";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "numActiveStakingContracts";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "Multisender";
        readonly contracts: readonly [{
            readonly network: "datil-test";
            readonly address_hash: "0x8281f3A62f7de320B3a634e6814BeC36a1AA92bd";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
            readonly network: "datil-test";
            readonly address_hash: "0xFA1208f5275a01Be1b4A6F6764d388FDcF5Bf85e";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
            readonly network: "datil-test";
            readonly address_hash: "0x65C3d057aef28175AfaC61a74cc6b27E88405583";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
                readonly inputs: readonly [{
                    readonly internalType: "address";
                    readonly name: "stakingContract";
                    readonly type: "address";
                }];
                readonly name: "adminResetRootKeys";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
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
                }, {
                    readonly internalType: "address";
                    readonly name: "stakingContractAddress";
                    readonly type: "address";
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
                    readonly name: "stakingContractAddress";
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
            readonly network: "datil-test";
            readonly address_hash: "0x6a0f439f064B7167A8Ea6B22AcC07ae5360ee0d1";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
        readonly name: "RateLimitNFT";
        readonly contracts: readonly [{
            readonly network: "datil-test";
            readonly address_hash: "0xa17f11B7f828EEc97926E56D98D5AB63A0231b77";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newAdditionalRequestsPerKilosecondCost";
                    readonly type: "uint256";
                }];
                readonly name: "AdditionalRequestsPerKilosecondCostSet";
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
                    readonly internalType: "uint256";
                    readonly name: "newFreeRequestsPerRateLimitWindow";
                    readonly type: "uint256";
                }];
                readonly name: "FreeRequestsPerRateLimitWindowSet";
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
                    readonly name: "newRLIHolderRateLimitWindowSeconds";
                    readonly type: "uint256";
                }];
                readonly name: "RLIHolderRateLimitWindowSecondsSet";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: false;
                    readonly internalType: "uint256";
                    readonly name: "newRateLimitWindowSeconds";
                    readonly type: "uint256";
                }];
                readonly name: "RateLimitWindowSecondsSet";
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
                    readonly name: "expiresAt";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "requestsPerKilosecond";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "msgHash";
                    readonly type: "bytes32";
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
                    readonly name: "sVal";
                    readonly type: "bytes32";
                }];
                readonly name: "freeMint";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "nonpayable";
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
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "expiresAt";
                    readonly type: "uint256";
                }];
                readonly name: "mint";
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
                    readonly internalType: "address";
                    readonly name: "owner";
                    readonly type: "address";
                }];
                readonly name: "pruneExpired";
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
                    readonly internalType: "uint256";
                    readonly name: "newAdditionalRequestsPerKilosecondCost";
                    readonly type: "uint256";
                }];
                readonly name: "setAdditionalRequestsPerKilosecondCost";
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
                    readonly name: "newFreeRequestsPerRateLimitWindow";
                    readonly type: "uint256";
                }];
                readonly name: "setFreeRequestsPerRateLimitWindow";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newMaxExpirationSeconds";
                    readonly type: "uint256";
                }];
                readonly name: "setMaxExpirationSeconds";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newMaxRequestsPerKilosecond";
                    readonly type: "uint256";
                }];
                readonly name: "setMaxRequestsPerKilosecond";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newRLIHolderRateLimitWindowSeconds";
                    readonly type: "uint256";
                }];
                readonly name: "setRLIHolderRateLimitWindowSeconds";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "newRateLimitWindowSeconds";
                    readonly type: "uint256";
                }];
                readonly name: "setRateLimitWindowSeconds";
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
            }, {
                readonly inputs: readonly [];
                readonly name: "RLIHolderRateLimitWindowSeconds";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "additionalRequestsPerKilosecondCost";
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
                    readonly name: "requestsPerKilosecond";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expiresAt";
                    readonly type: "uint256";
                }];
                readonly name: "calculateCost";
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
                    readonly name: "payingAmount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expiresAt";
                    readonly type: "uint256";
                }];
                readonly name: "calculateRequestsPerKilosecond";
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
                readonly name: "capacity";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly internalType: "uint256";
                        readonly name: "requestsPerKilosecond";
                        readonly type: "uint256";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "expiresAt";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct LibRateLimitNFTStorage.RateLimit";
                    readonly name: "";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "requestedRequestsPerKilosecond";
                    readonly type: "uint256";
                }];
                readonly name: "checkBelowMaxRequestsPerKilosecond";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "currentSoldRequestsPerKilosecond";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "defaultRateLimitWindowSeconds";
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
                    readonly name: "expiresAt";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "requestsPerKilosecond";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes32";
                    readonly name: "msgHash";
                    readonly type: "bytes32";
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
                    readonly name: "sVal";
                    readonly type: "bytes32";
                }];
                readonly name: "freeMintSigTest";
                readonly outputs: readonly [];
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
                readonly inputs: readonly [];
                readonly name: "freeRequestsPerRateLimitWindow";
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
                readonly name: "isExpired";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "maxExpirationSeconds";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "maxRequestsPerKilosecond";
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
                    readonly internalType: "bytes32";
                    readonly name: "msgHash";
                    readonly type: "bytes32";
                }];
                readonly name: "redeemedFreeMints";
                readonly outputs: readonly [{
                    readonly internalType: "bool";
                    readonly name: "";
                    readonly type: "bool";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "tokenIdCounter";
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
                readonly name: "tokenSVG";
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
                    readonly name: "expiresAt";
                    readonly type: "uint256";
                }];
                readonly name: "totalSoldRequestsPerKilosecondByExpirationTime";
                readonly outputs: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }];
        }];
    }, {
        readonly name: "PKPHelper";
        readonly contracts: readonly [{
            readonly network: "datil-test";
            readonly address_hash: "0x7E209fDFBBEe26Df3363354BC55C2Cc89DD030a9";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
            readonly network: "datil-test";
            readonly address_hash: "0x60C1ddC8b9e38F730F0e7B70A2F84C1A98A69167";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
            readonly network: "datil-test";
            readonly address_hash: "0xaC1d01692EBA0E457134Eb7EB8bb96ee9D91FcdD";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
            readonly network: "datil-test";
            readonly address_hash: "0x5DD7a0FD581aB11a5720bE7E388e63346bC266fe";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
            readonly network: "datil-test";
            readonly address_hash: "0xd7188e0348F1dA8c9b3d6e614844cbA22329B99E";
            readonly inserted_at: "2025-09-15T23:45:01Z";
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
                readonly inputs: readonly [];
                readonly name: "setDefaultRestriction";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
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
