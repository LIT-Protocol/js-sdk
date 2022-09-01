export interface ILitError{
    message?: string,
    name: string,
    errorCode: string,
}

export interface ILitErrorType{
    [key: string] : {
        NAME: string,
        CODE: string,
    }
}