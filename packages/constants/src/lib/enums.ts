/** ---------- Chains ---------- */
export enum VMTYPE {
    EVM = 'EVM',
    SVM = 'SVM',
    CVM = 'CVM',
}

export enum SIGTYPE {
    BLS = 'BLS',
    ECDSA = 'ECDSA',
}

/**
 * The only either possible error types
 */
 export const enum EITHER_TYPE {
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}