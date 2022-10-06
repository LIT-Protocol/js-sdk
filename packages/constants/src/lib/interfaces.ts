/** ---------- Common Interfaces ---------- */
export interface ILitError{
    message?: string,
    name?: string,
    errorCode?: string,
    error?: ILitErrorTypeParams,
}

export interface ILitErrorType{
    [key: string ] : ILitErrorTypeParams
}

export interface ILitErrorTypeParams{
    NAME: string,
    CODE: string,
}

/**
 * The only either possible error types
 */
 export const enum IEitherErrorType{
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}

/**
 * A standardized way to return either error or success
 */
export interface IEither{
    type: 'ERROR' | 'SUCCESS',
    result: any | ILitError
}

/**
 * 
 * This method should be used when there's an expected error
 * 
 * @param { any } result 
 * @returns { IEither }
 */
export const ELeft = (result: any) : IEither => {
    return {
        type: IEitherErrorType.ERROR,
        result: result,
    }
}

/**
 * 
 * This method should be used when there's an expected success outcome
 * 
 * @param result 
 * @returns 
 */
export const ERight = (result: any) : IEither => {
    return {
        type: IEitherErrorType.SUCCESS,
        result: result,
    }
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

/** ---------- Auth Sig ---------- */

// TODO: This should ideally be generated from the rust side
// pub struct JsonAuthSig {
//     pub sig: String,
//     pub derived_via: String,
//     pub signed_message: String,
//     pub address: String,
//     pub capabilities: Option<Vec<JsonAuthSig>>,
//     pub algo: Option<String>,
// }
export interface JsonAuthSig{
    sig: string,
    derivedVia: string,
    signedMessage: string,
    address: string,
    capabilities?: [],
    algo?: [],
}

export interface CheckAndSignAuthParams {
    chain: string,
    resources: any[],
    switchChain: boolean,
}

/** ---------- Web3 ---------- */
export interface IProvider{
    provider: any,
    account: string,
}


/** ---------- Crypto ---------- */
export interface EncryptedString{
    symmetricKey: Uint8Array,
    encryptedString: Blob,
    encryptedData?: Blob
}