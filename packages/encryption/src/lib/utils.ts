import {
  AccessControlConditions,
  EvmContractConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions
} from "@lit-protocol/types";

function isTokenOperator(token: any): boolean {
  const OPERATORS = ["and", "or"]; // Only permissible boolean operators on the nodes
  return token.hasOwnProperty("operator") && OPERATORS.includes(token.operator);
}

export function validateBooleanExpression(
  expression: AccessControlConditions 
  | EvmContractConditions 
  | SolRpcConditions 
  | UnifiedAccessControlConditions
): boolean {
  const STATES = { START: "start", CONDITION: "condition", OPERATOR: "operator" };

  let currentState = STATES.START;
  for (const token of expression) {
    switch (currentState) {
      case STATES.START:
      case STATES.OPERATOR:
        if (isTokenOperator(token)) {
          return false;
        }
        // Nested conditions expression
        if (Array.isArray(token) && !validateBooleanExpression(token)) {
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
