// @ts-expect-error No types available for this package
import { Options, VError } from '@openagenda/verror';

import { ConstantValues } from './constants/constants';

export const LIT_ERROR_KIND = {
  Unknown: 'Unknown',
  Unexpected: 'Unexpected',
  Generic: 'Generic',
  Config: 'Config',
  Validation: 'Validation',
  Conversion: 'Conversion',
  Parser: 'Parser',
  Serializer: 'Serializer',
  Timeout: 'Timeout',
  Pricing: 'Pricing',
} as const;

interface ErrorConfig {
  name: string;
  code: string;
  kind: ConstantValues<typeof LIT_ERROR_KIND>;
}

export const LIT_ERROR: Record<string, ErrorConfig> = {
  MAX_PRICE_TOO_LOW: {
    name: 'MaxPriceTooLow',
    code: 'max_price_too_low',
    kind: LIT_ERROR_KIND.Pricing,
  },
  INVALID_PARAM_TYPE: {
    name: 'InvalidParamType',
    code: 'invalid_param_type',
    kind: LIT_ERROR_KIND.Validation,
  },
  INVALID_ACCESS_CONTROL_CONDITIONS: {
    name: 'InvalidAccessControlConditions',
    code: 'invalid_access_control_conditions',
    kind: LIT_ERROR_KIND.Validation,
  },
  WRONG_NETWORK_EXCEPTION: {
    name: 'WrongNetworkException',
    code: 'wrong_network_exception',
    kind: LIT_ERROR_KIND.Validation,
  },
  MINTING_NOT_SUPPORTED: {
    name: 'MintingNotSupported',
    code: 'minting_not_supported',
    kind: LIT_ERROR_KIND.Validation,
  },
  UNSUPPORTED_CHAIN_EXCEPTION: {
    name: 'UnsupportedChainException',
    code: 'unsupported_chain_exception',
    kind: LIT_ERROR_KIND.Validation,
  },
  INVALID_UNIFIED_CONDITION_TYPE: {
    name: 'InvalidUnifiedConditionType',
    code: 'invalid_unified_condition_type',
    kind: LIT_ERROR_KIND.Validation,
  },
  LIT_NODE_CLIENT_NOT_READY_ERROR: {
    name: 'LitNodeClientNotReadyError',
    code: 'lit_node_client_not_ready_error',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  UNAUTHORIZED_EXCEPTION: {
    name: 'UnauthorizedException',
    code: 'unauthorized_exception',
    kind: LIT_ERROR_KIND.Validation,
  },
  INVALID_ARGUMENT_EXCEPTION: {
    name: 'InvalidArgumentException',
    code: 'invalid_argument_exception',
    kind: LIT_ERROR_KIND.Validation,
  },
  INVALID_BOOLEAN_EXCEPTION: {
    name: 'InvalidBooleanException',
    code: 'invalid_boolean_exception',
    kind: LIT_ERROR_KIND.Validation,
  },
  UNKNOWN_ERROR: {
    name: 'UnknownError',
    code: 'unknown_error',
    kind: LIT_ERROR_KIND.Unknown,
  },
  NO_WALLET_EXCEPTION: {
    name: 'NoWalletException',
    code: 'no_wallet_exception',
    kind: LIT_ERROR_KIND.Validation,
  },
  WRONG_PARAM_FORMAT: {
    name: 'WrongParamFormat',
    code: 'wrong_param_format',
    kind: LIT_ERROR_KIND.Validation,
  },
  LOCAL_STORAGE_ITEM_NOT_FOUND_EXCEPTION: {
    name: 'LocalStorageItemNotFoundException',
    code: 'local_storage_item_not_found_exception',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  LOCAL_STORAGE_ITEM_NOT_SET_EXCEPTION: {
    name: 'LocalStorageItemNotSetException',
    code: 'local_storage_item_not_set_exception',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  LOCAL_STORAGE_ITEM_NOT_REMOVED_EXCEPTION: {
    name: 'LocalStorageItemNotRemovedException',
    code: 'local_storage_item_not_removed_exception',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  REMOVED_FUNCTION_ERROR: {
    name: 'RemovedFunctionError',
    code: 'removed_function_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  UNSUPPORTED_METHOD_ERROR: {
    name: 'UnsupportedMethodError',
    code: 'unsupported_method_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  LIT_NODE_CLIENT_BAD_CONFIG_ERROR: {
    name: 'LitNodeClientBadConfigError',
    code: 'lit_node_client_bad_config_error',
    kind: LIT_ERROR_KIND.Config,
  },
  PARAMS_MISSING_ERROR: {
    name: 'ParamsMissingError',
    code: 'params_missing_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  UNKNOWN_SIGNATURE_TYPE: {
    name: 'UnknownSignatureType',
    code: 'unknown_signature_type',
    kind: LIT_ERROR_KIND.Validation,
  },
  UNKNOWN_SIGNATURE_ERROR: {
    name: 'UnknownSignatureError',
    code: 'unknown_signature_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  INVALID_SIGNATURE_ERROR: {
    name: 'InvalidSignatureError',
    code: 'invalid_signature_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  PARAM_NULL_ERROR: {
    name: 'ParamNullError',
    code: 'param_null_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  CURVE_TYPE_NOT_FOUND_ERROR: {
    name: 'CurveTypeNotFoundError',
    code: 'curve_type_not_found_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  UNKNOWN_DECRYPTION_ALGORITHM_TYPE_ERROR: {
    name: 'UnknownDecryptionAlgorithmTypeError',
    code: 'unknown_decryption_algorithm_type_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  WASM_INIT_ERROR: {
    name: 'WasmInitError',
    code: 'wasm_init_error',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  NODEJS_EXCEPTION: {
    name: 'NodejsException',
    code: 'nodejs_exception',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  NODE_ERROR: {
    name: 'NodeError',
    code: 'node_error',
    kind: LIT_ERROR_KIND.Unknown,
  },
  WALLET_SIGNATURE_NOT_FOUND_ERROR: {
    name: 'WalletSignatureNotFoundError',
    code: 'wallet_signature_not_found_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  NO_VALID_SHARES: {
    name: 'NoValidShares',
    code: 'no_valid_shares',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  INVALID_NODE_ATTESTATION: {
    name: 'InvalidNodeAttestation',
    code: 'invalid_node_attestation',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  INVALID_ETH_BLOCKHASH: {
    name: 'InvalidEthBlockhash',
    code: 'invalid_eth_blockhash',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  INVALID_SESSION_SIGS: {
    name: 'InvalidSessionSigs',
    code: 'invalid_session_sigs',
    kind: LIT_ERROR_KIND.Validation,
  },
  INIT_ERROR: {
    name: 'InitError',
    code: 'init_error',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  NETWORK_ERROR: {
    name: 'NetworkError',
    code: 'network_error',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  LIT_NETWORK_ERROR: {
    name: 'LitNetworkError',
    code: 'lit_network_error',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  TRANSACTION_ERROR: {
    name: 'TransactionError',
    code: 'transaction_error',
    kind: LIT_ERROR_KIND.Unexpected,
  },
  AUTOMATION_ERROR: {
    name: 'AutomationError',
    code: 'automation_error',
    kind: LIT_ERROR_KIND.Unexpected,
  },
} as const;

export const LIT_ERROR_CODE = {
  NODE_NOT_AUTHORIZED: 'NodeNotAuthorized',
} as const;

export abstract class LitError extends VError {
  protected constructor(
    options: Error | Options,
    message: string,
    ...params: unknown[]
  ) {
    super(options, message, ...params);
  }
}

type LitErrorConstructor = new (
  options: Error | Options,
  message: string,
  ...params: unknown[]
) => LitError;

export interface LitErrorClass {
  name: string;
  code: string;
  kind: string;
}

function createErrorClass({
  name,
  code,
  kind,
}: LitErrorClass): LitErrorConstructor {
  return class extends LitError {
    // VError has optional options parameter, but we make it required so thrower remembers to pass all the useful info
    constructor(
      options: Error | Options,
      message: string,
      ...params: unknown[]
    ) {
      if (options instanceof Error) {
        options = {
          cause: options,
        };
      }

      // If the cause is not an Error, wrap it in one
      if (!(options.cause instanceof Error)) {
        options.cause = new Error(options.cause);
      }

      super(
        {
          name,
          ...options,
          meta: {
            code,
            kind,
            ...options.meta,
          },
        },
        message,
        ...params
      );
    }
  };
}

const errorClasses: Record<string, LitErrorConstructor> = {};
for (const key in LIT_ERROR) {
  if (key in LIT_ERROR) {
    const errorDef = LIT_ERROR[key];
    errorClasses[errorDef.name] = createErrorClass(errorDef);
  }
}

// Re-export to allow MultiErrors but keep the centralized VError import here
const MultiError = VError.MultiError;
export { MultiError };

export const {
  AutomationError,
  CurveTypeNotFoundError,
  InitError,
  InvalidAccessControlConditions,
  InvalidArgumentException,
  InvalidBooleanException,
  InvalidEthBlockhash,
  InvalidSessionSigs,
  InvalidNodeAttestation,
  InvalidParamType,
  InvalidSignatureError,
  InvalidUnifiedConditionType,
  LitNetworkError,
  LitNodeClientBadConfigError,
  LitNodeClientNotReadyError,
  LocalStorageItemNotFoundException,
  LocalStorageItemNotRemovedException,
  LocalStorageItemNotSetException,
  MaxPriceTooLow,
  MintingNotSupported,
  NetworkError,
  NoValidShares,
  NoWalletException,
  NodeError,
  NodejsException,
  ParamNullError,
  ParamsMissingError,
  RemovedFunctionError,
  TransactionError,
  UnauthorizedException,
  UnknownDecryptionAlgorithmTypeError,
  UnknownError,
  UnknownSignatureError,
  UnknownSignatureType,
  UnsupportedChainException,
  UnsupportedMethodError,
  WalletSignatureNotFoundError,
  WasmInitError,
  WrongNetworkException,
  WrongParamFormat,
} = errorClasses;
