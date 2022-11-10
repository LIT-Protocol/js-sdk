import {
    ELeft,
    ERight,
    IEither,
    KV,
    LIT_AUTH_SIG_CHAIN_KEYS,
    LIT_ERROR,
} from '@litprotocol-dev/constants';
import { ILitError } from '@litprotocol-dev/constants';
import { paramsValidators } from './params-validators';

// ----- Real Modules -----
/**
 *
 * Print error message based on Error interface
 *
 * @param { Error } e
 * @returns { void }
 */
export const printError = (e: Error): void => {
    console.log('Error Stack', e.stack);
    console.log('Error Name', e.name);
    console.log('Error Message', e.message);
};

/**
 *
 * Find the element that occurs the most in an array
 *
 * @param { Array<any> } arr
 * @returns { any } the element that appeared the most
 */
export const mostCommonString = (arr: Array<any>): any => {
    return arr
        .sort(
            (a, b) =>
                arr.filter((v) => v === a).length -
                arr.filter((v) => v === b).length
        )
        .pop();
};

/**
 *
 * Standardized way to throw error in Lit Protocol projects
 * TODO: remove errorCode and use standardized ILitError type instead
 *
 * @param { ILitError }
 * @property { string } message
 * @property { string } name
 * @property { string } errorCode
 */
export const throwError = ({
    message,
    name,
    errorCode,
    error,
}: ILitError): never => {
    const errConstructorFunc = function (
        this: any,
        message: string,
        name: string,
        errorCode: string
    ) {
        this.message = message;
        this.name = name;
        this.errorCode = errorCode;
    };

    throw new (errConstructorFunc as any)(
        message,
        (name = error?.name ?? name),
        (errorCode = error?.code ?? errorCode)
    );
};

declare global {
    var litConfig: any;
}

export const throwRemovedFunctionError = (functionName: string) => {
    throwError({
        message: `This function "${functionName}" has been removed. Please use the old SDK.`,
        error: LIT_ERROR.REMOVED_FUNCTION_ERROR,
    });
};

/**
 *
 * console.log but prepend [Lit-JS-SDK] before the message
 *
 * @param { any } args
 *
 * @returns { void }
 */
export const log = (...args: any): void => {
    // -- validate
    if (
        globalThis &&
        globalThis?.litConfig &&
        globalThis?.litConfig.debug === false
    ) {
        return;
    }

    // -- execute
    args.unshift('[Lit-JS-SDK]');
    console.log(...args);
};

/**
 *
 * Get the type of a variable, could be an object instance type.
 * eg Uint8Array instance should return 'Uint8Array` as string
 * or simply a `string` or `int` type
 *
 * @param { any } value
 * @returns { string } type
 */
export const getVarType = (value: any): string => {
    return Object.prototype.toString.call(value).slice(8, -1);
};

/**
 *
 *  Check if the given value is the given type
 *  If not, throw `invalidParamType` error
 *
 * @property { any } value
 * @property { Array<String> } allowedTypes
 * @property { string } paramName
 * @property { string } functionName
 * @property { boolean } throwOnError
 *
 * @returns { Boolean } true/false
 *
 */
export const checkType = ({
    value,
    allowedTypes,
    paramName,
    functionName,
    throwOnError = true,
}: {
    value: any;
    allowedTypes: Array<string> | any;
    paramName: string;
    functionName: string;
    throwOnError?: boolean;
}): boolean => {
    // -- validate
    if (!allowedTypes.includes(getVarType(value))) {
        const message = `Expecting ${allowedTypes.join(
            ' or '
        )} type for parameter named ${paramName} in Lit-JS-SDK function ${functionName}(), but received "${getVarType(
            value
        )}" type instead. value: ${
            value instanceof Object ? JSON.stringify(value) : value
        }`;

        if (throwOnError) {
            throwError({
                message,
                error: LIT_ERROR.INVALID_PARAM,
            });
        }
        return false;
    }

    // -- else
    return true;
};

export const safeParams = ({
    functionName,
    params,
}: {
    functionName: string;
    params: any[] | any;
}) => {
    const validators = paramsValidators as KV;

    const validator = validators[functionName](params);

    if (!validator) {
        log(`This function ${functionName} is skipping params safe guarding.`);
        return true;
    }

    return validator;
};

/**
 *
 * @param { object } authSig
 * @param { string } chain
 * @param { string } functionName
 *
 * @returns { boolean }
 */
export const checkIfAuthSigRequiresChainParam = (
    authSig: object,
    chain: string,
    functionName: string
): boolean => {
    log('checkIfAuthSigRequiresChainParam');
    for (const key of LIT_AUTH_SIG_CHAIN_KEYS) {
        if (key in authSig) {
            log('Testing 1');
            return true;
        }
    }

    // if we're here, then we need the chain param
    if (
        !checkType({
            value: chain,
            allowedTypes: ['String'],
            paramName: 'chain',
            functionName,
        })
    ) {
        log('Testing 2');
        return false;
    }

    log('Testing 3');
    return true;
};

/**
 * TODO: Fix "any"
 * Sort object
 *
 * @param { any } obj
 * @returns { any }
 */
export const sortedObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sortedObject);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result: any = {};

    // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
    sortedKeys.forEach((key) => {
        result[key] = sortedObject(obj[key]);
    });

    return result;
};

/**
 *
 * Convert number to hex
 * @param { number } v
 * @return { string } hex value prexied with 0x
 */
export const numberToHex = (v: number): string => {
    return '0x' + v.toString(16);
};

/**
 *
 * Get the local storage item by key
 *
 * @param { string } key
 */
export const getStorageItem = (key: string): IEither => {
    const item = localStorage.getItem(key);

    let keyOrError: IEither;

    if (!item) {
        keyOrError = ELeft({
            message: `Failed to get ${key} from local storage`,
            error: LIT_ERROR.LOCAL_STORAGE_ITEM_NOT_FOUND_EXCEPTION,
        });
    } else {
        keyOrError = ERight(item);
    }

    return keyOrError;
};

/**
 *
 *  Check if the given value is the given type
 *  If not, throw `invalidParamType` error
 *
 * @param { any } value
 * @param { string } type
 * @param { string } paramName
 * @param { string } functionName
 * @returns { Boolean } true/false
 */
export const is = (
    value: any,
    type: string,
    paramName: string,
    functionName: string,
    throwOnError = true
) => {
    if (getVarType(value) !== type) {
        let message = `Expecting "${type}" type for parameter named ${paramName} in Lit-JS-SDK function ${functionName}(), but received "${getVarType(
            value
        )}" type instead. value: ${
            value instanceof Object ? JSON.stringify(value) : value
        }`;

        if (throwOnError) {
            throwError({
                message,
                name: 'invalidParamType',
                errorCode: 'invalid_param_type',
            });
        }
        return false;
    }

    return true;
};

/**
 * Convert types before sending to Lit Actions as jsParams, some JS types don't serialize well, so we will convert them before sending to the nodes
 *
 * @param { object } params.jsParams The jsParams you are sending
 * @returns { object } The jsParams object, but with any incompatible types automatically converted
 */
export const convertLitActionsParams = (jsParams: object): object => {
    // -- property
    const convertedParams: KV = {};

    // -- execute
    for (const [key, value] of Object.entries(jsParams)) {
        const _key: string = key;
        const _value: any = value;

        // -- get value type
        const varType = getVarType(_value);

        // -- case: Unit8Array
        if (varType === 'Uint8Array') {
            convertedParams[_key] = Array.from(_value);
            // -- case: Object, recurse over any objects
        } else if (varType === 'Object') {
            convertedParams[_key] = convertLitActionsParams(_value);
        }
        // -- default
        else {
            convertedParams[_key] = _value;
        }
    }

    return convertedParams;
};

export const isNode = () => {
    var isNode = false;    
    if (typeof process === 'object') {
      if (typeof process.versions === 'object') {
        if (typeof process.versions.node !== 'undefined') {
          isNode = true;
        }
      }
    }
    return isNode;
}
export const isBrowser = () => {
    return isNode() === false;
}