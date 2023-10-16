import {
  AccessControlConditions,
  EvmContractConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions
} from "@lit-protocol/types";

function isTokenOperator(token: any): boolean {
  const OPERATORS = ["and", "or"]; // Only permissible boolean operators on the nodes
  const res = token.hasOwnProperty("operator") && OPERATORS.includes(token.operator);
  console.log('isTokenOperator- ', isTokenOperator);
  return res;
}

export function isValidBooleanExpression(
  expression: AccessControlConditions 
  | EvmContractConditions 
  | SolRpcConditions 
  | UnifiedAccessControlConditions
): boolean {
  console.log('expression');
  console.log(expression);
  const STATES = { START: "start", CONDITION: "condition", OPERATOR: "operator" };

  let currentState = STATES.START;
  for (const token of expression) {
    console.log('token- ', token);
    switch (currentState) {
      case STATES.START:
      case STATES.OPERATOR:
        console.log(currentState);
        if (isTokenOperator(token)) {
          console.log('invalid- 1');
          return false;
        }
        // Nested conditions expression
        if (Array.isArray(token) && !isValidBooleanExpression(token)) {
          console.log('invalid- 2');
          return false;
        }
        currentState = STATES.CONDITION;
        break;
      default:
        console.log('STATES.CONDITION');
        if (!isTokenOperator(token)) {
          console.log('invalid- 3');
          return false;
        }
        currentState = STATES.OPERATOR;
    }
  }

  const res = currentState === STATES.CONDITION;
  console.log('isValidBooleanExpression- ', res);
  return res;
}
