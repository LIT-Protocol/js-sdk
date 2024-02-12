import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import { StakingStates } from '@lit-protocol/constants';

export async function main() {
  // ==================== Test Logic ====================
  const RESOLVER_ABI = [
    {
      inputs: [
        {
          internalType: 'enum ContractResolver.Env',
          name: 'env',
          type: 'uint8',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [],
      name: 'AdminRoleRequired',
      type: 'error',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'enum ContractResolver.Env',
          name: 'env',
          type: 'uint8',
        },
      ],
      name: 'AllowedEnvAdded',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'enum ContractResolver.Env',
          name: 'env',
          type: 'uint8',
        },
      ],
      name: 'AllowedEnvRemoved',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32',
        },
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'previousAdminRole',
          type: 'bytes32',
        },
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'newAdminRole',
          type: 'bytes32',
        },
      ],
      name: 'RoleAdminChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
      ],
      name: 'RoleGranted',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
      ],
      name: 'RoleRevoked',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'typ',
          type: 'bytes32',
        },
        {
          indexed: false,
          internalType: 'enum ContractResolver.Env',
          name: 'env',
          type: 'uint8',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'addr',
          type: 'address',
        },
      ],
      name: 'SetContract',
      type: 'event',
    },
    {
      inputs: [],
      name: 'ADMIN_ROLE',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'ALLOWLIST_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'BACKUP_RECOVERY_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'DEFAULT_ADMIN_ROLE',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'DOMAIN_WALLET_ORACLE',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'DOMAIN_WALLET_REGISTRY',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'HD_KEY_DERIVER_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'LIT_TOKEN_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'MULTI_SENDER_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'PKP_HELPER_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'PKP_NFT_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'PKP_NFT_METADATA_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'PKP_PERMISSIONS_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'PUB_KEY_ROUTER_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'RATE_LIMIT_NFT_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'RELEASE_REGISTER_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'STAKING_BALANCES_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'STAKING_CONTRACT',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newAdmin',
          type: 'address',
        },
      ],
      name: 'addAdmin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'enum ContractResolver.Env',
          name: 'env',
          type: 'uint8',
        },
      ],
      name: 'addAllowedEnv',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'typ',
          type: 'bytes32',
        },
        {
          internalType: 'enum ContractResolver.Env',
          name: 'env',
          type: 'uint8',
        },
      ],
      name: 'getContract',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32',
        },
      ],
      name: 'getRoleAdmin',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'grantRole',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'hasRole',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'adminBeingRemoved',
          type: 'address',
        },
      ],
      name: 'removeAdmin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'enum ContractResolver.Env',
          name: 'env',
          type: 'uint8',
        },
      ],
      name: 'removeAllowedEnv',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'renounceRole',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'revokeRole',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'typ',
          type: 'bytes32',
        },
        {
          internalType: 'enum ContractResolver.Env',
          name: 'env',
          type: 'uint8',
        },
        {
          internalType: 'address',
          name: 'addr',
          type: 'address',
        },
      ],
      name: 'setContract',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: 'interfaceId',
          type: 'bytes4',
        },
      ],
      name: 'supportsInterface',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
        {
          internalType: 'enum ContractResolver.Env',
          name: '',
          type: 'uint8',
        },
      ],
      name: 'typeAddresses',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const client = new LitNodeClient({
    litNetwork: 'custom',
    debug: true,
    contractContext: {
      resolverAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      abi: RESOLVER_ABI,
      enviorment: 0,
      provider: new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545'),
    },
  });
  const contracts = new LitContracts({
    signer: new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545'),
    customContext: {
        resolverAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        abi: RESOLVER_ABI,
        enviorment: 0,
        provider: new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545'),
    }
  });
  await contracts.connect();
  
  while (true) {
    let e = await contracts.stakingContract.write.epoch();
    if (e.number && e.number._hex === '0x02') {
        console.log('Epoch found to be 2 continuing');
        await client.connect();
        break;
    } else {
        console.log("current epoch is ", e.number._hex);
    }
    await new Promise((res, _rej) => {
        setTimeout(res, 100);
    });
  }

  // a non elegant way to allow the nodes to advance to another epoch while the sdk is connected, but waiting for the
  // the next epoch. This allows us to observe how the sdk behaves when an epoch transition occurs.
  await new Promise((res, rej) => {
    setTimeout(res, 30_000);
  });
  // ==================== Post-Validation ====================
  if (!client.ready) {
    return fail('client not ready');
  }

  let threshold = await LitContracts.getMinNodeCount('custom');
  console.log(`threshold ${threshold}`);

  // ==================== Success ====================
  return success(`Connected to local network`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });