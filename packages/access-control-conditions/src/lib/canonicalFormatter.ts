import { ILitError, LIT_ERROR } from '@lit-protocol/constants';

import {
  ABIParams,
  AccessControlConditions,
  AccsCOSMOSParams,
  AccsDefaultParams,
  AccsEVMParams,
  AccsOperatorParams,
  AccsParams,
  AccsSOLV2Params,
  ConditionItem,
  EvmContractConditions,
  JsonSigningResourceId,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

import { throwError } from '@lit-protocol/misc';

/** ---------- Local Functions ---------- */
/**
 *
 * Get operator param
 *
 * @param { ConditionItem } cond
 * @returns { AccsOperatorParams }
 */
const getOperatorParam = (cond: ConditionItem): AccsOperatorParams => {
  const _cond = cond as AccsOperatorParams;

  return {
    operator: _cond.operator,
  };
};

/**
 *
 * Canonical ABI Params
 *
 * @param { Array<ABIParams> } params
 * @returns { Array<ABIParams> }
 */
const canonicalAbiParamss = (params: Array<ABIParams>): Array<ABIParams> => {
  return params.map((param) => ({
    name: param.name,
    type: param.type,
  }));
};

/**
 *
 * Canonical Unified Access Control Condition Formatter
 *
 * @param { UnifiedAccessControlConditions | ConditionItem } cond
 * @returns { any[] | AccsOperatorParams | any }
 */
export const canonicalUnifiedAccessControlConditionFormatter = (
  cond: AccsParams | AccsOperatorParams | UnifiedAccessControlConditions
): AccsOperatorParams | any => {
  // -- if it's an array
  if (Array.isArray(cond)) {
    return cond.map((c) => canonicalUnifiedAccessControlConditionFormatter(c));
  }

  // -- if there's a `operator` key in the object
  if ('operator' in cond) {
    return getOperatorParam(cond);
  }

  // -- otherwise
  if ('returnValueTest' in cond) {
    const _cond = cond;
    const _conditionType = _cond.conditionType;

    switch (_conditionType) {
      case 'solRpc':
        return canonicalSolRpcConditionFormatter(cond, true);

      case 'evmBasic':
        return canonicalAccessControlConditionFormatter(
          cond as AccsDefaultParams
        );

      case 'evmContract':
        return canonicalEVMContractConditionFormatter(cond as AccsEVMParams);

      case 'cosmos':
        return canonicalCosmosConditionFormatter(cond as AccsCOSMOSParams);

      default:
        throwError({
          message: `You passed an invalid access control condition that is missing or has a wrong "conditionType": ${JSON.stringify(
            cond
          )}`,
          errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
          errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
        });
    }
  }

  throwError({
    message: `You passed an invalid access control condition: ${cond}`,
    errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
    errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
  });
};

/**
*
* (SOLANA) Canonical Solana RPC Condition Formatter
*
* need to return in the exact format below:
* but make sure we don't include the optional fields:
 ---
  #[derive(Debug, Serialize, Deserialize, Clone)]
  #[serde(rename_all = "camelCase")]
  pub struct SolRpcCondition {
      pub method: String,
      pub params: Vec<serde_json::Value>,
      pub pda_params: Option<Vec<serde_json::Value>>,
      pub pda_interface: Option<SolPdaInterface>,
      pub chain: String,
      pub return_value_test: JsonReturnValueTestV2,
  }

  #[derive(Debug, Serialize, Deserialize, Clone)]
  #[serde(rename_all = "camelCase")]
  pub struct SolPdaInterface {
      pub offset: u64,
      pub fields: serde_json::Value,
  }
  ---
*
* @param { object } cond
* @param { boolean } requireV2Conditions
*
* @returns { any[] | AccsOperatorParams | AccsSOLV2Params | ILitError | any }
*/
export const canonicalSolRpcConditionFormatter = (
  cond: ConditionItem,
  requireV2Conditions: boolean = false
):
  | any[]
  | AccsOperatorParams
  | ConditionItem
  | AccsSOLV2Params
  | ILitError
  | any => {
  // -- if is array
  if (Array.isArray(cond)) {
    return cond.map((c: ConditionItem) =>
      canonicalSolRpcConditionFormatter(c, requireV2Conditions)
    );
  }

  // -- if there's a `operator` key in the object
  if ('operator' in cond) {
    return getOperatorParam(cond);
  }

  // -- if it has a return value
  if ('returnValueTest' in cond) {
    const { returnValueTest } = cond;

    const canonicalReturnValueTest = {
      // @ts-ignore
      key: returnValueTest.key,
      comparator: returnValueTest.comparator,
      value: returnValueTest.value,
    };

    // -- check if this is a sol v1 or v2 condition
    // -- v1 conditions didn't have any pda params or pda interface or pda key
    // -- SOL version 1:: return V2 must have params
    if ('pdaParams' in cond || requireV2Conditions) {
      const _assumedV2Cond = cond as AccsSOLV2Params;

      if (
        !('pdaInterface' in _assumedV2Cond) ||
        !('pdaKey' in _assumedV2Cond) ||
        !('offset' in _assumedV2Cond.pdaInterface) ||
        !('fields' in _assumedV2Cond.pdaInterface)
      ) {
        throwError({
          message: `Solana RPC Conditions have changed and there are some new fields you must include in your condition.  Check the docs here: https://developer.litprotocol.com/AccessControlConditions/solRpcConditions`,
          errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
          errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
        });
      }

      // -- else
      const canonicalPdaInterface = {
        offset: _assumedV2Cond.pdaInterface.offset,
        fields: _assumedV2Cond.pdaInterface.fields,
      };

      const _solV2Cond = cond as AccsSOLV2Params;

      const _requiredParams: AccsSOLV2Params = {
        method: _solV2Cond.method,
        params: _solV2Cond.params,
        pdaParams: _solV2Cond.pdaParams,
        pdaInterface: canonicalPdaInterface,
        pdaKey: _solV2Cond.pdaKey,
        chain: _solV2Cond.chain,
        returnValueTest: canonicalReturnValueTest,
      };

      return _requiredParams;

      // -- SOL version 2:: return default params
    } else {
      const _solV1Cond = cond;

      const _requiredParams = {
        // @ts-ignore
        method: _solV1Cond.method,
        // @ts-ignore
        params: _solV1Cond.params,
        chain: _solV1Cond.chain,
        returnValueTest: canonicalReturnValueTest,
      };

      return _requiredParams;
    }
  }

  // -- else
  throwError({
    message: `You passed an invalid access control condition: ${cond}`,
    errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
    errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
  });
};

/**
*
* (DEFAULT) Canonical Access Control Condition Formatter
*
* need to return in the exact format below:
 ---
  pub struct JsonAccessControlCondition {
    pub contract_address: String,
    pub chain: String,
    pub standard_contract_type: String,
    pub method: String,
    pub parameters: Vec<String>,
    pub return_value_test: JsonReturnValueTest,
  }
  ---
*
* @param { AccsDefaultParams | AccsOperatorParams | AccessControlConditions } cond
*
* @returns { any[] | AccsOperatorParams | AccsDefaultParams | any }
*/
export const canonicalAccessControlConditionFormatter = (
  cond: AccsDefaultParams | AccsOperatorParams | AccessControlConditions
): any[] | AccsOperatorParams | AccsDefaultParams | any => {
  // -- if it's an array
  if (Array.isArray(cond)) {
    return cond.map((c) => canonicalAccessControlConditionFormatter(c));
  }

  // -- if there's a `operator` key in the object
  if ('operator' in cond) {
    return getOperatorParam(cond);
  }

  if ('returnValueTest' in cond) {
    const _cond = cond as AccsDefaultParams;

    const _return: AccsDefaultParams = {
      contractAddress: _cond.contractAddress,
      chain: _cond.chain,
      standardContractType: _cond.standardContractType,
      method: _cond.method,
      parameters: _cond.parameters,
      returnValueTest: {
        comparator: _cond.returnValueTest.comparator,
        value: _cond.returnValueTest.value,
      },
    };

    return _return;
  }

  throwError({
    message: `You passed an invalid access control condition: ${cond}`,
    errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
    errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
  });
};

/**
*
* (EVM) Canonical EVM Contract Condition Formatter
*
*  need to return in the exact format below:
  ---
  pub struct JsonAccessControlCondition {
      pub contract_address: String,
      pub chain: String,
      pub standard_contract_type: String,
      pub method: String,
      pub parameters: Vec<String>,
      pub return_value_test: JsonReturnValueTest,
  }
  ---
*
* @param { AccsEVMParams | AccsOperatorParams | EvmContractConditions } cond
*
* @returns
*/
export const canonicalEVMContractConditionFormatter = (
  cond: AccsEVMParams | AccsOperatorParams | EvmContractConditions
): any[] | AccsOperatorParams | AccsEVMParams | any => {
  // -- if it's an array
  if (Array.isArray(cond)) {
    return cond.map((c) => canonicalEVMContractConditionFormatter(c));
  }

  // -- if there's a `operator` key in the object
  if ('operator' in cond) {
    const _cond = cond as AccsOperatorParams;

    return {
      operator: _cond.operator,
    };
  }

  if ('returnValueTest' in cond) {
    /* abi needs to match:
      pub name: String,
      /// Function input.
      pub inputs: Vec<Param>,
      /// Function output.
      pub outputs: Vec<Param>,
      #[deprecated(note = "The constant attribute was removed in Solidity 0.5.0 and has been \
          replaced with stateMutability. If parsing a JSON AST created with \
          this version or later this value will always be false, which may be wrong.")]
      /// Constant function.
      #[cfg_attr(feature = "full-serde", serde(default))]
      pub constant: bool,
      /// Whether the function reads or modifies blockchain state
      #[cfg_attr(feature = "full-serde", serde(rename = "stateMutability", default))]
      pub state_mutability: StateMutability,
      */

    const evmCond = cond as AccsEVMParams;

    const { functionAbi, returnValueTest } = evmCond;

    const canonicalAbi = {
      name: functionAbi.name,
      inputs: canonicalAbiParamss(functionAbi.inputs),
      outputs: canonicalAbiParamss(functionAbi.outputs),
      constant:
        typeof functionAbi.constant === 'undefined'
          ? false
          : functionAbi.constant,
      stateMutability: functionAbi.stateMutability,
    };

    const canonicalReturnValueTest = {
      key: returnValueTest.key,
      comparator: returnValueTest.comparator,
      value: returnValueTest.value,
    };

    const _return: AccsEVMParams = {
      contractAddress: evmCond.contractAddress,
      functionName: evmCond.functionName,
      functionParams: evmCond.functionParams,
      functionAbi: canonicalAbi,
      chain: evmCond.chain,
      returnValueTest: canonicalReturnValueTest,
    };

    return _return;
  }

  throwError({
    message: `You passed an invalid access control condition: ${cond}`,
    errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
    errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
  });
};

/**
*
* (COSMOS) Canonical Condition Formmater for Cosmos
*
* need to return in the exact format below:
 ---
  pub struct CosmosCondition {
      pub path: String,
      pub chain: String,
      pub return_value_test: JsonReturnValueTestV2,
  }
 ---
*
*
* @param { ConditionItem } cond
* @returns
*/
export const canonicalCosmosConditionFormatter = (
  cond: ConditionItem
): any[] | AccsOperatorParams | AccsCOSMOSParams | any => {
  // -- if it's an array
  if (Array.isArray(cond)) {
    return cond.map((c: any) => canonicalCosmosConditionFormatter(c));
  }

  // -- if there's a `operator` key in the object
  if ('operator' in cond) {
    const _cond = cond as AccsOperatorParams;

    return {
      operator: _cond.operator,
    };
  }

  if ('returnValueTest' in cond) {
    const _cosmosCond = cond as AccsCOSMOSParams;

    const { returnValueTest } = _cosmosCond;

    const canonicalReturnValueTest = {
      key: returnValueTest.key,
      comparator: returnValueTest.comparator,
      value: returnValueTest.value,
    };

    return {
      path: _cosmosCond.path,
      chain: _cosmosCond.chain,
      method: _cosmosCond?.method,
      parameters: _cosmosCond?.parameters,
      returnValueTest: canonicalReturnValueTest,
    };
  }

  throwError({
    message: `You passed an invalid access control condition: ${cond}`,
    errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
    errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
  });
};

/**
 *
 * Canonical ResourceId Formatter returning JSON signing resource id
 *
 * @param { JsonSigningResourceId } resId
 *
 * @returns { JsonSigningResourceId }
 *
 */
export const canonicalResourceIdFormatter = (
  resId: JsonSigningResourceId
): JsonSigningResourceId => {
  // need to return in the exact format below:
  return {
    baseUrl: resId.baseUrl,
    path: resId.path,
    orgId: resId.orgId,
    role: resId.role,
    extraData: resId.extraData,
  };
};
