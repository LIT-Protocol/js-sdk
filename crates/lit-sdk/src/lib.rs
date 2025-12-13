pub mod accs;
pub mod auth;
pub mod client;
pub mod chain;
pub mod crypto;
pub mod e2ee;
pub mod error;
pub mod network;
pub mod pkp_signer;
pub mod session;
pub(crate) mod sev_snp;
pub mod types;
pub mod wrapped_keys;

pub use client::{create_lit_client, LitClient};
pub use client::ExecuteJsOptions;
pub use chain::{
    auth_method_id_for_eth_wallet, get_derived_pubkey, view_pkps_by_address, view_pkps_by_auth_data, PaginatedPkps,
    MintPkpTx, Pagination, PaginationInfo, PaymentBalance, PaymentManager, PaymentTx,
    PkpAuthMethod, PkpMintManager,
    PkpAuthMethodWithScopes, PkpData, PkpPermissionsContext, PkpPermissionsManager,
    WithdrawRequest, WithdrawRequestInfo,
};
pub use error::LitSdkError;
pub use network::{
    naga_dev, naga_local, naga_mainnet, naga_proto, naga_staging, naga_test, Endpoint,
    NagaEndpoints, NetworkConfig,
};
pub use types::{DecryptParams, DecryptResponse, EncryptParams, EncryptResponse, ExecuteJsResponse};
pub use auth::{
    create_eth_wallet_auth_data, create_siwe_message_with_resources, generate_session_key_pair,
    auth_config_from_delegation_auth_sig, pkp_eth_address_from_pubkey, sign_siwe_with_eoa,
    validate_delegation_auth_sig, AuthConfig, AuthContext, AuthData, AuthSig, CustomAuthParams,
    LitAbility, ResourceAbilityRequest, SessionKeyPair,
};
pub use pkp_signer::PkpSigner;

pub use wrapped_keys::{
    BatchGeneratePrivateKeysParams, BatchGeneratePrivateKeysResult, ExportPrivateKeyResult,
    GenerateKeyParams, GeneratePrivateKeyAction, GeneratePrivateKeyResult, ImportPrivateKeyResult,
    SignMessageParams, StoreEncryptedKeyBatchResult, StoreEncryptedKeyParams,
    StoreEncryptedKeyResult, StoredKeyData, StoredKeyMetadata, WrappedKeysClient,
    WrappedKeysKeyType, WrappedKeysNetwork,
};
