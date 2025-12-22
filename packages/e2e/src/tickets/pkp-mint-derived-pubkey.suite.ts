import {
  nagaDevSignatures,
  nagaProtoSignatures,
  nagaSignatures,
  nagaStagingSignatures,
  nagaTestSignatures,
} from '@lit-protocol/contracts';
import { buildSignaturesFromContext } from '@lit-protocol/contracts/custom-network-signatures';
import { createPublicClient, getContract, http, type Hex } from 'viem';

import { createEnvVars, type EnvVars } from '../helper/createEnvVars';
import { createTestEnv } from '../helper/createTestEnv';

const KEY_SET_ID = 'naga-keyset1';
type RequiredSignatures = {
  PKPNFT?: { address?: string };
  PubkeyRouter?: { address?: string };
  Staking?: { address?: string };
};

const PKP_NFT_ABI = [
  {
    name: 'getNextDerivedKeyId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
  },
] as const;

const PUBKEY_ROUTER_ABI = [
  {
    name: 'getRootKeys',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'stakingContract', type: 'address' },
      { name: 'keySetId', type: 'string' },
    ],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'pubkey', type: 'bytes' },
          { name: 'keyType', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getDerivedPubkey',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'stakingContract', type: 'address' },
      { name: 'keySetId', type: 'string' },
      { name: 'derivedKeyId', type: 'bytes32' },
    ],
    outputs: [{ type: 'bytes' }],
  },
  {
    name: 'deriveEthAddressFromPubkey',
    type: 'function',
    stateMutability: 'pure',
    inputs: [{ name: 'pubkey', type: 'bytes' }],
    outputs: [{ type: 'address' }],
  },
] as const;

const resolveSignatures = (envVars: EnvVars): RequiredSignatures => {
  switch (envVars.network) {
    case 'naga':
      return nagaSignatures;
    case 'naga-proto':
      return nagaProtoSignatures;
    case 'naga-staging':
      return nagaStagingSignatures;
    case 'naga-test':
      return nagaTestSignatures;
    case 'naga-dev':
      return nagaDevSignatures;
    case 'naga-local': {
      if (!envVars.localContextPath) {
        throw new Error(
          'naga-local requires NAGA_LOCAL_CONTEXT_PATH to be set'
        );
      }
      const { signatures } = buildSignaturesFromContext({
        jsonFilePath: envVars.localContextPath,
        networkName: envVars.network,
      });
      return signatures as RequiredSignatures;
    }
    default: {
      const exhaustiveCheck: never = envVars.network;
      throw new Error(`Unsupported network: ${exhaustiveCheck}`);
    }
  }
};

const requireAddress = (
  signatures: RequiredSignatures,
  key: keyof RequiredSignatures,
  network: EnvVars['network']
) => {
  const address = signatures[key]?.address;
  if (!address) {
    throw new Error(
      `[pkp-mint-derived-pubkey] missing ${String(key)} address for ${network}`
    );
  }
  return address;
};

const summarizeRootKeys = (
  rootKeys: ReadonlyArray<{ keyType: bigint; pubkey: Hex }>
) => {
  const summary: Record<string, { count: number; byteLengths: number[] }> = {};

  for (const rootKey of rootKeys) {
    const keyType = rootKey.keyType.toString();
    const byteLength = (rootKey.pubkey.length - 2) / 2;

    if (!summary[keyType]) {
      summary[keyType] = { count: 0, byteLengths: [] };
    }

    summary[keyType].count += 1;
    if (!summary[keyType].byteLengths.includes(byteLength)) {
      summary[keyType].byteLengths.push(byteLength);
    }
  }

  for (const entry of Object.values(summary)) {
    entry.byteLengths.sort((a, b) => a - b);
  }

  return summary;
};

export function registerPkpMintDerivedPubkeyTicketSuite() {
  describe('pkp mint derived pubkey', () => {
    let envVars: ReturnType<typeof createEnvVars>;
    let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
    let signatures: RequiredSignatures;

    beforeAll(async () => {
      envVars = createEnvVars();
      testEnv = await createTestEnv(envVars);
      signatures = resolveSignatures(envVars);
    });

    it('derives a pubkey that can produce an ETH address', async () => {
      const rpcUrl = envVars.rpcUrl ?? testEnv.networkModule.getRpcUrl();
      const publicClient = createPublicClient({
        chain: testEnv.networkModule.getChainConfig(),
        transport: http(rpcUrl),
      });

      const pkpNft = getContract({
        address: requireAddress(signatures, 'PKPNFT', envVars.network),
        abi: PKP_NFT_ABI,
        client: { public: publicClient },
      });

      const pubkeyRouter = getContract({
        address: requireAddress(signatures, 'PubkeyRouter', envVars.network),
        abi: PUBKEY_ROUTER_ABI,
        client: { public: publicClient },
      });

      const stakingAddress = requireAddress(
        signatures,
        'Staking',
        envVars.network
      );
      const rootKeys = await pubkeyRouter.read.getRootKeys([
        stakingAddress,
        KEY_SET_ID,
      ]);

      console.log(
        '[pkp-mint-derived-pubkey] root keys total:',
        rootKeys.length
      );
      console.log(
        '[pkp-mint-derived-pubkey] root key summary:',
        summarizeRootKeys(rootKeys)
      );

      if (rootKeys.length === 0) {
        throw new Error(
          `[pkp-mint-derived-pubkey] no root keys returned for ${envVars.network} (${KEY_SET_ID})`
        );
      }

      const derivedKeyId = await pkpNft.read.getNextDerivedKeyId();
      console.log('[pkp-mint-derived-pubkey] derived key id:', derivedKeyId);
      const derivedPubkey = await pubkeyRouter.read.getDerivedPubkey([
        stakingAddress,
        KEY_SET_ID,
        derivedKeyId,
      ]);
      const derivedPubkeyBytes = (derivedPubkey.length - 2) / 2;
      const hasK256Roots = rootKeys.some((rootKey) => rootKey.keyType === 2n);

      console.log(
        '[pkp-mint-derived-pubkey] derived pubkey bytes:',
        derivedPubkeyBytes
      );
      console.log('[pkp-mint-derived-pubkey] derived pubkey:', derivedPubkey);

      if (derivedPubkeyBytes === 0) {
        const hint = hasK256Roots
          ? 'root keys exist; HD KDF precompile may be missing or misconfigured'
          : 'no keyType=2 root keys found';
        throw new Error(
          `[pkp-mint-derived-pubkey] derived pubkey is empty for ${envVars.network} (${hint}).`
        );
      }

      if (derivedPubkeyBytes < 65) {
        throw new Error(
          `[pkp-mint-derived-pubkey] derived pubkey too short (${derivedPubkeyBytes} bytes) for ${envVars.network}`
        );
      }

      try {
        const ethAddress = await pubkeyRouter.read.deriveEthAddressFromPubkey([
          derivedPubkey,
        ]);
        console.log(
          '[pkp-mint-derived-pubkey] derived eth address:',
          ethAddress
        );
        expect(ethAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
      } catch (error) {
        console.log(
          '[pkp-mint-derived-pubkey] deriveEthAddressFromPubkey failed:',
          error
        );
        throw error;
      }
    });
  });
}
