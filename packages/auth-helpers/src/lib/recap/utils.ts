import {
  LIT_ABILITY,
  LIT_ABILITY_VALUES,
  LIT_RECAP_ABILITY,
  LIT_RECAP_ABILITY_VALUES,
  LIT_NAMESPACE,
  LIT_NAMESPACE_VALUES,
} from '@lit-protocol/constants';

/**
 * Map from a LitAbility to the Recap namespace and ability.
 * @throws Error if the LitAbility is unknown
 */
export function getRecapNamespaceAndAbility(litAbility: LIT_ABILITY_VALUES): {
  recapNamespace: LIT_NAMESPACE_VALUES;
  recapAbility: LIT_RECAP_ABILITY_VALUES;
} {
  switch (litAbility) {
    case LIT_ABILITY.AccessControlConditionDecryption:
      return {
        recapNamespace: LIT_NAMESPACE.Threshold,
        recapAbility: LIT_RECAP_ABILITY.Decryption,
      };
    case LIT_ABILITY.AccessControlConditionSigning:
      return {
        recapNamespace: LIT_NAMESPACE.Threshold,
        recapAbility: LIT_RECAP_ABILITY.Signing,
      };
    case LIT_ABILITY.PKPSigning:
      return {
        recapNamespace: LIT_NAMESPACE.Threshold,
        recapAbility: LIT_RECAP_ABILITY.Signing,
      };
    case LIT_ABILITY.RateLimitIncreaseAuth:
      return {
        recapNamespace: LIT_NAMESPACE.Auth,
        recapAbility: LIT_RECAP_ABILITY.Auth,
      };
    case LIT_ABILITY.LitActionExecution:
      return {
        recapNamespace: LIT_NAMESPACE.Threshold,
        recapAbility: LIT_RECAP_ABILITY.Execution,
      };

    default:
      throw new Error(`Unknown LitAbility: ${litAbility}`);
  }
}
