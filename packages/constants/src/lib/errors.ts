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
} as const;
/**
 * @deprecated Will be removed - Use LIT_ERROR_KIND instead
 * Alias for LIT_ERROR_KIND. Added for backwards compatibility.
 * See {@link LIT_ERROR_KIND}
 */
export const LitErrorKind = LIT_ERROR_KIND;

export const LIT_ERROR = {
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
  UNAUTHROZIED_EXCEPTION: {
    name: 'UnauthroziedException',
    code: 'unauthrozied_exception',
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
  SIGNATURE_VALIDATION_ERROR: {
    name: 'InvalidSignatureError',
    code: 'invalid_signature_error',
    kind: LIT_ERROR_KIND.Validation,
  },
  PARAM_NULL_ERROR: {
    name: 'ParamNullError',
    code: 'param_null_error',
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
  INIT_ERROR: {
    name: 'InitError',
    code: 'init_error',
    kind: LIT_ERROR_KIND.Unexpected,
  },
};

export const LIT_ERROR_CODE = {
  NODE_NOT_AUTHORIZED: 'NodeNotAuthorized',
};
