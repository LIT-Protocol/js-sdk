/** ---------- Common Interfaces ---------- */
export interface ILitError{
    message?: string,
    name?: string,
    errorCode?: string,
    error?: ILitErrorTypeParams,
}

export interface ILitErrorType{
    [key: string] : ILitErrorTypeParams
}

export interface ILitErrorTypeParams{
    NAME: string,
    CODE: string,
}

/** ---------- Access Control Conditions Interfaces ---------- */
/**
 * TODO: We should probably create a schema for these different types of params
 */
export interface AccsOperatorParams { 
    operator: string
}

export interface AccsRegularParams{
    conditionType?: string,
    returnValueTest: {
        key?: string,
        comparator: string,
        value: string
    },
    method?: string,
    params?: [],
    chain: string,
}

export interface AccsDefaultParams extends AccsRegularParams{
    contractAddress?: string,
    standardContractType?: string,
    parameters?: [],
}

export interface AccsSOLV2Params extends AccsRegularParams{
    pdaKey: string,
    pdaInterface: {
        offset: string,
        fields: string,
    }
    pdaParams: [],   
}

export interface ABIParams {
    name: string,
    type: string,
}

export interface FunctionABI { 
    name: string,
    type?: string,
    stateMutability: string,
    inputs: Array<ABIParams | any>,
    outputs: Array<ABIParams | any>,
    constant: string | boolean,
}

export interface AccsEVMParams extends AccsRegularParams{
    functionAbi: FunctionABI,
    contractAddress: string,
    functionName: string,
    functionParams: [],
}

export interface AccsCOSMOSParams extends AccsRegularParams{
    path: string,
}