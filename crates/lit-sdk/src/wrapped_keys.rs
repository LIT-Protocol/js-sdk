use crate::accs::hash_access_control_conditions;
use crate::auth::{AuthContext, AuthSig};
use crate::client::{ExecuteJsOptions, LitClient};
use crate::error::LitSdkError;
use crate::session::issue_session_sigs;
use crate::types::EncryptParams;
use base64ct::{Base64, Encoding};
use ethers::types::U256;
use rand::RngCore;
use reqwest::Method;
use serde::{Deserialize, Serialize};
use serde_json::Value;

const LIT_PREFIX: &str = "lit_";
const AUTH_HEADER_PREFIX: &str = "LitSessionSig:";

const SERVICE_URL_TEST: &str = "https://test.wrapped.litprotocol.com/encrypted";
const SERVICE_URL_PROD: &str = "https://wrapped.litprotocol.com/encrypted";

const CID_SIGN_TRANSACTION_EVM: &str = "QmdSQqkdGF5EqPCBi4pidkjGQXLNoP5kp8gxGLtgzyiw7L";
const CID_SIGN_TRANSACTION_SOLANA: &str = "QmVeR4rKuyN27gq1JrsoJqjN2GrwZD87Sm2vHzV5MmBxwb";
const CID_SIGN_MESSAGE_EVM: &str = "QmQWwWjJXLiCKi7ZpfwXnGPeXAcjfG1VXjB6CLTb3Xh31X";
const CID_SIGN_MESSAGE_SOLANA: &str = "QmawpLLPxL6GVKj7QW3PR8us4gNyVEijPpcDzD8Uo95jXR";
const CID_GENERATE_KEY_EVM: &str = "QmSKi3kMRP7biW6HhNf79vcffMSXDSu7Yr1K653ZoGXsxw";
const CID_GENERATE_KEY_SOLANA: &str = "QmZGd5gPcqTJmeM9Thdguz6DufFkQCa9Qq2oS6L3D6HD8o";
const CID_EXPORT_PRIVATE_KEY: &str = "QmaCGGq6EqXezgBiwAAbwh2UTeeTZnLaHQxxDcXwRboFXM";
const CID_BATCH_GENERATE_KEYS: &str = "QmUDB7jZfCMwh9CuQZZ4YDmrJnNdPq9NGdqHzmQE3RggSr";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WrappedKeysNetwork {
    Evm,
    Solana,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum WrappedKeysKeyType {
    #[serde(rename = "K256")]
    K256,
    #[serde(rename = "ed25519")]
    Ed25519,
}

impl WrappedKeysNetwork {
    pub fn key_type(self) -> WrappedKeysKeyType {
        match self {
            WrappedKeysNetwork::Evm => WrappedKeysKeyType::K256,
            WrappedKeysNetwork::Solana => WrappedKeysKeyType::Ed25519,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredKeyMetadata {
    pub public_key: String,
    pub pkp_address: String,
    pub key_type: WrappedKeysKeyType,
    pub lit_network: String,
    pub memo: String,
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredKeyData {
    #[serde(flatten)]
    pub metadata: StoredKeyMetadata,
    pub ciphertext: String,
    pub data_to_encrypt_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoreEncryptedKeyResult {
    pub id: String,
    pub pkp_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoreEncryptedKeyBatchResult {
    pub pkp_address: String,
    pub ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePrivateKeyResult {
    pub pkp_address: String,
    pub generated_public_key: String,
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportPrivateKeyResult {
    pub pkp_address: String,
    pub decrypted_private_key: String,
    pub public_key: String,
    pub lit_network: String,
    pub key_type: WrappedKeysKeyType,
    pub memo: String,
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportPrivateKeyResult {
    pub pkp_address: String,
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoreEncryptedKeyParams {
    pub ciphertext: String,
    pub data_to_encrypt_hash: String,
    pub public_key: String,
    pub key_type: WrappedKeysKeyType,
    pub memo: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateKeyParams {
    pub memo: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignMessageParams {
    pub message_to_sign: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePrivateKeyAction {
    pub network: WrappedKeysNetwork,
    pub generate_key_params: GenerateKeyParams,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sign_message_params: Option<SignMessageParams>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchGeneratePrivateKeysParams {
    pub actions: Vec<GeneratePrivateKeyAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchGeneratePrivateKeysActionResult {
    pub generate_encrypted_private_key: GeneratePrivateKeyResultWithMemo,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sign_message: Option<BatchSignedMessageResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchGeneratePrivateKeysResult {
    pub pkp_address: String,
    pub results: Vec<BatchGeneratePrivateKeysActionResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePrivateKeyResultWithMemo {
    pub pkp_address: String,
    pub generated_public_key: String,
    pub id: String,
    pub memo: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchSignedMessageResult {
    pub signature: String,
}

#[derive(Clone)]
pub struct WrappedKeysClient {
    lit_client: LitClient,
    http: reqwest::Client,
}

impl WrappedKeysClient {
    pub fn new(lit_client: LitClient) -> Result<Self, LitSdkError> {
        let http = reqwest::Client::builder()
            .user_agent("lit-sdk-rust-wrapped-keys/0.1.0")
            .build()?;
        Ok(Self { lit_client, http })
    }

    pub fn lit_client(&self) -> &LitClient {
        &self.lit_client
    }

    pub async fn generate_private_key(
        &self,
        auth_context: &AuthContext,
        network: WrappedKeysNetwork,
        memo: impl Into<String>,
        user_max_price_wei: Option<U256>,
    ) -> Result<GeneratePrivateKeyResult, LitSdkError> {
        let pkp_address = pkp_address_from_auth_context(auth_context)?;
        let access_control_conditions = pkp_access_control_conditions(&pkp_address);

        let cid = match network {
            WrappedKeysNetwork::Evm => CID_GENERATE_KEY_EVM,
            WrappedKeysNetwork::Solana => CID_GENERATE_KEY_SOLANA,
        };

        let js_params = serde_json::json!({
            "pkpAddress": pkp_address,
            "accessControlConditions": access_control_conditions,
        });

        let lit_action_res = self
            .lit_client
            .execute_js_with_options(
                None,
                Some(cid.to_string()),
                Some(js_params),
                auth_context,
                ExecuteJsOptions {
                    use_single_node: true,
                    user_max_price_wei,
                    ..Default::default()
                },
            )
            .await?;

        let generated: GenerateEncryptedKeyResponse = decode_lit_action_json(&lit_action_res)?;
        let store_res = self
            .store_encrypted_key(
                auth_context,
                StoreEncryptedKeyParams {
                    ciphertext: generated.ciphertext,
                    data_to_encrypt_hash: generated.data_to_encrypt_hash,
                    public_key: generated.public_key.clone(),
                    key_type: network.key_type(),
                    memo: memo.into(),
                },
            )
            .await?;

        Ok(GeneratePrivateKeyResult {
            pkp_address: store_res.pkp_address,
            id: store_res.id,
            generated_public_key: generated.public_key,
        })
    }

    pub async fn export_private_key(
        &self,
        auth_context: &AuthContext,
        network: WrappedKeysNetwork,
        id: &str,
        user_max_price_wei: Option<U256>,
    ) -> Result<ExportPrivateKeyResult, LitSdkError> {
        let stored = self.get_encrypted_key(auth_context, id).await?;
        let access_control_conditions =
            pkp_access_control_conditions(&stored.metadata.pkp_address);

        let js_params = serde_json::json!({
            "pkpAddress": stored.metadata.pkp_address,
            "ciphertext": stored.ciphertext,
            "dataToEncryptHash": stored.data_to_encrypt_hash,
            "accessControlConditions": access_control_conditions,
        });

        let lit_action_res = self
            .lit_client
            .execute_js_with_options(
                None,
                Some(lit_action_cid_for_export_private_key(network).to_string()),
                Some(js_params),
                auth_context,
                ExecuteJsOptions {
                    use_single_node: false,
                    user_max_price_wei,
                    ..Default::default()
                },
            )
            .await?;

        let decrypted_private_key = decode_lit_action_string(&lit_action_res)?;

        Ok(ExportPrivateKeyResult {
            pkp_address: stored.metadata.pkp_address,
            decrypted_private_key,
            public_key: stored.metadata.public_key,
            lit_network: stored.metadata.lit_network,
            key_type: stored.metadata.key_type,
            memo: stored.metadata.memo,
            id: stored.metadata.id,
        })
    }

    pub async fn list_encrypted_key_metadata(
        &self,
        auth_context: &AuthContext,
    ) -> Result<Vec<StoredKeyMetadata>, LitSdkError> {
        let base_url = service_url_for_lit_network(self.lit_client.network_name())?;
        let pkp_address = pkp_address_from_auth_context(auth_context)?;
        let session_sig = session_sig_for_service(&self.lit_client, auth_context)?;
        let request_id = random_request_id();

        let url = format!("{base_url}/{pkp_address}");
        self.service_request(Method::GET, &url, &session_sig, &request_id, None)
            .await
    }

    pub async fn get_encrypted_key(
        &self,
        auth_context: &AuthContext,
        id: &str,
    ) -> Result<StoredKeyData, LitSdkError> {
        let base_url = service_url_for_lit_network(self.lit_client.network_name())?;
        let pkp_address = pkp_address_from_auth_context(auth_context)?;
        let session_sig = session_sig_for_service(&self.lit_client, auth_context)?;
        let request_id = random_request_id();

        let url = format!("{base_url}/{pkp_address}/{id}");
        self.service_request(Method::GET, &url, &session_sig, &request_id, None)
            .await
    }

    pub async fn store_encrypted_key(
        &self,
        auth_context: &AuthContext,
        params: StoreEncryptedKeyParams,
    ) -> Result<StoreEncryptedKeyResult, LitSdkError> {
        let base_url = service_url_for_lit_network(self.lit_client.network_name())?;
        let session_sig = session_sig_for_service(&self.lit_client, auth_context)?;
        let request_id = random_request_id();

        let body = serde_json::to_value(params).map_err(|e| LitSdkError::Network(e.to_string()))?;
        self.service_request(Method::POST, base_url, &session_sig, &request_id, Some(body))
            .await
    }

    pub async fn store_encrypted_key_batch(
        &self,
        auth_context: &AuthContext,
        key_batch: Vec<StoreEncryptedKeyParams>,
    ) -> Result<StoreEncryptedKeyBatchResult, LitSdkError> {
        let base_url = service_url_for_lit_network(self.lit_client.network_name())?;
        let session_sig = session_sig_for_service(&self.lit_client, auth_context)?;
        let request_id = random_request_id();

        let body = serde_json::json!({ "keyParamsBatch": key_batch });
        let url = format!("{base_url}_batch");
        self.service_request(Method::POST, &url, &session_sig, &request_id, Some(body))
            .await
    }

    pub async fn import_private_key(
        &self,
        auth_context: &AuthContext,
        private_key: &str,
        public_key: &str,
        key_type: WrappedKeysKeyType,
        memo: impl Into<String>,
    ) -> Result<ImportPrivateKeyResult, LitSdkError> {
        let pkp_address = pkp_address_from_auth_context(auth_context)?;
        let access_control_conditions = pkp_access_control_conditions(&pkp_address);

        let salted_private_key = format!("{LIT_PREFIX}{private_key}");
        let hashed_accs = hex::encode(hash_access_control_conditions(&access_control_conditions)?);
        let encrypted = self
            .lit_client
            .encrypt(EncryptParams {
                data_to_encrypt: salted_private_key.as_bytes().to_vec(),
                unified_access_control_conditions: None,
                hashed_access_control_conditions_hex: Some(hashed_accs),
                metadata: None,
            })
            .await?;

        let store_res = self
            .store_encrypted_key(
                auth_context,
                StoreEncryptedKeyParams {
                    ciphertext: encrypted.ciphertext_base64,
                    data_to_encrypt_hash: encrypted.data_to_encrypt_hash_hex,
                    public_key: public_key.to_string(),
                    key_type,
                    memo: memo.into(),
                },
            )
            .await?;

        Ok(ImportPrivateKeyResult {
            pkp_address: store_res.pkp_address,
            id: store_res.id,
        })
    }

    pub async fn sign_message_with_encrypted_key(
        &self,
        auth_context: &AuthContext,
        network: WrappedKeysNetwork,
        id: &str,
        message_to_sign: &str,
        user_max_price_wei: Option<U256>,
    ) -> Result<String, LitSdkError> {
        let stored = self.get_encrypted_key(auth_context, id).await?;
        let access_control_conditions =
            pkp_access_control_conditions(&stored.metadata.pkp_address);

        let cid = match network {
            WrappedKeysNetwork::Evm => CID_SIGN_MESSAGE_EVM,
            WrappedKeysNetwork::Solana => CID_SIGN_MESSAGE_SOLANA,
        };

        let js_params = serde_json::json!({
            "pkpAddress": stored.metadata.pkp_address,
            "ciphertext": stored.ciphertext,
            "dataToEncryptHash": stored.data_to_encrypt_hash,
            "messageToSign": message_to_sign,
            "accessControlConditions": access_control_conditions,
        });

        let lit_action_res = self
            .lit_client
            .execute_js_with_options(
                None,
                Some(cid.to_string()),
                Some(js_params),
                auth_context,
                ExecuteJsOptions {
                    use_single_node: false,
                    user_max_price_wei,
                    ..Default::default()
                },
            )
            .await?;

        decode_lit_action_string(&lit_action_res)
    }

    pub async fn sign_transaction_with_encrypted_key<T: Serialize>(
        &self,
        auth_context: &AuthContext,
        network: WrappedKeysNetwork,
        id: &str,
        unsigned_transaction: T,
        broadcast: bool,
        versioned_transaction: Option<bool>,
        user_max_price_wei: Option<U256>,
    ) -> Result<String, LitSdkError> {
        let stored = self.get_encrypted_key(auth_context, id).await?;
        let access_control_conditions =
            pkp_access_control_conditions(&stored.metadata.pkp_address);

        let cid = match network {
            WrappedKeysNetwork::Evm => CID_SIGN_TRANSACTION_EVM,
            WrappedKeysNetwork::Solana => CID_SIGN_TRANSACTION_SOLANA,
        };

        let unsigned_tx_val =
            serde_json::to_value(unsigned_transaction).map_err(|e| LitSdkError::Network(e.to_string()))?;

        let inner = if let Some(v) = versioned_transaction {
            serde_json::json!({
                "pkpAddress": stored.metadata.pkp_address,
                "ciphertext": stored.ciphertext,
                "dataToEncryptHash": stored.data_to_encrypt_hash,
                "unsignedTransaction": unsigned_tx_val,
                "broadcast": broadcast,
                "accessControlConditions": access_control_conditions,
                "versionedTransaction": v,
            })
        } else {
            serde_json::json!({
                "pkpAddress": stored.metadata.pkp_address,
                "ciphertext": stored.ciphertext,
                "dataToEncryptHash": stored.data_to_encrypt_hash,
                "unsignedTransaction": unsigned_tx_val,
                "broadcast": broadcast,
                "accessControlConditions": access_control_conditions,
            })
        };
        let mut js_params = inner.clone();
        if let Some(obj) = js_params.as_object_mut() {
            obj.insert("jsParams".into(), inner);
        }

        let lit_action_res = self
            .lit_client
            .execute_js_with_options(
                None,
                Some(cid.to_string()),
                Some(js_params),
                auth_context,
                ExecuteJsOptions {
                    use_single_node: false,
                    user_max_price_wei,
                    ..Default::default()
                },
            )
            .await?;

        decode_lit_action_string(&lit_action_res)
    }

    pub async fn batch_generate_private_keys(
        &self,
        auth_context: &AuthContext,
        params: BatchGeneratePrivateKeysParams,
        user_max_price_wei: Option<U256>,
    ) -> Result<BatchGeneratePrivateKeysResult, LitSdkError> {
        let pkp_address = pkp_address_from_auth_context(auth_context)?;
        let access_control_conditions = pkp_access_control_conditions(&pkp_address);

        let lit_action_res = self
            .lit_client
            .execute_js_with_options(
                None,
                Some(CID_BATCH_GENERATE_KEYS.to_string()),
                Some(serde_json::json!({
                    "actions": params.actions,
                    "accessControlConditions": access_control_conditions,
                })),
                auth_context,
                ExecuteJsOptions {
                    use_single_node: true,
                    user_max_price_wei,
                    ..Default::default()
                },
            )
            .await?;

        let action_results: Vec<BatchGenerateLitActionResult> =
            decode_lit_action_json(&lit_action_res)?;
        let store_batch: Vec<StoreEncryptedKeyParams> = action_results
            .iter()
            .map(|r| StoreEncryptedKeyParams {
                ciphertext: r.generate_encrypted_private_key.ciphertext.clone(),
                data_to_encrypt_hash: r.generate_encrypted_private_key.data_to_encrypt_hash.clone(),
                public_key: r.generate_encrypted_private_key.public_key.clone(),
                key_type: r.network.key_type(),
                memo: r.generate_encrypted_private_key.memo.clone(),
            })
            .collect();

        let stored = self
            .store_encrypted_key_batch(auth_context, store_batch)
            .await?;

        let mut results = vec![];
        for (idx, r) in action_results.into_iter().enumerate() {
            let id = stored
                .ids
                .get(idx)
                .cloned()
                .ok_or_else(|| LitSdkError::Network("wrapped keys service returned fewer ids than requested".into()))?;

            results.push(BatchGeneratePrivateKeysActionResult {
                generate_encrypted_private_key: GeneratePrivateKeyResultWithMemo {
                    pkp_address: pkp_address.clone(),
                    generated_public_key: r.generate_encrypted_private_key.public_key,
                    id,
                    memo: r.generate_encrypted_private_key.memo,
                },
                sign_message: r.sign_message,
            });
        }

        Ok(BatchGeneratePrivateKeysResult { pkp_address, results })
    }

    async fn service_request<T: serde::de::DeserializeOwned>(
        &self,
        method: Method,
        url: &str,
        session_sig: &AuthSig,
        request_id: &str,
        body: Option<Value>,
    ) -> Result<T, LitSdkError> {
        let lit_network = self.lit_client.network_name();
        let auth_header = compose_service_auth_header(session_sig)?;

        let mut req = self
            .http
            .request(method, url)
            .header("x-correlation-id", request_id)
            .header("Content-Type", "application/json")
            .header("Lit-Network", lit_network)
            .header("Authorization", auth_header);
        if let Some(body_val) = body {
            req = req.json(&body_val);
        }

        let res = req.send().await?;
        let status = res.status();
        if !status.is_success() {
            let txt = res.text().await.unwrap_or_default();
            return Err(LitSdkError::Network(format!(
                "Request({request_id}) for wrapped key failed. HTTP({}): {txt}",
                status.as_u16()
            )));
        }

        res.json::<T>().await.map_err(|e| {
            LitSdkError::Network(format!(
                "Request({request_id}) for wrapped key failed to parse JSON: {e}"
            ))
        })
    }
}

fn service_url_for_lit_network(lit_network: &str) -> Result<&'static str, LitSdkError> {
    match lit_network {
        "naga-dev" | "naga-test" => Ok(SERVICE_URL_TEST),
        "naga" => Ok(SERVICE_URL_PROD),
        other => Err(LitSdkError::Config(format!(
            "wrapped keys service unsupported for network {other}"
        ))),
    }
}

fn pkp_address_from_auth_context(auth_context: &AuthContext) -> Result<String, LitSdkError> {
    if auth_context.delegation_auth_sig.algo.as_deref() != Some("LIT_BLS") {
        return Err(LitSdkError::Config(
            "wrapped keys requires a PKP auth context (delegationAuthSig algo LIT_BLS)".into(),
        ));
    }
    Ok(auth_context.delegation_auth_sig.address.clone())
}

fn pkp_access_control_conditions(pkp_address: &str) -> Value {
    serde_json::json!([
        {
            "contractAddress": "",
            "standardContractType": "",
            "chain": "ethereum",
            "method": "",
            "parameters": [":userAddress"],
            "returnValueTest": {
                "comparator": "=",
                "value": pkp_address,
            }
        }
    ])
}

fn session_sig_for_service(
    lit_client: &LitClient,
    auth_context: &AuthContext,
) -> Result<AuthSig, LitSdkError> {
    let url = lit_client
        .handshake_result()
        .connected_nodes
        .first()
        .ok_or_else(|| LitSdkError::Network("no connected nodes available".into()))?
        .clone();
    let map = issue_session_sigs(
        &auth_context.session_key_pair,
        &auth_context.auth_config,
        &auth_context.delegation_auth_sig,
        &[url],
    )?;
    map.into_iter()
        .next()
        .map(|(_, sig)| sig)
        .ok_or_else(|| LitSdkError::Network("failed to generate sessionSig".into()))
}

fn compose_service_auth_header(session_sig: &AuthSig) -> Result<String, LitSdkError> {
    let session_sig_json =
        serde_json::to_string(session_sig).map_err(|e| LitSdkError::Network(e.to_string()))?;
    let encoded = Base64::encode_string(session_sig_json.as_bytes());
    Ok(format!("{AUTH_HEADER_PREFIX}{encoded}"))
}

fn random_request_id() -> String {
    let mut bytes = [0u8; 8];
    rand::thread_rng().fill_bytes(&mut bytes);
    hex::encode(bytes)
}

fn lit_action_cid_for_export_private_key(_network: WrappedKeysNetwork) -> &'static str {
    CID_EXPORT_PRIVATE_KEY
}

fn decode_lit_action_string(res: &crate::types::ExecuteJsResponse) -> Result<String, LitSdkError> {
    match &res.response {
        Value::String(s) => {
            if s.is_empty() {
                return Err(LitSdkError::Network(
                    "Lit Action returned an empty response".into(),
                ));
            }
            if s.starts_with("Error:") {
                return Err(LitSdkError::Network(format!(
                    "error executing Lit Action: {s}"
                )));
            }
            Ok(s.clone())
        }
        other => Err(LitSdkError::Network(format!(
            "expected Lit Action response string, got: {other}"
        ))),
    }
}

fn decode_lit_action_json<T: serde::de::DeserializeOwned>(
    res: &crate::types::ExecuteJsResponse,
) -> Result<T, LitSdkError> {
    let s = match &res.response {
        Value::String(s) => s.clone(),
        other => serde_json::to_string(other).map_err(|e| LitSdkError::Network(e.to_string()))?,
    };
    if s.is_empty() {
        return Err(LitSdkError::Network(
            "Lit Action returned an empty response".into(),
        ));
    }
    if s.starts_with("Error:") {
        return Err(LitSdkError::Network(format!(
            "error executing Lit Action: {s}"
        )));
    }
    serde_json::from_str(&s).map_err(|e| LitSdkError::Network(e.to_string()))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GenerateEncryptedKeyResponse {
    ciphertext: String,
    data_to_encrypt_hash: String,
    public_key: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BatchGenerateEncryptedPrivateKeyResult {
    ciphertext: String,
    data_to_encrypt_hash: String,
    public_key: String,
    memo: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BatchGenerateLitActionResult {
    network: WrappedKeysNetwork,
    #[serde(default)]
    sign_message: Option<BatchSignedMessageResult>,
    generate_encrypted_private_key: BatchGenerateEncryptedPrivateKeyResult,
}
