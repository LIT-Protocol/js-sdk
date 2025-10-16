import {
  InvalidArgumentException,
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
    case LIT_ABILITY.PaymentDelegation:
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
      throw new InvalidArgumentException(
        {
          info: {
            litAbility,
          },
        },
        `Unknown LitAbility`
      );
  }
}

export const RESOLVED_AUTH_CONTEXT_PREFIX = 'lit-resolvedauthcontext://';
const PAYMENT_DELEGATION_PREFIX = 'lit-paymentdelegation://';
const PKP_PREFIX = 'lit-pkp://';
const ACC_PREFIX = 'lit-accesscontrolcondition://';

/**
 * Reverse mapping from Recap namespace/ability to LitAbility.
 * Returns null when the recap entry only carries metadata (eg. resolved auth context).
 */
export function getLitAbilityFromRecap(params: {
  recapNamespace: string;
  recapAbility: string;
  resourceKey: string;
}): LIT_ABILITY_VALUES | null {
  const { recapNamespace, recapAbility, resourceKey } = params;

  if (recapNamespace === LIT_NAMESPACE.Threshold) {
    if (recapAbility === LIT_RECAP_ABILITY.Decryption) {
      return LIT_ABILITY.AccessControlConditionDecryption;
    }

    if (recapAbility === LIT_RECAP_ABILITY.Execution) {
      return LIT_ABILITY.LitActionExecution;
    }

    if (recapAbility === LIT_RECAP_ABILITY.Signing) {
      if (resourceKey.startsWith(PKP_PREFIX)) {
        return LIT_ABILITY.PKPSigning;
      }
      if (resourceKey.startsWith(ACC_PREFIX)) {
        return LIT_ABILITY.AccessControlConditionSigning;
      }
    }
  }

  if (recapNamespace === LIT_NAMESPACE.Auth && recapAbility === LIT_RECAP_ABILITY.Auth) {
    if (resourceKey.startsWith(PAYMENT_DELEGATION_PREFIX)) {
      return LIT_ABILITY.PaymentDelegation;
    }

    if (resourceKey.startsWith(RESOLVED_AUTH_CONTEXT_PREFIX)) {
      // Resolved auth context entries only contain metadata.
      return null;
    }
  }

  return null;
}
