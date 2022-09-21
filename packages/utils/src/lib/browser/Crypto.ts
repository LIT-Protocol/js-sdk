import { ABIParams, AccsCOSMOSParams, AccsDefaultParams, AccsEVMParams, AccsOperatorParams, AccsRegularParams, AccsSOLV2Params, ILitError, ILitErrorType, LIT_ERROR_TYPE } from "@litprotocol-dev/constants";
import { log, throwError } from "../utils";

/** ---------- Local Functions ---------- */

/**
 * 
 * Canonical ABI Params
 * 
 * @param { Array<ABIParams> } params 
 * @returns { Array<ABIParams> }
 */
 const canonicalAbiParamss = (params: Array<ABIParams>) : Array<ABIParams> => {
    return params.map((param) => ({
        name: param.name,
        type: param.type,
    }));
}

/**
 * TODO: a template for Canonical Condition Formatter
 */
// const canonicalFormatter = (cond: object, options: CanonicalFormatterOptions) => {

//     // -- set error

//     // -- if it's an array

//     // -- if it's an operator

//     // -- callback custom

//     // -- throw error

// }

/** ---------- Exports ---------- */

/**
 * 
 * Hash the unified access control conditions using SHA-256 in a deterministic way.
 * 
 * @param { Array<object> } unifiedAccessControlConditions - The unified access control conditions to hash.
 * @returns { Promise<ArrayBuffer> } A promise that resolves to an ArrayBuffer that contains the hash
 */
export const hashUnifiedAccessControlConditions = (
    unifiedAccessControlConditions: Array<object>
) : Promise<ArrayBuffer> => {

    const conditions = unifiedAccessControlConditions.map((condition: object) => {
        canonicalUnifiedAccessControlConditionFormatter(condition);
    })

    const toHash = JSON.stringify(conditions);

    log("Hashing unified access control conditions: ", toHash);
    
    const encoder = new TextEncoder();
    const data = encoder.encode(toHash);
    return crypto.subtle.digest("SHA-256", data);

}


/**
 * 
 * Canonical Unified Access Control Condition Formatter
 * 
 * @param { object } cond 
 * @returns { any[] | AccsOperatorParams | any } 
 */
export const canonicalUnifiedAccessControlConditionFormatter = (cond: object | []) : any[] | AccsOperatorParams | any =>  {

    // -- set error
    const _error = LIT_ERROR_TYPE['INVALID_ACCESS_CONTROL_CONDITIONS'];

    // -- if it's an array
    if (Array.isArray(cond)) {
        return cond.map((c: object) => canonicalUnifiedAccessControlConditionFormatter(c));
    }
    
    // -- if there's a `operator` key in the object
    if ("operator" in cond) {

        const _cond = cond as AccsOperatorParams;

        return {
            operator: _cond.operator,
        };
    }
    
    // -- otherwise 
    if ("returnValueTest" in cond) {
        
        const _cond = (cond as AccsRegularParams);

        if (_cond.conditionType === "solRpc") {
            return canonicalSolRpcConditionFormatter(cond, true);
        } else if (_cond.conditionType === "evmBasic") {
            return canonicalAccessControlConditionFormatter(cond);
        } else if (_cond.conditionType === "evmContract") {
            return canonicalEVMContractConditionFormatter(cond);
        } else if (_cond.conditionType === "cosmos") {
            return canonicalCosmosConditionFormatter(cond);
        } else {

            throwError({
                message: `You passed an invalid access control condition that is missing or has a wrong "conditionType": ${JSON.stringify(
                    cond
                )}`,
                name: _error.NAME,
                errorCode: _error.CODE,
            });
        }
    }
  
    throwError({
      message: `You passed an invalid access control condition: ${cond}`,
      name: _error.NAME,
      errorCode: _error.CODE,
    });
  }


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
 * @returns { any[] | AccsOperatorParams | AccsRegularParams | AccsSOLV2Params | ILitError | any }
 */
export const canonicalSolRpcConditionFormatter = (
    cond: object,
    requireV2Conditions: boolean = false
) : any[] | AccsOperatorParams | AccsRegularParams | AccsSOLV2Params | ILitError | any => {


    // -- set error
    const _error = LIT_ERROR_TYPE['INVALID_ACCESS_CONTROL_CONDITIONS'];

    // -- if is array
    if (Array.isArray(cond)) {
        return cond.map((c: object) => canonicalSolRpcConditionFormatter(c, requireV2Conditions));
    }

    // -- if it operator
    if ("operator" in cond) {

        const _cond = (cond as AccsOperatorParams);

        return {
            operator: _cond.operator,
        };
    }

    // -- if it has a return value
    if ("returnValueTest" in cond) {

        const _cond = (cond as AccsRegularParams);

        const { returnValueTest } = _cond;

        const canonicalReturnValueTest = {
            key: returnValueTest.key,
            comparator: returnValueTest.comparator,
            value: returnValueTest.value,
        };

        // -- check if this is a sol v1 or v2 condition
        // -- v1 conditions didn't have any pda params or pda interface or pda key
        if ("pdaParams" in cond || requireV2Conditions) {

            const _assumedV2Cond = (cond as AccsSOLV2Params);
            

            // -- SOL version 1:: return V2 must have params
            if (
                !("pdaInterface" in _assumedV2Cond) ||
                !("pdaKey" in _assumedV2Cond) ||
                !("offset" in _assumedV2Cond.pdaInterface) ||
                !("fields" in _assumedV2Cond.pdaInterface)
            ) {

                throwError({
                    message: `Solana RPC Conditions have changed and there are some new fields you must include in your condition.  Check the docs here: https://developer.litprotocol.com/AccessControlConditions/solRpcConditions`,
                    name: _error.NAME,
                    errorCode: _error.CODE,
                });
            }

            // -- else
            const canonicalPdaInterface = {
                offset: _assumedV2Cond.pdaInterface.offset,
                fields: _assumedV2Cond.pdaInterface.fields,
            };

            const _solV2Cond = (cond as AccsSOLV2Params);

            const _returnCond : AccsSOLV2Params = {
                method: _solV2Cond.method,
                params: _solV2Cond.params,
                pdaParams: _solV2Cond.pdaParams,
                pdaInterface: canonicalPdaInterface,
                pdaKey: _solV2Cond.pdaKey,
                chain: _solV2Cond.chain,
                returnValueTest: canonicalReturnValueTest,
            };

            return _returnCond;

        // -- SOL version 2:: return default params
        } else {

            const _solV1Cond = (cond as AccsRegularParams);
            
            const _returnCond : AccsRegularParams = {
                method: _solV1Cond.method,
                params: _solV1Cond.params,
                chain: _solV1Cond.chain,
                returnValueTest: canonicalReturnValueTest,
            };
            
            return _returnCond
        }
    }

    // -- else
    throwError({
        message: `You passed an invalid access control condition: ${cond}`,
        name: _error.NAME,
        errorCode: _error.CODE,
    });
}


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
 * @param { object } cond 
 *  
 * @returns { any[] | AccsOperatorParams | AccsDefaultParams | any }
 */
export const canonicalAccessControlConditionFormatter = (cond: object) : any[] | AccsOperatorParams | AccsDefaultParams | any => {

    // -- set error
    const _error = LIT_ERROR_TYPE['INVALID_ACCESS_CONTROL_CONDITIONS'];
    
    // -- if it's an array
    if (Array.isArray(cond)) {
        return cond.map((c) => canonicalAccessControlConditionFormatter(c));
    }
  
    // -- if it operator
    if ("operator" in cond) {

        const _cond = (cond as AccsOperatorParams);

        return {
            operator: _cond.operator,
        };
    }

    if ("returnValueTest" in cond) {

        const _cond = cond as AccsDefaultParams;

        const _return : AccsDefaultParams = {
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
        name: _error.NAME,
        errorCode: _error.CODE,
    });
  }


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
 * @param { object } cond
 *  
 * @returns 
 */
export const canonicalEVMContractConditionFormatter = (cond:object) : any[] | AccsOperatorParams | AccsEVMParams | any => {

    // -- set error
    const _error = LIT_ERROR_TYPE['INVALID_ACCESS_CONTROL_CONDITIONS'];

    // -- if it's an array
    if (Array.isArray(cond)) {
        return cond.map((c) => canonicalEVMContractConditionFormatter(c));
    }

    // -- if there's a `operator` key in the object
    if ("operator" in cond) {

        const _cond = cond as AccsOperatorParams;

        return {
            operator: _cond.operator,
        };
    }

    if ("returnValueTest" in cond) {
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
                typeof functionAbi.constant === "undefined"
                ? false
                : functionAbi.constant,
            stateMutability: functionAbi.stateMutability,
        };

        const canonicalReturnValueTest = {
            key: returnValueTest.key,
            comparator: returnValueTest.comparator,
            value: returnValueTest.value,
        };

        const _return : AccsEVMParams = {
            contractAddress: evmCond.contractAddress,
            functionName: evmCond.functionName,
            functionParams: evmCond.functionParams,
            functionAbi: canonicalAbi,
            chain: evmCond.chain,
            returnValueTest: canonicalReturnValueTest,
        }

        return _return
    }

    throwError({
        message: `You passed an invalid access control condition: ${cond}`,
        name: _error.NAME,
        errorCode: _error.CODE,
    });
}

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
 * @param { object } cond 
 * @returns 
 */
export const canonicalCosmosConditionFormatter = (cond: object) : any[] | AccsOperatorParams | AccsCOSMOSParams | any => {
  
    // -- set error
    const _error = LIT_ERROR_TYPE['INVALID_ACCESS_CONTROL_CONDITIONS'];

    // -- if it's an array
    if (Array.isArray(cond)) {
        return cond.map((c) => canonicalCosmosConditionFormatter(c));
    }

    // -- if there's a `operator` key in the object
    if ("operator" in cond) {

        const _cond = cond as AccsOperatorParams;

        return {
            operator: _cond.operator,
        };
    }
  
    if ("returnValueTest" in cond) {

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
        returnValueTest: canonicalReturnValueTest,
        };
    }
  
    throwError({
      message: `You passed an invalid access control condition: ${cond}`,
      name: _error.NAME,
      errorCode: _error.CODE,
    });
  }