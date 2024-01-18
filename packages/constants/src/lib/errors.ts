export enum LitErrorKind {
  Unknown = 'Unknown',
  Unexpected = 'Unexpected',
  Generic = 'Generic',
  Config = 'Config',
  Validation = 'Validation',
  Conversion = 'Conversion',
  Parser = 'Parser',
  Serializer = 'Serializer',
  Timeout = 'Timeout',
}

export const LIT_ERROR = {
  INVALID_PARAM_TYPE: {
    name: 'InvalidParamType',
    code: 'invalid_param_type',
    kind: LitErrorKind.Validation,
  },
  INVALID_ACCESS_CONTROL_CONDITIONS: {
    name: 'InvalidAccessControlConditions',
    code: 'invalid_access_control_conditions',
    kind: LitErrorKind.Validation,
  },
  WRONG_NETWORK_EXCEPTION: {
    name: 'WrongNetworkException',
    code: 'wrong_network_exception',
    kind: LitErrorKind.Validation,
  },
  MINTING_NOT_SUPPORTED: {
    name: 'MintingNotSupported',
    code: 'minting_not_supported',
    kind: LitErrorKind.Validation,
  },
  UNSUPPORTED_CHAIN_EXCEPTION: {
    name: 'UnsupportedChainException',
    code: 'unsupported_chain_exception',
    kind: LitErrorKind.Validation,
  },
  INVALID_UNIFIED_CONDITION_TYPE: {
    name: 'InvalidUnifiedConditionType',
    code: 'invalid_unified_condition_type',
    kind: LitErrorKind.Validation,
  },
  LIT_NODE_CLIENT_NOT_READY_ERROR: {
    name: 'LitNodeClientNotReadyError',
    code: 'lit_node_client_not_ready_error',
    kind: LitErrorKind.Unexpected,
  },
  UNAUTHROZIED_EXCEPTION: {
    name: 'UnauthroziedException',
    code: 'unauthrozied_exception',
    kind: LitErrorKind.Validation,
  },
  INVALID_ARGUMENT_EXCEPTION: {
    name: 'InvalidArgumentException',
    code: 'invalid_argument_exception',
    kind: LitErrorKind.Validation,
  },
  INVALID_BOOLEAN_EXCEPTION: {
    name: 'InvalidBooleanException',
    code: 'invalid_boolean_exception',
    kind: LitErrorKind.Validation,
  },
  UNKNOWN_ERROR: {
    name: 'UnknownError',
    code: 'unknown_error',
    kind: LitErrorKind.Unknown,
  },
  NO_WALLET_EXCEPTION: {
    name: 'NoWalletException',
    code: 'no_wallet_exception',
    kind: LitErrorKind.Validation,
  },
  WRONG_PARAM_FORMAT: {
    name: 'WrongParamFormat',
    code: 'wrong_param_format',
    kind: LitErrorKind.Validation,
  },
  LOCAL_STORAGE_ITEM_NOT_FOUND_EXCEPTION: {
    name: 'LocalStorageItemNotFoundException',
    code: 'local_storage_item_not_found_exception',
    kind: LitErrorKind.Unexpected,
  },
  LOCAL_STORAGE_ITEM_NOT_SET_EXCEPTION: {
    name: 'LocalStorageItemNotSetException',
    code: 'local_storage_item_not_set_exception',
    kind: LitErrorKind.Unexpected,
  },
  LOCAL_STORAGE_ITEM_NOT_REMOVED_EXCEPTION: {
    name: 'LocalStorageItemNotRemovedException',
    code: 'local_storage_item_not_removed_exception',
    kind: LitErrorKind.Unexpected,
  },
  REMOVED_FUNCTION_ERROR: {
    name: 'RemovedFunctionError',
    code: 'removed_function_error',
    kind: LitErrorKind.Validation,
  },
  LIT_NODE_CLIENT_BAD_CONFIG_ERROR: {
    name: 'LitNodeClientBadConfigError',
    code: 'lit_node_client_bad_config_error',
    kind: LitErrorKind.Config,
  },
  PARAMS_MISSING_ERROR: {
    name: 'ParamsMissingError',
    code: 'params_missing_error',
    kind: LitErrorKind.Validation,
  },
  UNKNOWN_SIGNATURE_TYPE: {
    name: 'UnknownSignatureType',
    code: 'unknown_signature_type',
    kind: LitErrorKind.Validation,
  },
  UNKNOWN_SIGNATURE_ERROR: {
    name: 'UnknownSignatureError',
    code: 'unknown_signature_error',
    kind: LitErrorKind.Validation,
  },
  SIGNATURE_VALIDATION_ERROR: {
    name: 'InvalidSignatureError',
    code: 'invalid_signature_error',
    kind: LitErrorKind.Validation,
  },
  PARAM_NULL_ERROR: {
    name: 'ParamNullError',
    code: 'param_null_error',
    kind: LitErrorKind.Validation,
  },
  UNKNOWN_DECRYPTION_ALGORITHM_TYPE_ERROR: {
    name: 'UnknownDecryptionAlgorithmTypeError',
    code: 'unknown_decryption_algorithm_type_error',
    kind: LitErrorKind.Validation,
  },
  WASM_INIT_ERROR: {
    name: 'WasmInitError',
    code: 'wasm_init_error',
    kind: LitErrorKind.Unexpected,
  },
  NODEJS_EXCEPTION: {
    name: 'NodejsException',
    code: 'nodejs_exception',
    kind: LitErrorKind.Unexpected,
  },
  WALLET_SIGNATURE_NOT_FOUND_ERROR: {
    name: 'WalletSignatureNotFoundError',
    code: 'wallet_signature_not_found_error',
    kind: LitErrorKind.Validation,
  },
  NO_VALID_SHARES: {
    name: 'NoValidShares',
    code: 'no_valid_shares',
    kind: LitErrorKind.Unexpected,
  },
  INVALID_NODE_ATTESTATION: {
    name: 'InvalidNodeAttestation',
    code: 'invalid_node_attestation',
    kind: LitErrorKind.Unexpected,
  },
  INVALID_ETH_BLOCKHASH: {
    name: 'InvalidEthBlockhash',
    code: 'invalid_eth_blockhash',
    kind: LitErrorKind.Unexpected,
  },
};

export const LIT_ERROR_CODE = {
  NODE_NOT_AUTHORIZED: 'NodeNotAuthorized',
};
