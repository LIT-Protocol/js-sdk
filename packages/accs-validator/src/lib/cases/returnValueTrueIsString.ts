// https://developer.litprotocol.com/docs/AccessControlConditions/EVM/basicExamples
// TODO: Fail case: add one extra property
// TODO: Fail case: miss one property
export default [
    {
      "contractAddress": "0x093d00c17dA59Ec0Bf265Aad61424360aE055f30",
      "functionName": "ownerOfBlock",
      "functionParams": [
        "0x1327aa70c020b4e34a7a271e594b4f02238ab1ab24de5ae51e8b13204e375010",
        ":userAddress"
      ],
      "functionAbi": {
        "name": "ownerOfBlock",
        "inputs": [
          {
            "name": "cid",
            "type": "bytes32"
          },
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "constant": "false",
        "stateMutability": "view",
        "type": "function"
      },
      "chain": "mumbai",
      "returnValueTest": {
        "comparator": "=",
        "value": "true"
      }
    }
  ]