import { ILitErrorType } from "./interfaces";

export const LIT_ERROR_TYPE : ILitErrorType = {
    INVALID_PARAM : {
        NAME: 'invalidParamType',
        CODE: 'invalid_param_type',
    },
    INVALID_ACCESS_CONTROL_CONDITIONS : {
        NAME: 'InvalidAccessControlCondition',
        CODE: 'invalid_access_control_condition',
    },
    WRONG_NETWORK_EXCEPTION : {
        NAME: 'WrongNetworkException',
        CODE: 'wrong_network',
    },
    MINTING_NOT_SUPPORTED : {
        NAME: 'MintingNotSupported',
        CODE: 'minting_not_supported',
    },
    UNSUPPORTED_CHAIN_EXCEPTION : {
        NAME: 'UnsupportedChainException',
        CODE: 'unsupported_chain',
    },
    INVALID_UNIFIED_CONDITION_TYPE : {
        NAME: 'InvalidUnifiedConditionType',
        CODE: 'invalid_unified_condition_type',
    },
    LIT_NODE_CLIENT_NOT_READY_ERROR : {
        NAME: 'LitNodeClientNotReadyError',
        CODE: 'lit_node_client_not_ready_error',
    },
    UNAUTHROZIED_EXCEPTION : {
        NAME: 'UnauthorizedException',
        CODE: 'not_authorized',
    },
    INVALID_ARGUMENT_EXCEPTION : {
        NAME: 'InvalidArgumentException',
        CODE: 'invalid_argument_exception',
    },
    UNKNOWN_ERROR : {
        NAME: 'UnknownError',
        CODE: 'unknown_error',
    },
    NO_WALLET_EXCEPTION : {
        NAME: 'NoWalletException',
        CODE: 'no_wallet_exception',
    },
}