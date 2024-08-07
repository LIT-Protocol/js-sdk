import {
  LitAbility,
  LitAbility_VALUES,
  LitRecapAbility,
  LitRecapAbility_VALUES,
  LitNamespace,
  LitNamespace_VALUES,
} from '@lit-protocol/constants';

/**
 * Map from a LitAbility to the Recap namespace and ability.
 * @throws Error if the LitAbility is unknown
 */
export function getRecapNamespaceAndAbility(litAbility: LitAbility_VALUES): {
  recapNamespace: LitNamespace_VALUES;
  recapAbility: LitRecapAbility_VALUES;
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
