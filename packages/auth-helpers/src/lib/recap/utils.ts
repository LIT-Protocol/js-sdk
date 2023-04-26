import { LitAbility, LitResourcePrefix } from '../models';

/**
 * Map from a LitAbility to the Recap namespace and ability.
 * @throws Error if the LitAbility is unknown
 */
export function getRecapNamespaceAndAbility(litAbility: LitAbility): {
  recapNamespace: string;
  recapAbility: string;
} {
  switch (litAbility) {
    case LitAbility.AccessControlConditionDecryption:
      return {
        recapNamespace: LitNamespace.AccessControlCondition,
        recapAbility: LitRecapAbility.Decryption,
      };
    case LitAbility.AccessControlConditionSigning:
      return {
        recapNamespace: LitNamespace.AccessControlCondition,
        recapAbility: LitRecapAbility.Signing,
      };
    case LitAbility.PKPSigning:
      return {
        recapNamespace: LitNamespace.PKP,
        recapAbility: LitRecapAbility.Signing,
      };
    case LitAbility.RateLimitIncreaseAuth:
      return {
        recapNamespace: LitNamespace.RLI,
        recapAbility: LitRecapAbility.Auth,
      };
    case LitAbility.LitActionExecution:
      return {
        recapNamespace: LitNamespace.LitAction,
        recapAbility: LitRecapAbility.Execution,
      };

    default:
      throw new Error(`Unknown LitAbility: ${litAbility}`);
  }
}

/**
 * LIT specific abilities mapped into the Recap specific terminology
 * of an 'ability'.
 */
export enum LitRecapAbility {
  Decryption = 'decryption',
  Signing = 'signing',
  Auth = 'auth',
  Execution = 'execution',
}

export enum LitNamespace {
  AccessControlCondition = 'AccessControlCondition',
  PKP = 'PKP',
  RLI = 'RLI',
  LitAction = 'LitAction',
}

export function getRecapResourceKey(
  resource: string,
  litAbility: LitAbility
): string {
  switch (litAbility) {
    case LitAbility.AccessControlConditionDecryption:
      return `${LitResourcePrefix.AccessControlCondition}:${resource}`;
    case LitAbility.AccessControlConditionSigning:
      return `${LitResourcePrefix.AccessControlCondition}:${resource}`;
    case LitAbility.PKPSigning:
      return `${LitResourcePrefix.PKP}:${resource}`;
    case LitAbility.RateLimitIncreaseAuth:
      return `${LitResourcePrefix.RLI}:${resource}`;
    case LitAbility.LitActionExecution:
      return `${LitResourcePrefix.LitAction}:${resource}`;

    default:
      throw new Error(`Unknown LitAbility: ${litAbility}`);
  }
}
