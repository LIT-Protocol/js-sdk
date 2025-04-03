import { OperatorAccSchema } from '@lit-protocol/access-control-conditions-schemas';
import {
  AccessControlConditions,
  EvmContractConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

export function isTokenOperator(token: unknown): boolean {
  return OperatorAccSchema.safeParse(token).success;
}

export function isValidBooleanExpression(
  expression:
    | AccessControlConditions
    | EvmContractConditions
    | SolRpcConditions
    | UnifiedAccessControlConditions
): boolean {
  const STATES = {
    START: 'start',
    CONDITION: 'condition',
    OPERATOR: 'operator',
  };

  let currentState = STATES.START;
  for (const token of expression) {
    switch (currentState) {
      case STATES.START:
      case STATES.OPERATOR:
        if (isTokenOperator(token)) {
          return false;
        }
        // Nested conditions expression
        if (Array.isArray(token) && !isValidBooleanExpression(token)) {
          return false;
        }
        currentState = STATES.CONDITION;
        break;
      default:
        if (!isTokenOperator(token)) {
          return false;
        }
        currentState = STATES.OPERATOR;
    }
  }

  return currentState === STATES.CONDITION;
}
