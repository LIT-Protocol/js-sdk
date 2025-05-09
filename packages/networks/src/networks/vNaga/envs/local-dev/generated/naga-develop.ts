/**
 * Generated Contract Method Signatures for naga-develop
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

export const signatures = {
  "PKPHelper": {
    "address": "0x04C89607413713Ec9775E14b954286519d836FEf",
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
  "PKPNFT": {
    "address": "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
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
  "PKPPermissions": {
    "address": "0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6",
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
  "PubkeyRouter": {
    "address": "0x809d550fca64d94Bd9F66E60752A544199cfAC3D",
    "methods": {
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
      },
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
  "Staking": {
    "address": "0x9E545E3C0baAB3E08CdfD552C960A1050f373042",
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
            "name": "tokenRewardPerTokenPerEpoch",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256[]",
            "name": "keyTypes",
            "type": "uint256[]"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "minimumValidatorCount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "rewardEpochDuration",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "maxTimeLock",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "minTimeLock",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bmin",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bmax",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "k",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "p",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "enableStakeAutolock",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "permittedStakersOn",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "tokenPrice",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "profitMultiplier",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "usdCostPerMonth",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "maxEmissionRate",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "minStakeAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "maxStakeAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "minSelfStake",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "minSelfStakeTimelock",
            "type": "uint256"
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
        "name": "RealmConfigSet",
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
            "indexed": true,
            "internalType": "uint256",
            "name": "attestedPubKey",
            "type": "uint256"
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
  "PriceFeed": {
    "address": "0xf953b3A269d80e3eB0F2947630Da976B896A8C5b",
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
} as const;
export type Signatures = typeof signatures;
