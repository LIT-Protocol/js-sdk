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
        recapNamespace: LitNamespace.Threshold,
        recapAbility: LitRecapAbility.Decryption,
      };
    case LitAbility.AccessControlConditionSigning:
      return {
        recapNamespace: LitNamespace.Threshold,
        recapAbility: LitRecapAbility.Signing,
      };
    case LitAbility.PKPSigning:
      return {
        recapNamespace: LitNamespace.Threshold,
        recapAbility: LitRecapAbility.Signing,
      };
    case LitAbility.RateLimitIncreaseAuth:
      return {
        recapNamespace: LitNamespace.Auth,
        recapAbility: LitRecapAbility.Auth,
      };
    case LitAbility.LitActionExecution:
      return {
        recapNamespace: LitNamespace.Threshold,
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
  Decryption = 'Decryption',
  Signing = 'Signing',
  Auth = 'Auth',
  Execution = 'Execution',
}

export enum LitNamespace {
  Auth = 'Auth',
  Threshold = 'Threshold',
}
