export const pkpPermissions = {
  "address": "0x4Aed2F242E806c58758677059340e29E6B5b7619",
  "abi": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_pkpNft",
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
          "internalType": "struct PKPPermissions.AuthMethod",
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
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "authMethods",
      "outputs": [
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
          "internalType": "struct PKPPermissions.AuthMethod[]",
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
      "name": "pkpNFT",
      "outputs": [
        {
          "internalType": "contract PKPNFT",
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
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newPkpNftAddress",
          "type": "address"
        }
      ],
      "name": "setPkpNftAddress",
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