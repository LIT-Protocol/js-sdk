export const pkpNftMetadata = {
  "address": "0x46c568B561Cde9ded66Be7d8044C141481c74d0f",
  "abi": [
    {
      "inputs": [],
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
      "stateMutability": "pure",
      "type": "function"
    }
  ]
}