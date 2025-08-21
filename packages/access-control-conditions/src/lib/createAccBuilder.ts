/**
 * Access Control Conditions Builder
 *
 * A flexible, type-safe builder for creating access control conditions.
 * Supports all condition types: EVM Basic, EVM Contract, Solana RPC, Cosmos, and Lit Actions.
 *
 * Features:
 * - Convenience methods for common patterns
 * - Escape hatches for custom conditions
 * - Boolean expressions with and/or operators
 * - Grouping support for complex logic
 * - Full TypeScript support
 * - Cosmos flexibility with custom paths and JSONPath keys
 * - Lit Action support with all comparators (=, !=, contains, !contains)
 *
 * Usage:
 * ```typescript
 * import { createAccBuilder } from '@lit-protocol/access-control-conditions';
 *
 * // Simple ETH balance check
 * const simpleCondition = createAccBuilder()
 *   .requireEthBalance('0.001')
 *   .on('ethereum')
 *   .build();
 *
 * // Weather-gated content using Lit Action
 * const weatherGated = createAccBuilder()
 *   .requireLitAction(
 *     'QmWeatherCheckCID',
 *     'checkTemperature',
 *     ['40'],
 *     'true'
 *   )
 *   .on('ethereum')
 *   .build();
 *
 * // Flexible Cosmos condition for KYVE funders
 * const kyveCondition = createAccBuilder()
 *   .requireCosmosCustom(
 *     '/kyve/registry/v1beta1/funders_list/0',
 *     '$.funders.*.account',
 *     ':userAddress',
 *     'contains'
 *   )
 *   .on('kyve')
 *   .build();
 *
 * // Complex boolean expression
 * const complexCondition = createAccBuilder()
 *   .requireEthBalance('0.001').on('ethereum')
 *   .or()
 *   .requireNftOwnership('0x123...', '1').on('polygon')
 *   .or()
 *   .requireCosmosBalance('1000000').on('cosmos')
 *   .or()
 *   .requireLitAction('QmCustomLogic', 'validate', ['param'], 'true').on('ethereum')
 *   .build();
 * ```
 */

import type {
  AtomAcc,
  ChainEnumAtom,
  ChainEnumSol,
  EvmBasicAcc,
  EvmChainEnum,
  EvmContractAcc,
  OperatorAcc,
  SolAcc,
  UnifiedAccessControlCondition,
} from '@lit-protocol/access-control-conditions-schemas';
import { z } from 'zod';
import { canonicalUnifiedAccessControlConditionFormatter } from './canonicalFormatter';

// Re-export for convenience
export type {
  AtomAcc,
  EvmBasicAcc,
  EvmContractAcc,
  OperatorAcc,
  SolAcc,
  UnifiedAccessControlCondition,
};

// Type for the final built conditions array
export type AccessControlConditions = UnifiedAccessControlCondition[];

// Supported chain types - inferred from the actual schemas
export type EvmChain = z.infer<typeof EvmChainEnum>;
export type SolanaChain = z.infer<typeof ChainEnumSol>;
export type CosmosChain = z.infer<typeof ChainEnumAtom>;
export type SupportedChain = EvmChain | SolanaChain | CosmosChain;

// Comparator types for different condition formats
export type Comparator =
  | 'contains'
  | '='
  | '>'
  | '>='
  | '<'
  | '<='
  | '!='
  | '!contains';
export type NumericComparator = '>=' | '>' | '=' | '<=' | '<';
export type LitActionComparator = '=' | '!=' | 'contains' | '!contains';

// Standard contract types for EVM Basic conditions
export type StandardContractType =
  | ''
  | 'ERC20'
  | 'ERC721'
  | 'ERC721MetadataName'
  | 'ERC1155'
  | 'CASK'
  | 'Creaton'
  | 'POAP'
  | 'timestamp'
  | 'MolochDAOv2.1'
  | 'ProofOfHumanity'
  | 'SIWE'
  | 'PKPPermissions'
  | 'LitAction';

// Builder interface for fluent API
export interface AccBuilder {
  // ========== Convenience Methods ==========

  // EVM Basic patterns
  requireEthBalance(
    amount: string,
    comparator?: NumericComparator
  ): ChainableEvmBuilder;
  requireTokenBalance(
    contractAddress: string,
    amount: string,
    comparator?: NumericComparator
  ): ChainableEvmBuilder;
  requireNftOwnership(
    contractAddress: string,
    tokenId?: string
  ): ChainableEvmBuilder;
  requireWalletOwnership(address: string): ChainableEvmBuilder;
  requireTimestamp(
    timestamp: string,
    comparator?: NumericComparator
  ): ChainableEvmBuilder;
  requireDAOMembership(daoAddress: string): ChainableEvmBuilder;
  requirePOAPOwnership(eventId: string): ChainableEvmBuilder;

  // Solana patterns
  requireSolBalance(
    amount: string,
    comparator?: NumericComparator
  ): ChainableSolBuilder;
  requireSolNftOwnership(collectionAddress: string): ChainableSolBuilder;
  requireSolWalletOwnership(address: string): ChainableSolBuilder;

  // Cosmos patterns
  requireCosmosBalance(
    amount: string,
    comparator?: NumericComparator
  ): ChainableCosmosBuilder;
  requireCosmosWalletOwnership(address: string): ChainableCosmosBuilder;
  requireCosmosCustom(
    path: string,
    key: string,
    value: string,
    comparator?: Comparator
  ): ChainableCosmosBuilder;

  // Lit Action patterns

  /**
   * @example
   https://ipfs.io/ipfs/Qme2pfQUV9cuxWmzHrhMKuvTVvKVx87iLiz4AnQnEwS3B6
   
   * @example // Lit Action you can pin this to IPFS and test it
   * const go = async (secretValue) => {
     const VERY_SECURED_PASSWORD = '123456';
     if(secretValue !== VERY_SECURED_PASSWORD){
       return false;
     }
   };
   */
  requireLitAction(
    ipfsCid: string,
    method: string,
    parameters: string[],
    expectedValue: string,
    comparator?: LitActionComparator
  ): AccBuilder;

  // ========== Custom/Raw Methods ==========
  custom(
    condition: Partial<AtomAcc | EvmBasicAcc | EvmContractAcc | SolAcc>
  ): AccBuilder;
  unifiedAccs(condition: UnifiedAccessControlCondition): AccBuilder;
  evmBasic(params: Omit<EvmBasicAcc, 'conditionType'>): AccBuilder;
  solRpc(params: Omit<SolAcc, 'conditionType'>): AccBuilder;
  cosmos(params: Omit<AtomAcc, 'conditionType'>): AccBuilder;

  // ========== Boolean Operations ==========
  and(): AccBuilder;
  or(): AccBuilder;

  // ========== Grouping ==========
  group(builderFn: (builder: AccBuilder) => AccBuilder): AccBuilder;

  // ========== Build ==========
  build(): AccessControlConditions;

  // ========== Utility ==========
  validate(): { valid: boolean; errors: string[] };
  humanize(): Promise<string>;
}

// Chainable builders for different condition types
export interface ChainableEvmBuilder {
  on(chain: EvmChain): AccBuilder;
}

export interface ChainableSolBuilder {
  on(chain: SolanaChain): AccBuilder;
}

export interface ChainableCosmosBuilder {
  on(chain: CosmosChain): AccBuilder;
}

// Internal condition builder class
class AccessControlConditionBuilder implements AccBuilder {
  private conditions: UnifiedAccessControlCondition[] = [];
  private pendingCondition: Partial<
    AtomAcc | EvmBasicAcc | EvmContractAcc | SolAcc
  > | null = null;

  // ========== Convenience Methods - EVM Basic ==========

  requireEthBalance(
    amount: string,
    comparator?: NumericComparator
  ): ChainableEvmBuilder {
    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: comparator || '>=',
        value: amount,
      },
    };

    return {
      on: (chain: EvmChain) => this.setChain(chain),
    };
  }

  requireTokenBalance(
    contractAddress: string,
    amount: string,
    comparator?: NumericComparator
  ): ChainableEvmBuilder {
    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress,
      standardContractType: 'ERC20',
      method: 'balanceOf',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: comparator || '>=',
        value: amount,
      },
    };

    return {
      on: (chain: EvmChain) => this.setChain(chain),
    };
  }

  requireNftOwnership(
    contractAddress: string,
    tokenId?: string
  ): ChainableEvmBuilder {
    const isERC721 = tokenId !== undefined;

    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress,
      standardContractType: isERC721 ? 'ERC721' : 'ERC1155',
      method: 'balanceOf',
      parameters: isERC721
        ? [':userAddress']
        : [':userAddress', tokenId || '1'],
      returnValueTest: {
        comparator: '>',
        value: '0',
      },
    };

    return {
      on: (chain: EvmChain) => this.setChain(chain),
    };
  }

  requireWalletOwnership(address: string): ChainableEvmBuilder {
    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: address,
      },
    };

    return {
      on: (chain: EvmChain) => this.setChain(chain),
    };
  }

  requireTimestamp(
    timestamp: string,
    comparator?: NumericComparator
  ): ChainableEvmBuilder {
    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: 'timestamp',
      method: 'eth_getBlockByNumber',
      parameters: ['latest', 'false'],
      returnValueTest: {
        comparator: comparator || '>=',
        value: timestamp,
      },
    };

    return {
      on: (chain: EvmChain) => this.setChain(chain),
    };
  }

  requireDAOMembership(daoAddress: string): ChainableEvmBuilder {
    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress: daoAddress,
      standardContractType: 'MolochDAOv2.1',
      method: 'members',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: 'true',
      },
    };

    return {
      on: (chain: EvmChain) => this.setChain(chain),
    };
  }

  requirePOAPOwnership(eventId: string): ChainableEvmBuilder {
    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress: '0x22C1f6050E56d2876009903609a2cC3fEf83B415', // POAP contract
      standardContractType: 'POAP',
      method: 'eventId',
      parameters: [],
      returnValueTest: {
        comparator: '=',
        value: eventId,
      },
    };

    return {
      on: (chain: EvmChain) => this.setChain(chain),
    };
  }

  // ========== Convenience Methods - Solana ==========

  requireSolBalance(
    amount: string,
    comparator?: NumericComparator
  ): ChainableSolBuilder {
    this.pendingCondition = {
      conditionType: 'solRpc',
      method: 'getBalance',
      params: [':userAddress'],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: '',
      returnValueTest: {
        key: '',
        comparator: comparator || '>=',
        value: amount,
      },
    };

    return {
      on: (chain: SolanaChain) => this.setChain(chain),
    };
  }

  requireSolNftOwnership(collectionAddress: string): ChainableSolBuilder {
    this.pendingCondition = {
      conditionType: 'solRpc',
      method: 'balanceOfMetaplexCollection',
      params: [collectionAddress],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: '',
      returnValueTest: {
        key: '',
        comparator: '>',
        value: '0',
      },
    };

    return {
      on: (chain: SolanaChain) => this.setChain(chain),
    };
  }

  requireSolWalletOwnership(address: string): ChainableSolBuilder {
    this.pendingCondition = {
      conditionType: 'solRpc',
      method: '',
      params: [':userAddress'],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: '',
      returnValueTest: {
        key: '',
        comparator: '=',
        value: address,
      },
    };

    return {
      on: (chain: SolanaChain) => this.setChain(chain),
    };
  }

  // ========== Convenience Methods - Cosmos ==========

  requireCosmosBalance(
    amount: string,
    comparator?: NumericComparator
  ): ChainableCosmosBuilder {
    this.pendingCondition = {
      conditionType: 'cosmos',
      path: '/cosmos/bank/v1beta1/balances/:userAddress',
      returnValueTest: {
        key: '$.balances[0].amount',
        comparator: comparator || '>=',
        value: amount,
      },
    };

    return {
      on: (chain: CosmosChain) => this.setChain(chain),
    };
  }

  requireCosmosWalletOwnership(address: string): ChainableCosmosBuilder {
    this.pendingCondition = {
      conditionType: 'cosmos',
      path: ':userAddress',
      returnValueTest: {
        key: '',
        comparator: '=',
        value: address,
      },
    };

    return {
      on: (chain: CosmosChain) => this.setChain(chain),
    };
  }

  requireCosmosCustom(
    path: string,
    key: string,
    value: string,
    comparator?: Comparator
  ): ChainableCosmosBuilder {
    this.pendingCondition = {
      conditionType: 'cosmos',
      path,
      returnValueTest: {
        key,
        comparator: comparator || ('=' as any),
        value,
      },
    };

    return {
      on: (chain: CosmosChain) => this.setChain(chain),
    };
  }

  // ========== Convenience Methods - Lit Actions ==========

  requireLitAction(
    ipfsCid: string,
    method: string,
    parameters: string[],
    expectedValue: string,
    comparator?: LitActionComparator
  ): AccBuilder {
    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress: `ipfs://${ipfsCid}`,
      standardContractType: 'LitAction',
      method,
      parameters,
      returnValueTest: {
        comparator: comparator || ('=' as any),
        value: expectedValue,
      },
    };

    // Automatically set chain to 'ethereum' for Lit Actions
    this.setChain('ethereum');
    return this;
  }

  // ========== Custom/Raw Methods ==========

  custom(
    condition: Partial<AtomAcc | EvmBasicAcc | EvmContractAcc | SolAcc>
  ): AccBuilder {
    // Validate that essential fields are present
    if (!condition.conditionType) {
      throw new Error('Custom condition must specify conditionType');
    }

    this.commitPendingCondition();
    this.conditions.push(condition as UnifiedAccessControlCondition);
    return this;
  }

  unifiedAccs(condition: UnifiedAccessControlCondition): AccBuilder {
    this.commitPendingCondition();
    this.conditions.push(condition);
    return this;
  }

  evmBasic(
    params: Omit<EvmBasicAcc, 'conditionType'>
  ): AccBuilder {
    const p = params as Partial<EvmBasicAcc>;
    
    // For raw evmBasic, chain must be provided in params
    if (!p.chain) {
      throw new Error('Chain must be specified in params for evmBasic method');
    }

    this.pendingCondition = {
      conditionType: 'evmBasic',
      contractAddress: p.contractAddress as string,
      standardContractType: p.standardContractType as StandardContractType,
      method: p.method as string,
      parameters: p.parameters as string[],
      returnValueTest: p.returnValueTest as any,
    } as Partial<EvmBasicAcc>;

    this.setChain(p.chain as EvmChain);
    return this;
  }

  solRpc(
    params: Omit<SolAcc, 'conditionType'>
  ): AccBuilder {
    const p = params as Partial<SolAcc>;
    
    // For raw solRpc, chain must be provided in params
    if (!p.chain) {
      throw new Error('Chain must be specified in params for solRpc method');
    }

    this.pendingCondition = {
      conditionType: 'solRpc',
      method: p.method as string,
      params: p.params as string[],
      pdaParams: p.pdaParams as string[],
      pdaInterface: p.pdaInterface as any,
      pdaKey: p.pdaKey as string,
      returnValueTest: p.returnValueTest as any,
    } as Partial<SolAcc>;

    this.setChain(p.chain as SolanaChain);
    return this;
  }

  cosmos(
    params: Omit<AtomAcc, 'conditionType'>
  ): AccBuilder {
    const p = params as Partial<AtomAcc>;
    
    // For raw cosmos, chain must be provided in params
    if (!p.chain) {
      throw new Error('Chain must be specified in params for cosmos method');
    }

    this.pendingCondition = {
      conditionType: 'cosmos',
      path: p.path as string,
      returnValueTest: p.returnValueTest as any,
    } as Partial<AtomAcc>;

    this.setChain(p.chain as CosmosChain);
    return this;
  }

  // ========== Boolean Operations ==========

  and(): AccBuilder {
    this.commitPendingCondition();
    this.conditions.push({ operator: 'and' } as OperatorAcc);
    return this;
  }

  or(): AccBuilder {
    this.commitPendingCondition();
    this.conditions.push({ operator: 'or' } as OperatorAcc);
    return this;
  }

  // ========== Grouping ==========

  group(builderFn: (builder: AccBuilder) => AccBuilder): AccBuilder {
    this.commitPendingCondition();

    const subBuilder = new AccessControlConditionBuilder();
    const result = builderFn(subBuilder);

    // Get the raw conditions without calling build() to avoid canonical formatting issues
    const subConditions = (result as any).conditions || [];

    if (subConditions.length > 0) {
      // Add grouping parentheses if there are multiple conditions
      if (subConditions.length > 1) {
        this.conditions.push({ operator: '(' } as any);
        this.conditions.push(...subConditions);
        this.conditions.push({ operator: ')' } as any);
      } else {
        this.conditions.push(...subConditions);
      }
    }

    return this;
  }

  // ========== Build ==========

  build(): AccessControlConditions {
    this.commitPendingCondition();

    if (this.conditions.length === 0) {
      throw new Error(
        'Cannot build empty conditions. Add at least one condition.'
      );
    }

    // Return raw conditions - canonical formatting should happen later in the pipeline
    return [...this.conditions];
  }

  // ========== Utility ==========

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const conditions = this.build();

      // Basic validation
      if (conditions.length === 0) {
        errors.push('No conditions specified');
      }

      // Check for proper operator placement
      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];

        if ('operator' in condition) {
          if (i === 0 || i === conditions.length - 1) {
            errors.push(
              `Operator "${condition.operator}" cannot be at the beginning or end`
            );
          }
        }
      }

      // Check for consecutive operators
      for (let i = 0; i < conditions.length - 1; i++) {
        const current = conditions[i];
        const next = conditions[i + 1];

        if ('operator' in current && 'operator' in next) {
          errors.push('Cannot have consecutive operators');
        }
      }
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : 'Unknown validation error'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async humanize(): Promise<string> {
    try {
      const { humanizeUnifiedAccessControlConditions } = await import(
        './humanizer'
      );
      const conditions = this.build();
      return await humanizeUnifiedAccessControlConditions({
        unifiedAccessControlConditions: conditions,
      });
    } catch (error) {
      throw new Error(
        `Failed to humanize conditions: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // ========== Internal Helpers ==========

  private setChain(chain: SupportedChain): AccBuilder {
    if (!this.pendingCondition) {
      throw new Error('No pending condition to set chain on');
    }

    this.pendingCondition.chain = chain;
    this.commitPendingCondition();
    return this;
  }

  private commitPendingCondition(): void {
    if (this.pendingCondition) {
      // Validate that required fields are present
      if (!this.pendingCondition.chain) {
        throw new Error('Chain must be specified using .on() method');
      }

      this.conditions.push(
        this.pendingCondition as UnifiedAccessControlCondition
      );
      this.pendingCondition = null;
    }
  }
}

// ========== Factory Functions ==========

/**
 * Creates a new access control conditions builder
 *
 * @returns {AccBuilder} A new builder instance
 *
 * @example
 * ```typescript
 * const conditions = createAccBuilder()
 *   .requireEthBalance('0.001')
 *   .on('ethereum')
 *   .build();
 * ```
 */
export const createAccBuilder = (): AccBuilder => {
  return new AccessControlConditionBuilder();
};

// ========== Quick Factory Functions ==========

/**
 * Quick factory for ETH balance requirement
 */
export const createEthBalanceCondition = (
  amount: string,
  chain: EvmChain,
  comparator: NumericComparator = '>='
): EvmBasicAcc => ({
  conditionType: 'evmBasic',
  contractAddress: '',
  standardContractType: '',
  chain,
  method: 'eth_getBalance',
  parameters: [':userAddress', 'latest'],
  returnValueTest: {
    comparator,
    value: amount,
  },
});

/**
 * Quick factory for token balance requirement
 */
export const createTokenBalanceCondition = (
  contractAddress: string,
  amount: string,
  chain: EvmChain,
  comparator: NumericComparator = '>='
): EvmBasicAcc => ({
  conditionType: 'evmBasic',
  contractAddress,
  standardContractType: 'ERC20',
  chain,
  method: 'balanceOf',
  parameters: [':userAddress'],
  returnValueTest: {
    comparator,
    value: amount,
  },
});

/**
 * Quick factory for NFT ownership requirement
 */
export const createNftOwnershipCondition = (
  contractAddress: string,
  chain: EvmChain,
  tokenId?: string
): EvmBasicAcc => {
  const isERC721 = tokenId !== undefined;

  return {
    conditionType: 'evmBasic',
    contractAddress,
    standardContractType: isERC721 ? 'ERC721' : 'ERC1155',
    chain,
    method: 'balanceOf',
    parameters: isERC721 ? [':userAddress'] : [':userAddress', tokenId || '1'],
    returnValueTest: {
      comparator: '>',
      value: '0',
    },
  };
};

/**
 * Quick factory for wallet ownership requirement
 */
export const createWalletOwnershipCondition = (
  address: string,
  chain: EvmChain
): EvmBasicAcc => ({
  conditionType: 'evmBasic',
  contractAddress: '',
  standardContractType: '',
  chain,
  method: '',
  parameters: [':userAddress'],
  returnValueTest: {
    comparator: '=',
    value: address,
  },
});

/**
 * Quick factory for SOL balance requirement
 */
export const createSolBalanceCondition = (
  amount: string,
  chain: SolanaChain,
  comparator: NumericComparator = '>='
): SolAcc => ({
  conditionType: 'solRpc',
  method: 'getBalance',
  params: [':userAddress'],
  pdaParams: [],
  pdaInterface: { offset: 0, fields: {} },
  pdaKey: '',
  chain,
  returnValueTest: {
    key: '',
    comparator,
    value: amount,
  },
});

/**
 * Quick factory for Cosmos custom condition
 */
export const createCosmosCustomCondition = (
  path: string,
  key: string,
  value: string,
  chain: CosmosChain,
  comparator: Comparator = '='
): AtomAcc => ({
  conditionType: 'cosmos',
  path,
  chain,
  returnValueTest: {
    key,
    comparator: comparator as any,
    value,
  },
});

/**
 * Quick factory for Lit Action condition
 */
export const createLitActionCondition = (
  ipfsCid: string,
  method: string,
  parameters: string[],
  expectedValue: string,
  comparator: LitActionComparator = '='
): EvmBasicAcc => ({
  conditionType: 'evmBasic',
  contractAddress: `ipfs://${ipfsCid}`,
  standardContractType: 'LitAction',
  chain: 'ethereum', // Automatically set to ethereum for Lit Actions
  method,
  parameters,
  returnValueTest: {
    comparator: comparator as any,
    value: expectedValue,
  },
});