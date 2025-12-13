use crate::accs::{
    canonicalize_unified_access_control_conditions, hash_unified_access_control_conditions,
};
use crate::auth::{
    auth_config_from_delegation_auth_sig, create_siwe_message_with_resources,
    generate_session_key_pair, pkp_eth_address_from_pubkey, validate_delegation_auth_sig,
    AuthConfig, AuthContext, AuthData, AuthSig, CustomAuthParams, SessionKeyPair,
};
use crate::crypto::{
    bls_encrypt, bls_verify_and_decrypt_with_signature_shares, combine_bls_signature_shares,
};
use crate::e2ee::{wallet_decrypt, wallet_encrypt, EncryptedPayload, GenericEncryptedPayload};
use crate::error::LitSdkError;
use crate::network::{Endpoint, NetworkConfig};
use crate::sev_snp::SevSnp;
use crate::types::{
    DecryptParams, DecryptResponse, EncryptParams, EncryptResponse, HandshakeRequestData,
    ExecuteJsResponse, OrchestrateHandshakeResponse, RawHandshakeResponse, ResolvedHandshakeResponse,
};
use crate::session::{issue_session_sigs, issue_session_sigs_with_max_price};
use base64ct::Encoding;
use ethers::providers::{Http, Provider};
use ethers::types::{Address, U256};
use rand::RngCore;
use reqwest::header::{HeaderMap, HeaderValue};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256, Sha384};
use sha3::{Keccak256, Keccak384};
use std::collections::{BTreeMap, HashMap, HashSet};
use std::sync::Arc;
use tokio::time::{timeout, Duration};

ethers::contract::abigen!(
    StakingContract,
    r#"[{
        "inputs":[{"internalType":"uint256","name":"realmId","type":"uint256"}],
        "name":"getActiveUnkickedValidatorStructsAndCounts",
        "outputs":[
            {"components":[
                {"internalType":"uint256","name":"epochLength","type":"uint256"},
                {"internalType":"uint256","name":"number","type":"uint256"},
                {"internalType":"uint256","name":"rewardEpochNumber","type":"uint256"},
                {"internalType":"uint256","name":"nextRewardEpochNumber","type":"uint256"},
                {"internalType":"uint256","name":"endTime","type":"uint256"},
                {"internalType":"uint256","name":"retries","type":"uint256"},
                {"internalType":"uint256","name":"timeout","type":"uint256"},
                {"internalType":"uint256","name":"startTime","type":"uint256"},
                {"internalType":"uint256","name":"lastAdvanceVoteTime","type":"uint256"}
            ],"internalType":"struct LibStakingStorage.Epoch","name":"","type":"tuple"},
            {"internalType":"uint256","name":"minNodeCount","type":"uint256"},
            {"components":[
                {"internalType":"uint32","name":"ip","type":"uint32"},
                {"internalType":"uint128","name":"ipv6","type":"uint128"},
                {"internalType":"uint32","name":"port","type":"uint32"},
                {"internalType":"address","name":"nodeAddress","type":"address"},
                {"internalType":"uint256","name":"reward","type":"uint256"},
                {"internalType":"uint256","name":"senderPubKey","type":"uint256"},
                {"internalType":"uint256","name":"receiverPubKey","type":"uint256"},
                {"internalType":"uint256","name":"lastActiveEpoch","type":"uint256"},
                {"internalType":"uint256","name":"commissionRate","type":"uint256"},
                {"internalType":"uint256","name":"lastRewardEpoch","type":"uint256"},
                {"internalType":"uint256","name":"lastRealmId","type":"uint256"},
                {"internalType":"uint256","name":"delegatedStakeAmount","type":"uint256"},
                {"internalType":"uint256","name":"delegatedStakeWeight","type":"uint256"},
                {"internalType":"uint256","name":"lastRewardEpochClaimedFixedCostRewards","type":"uint256"},
                {"internalType":"uint256","name":"lastRewardEpochClaimedCommission","type":"uint256"},
                {"internalType":"address","name":"operatorAddress","type":"address"},
                {"internalType":"uint256","name":"uniqueDelegatingStakerCount","type":"uint256"},
                {"internalType":"bool","name":"registerAttestedWalletDisabled","type":"bool"}
            ],"internalType":"struct LibStakingStorage.Validator[]","name":"","type":"tuple[]"}
        ],
        "stateMutability":"view",
        "type":"function"
    }]"#,
);

ethers::contract::abigen!(
    PriceFeedContract,
    r#"[{
        "inputs":[
            {"internalType":"uint256","name":"realmId","type":"uint256"},
            {"internalType":"uint256[]","name":"productIds","type":"uint256[]"}
        ],
        "name":"getNodesForRequest",
        "outputs":[
            {"internalType":"uint256","name":"","type":"uint256"},
            {"internalType":"uint256","name":"","type":"uint256"},
            {"components":[
                {"components":[
                    {"internalType":"uint32","name":"ip","type":"uint32"},
                    {"internalType":"uint128","name":"ipv6","type":"uint128"},
                    {"internalType":"uint32","name":"port","type":"uint32"},
                    {"internalType":"address","name":"nodeAddress","type":"address"},
                    {"internalType":"uint256","name":"reward","type":"uint256"},
                    {"internalType":"uint256","name":"senderPubKey","type":"uint256"},
                    {"internalType":"uint256","name":"receiverPubKey","type":"uint256"},
                    {"internalType":"uint256","name":"lastActiveEpoch","type":"uint256"},
                    {"internalType":"uint256","name":"commissionRate","type":"uint256"},
                    {"internalType":"uint256","name":"lastRewardEpoch","type":"uint256"},
                    {"internalType":"uint256","name":"lastRealmId","type":"uint256"},
                    {"internalType":"uint256","name":"delegatedStakeAmount","type":"uint256"},
                    {"internalType":"uint256","name":"delegatedStakeWeight","type":"uint256"},
                    {"internalType":"uint256","name":"lastRewardEpochClaimedFixedCostRewards","type":"uint256"},
                    {"internalType":"uint256","name":"lastRewardEpochClaimedCommission","type":"uint256"},
                    {"internalType":"address","name":"operatorAddress","type":"address"},
                    {"internalType":"uint256","name":"uniqueDelegatingStakerCount","type":"uint256"},
                    {"internalType":"bool","name":"registerAttestedWalletDisabled","type":"bool"}
                ],"internalType":"struct LibStakingStorage.Validator","name":"validator","type":"tuple"},
                {"internalType":"uint256[]","name":"prices","type":"uint256[]"}
            ],"internalType":"struct LibPriceFeedStorage.NodeInfoAndPrices[]","name":"","type":"tuple[]"}
        ],
        "stateMutability":"view",
        "type":"function"
    }]"#,
);

const PRODUCT_ID_DECRYPTION: usize = 0;
const PRODUCT_ID_SIGN: usize = 1;
const PRODUCT_ID_LIT_ACTION: usize = 2;
const PRODUCT_ID_SIGN_SESSION_KEY: usize = 3;

fn int_to_ip(ip: u32) -> String {
    let b = ip.to_be_bytes();
    format!("{}.{}.{}.{}", b[0], b[1], b[2], b[3])
}

fn price_feed_address_for(network: &str) -> Option<Address> {
    match network {
        "naga-dev" => Some("0xa997f8DE767d59ecb47A76B421E0C5a1764dD945".parse().ok()?),
        "naga-test" => Some("0x556955025dD0981Bac684fbDEcE14cDa897d0837".parse().ok()?),
        "naga-staging" => Some("0x651d3282E1F083036Bb136dBbe7df17aCC39A330".parse().ok()?),
        "naga-proto" => Some("0xFF4ceEC38572fEd4a48f6D3DF2bed7ccadD115a6".parse().ok()?),
        "naga" => Some("0x88F5535Fa6dA5C225a3C06489fE4e3405b87608C".parse().ok()?),
        _ => None,
    }
}

fn staking_address_for(network: &str) -> Option<Address> {
    match network {
        "naga-dev" => Some("0x544ac098670a266d3598B543aefBEbAb0A2C86C6".parse().ok()?),
        "naga-test" => Some("0x9f3cE810695180C5f693a7cD2a0203A381fd57E1".parse().ok()?),
        "naga-staging" => Some("0x9b8Ed3FD964Bc38dDc32CF637439e230CD50e3Dd".parse().ok()?),
        "naga-proto" => Some("0x28759afC5989B961D0A8EB236C9074c4141Baea1".parse().ok()?),
        "naga" => Some("0x8a861B3640c1ff058CCB109ba11CA3224d228159".parse().ok()?),
        _ => None,
    }
}

#[derive(Clone)]
pub struct LitClient {
    http: reqwest::Client,
    config: NetworkConfig,
    handshake: OrchestrateHandshakeResponse,
    version: String,
}

#[derive(Clone, Copy, Debug, Default)]
pub struct ExecuteJsOptions {
    pub use_single_node: bool,
    pub user_max_price_wei: Option<U256>,
    pub response_strategy: ExecuteJsResponseStrategy,
}

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub enum ExecuteJsResponseStrategy {
    #[default]
    LeastCommon,
    MostCommon,
}

#[derive(Clone, Debug)]
struct JitKeyPair {
    public_key: [u8; 32],
    secret_key: [u8; 32],
}

#[derive(Clone, Debug)]
struct NagaJitContext {
    key_set: HashMap<String, JitKeyPair>,
}

pub async fn create_lit_client(config: NetworkConfig) -> Result<LitClient, LitSdkError> {
    let mut config = config;
    if config.bootstrap_urls.is_empty() {
        config.bootstrap_urls = discover_bootstrap_urls(&config).await?;
    }

    let http = reqwest::Client::builder()
        .user_agent("lit-sdk-rust/0.1.0")
        .build()?;

    // Nodes use this for request handling/telemetry; mirror the JS SDK format (`<sdkVersion>-<network>`).
    // NOTE: The Rust crate version is not the same as the JS SDK version.
    let version = format!("8.0.0-{}", config.network);
    let handshake = orchestrate_handshake(&http, &config, &version).await?;

    Ok(LitClient {
        http,
        config,
        handshake,
        version,
    })
}

async fn discover_bootstrap_urls(config: &NetworkConfig) -> Result<Vec<String>, LitSdkError> {
    let rpc_url = config.rpc_url.as_deref().ok_or_else(|| {
        LitSdkError::Config(
            "rpc_url is required to auto-discover bootstrap_urls (or provide bootstrap_urls)"
                .into(),
        )
    })?;
    let staking_addr = staking_address_for(config.network).ok_or_else(|| {
        LitSdkError::Config(format!(
            "unknown Staking contract address for network {}",
            config.network
        ))
    })?;

    let provider = Arc::new(
        Provider::<Http>::try_from(rpc_url).map_err(|e| LitSdkError::Config(e.to_string()))?,
    );
    let contract = StakingContract::new(staking_addr, provider);

    let realm_id: U256 = 1u64.into();
    let (_epoch, min_node_count, validators) = contract
        .get_active_unkicked_validator_structs_and_counts(realm_id)
        .call()
        .await
        .map_err(|e| LitSdkError::Network(e.to_string()))?;

    let min = min_node_count.as_usize().max(1);
    let mut urls: Vec<String> = validators
        .iter()
        .map(|v| format!("{}{}:{}", config.http_protocol, int_to_ip(v.ip), v.port))
        .collect();
    urls.sort();
    urls.dedup();

    if urls.len() < min {
        return Err(LitSdkError::Network(format!(
            "validator set below minNodeCount: min={min} got={}",
            urls.len()
        )));
    }

    Ok(urls)
}

impl LitClient {
    pub fn network_name(&self) -> &'static str {
        self.config.network
    }

    pub fn handshake_result(&self) -> &OrchestrateHandshakeResponse {
        &self.handshake
    }

    fn is_node_payload_decryption_error(err: &LitSdkError) -> bool {
        match err {
            LitSdkError::Network(msg) => {
                msg.contains("can't decrypt")
                    || msg.contains("encrypted payload decryption failed")
                    || msg.contains("E2EE decryption failed")
            }
            _ => false,
        }
    }

    pub async fn encrypt(&self, params: EncryptParams) -> Result<EncryptResponse, LitSdkError> {
        let subnet_pub_key = &self.handshake.core_node_config.subnet_pub_key;

        let data_hash_hex = sha256_hex(&params.data_to_encrypt);

        let conditions_hash_hex = if let Some(hex) = params.hashed_access_control_conditions_hex {
            hex
        } else if let Some(unified) = params.unified_access_control_conditions {
            let hash_bytes = hash_unified_access_control_conditions(&unified)?;
            hex::encode(hash_bytes)
        } else {
            return Err(LitSdkError::Accs(
                "provide unified_access_control_conditions or hashed_access_control_conditions_hex"
                    .into(),
            ));
        };

        let identity_param =
            format!("lit-accesscontrolcondition://{}/{}", conditions_hash_hex, data_hash_hex);
        let identity_bytes = identity_param.as_bytes();

        let ciphertext_b64 = bls_encrypt(subnet_pub_key, &params.data_to_encrypt, identity_bytes)?;

        Ok(EncryptResponse {
            ciphertext_base64: ciphertext_b64,
            data_to_encrypt_hash_hex: data_hash_hex,
            metadata: params.metadata,
        })
    }

    pub async fn decrypt(
        &self,
        params: DecryptParams,
        auth_context: &AuthContext,
        chain: &str,
    ) -> Result<DecryptResponse, LitSdkError> {
        let res = self.decrypt_inner(params.clone(), auth_context, chain).await;
        match res {
            Ok(v) => Ok(v),
            Err(e) if Self::is_node_payload_decryption_error(&e) => {
                let refreshed = create_lit_client(self.config.clone()).await?;
                refreshed.decrypt_inner(params, auth_context, chain).await
            }
            Err(e) => Err(e),
        }
    }

    async fn decrypt_inner(
        &self,
        params: DecryptParams,
        auth_context: &AuthContext,
        chain: &str,
    ) -> Result<DecryptResponse, LitSdkError> {
        let jit = self.create_jit_context()?;
        let threshold = self.handshake.threshold.max(1);
        let node_urls = match self.select_priced_nodes(PRODUCT_ID_DECRYPTION).await {
            Ok(urls) => urls,
            Err(_) => self
                .handshake
                .connected_nodes
                .iter()
                .take(threshold)
                .cloned()
                .collect(),
        };
        if node_urls.len() < threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient node urls for decrypt: got {}, need {}",
                node_urls.len(),
                threshold
            )));
        }

        let session_sigs = issue_session_sigs(
            &auth_context.session_key_pair,
            &auth_context.auth_config,
            &auth_context.delegation_auth_sig,
            &node_urls,
        )?;

        let unified_canonical = params
            .unified_access_control_conditions
            .as_ref()
            .map(canonicalize_unified_access_control_conditions)
            .transpose()?;

        let conditions_hash_hex = if let Some(hex) = params.hashed_access_control_conditions_hex {
            hex
        } else if let Some(unified) = unified_canonical.clone() {
            let hash_bytes = hash_unified_access_control_conditions(&unified)?;
            hex::encode(hash_bytes)
        } else {
            return Err(LitSdkError::Accs(
                "provide unified_access_control_conditions or hashed_access_control_conditions_hex"
                    .into(),
            ));
        };

        let identity_param = format!(
            "lit-accesscontrolcondition://{}/{}",
            conditions_hash_hex, params.data_to_encrypt_hash_hex
        );

        let request_id = random_hex(16);
        let epoch = self.handshake.epoch;

        let mut requests = vec![];
        let http = self.http.clone();
        let version = self.version.clone();
        for (url, sig) in &session_sigs {
            let request_data = serde_json::json!({
                "ciphertext": params.ciphertext_base64,
                "dataToEncryptHash": params.data_to_encrypt_hash_hex,
                "authSig": sig,
                "chain": chain,
                "unifiedAccessControlConditions": unified_canonical.clone().unwrap_or_else(|| serde_json::json!([])),
            });

            let encrypted = wallet_encrypt(
                &jit.key_set[url].secret_key,
                &jit.key_set[url].public_key,
                request_data.to_string().as_bytes(),
            )?;

            let full_url = compose_lit_url(url, &self.config.endpoints.encryption_sign);
            let body = serde_json::to_value(&encrypted).unwrap();
            let secret_key = jit.key_set[url].secret_key;
            let http_cl = http.clone();
            let version_cl = version.clone();
            let request_id_cl = request_id.clone();
            requests.push(async move {
                send_encrypted_node_request(
                    &http_cl,
                    &full_url,
                    body,
                    &secret_key,
                    &request_id_cl,
                    &version_cl,
                    epoch,
                )
                .await
            });
        }

        let results = futures::future::join_all(requests).await;
        let batch = merge_encrypted_batch(results, threshold)?;

        let decrypted_nodes: Vec<DecryptNodeResponse> = decrypt_batch_response(
            &batch,
            &jit,
            |v| {
                let data_val = v
                    .get("data")
                    .cloned()
                    .ok_or_else(|| LitSdkError::Network("missing data field".into()))?;
                serde_json::from_value::<DecryptNodeResponse>(data_val)
                    .map_err(|e| LitSdkError::Network(e.to_string()))
            },
        )?;

        let shares_json: Vec<String> = decrypted_nodes
            .iter()
            .map(|n| {
                serde_json::to_string(&serde_json::json!({
                    "ProofOfPossession": {
                        "identifier": n.signature_share.proof_of_possession.identifier,
                        "value": n.signature_share.proof_of_possession.value,
                    }
                }))
                .unwrap()
            })
            .collect();

        let plaintext = bls_verify_and_decrypt_with_signature_shares(
            &self.handshake.core_node_config.subnet_pub_key,
            identity_param.as_bytes(),
            &params.ciphertext_base64,
            &shares_json,
        )?;

        Ok(DecryptResponse {
            decrypted_data: plaintext,
            metadata: None,
        })
    }

    pub async fn execute_js(
        &self,
        code: Option<String>,
        ipfs_id: Option<String>,
        js_params: Option<serde_json::Value>,
        auth_context: &AuthContext,
    ) -> Result<ExecuteJsResponse, LitSdkError> {
        self.execute_js_with_options(
            code,
            ipfs_id,
            js_params,
            auth_context,
            ExecuteJsOptions::default(),
        )
        .await
    }

    pub async fn execute_js_with_options(
        &self,
        code: Option<String>,
        ipfs_id: Option<String>,
        js_params: Option<serde_json::Value>,
        auth_context: &AuthContext,
        options: ExecuteJsOptions,
    ) -> Result<ExecuteJsResponse, LitSdkError> {
        let res = self
            .execute_js_with_options_inner(
                code.clone(),
                ipfs_id.clone(),
                js_params.clone(),
                auth_context,
                options,
            )
            .await;
        match res {
            Ok(v) => Ok(v),
            Err(e) if Self::is_node_payload_decryption_error(&e) => {
                let refreshed = create_lit_client(self.config.clone()).await?;
                refreshed
                    .execute_js_with_options_inner(code, ipfs_id, js_params, auth_context, options)
                    .await
            }
            Err(e) => Err(e),
        }
    }

    async fn execute_js_with_options_inner(
        &self,
        code: Option<String>,
        ipfs_id: Option<String>,
        js_params: Option<serde_json::Value>,
        auth_context: &AuthContext,
        options: ExecuteJsOptions,
    ) -> Result<ExecuteJsResponse, LitSdkError> {
        let jit = self.create_jit_context()?;
        let execute_threshold = if options.use_single_node {
            1
        } else {
            self.handshake.threshold.max(1)
        };

        let mut node_urls = match self.select_priced_nodes(PRODUCT_ID_LIT_ACTION).await {
            Ok(urls) => urls,
            Err(_) => self.handshake.connected_nodes.clone(),
        };
        node_urls.truncate(execute_threshold);
        if node_urls.len() < execute_threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient node urls for executeJs: got {}, need {}",
                node_urls.len(),
                execute_threshold
            )));
        }

        let per_node_max_price =
            options
                .user_max_price_wei
                .map(|p| p / ethers::types::U256::from(execute_threshold as u64));
        let session_sigs = issue_session_sigs_with_max_price(
            &auth_context.session_key_pair,
            &auth_context.auth_config,
            &auth_context.delegation_auth_sig,
            &node_urls,
            per_node_max_price,
        )?;

        let node_set = node_set_from_urls(&node_urls);
        let request_id = random_hex(16);
        let epoch = self.handshake.epoch;

        let mut requests = vec![];
        let http = self.http.clone();
        let version = self.version.clone();
        for (url, sig) in &session_sigs {
            let mut request_data = serde_json::json!({
                "authSig": sig,
                "nodeSet": node_set.clone(),
            });
            if let Some(code_str) = &code {
                request_data["code"] = serde_json::json!(base64ct::Base64::encode_string(code_str.as_bytes()));
            }
            if let Some(id) = &ipfs_id {
                request_data["ipfsId"] = serde_json::json!(id);
            }
            if let Some(params) = &js_params {
                request_data["jsParams"] = serde_json::json!({ "jsParams": params.clone() });
            }

            let encrypted = wallet_encrypt(
                &jit.key_set[url].secret_key,
                &jit.key_set[url].public_key,
                request_data.to_string().as_bytes(),
            )?;

            let full_url = compose_lit_url(url, &self.config.endpoints.execute_js);
            let body = serde_json::to_value(&encrypted).unwrap();
            let secret_key = jit.key_set[url].secret_key;
            let http_cl = http.clone();
            let version_cl = version.clone();
            let request_id_cl = request_id.clone();
            requests.push(async move {
                send_encrypted_node_request(
                    &http_cl,
                    &full_url,
                    body,
                    &secret_key,
                    &request_id_cl,
                    &version_cl,
                    epoch,
                )
                .await
            });
        }

        let results = futures::future::join_all(requests).await;
        let batch = merge_encrypted_batch(results, execute_threshold)?;

        let node_values: Vec<ExecuteJsNodeValue> = decrypt_batch_response(&batch, &jit, |v| {
            let data = v
                .get("data")
                .cloned()
                .ok_or_else(|| LitSdkError::Network("missing data field".into()))?;
            serde_json::from_value::<ExecuteJsNodeValue>(data)
                .map_err(|e| LitSdkError::Network(e.to_string()))
        })?;

        let successful: Vec<&ExecuteJsNodeValue> =
            node_values.iter().filter(|v| v.success).collect();
        if successful.len() < execute_threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient successful executeJs responses: got {}, need {}",
                successful.len(),
                execute_threshold
            )));
        }

        let mut freq: Vec<(&str, usize)> = vec![];
        for v in &successful {
            let resp = v.response.as_str();
            if let Some((_, count)) = freq.iter_mut().find(|(r, _)| *r == resp) {
                *count += 1;
            } else {
                freq.push((resp, 1));
            }
        }

        let mut least_common = freq[0].0;
        let mut least_common_count = freq[0].1;
        let mut most_common = freq[0].0;
        let mut most_common_count = freq[0].1;
        for (resp, count) in &freq {
            if *count < least_common_count {
                least_common = *resp;
                least_common_count = *count;
            }
            if *count > most_common_count {
                most_common = *resp;
                most_common_count = *count;
            }
        }

        let selected_response = match options.response_strategy {
            ExecuteJsResponseStrategy::LeastCommon => least_common,
            ExecuteJsResponseStrategy::MostCommon => most_common,
        };

        let logs = successful
            .iter()
            .find(|v| v.response == selected_response)
            .map(|v| v.logs.clone())
            .unwrap_or_default();

        let mut signatures: HashMap<String, serde_json::Value> = HashMap::new();
        let mut signature_keys: HashSet<String> = HashSet::new();
        for v in &successful {
            for k in v.signed_data.keys() {
                signature_keys.insert(k.clone());
            }
        }

        for sig_name in signature_keys {
            let signature_threshold = self.handshake.threshold.max(1);
            let mut shares: Vec<String> = vec![];
            for v in &successful {
                let Some(entry) = v.signed_data.get(&sig_name) else {
                    continue;
                };
                let Some(share_val) = entry.get("signatureShare") else {
                    continue;
                };
                if let Some(s) = share_val.as_str() {
                    shares.push(s.to_string());
                } else {
                    shares.push(
                        serde_json::to_string(share_val)
                            .map_err(|e| LitSdkError::Network(e.to_string()))?,
                    );
                }
            }

            if shares.is_empty() {
                continue;
            }
            if shares.len() < signature_threshold {
                return Err(LitSdkError::Network(format!(
                    "insufficient signature shares for {sig_name}: got {}, need {}",
                    shares.len(),
                    signature_threshold
                )));
            }

            let combined = lit_utilities_wasm::combine_and_verify(shares)
                .map_err(|e| LitSdkError::Crypto(format!("{e:?}")))?;
            let combined_value: serde_json::Value = serde_json::from_str(&combined)
                .map_err(|e| LitSdkError::Crypto(e.to_string()))?;
            signatures.insert(sig_name, combined_value);
        }

        let response_val: serde_json::Value = serde_json::from_str(selected_response)
            .unwrap_or_else(|_| serde_json::Value::String(selected_response.to_string()));

        Ok(ExecuteJsResponse {
            success: true,
            signatures,
            response: response_val,
            logs,
        })
    }

    pub async fn create_pkp_auth_context(
        &self,
        pkp_public_key: &str,
        auth_data: AuthData,
        auth_config: AuthConfig,
        session_key_pair: Option<SessionKeyPair>,
        delegation_auth_sig: Option<AuthSig>,
        user_max_price_wei: Option<U256>,
    ) -> Result<AuthContext, LitSdkError> {
        let has_session_key_pair = session_key_pair.is_some();
        let has_delegation_auth_sig = delegation_auth_sig.is_some();
        if has_session_key_pair != has_delegation_auth_sig {
            return Err(LitSdkError::Config(
                "Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided".into(),
            ));
        }

        let session_key_pair = session_key_pair.unwrap_or_else(generate_session_key_pair);
        let delegation_auth_sig = match delegation_auth_sig {
            Some(sig) => sig,
            None => {
                self.sign_session_key_for_pkp(
                    pkp_public_key,
                    &auth_data,
                    &auth_config,
                    &session_key_pair,
                    user_max_price_wei,
                )
                .await?
            }
        };

        validate_delegation_auth_sig(&delegation_auth_sig, &session_key_pair.public_key)?;

        Ok(AuthContext {
            session_key_pair,
            auth_config,
            delegation_auth_sig,
        })
    }

    pub async fn create_custom_auth_context(
        &self,
        pkp_public_key: &str,
        auth_config: AuthConfig,
        custom_auth_params: CustomAuthParams,
        session_key_pair: Option<SessionKeyPair>,
        delegation_auth_sig: Option<AuthSig>,
        user_max_price_wei: Option<U256>,
    ) -> Result<AuthContext, LitSdkError> {
        let has_session_key_pair = session_key_pair.is_some();
        let has_delegation_auth_sig = delegation_auth_sig.is_some();
        if has_session_key_pair != has_delegation_auth_sig {
            return Err(LitSdkError::Config(
                "Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided".into(),
            ));
        }

        let session_key_pair = session_key_pair.unwrap_or_else(generate_session_key_pair);
        let delegation_auth_sig = match delegation_auth_sig {
            Some(sig) => sig,
            None => {
                self.sign_custom_session_key_for_pkp(
                    pkp_public_key,
                    &auth_config,
                    &custom_auth_params,
                    &session_key_pair,
                    user_max_price_wei,
                )
                .await?
            }
        };

        validate_delegation_auth_sig(&delegation_auth_sig, &session_key_pair.public_key)?;

        Ok(AuthContext {
            session_key_pair,
            auth_config,
            delegation_auth_sig,
        })
    }

    pub fn create_pkp_auth_context_from_pre_generated(
        &self,
        session_key_pair: SessionKeyPair,
        delegation_auth_sig: AuthSig,
    ) -> Result<AuthContext, LitSdkError> {
        validate_delegation_auth_sig(&delegation_auth_sig, &session_key_pair.public_key)?;
        let auth_config = auth_config_from_delegation_auth_sig(&delegation_auth_sig)?;

        Ok(AuthContext {
            session_key_pair,
            auth_config,
            delegation_auth_sig,
        })
    }

    async fn sign_session_key_for_pkp(
        &self,
        pkp_public_key: &str,
        auth_data: &AuthData,
        auth_config: &AuthConfig,
        session_key_pair: &SessionKeyPair,
        user_max_price_wei: Option<U256>,
    ) -> Result<AuthSig, LitSdkError> {
        let res = self
            .sign_session_key_for_pkp_inner(
                pkp_public_key,
                auth_data,
                auth_config,
                session_key_pair,
                user_max_price_wei.clone(),
            )
            .await;
        match res {
            Ok(v) => Ok(v),
            Err(e) if Self::is_node_payload_decryption_error(&e) => {
                let refreshed = create_lit_client(self.config.clone()).await?;
                refreshed
                    .sign_session_key_for_pkp_inner(
                        pkp_public_key,
                        auth_data,
                        auth_config,
                        session_key_pair,
                        user_max_price_wei,
                    )
                    .await
            }
            Err(e) => Err(e),
        }
    }

    async fn sign_session_key_for_pkp_inner(
        &self,
        pkp_public_key: &str,
        auth_data: &AuthData,
        auth_config: &AuthConfig,
        session_key_pair: &SessionKeyPair,
        user_max_price_wei: Option<U256>,
    ) -> Result<AuthSig, LitSdkError> {
        let jit = self.create_jit_context()?;
        let threshold = self.handshake.threshold.max(1);

        let selected_urls = match self.select_priced_nodes(PRODUCT_ID_SIGN_SESSION_KEY).await {
            Ok(urls) => urls,
            Err(_) => self
                .handshake
                .connected_nodes
                .iter()
                .take(threshold)
                .cloned()
                .collect(),
        };
        if selected_urls.len() < threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient node urls for signSessionKey: got {}, need {}",
                selected_urls.len(),
                threshold
            )));
        }

        let node_set = node_set_from_urls(&selected_urls);
        let request_id = random_hex(16);
        let epoch = self.handshake.epoch;

        let pkp_eth_address = pkp_eth_address_from_pubkey(pkp_public_key)?;

        let mut pkp_auth_config = auth_config.clone();
        let base_stmt = "Lit Protocol PKP session signature";
        let extra = pkp_auth_config.statement.trim();
        pkp_auth_config.statement = if extra.is_empty() {
            base_stmt.to_string()
        } else {
            format!("{base_stmt} {extra}")
        };
        if pkp_auth_config.domain.trim().is_empty() {
            pkp_auth_config.domain = "localhost".into();
        }

        let nonce = self.handshake.core_node_config.latest_blockhash.clone();
        let session_public_key_hex = session_key_pair
            .public_key
            .strip_prefix("lit:session:")
            .unwrap_or(&session_key_pair.public_key);
        let session_key_uri = format!("lit:session:{session_public_key_hex}");

        let siwe_message = create_siwe_message_with_resources(
            &pkp_eth_address,
            session_public_key_hex,
            &pkp_auth_config,
            &nonce,
        )?;

        #[derive(Debug, Clone, Serialize)]
        #[serde(rename_all = "camelCase")]
        struct AuthMethodForRequest {
            auth_method_type: u32,
            access_token: String,
        }

        let auth_method = AuthMethodForRequest {
            auth_method_type: auth_data.auth_method_type,
            access_token: auth_data.access_token.clone(),
        };

        let max_price = user_max_price_wei.unwrap_or_else(|| U256::from(u128::MAX));

        let mut requests = vec![];
        let http = self.http.clone();
        let version = self.version.clone();
        for url in &selected_urls {
            let request_data = serde_json::json!({
                "sessionKey": session_key_uri.clone(),
                "authMethods": [auth_method.clone()],
                "pkpPublicKey": pkp_public_key,
                "siweMessage": siwe_message.clone(),
                "curveType": "BLS",
                "epoch": epoch,
                "nodeSet": node_set.clone(),
                "maxPrice": max_price.to_string(),
            });

            let encrypted = wallet_encrypt(
                &jit.key_set[url].secret_key,
                &jit.key_set[url].public_key,
                request_data.to_string().as_bytes(),
            )?;

            let full_url = compose_lit_url(url, &self.config.endpoints.sign_session_key);
            let body = serde_json::to_value(&encrypted).unwrap();
            let secret_key = jit.key_set[url].secret_key;
            let http_cl = http.clone();
            let version_cl = version.clone();
            let request_id_cl = request_id.clone();
            requests.push(async move {
                send_encrypted_node_request(
                    &http_cl,
                    &full_url,
                    body,
                    &secret_key,
                    &request_id_cl,
                    &version_cl,
                    epoch,
                )
                .await
            });
        }

        let results = futures::future::join_all(requests).await;
        let batch = merge_encrypted_batch(results, threshold)?;

        #[derive(Debug, Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct SignSessionKeyNodeData {
            #[serde(rename = "signatureShare")]
            signature_share: SignatureShareWrapper,
            #[serde(rename = "siweMessage")]
            siwe_message: String,
        }

        let node_values: Vec<SignSessionKeyNodeData> = decrypt_batch_response(&batch, &jit, |v| {
            let data = v
                .get("data")
                .cloned()
                .ok_or_else(|| LitSdkError::Network("missing data field".into()))?;
            serde_json::from_value::<SignSessionKeyNodeData>(data)
                .map_err(|e| LitSdkError::Network(e.to_string()))
        })?;

        let shares_json: Vec<String> = node_values
            .iter()
            .map(|n| {
                serde_json::to_string(&serde_json::json!({
                    "ProofOfPossession": {
                        "identifier": n.signature_share.proof_of_possession.identifier,
                        "value": n.signature_share.proof_of_possession.value,
                    }
                }))
                .unwrap()
            })
            .collect();
        if shares_json.len() < threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient signature shares for signSessionKey: got {}, need {}",
                shares_json.len(),
                threshold
            )));
        }

        let combined = combine_bls_signature_shares(&shares_json)?;
        if combined.len() != 192 {
            return Err(LitSdkError::Crypto(format!(
                "combined BLS signature must be 192 hex chars; got {}",
                combined.len()
            )));
        }

        let most_common_siwe = most_common_value(node_values.iter().map(|v| v.siwe_message.clone()).collect())
            .unwrap_or_else(|| siwe_message.clone());

        let sig_json = serde_json::to_string(&serde_json::json!({
            "ProofOfPossession": combined,
        }))
        .map_err(|e| LitSdkError::Crypto(e.to_string()))?;

        Ok(AuthSig {
            sig: sig_json,
            derived_via: "lit.bls".into(),
            signed_message: most_common_siwe,
            address: pkp_eth_address,
            algo: Some("LIT_BLS".into()),
        })
    }

    async fn sign_custom_session_key_for_pkp(
        &self,
        pkp_public_key: &str,
        auth_config: &AuthConfig,
        custom_auth_params: &CustomAuthParams,
        session_key_pair: &SessionKeyPair,
        user_max_price_wei: Option<U256>,
    ) -> Result<AuthSig, LitSdkError> {
        if custom_auth_params.lit_action_ipfs_id.is_none()
            && custom_auth_params.lit_action_code.is_none()
        {
            return Err(LitSdkError::Config(
                "custom auth requires lit_action_ipfs_id or lit_action_code".into(),
            ));
        }

        let res = self
            .sign_custom_session_key_for_pkp_inner(
                pkp_public_key,
                auth_config,
                custom_auth_params,
                session_key_pair,
                user_max_price_wei.clone(),
            )
            .await;
        match res {
            Ok(v) => Ok(v),
            Err(e) if Self::is_node_payload_decryption_error(&e) => {
                let refreshed = create_lit_client(self.config.clone()).await?;
                refreshed
                    .sign_custom_session_key_for_pkp_inner(
                        pkp_public_key,
                        auth_config,
                        custom_auth_params,
                        session_key_pair,
                        user_max_price_wei,
                    )
                    .await
            }
            Err(e) => Err(e),
        }
    }

    async fn sign_custom_session_key_for_pkp_inner(
        &self,
        pkp_public_key: &str,
        auth_config: &AuthConfig,
        custom_auth_params: &CustomAuthParams,
        session_key_pair: &SessionKeyPair,
        user_max_price_wei: Option<U256>,
    ) -> Result<AuthSig, LitSdkError> {
        let jit = self.create_jit_context()?;
        let threshold = self.handshake.threshold.max(1);

        let selected_urls = match self.select_priced_nodes(PRODUCT_ID_LIT_ACTION).await {
            Ok(urls) => urls,
            Err(_) => self
                .handshake
                .connected_nodes
                .iter()
                .take(threshold)
                .cloned()
                .collect(),
        };
        if selected_urls.len() < threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient node urls for signCustomSessionKey: got {}, need {}",
                selected_urls.len(),
                threshold
            )));
        }

        let node_set = node_set_from_urls(&selected_urls);
        let request_id = random_hex(16);
        let epoch = self.handshake.epoch;

        let pkp_eth_address = pkp_eth_address_from_pubkey(pkp_public_key)?;

        let mut pkp_auth_config = auth_config.clone();
        let base_stmt = "Lit Protocol PKP session signature";
        let extra = pkp_auth_config.statement.trim();
        pkp_auth_config.statement = if extra.is_empty() {
            base_stmt.to_string()
        } else {
            format!("{base_stmt} {extra}")
        };
        if pkp_auth_config.domain.trim().is_empty() {
            pkp_auth_config.domain = "localhost".into();
        }

        let nonce = self.handshake.core_node_config.latest_blockhash.clone();
        let session_public_key_hex = session_key_pair
            .public_key
            .strip_prefix("lit:session:")
            .unwrap_or(&session_key_pair.public_key);
        let session_key_uri = format!("lit:session:{session_public_key_hex}");

        let siwe_message = create_siwe_message_with_resources(
            &pkp_eth_address,
            session_public_key_hex,
            &pkp_auth_config,
            &nonce,
        )?;

        let max_price = user_max_price_wei.unwrap_or_else(|| U256::from(u128::MAX));

        let mut requests = vec![];
        let http = self.http.clone();
        let version = self.version.clone();
        for url in &selected_urls {
            let mut request_data = serde_json::json!({
                "sessionKey": session_key_uri.clone(),
                "authMethods": [],
                "pkpPublicKey": pkp_public_key,
                "siweMessage": siwe_message.clone(),
                "curveType": "BLS",
                "epoch": epoch,
                "nodeSet": node_set.clone(),
                "maxPrice": max_price.to_string(),
            });

            if let Some(ipfs_id) = &custom_auth_params.lit_action_ipfs_id {
                if let Some(obj) = request_data.as_object_mut() {
                    obj.insert(
                        "litActionIpfsId".into(),
                        serde_json::Value::String(ipfs_id.clone()),
                    );
                }
            }
            if let Some(code) = &custom_auth_params.lit_action_code {
                if let Some(obj) = request_data.as_object_mut() {
                    obj.insert(
                        "litActionCode".into(),
                        serde_json::Value::String(code.clone()),
                    );
                }
            }
            if let Some(js_params) = &custom_auth_params.js_params {
                if let Some(obj) = request_data.as_object_mut() {
                    obj.insert(
                        "jsParams".into(),
                        serde_json::json!({ "jsParams": js_params.clone() }),
                    );
                }
            }

            let encrypted = wallet_encrypt(
                &jit.key_set[url].secret_key,
                &jit.key_set[url].public_key,
                request_data.to_string().as_bytes(),
            )?;

            let full_url = compose_lit_url(url, &self.config.endpoints.sign_session_key);
            let body = serde_json::to_value(&encrypted).unwrap();
            let secret_key = jit.key_set[url].secret_key;
            let http_cl = http.clone();
            let version_cl = version.clone();
            let request_id_cl = request_id.clone();
            requests.push(async move {
                send_encrypted_node_request(
                    &http_cl,
                    &full_url,
                    body,
                    &secret_key,
                    &request_id_cl,
                    &version_cl,
                    epoch,
                )
                .await
            });
        }

        let results = futures::future::join_all(requests).await;
        let batch = merge_encrypted_batch(results, threshold)?;

        #[derive(Debug, Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct SignSessionKeyNodeData {
            #[serde(rename = "signatureShare")]
            signature_share: SignatureShareWrapper,
            #[serde(rename = "siweMessage")]
            siwe_message: String,
        }

        let node_values: Vec<SignSessionKeyNodeData> = decrypt_batch_response(&batch, &jit, |v| {
            let data = v
                .get("data")
                .cloned()
                .ok_or_else(|| LitSdkError::Network("missing data field".into()))?;
            serde_json::from_value::<SignSessionKeyNodeData>(data)
                .map_err(|e| LitSdkError::Network(e.to_string()))
        })?;

        let shares_json: Vec<String> = node_values
            .iter()
            .map(|n| {
                serde_json::to_string(&serde_json::json!({
                    "ProofOfPossession": {
                        "identifier": n.signature_share.proof_of_possession.identifier,
                        "value": n.signature_share.proof_of_possession.value,
                    }
                }))
                .unwrap()
            })
            .collect();
        if shares_json.len() < threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient signature shares for signCustomSessionKey: got {}, need {}",
                shares_json.len(),
                threshold
            )));
        }

        let combined = combine_bls_signature_shares(&shares_json)?;
        if combined.len() != 192 {
            return Err(LitSdkError::Crypto(format!(
                "combined BLS signature must be 192 hex chars; got {}",
                combined.len()
            )));
        }

        let most_common_siwe = most_common_value(
            node_values
                .iter()
                .map(|v| v.siwe_message.clone())
                .collect(),
        )
        .unwrap_or_else(|| siwe_message.clone());

        let sig_json = serde_json::to_string(&serde_json::json!({
            "ProofOfPossession": combined,
        }))
        .map_err(|e| LitSdkError::Crypto(e.to_string()))?;

        Ok(AuthSig {
            sig: sig_json,
            derived_via: "lit.bls".into(),
            signed_message: most_common_siwe,
            address: pkp_eth_address,
            algo: Some("LIT_BLS".into()),
        })
    }

    pub async fn pkp_sign_ethereum(
        &self,
        pkp_pubkey: &str,
        to_sign: &[u8],
        auth_context: &AuthContext,
        user_max_price_wei: Option<ethers::types::U256>,
    ) -> Result<serde_json::Value, LitSdkError> {
        self.pkp_sign_ethereum_with_options(
            pkp_pubkey,
            to_sign,
            auth_context,
            user_max_price_wei,
            false,
        )
        .await
    }

    pub async fn pkp_sign_ethereum_with_options(
        &self,
        pkp_pubkey: &str,
        to_sign: &[u8],
        auth_context: &AuthContext,
        user_max_price_wei: Option<ethers::types::U256>,
        bypass_auto_hashing: bool,
    ) -> Result<serde_json::Value, LitSdkError> {
        self.pkp_sign_raw_with_options(
            "ethereum",
            "EcdsaK256Sha256",
            pkp_pubkey,
            to_sign,
            auth_context,
            user_max_price_wei,
            bypass_auto_hashing,
        )
        .await
    }

    pub async fn pkp_sign_raw(
        &self,
        chain: &str,
        signing_scheme: &str,
        pkp_pubkey: &str,
        to_sign: &[u8],
        auth_context: &AuthContext,
        user_max_price_wei: Option<ethers::types::U256>,
    ) -> Result<serde_json::Value, LitSdkError> {
        self.pkp_sign_raw_with_options(
            chain,
            signing_scheme,
            pkp_pubkey,
            to_sign,
            auth_context,
            user_max_price_wei,
            false,
        )
        .await
    }

    pub async fn pkp_sign_raw_with_options(
        &self,
        chain: &str,
        signing_scheme: &str,
        pkp_pubkey: &str,
        to_sign: &[u8],
        auth_context: &AuthContext,
        user_max_price_wei: Option<ethers::types::U256>,
        bypass_auto_hashing: bool,
    ) -> Result<serde_json::Value, LitSdkError> {
        let res = self
            .pkp_sign_raw_with_options_inner(
                chain,
                signing_scheme,
                pkp_pubkey,
                to_sign,
                auth_context,
                user_max_price_wei.clone(),
                bypass_auto_hashing,
            )
            .await;
        match res {
            Ok(v) => Ok(v),
            Err(e) if Self::is_node_payload_decryption_error(&e) => {
                let refreshed = create_lit_client(self.config.clone()).await?;
                refreshed
                    .pkp_sign_raw_with_options_inner(
                        chain,
                        signing_scheme,
                        pkp_pubkey,
                        to_sign,
                        auth_context,
                        user_max_price_wei,
                        bypass_auto_hashing,
                    )
                    .await
            }
            Err(e) => Err(e),
        }
    }

    async fn pkp_sign_raw_with_options_inner(
        &self,
        chain: &str,
        signing_scheme: &str,
        pkp_pubkey: &str,
        to_sign: &[u8],
        auth_context: &AuthContext,
        user_max_price_wei: Option<ethers::types::U256>,
        bypass_auto_hashing: bool,
    ) -> Result<serde_json::Value, LitSdkError> {
        let to_sign_data = pkp_sign_message_bytes(
            chain,
            signing_scheme,
            to_sign,
            bypass_auto_hashing,
        )?;

        let jit = self.create_jit_context()?;

        let threshold = self.handshake.threshold.max(1);
        let selected_urls = match self.select_priced_nodes(PRODUCT_ID_SIGN).await {
            Ok(urls) => urls,
            Err(_) => self
                .handshake
                .connected_nodes
                .iter()
                .take(threshold)
                .cloned()
                .collect(),
        };
        if selected_urls.len() < threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient node urls for pkpSign: got {}, need {}",
                selected_urls.len(),
                threshold
            )));
        }

        let per_node_max_price =
            user_max_price_wei.map(|p| p / ethers::types::U256::from(threshold as u64));

        let session_sigs = issue_session_sigs_with_max_price(
            &auth_context.session_key_pair,
            &auth_context.auth_config,
            &auth_context.delegation_auth_sig,
            &selected_urls,
            per_node_max_price,
        )?;

        let node_set = node_set_from_urls(&selected_urls);
        let request_id = random_hex(16);
        let epoch = self.handshake.epoch;

        let mut requests = vec![];
        let http = self.http.clone();
        let version = self.version.clone();
        for (url, sig) in &session_sigs {
            let to_sign_vec = to_sign_data.clone();
            let request_data = serde_json::json!({
                "toSign": to_sign_vec,
                "signingScheme": signing_scheme,
                "pubkey": pkp_pubkey,
                "authSig": sig,
                "nodeSet": node_set.clone(),
                "epoch": epoch,
                "authMethods": [],
            });

            let encrypted = wallet_encrypt(
                &jit.key_set[url].secret_key,
                &jit.key_set[url].public_key,
                request_data.to_string().as_bytes(),
            )?;

            let full_url = compose_lit_url(url, &self.config.endpoints.pkp_sign);
            let body = serde_json::to_value(&encrypted).unwrap();
            let secret_key = jit.key_set[url].secret_key;
            let http_cl = http.clone();
            let version_cl = version.clone();
            let request_id_cl = request_id.clone();
            requests.push(async move {
                send_encrypted_node_request(
                    &http_cl,
                    &full_url,
                    body,
                    &secret_key,
                    &request_id_cl,
                    &version_cl,
                    epoch,
                )
                .await
            });
        }

        let results = futures::future::join_all(requests).await;
        let batch = merge_encrypted_batch(results, threshold)?;

        let node_values: Vec<serde_json::Value> =
            decrypt_batch_response(&batch, &jit, |v| {
                v.get("data")
                    .cloned()
                    .ok_or_else(|| LitSdkError::Network("missing data field".into()))
            })?;

        let combiner_shares: Vec<String> = node_values
            .iter()
            .filter(|v| v.get("success").and_then(|s| s.as_bool()) == Some(true))
            .filter_map(|v| v.get("signatureShare"))
            .filter_map(|s| serde_json::to_string(s).ok())
            .collect();
        if combiner_shares.len() < threshold {
            return Err(LitSdkError::Network(format!(
                "insufficient signature shares: got {}, need {}",
                combiner_shares.len(),
                threshold
            )));
        }

        let combined = lit_utilities_wasm::combine_and_verify(combiner_shares)
            .map_err(|e| LitSdkError::Crypto(format!("{e:?}")))?;

        let combined_value: serde_json::Value =
            serde_json::from_str(&combined).map_err(|e| LitSdkError::Crypto(e.to_string()))?;

        Ok(combined_value)
    }

    async fn select_priced_nodes(&self, product_id: usize) -> Result<Vec<String>, LitSdkError> {
        let rpc_url = self
            .config
            .rpc_url
            .as_deref()
            .ok_or_else(|| LitSdkError::Config("rpc_url is required for priced requests".into()))?;
        let price_feed_addr = price_feed_address_for(self.config.network).ok_or_else(|| {
            LitSdkError::Config(format!(
                "unknown PriceFeed contract address for network {}",
                self.config.network
            ))
        })?;

        let provider = Arc::new(
            Provider::<Http>::try_from(rpc_url)
                .map_err(|e| LitSdkError::Config(e.to_string()))?,
        );
        let contract = PriceFeedContract::new(price_feed_addr, provider);

        let realm_id: U256 = 1u64.into();
        let product_ids: Vec<U256> = vec![0u64.into(), 1u64.into(), 2u64.into(), 3u64.into()];
        let (_epoch_id, min_node_count, nodes_and_prices) = contract
            .get_nodes_for_request(realm_id, product_ids)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;

        let required = self.handshake.threshold.max(1);
        let contract_min = (min_node_count.as_u64() as usize).max(1);
        if required < contract_min {
            return Err(LitSdkError::Config(format!(
                "minimum_threshold ({required}) is below chain minNodeCount ({contract_min})"
            )));
        }
        let connected: HashSet<&str> = self
            .handshake
            .connected_nodes
            .iter()
            .map(|s| s.as_str())
            .collect();

        let mut candidates: Vec<(String, U256)> = nodes_and_prices
            .into_iter()
            .filter_map(|node| {
                let price = node.prices.get(product_id)?.clone();
                let url = format!(
                    "{}{}:{}",
                    self.config.http_protocol,
                    int_to_ip(node.validator.ip),
                    node.validator.port
                );
                connected.contains(url.as_str()).then_some((url, price))
            })
            .collect();

        candidates.sort_by(|a, b| a.1.cmp(&b.1));
        let selected: Vec<String> = candidates
            .into_iter()
            .take(required)
            .map(|(url, _)| url)
            .collect();

        if selected.len() < required {
            return Err(LitSdkError::Network(format!(
                "price feed returned only {} usable nodes, need {}",
                selected.len(),
                required
            )));
        }

        Ok(selected)
    }

    fn create_jit_context(&self) -> Result<NagaJitContext, LitSdkError> {
        let mut key_set = HashMap::new();
        for url in self.handshake.server_keys.keys() {
            let server_key = &self.handshake.server_keys[url];
            let pk_hex = server_key.node_identity_key.trim_start_matches("0x");
            let pk_bytes = hex::decode(pk_hex).map_err(|e| {
                LitSdkError::Config(format!(
                    "invalid node identity key for {url}: {e}"
                ))
            })?;
            let mut pk32 = [0u8; 32];
            if pk_bytes.len() != 32 {
                return Err(LitSdkError::Config(
                    "node identity key must be 32 bytes".into(),
                ));
            }
            pk32.copy_from_slice(&pk_bytes);

            let mut sk32 = [0u8; 32];
            rand::thread_rng().fill_bytes(&mut sk32);

            key_set.insert(
                url.clone(),
                JitKeyPair {
                    public_key: pk32,
                    secret_key: sk32,
                },
            );
        }

        Ok(NagaJitContext { key_set })
    }
}

fn compose_lit_url(base: &str, endpoint: &Endpoint) -> String {
    format!("{}{}{}", base, endpoint.path, endpoint.version)
}

async fn send_node_request<T: serde::de::DeserializeOwned>(
    http: &reqwest::Client,
    full_url: &str,
    mut body: serde_json::Value,
    request_id: &str,
    version: &str,
    epoch: u64,
) -> Result<T, LitSdkError> {
    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", HeaderValue::from_static("application/json"));
    headers.insert("Accept", HeaderValue::from_static("application/json"));
    headers.insert("X-Lit-SDK-Version", HeaderValue::from_str(version).unwrap());
    headers.insert("X-Lit-SDK-Type", HeaderValue::from_static("Typescript"));
    headers.insert("X-Request-Id", HeaderValue::from_str(request_id).unwrap());

    if let Some(obj) = body.as_object_mut() {
        obj.insert("epoch".into(), serde_json::json!(epoch));
    }

    let res = http.post(full_url).headers(headers).json(&body).send().await?;
    let status = res.status();

    if !status.is_success() {
        let text = res.text().await.unwrap_or_default();
        return Err(LitSdkError::Network(format!(
            "node request failed {}: {}",
            status,
            text
        )));
    }

    let value: serde_json::Value = res.json().await?;
    match serde_json::from_value::<T>(value.clone()) {
        Ok(parsed) => Ok(parsed),
        Err(err) => {
            if let Some(data) = value.get("data").cloned() {
                serde_json::from_value::<T>(data)
                    .map_err(|e| LitSdkError::Network(e.to_string()))
            } else {
                Err(LitSdkError::Network(format!(
                    "unexpected response shape: {err}; body={value}"
                )))
            }
        }
    }
}

/// Send a request whose body is an E2EE encrypted payload.
///
/// Nodes sometimes respond with an encrypted error payload and a non-2xx status.
/// This helper attempts to decrypt such errors using the per-node JIT secret key
/// so callers can see the underlying cause.
async fn send_encrypted_node_request(
    http: &reqwest::Client,
    full_url: &str,
    mut body: serde_json::Value,
    jit_secret_key: &[u8; 32],
    request_id: &str,
    version: &str,
    epoch: u64,
) -> Result<GenericEncryptedPayload, LitSdkError> {
    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", HeaderValue::from_static("application/json"));
    headers.insert("Accept", HeaderValue::from_static("application/json"));
    headers.insert("X-Lit-SDK-Version", HeaderValue::from_str(version).unwrap());
    headers.insert("X-Lit-SDK-Type", HeaderValue::from_static("Typescript"));
    headers.insert("X-Request-Id", HeaderValue::from_str(request_id).unwrap());

    if let Some(obj) = body.as_object_mut() {
        obj.insert("epoch".into(), serde_json::json!(epoch));
    }

    let res = http.post(full_url).headers(headers).json(&body).send().await?;
    let status = res.status();
    let text = res.text().await.unwrap_or_default();

    let value: serde_json::Value = serde_json::from_str(&text).unwrap_or_else(|_| {
        serde_json::json!({ "raw": text })
    });

    if status.is_success() {
        if let Ok(parsed) = serde_json::from_value::<GenericEncryptedPayload>(value.clone()) {
            return Ok(parsed);
        }
        if let Some(data) = value.get("data").cloned() {
            if let Ok(parsed) = serde_json::from_value::<GenericEncryptedPayload>(data.clone()) {
                return Ok(parsed);
            }
            // Some nodes return the encrypted payload directly under `data`.
            if let Ok(enc) = serde_json::from_value::<EncryptedPayload>(data) {
                return Ok(GenericEncryptedPayload {
                    success: true,
                    values: vec![enc],
                    error: None,
                });
            }
        }
        // Some nodes return a single encrypted payload on success.
        if let Ok(enc) = serde_json::from_value::<EncryptedPayload>(value.clone()) {
            return Ok(GenericEncryptedPayload {
                success: true,
                values: vec![enc],
                error: None,
            });
        }
        return Err(LitSdkError::Network(format!(
            "unexpected response shape; body={value}"
        )));
    }

    // Try to decrypt an encrypted error payload.
    if let Ok(encrypted_err) = serde_json::from_value::<EncryptedPayload>(value.clone()) {
        if let Ok(bytes) = wallet_decrypt(jit_secret_key, &encrypted_err) {
            if let Ok(decrypted_text) = String::from_utf8(bytes) {
                return Err(LitSdkError::Network(format!(
                    "node returned encrypted error: {decrypted_text}"
                )));
            }
        }
    }

    Err(LitSdkError::Network(format!(
        "node request failed {}: {}",
        status, text
    )))
}

fn merge_encrypted_batch(
    results: Vec<Result<GenericEncryptedPayload, LitSdkError>>,
    minimum_successes: usize,
) -> Result<GenericEncryptedPayload, LitSdkError> {
    let mut values = vec![];
    let mut errors = vec![];
    let mut success_count = 0usize;
    for r in results {
        match r {
            Ok(batch) if batch.success => {
                success_count += 1;
                values.extend(batch.values)
            }
            Ok(batch) => {
                let err = batch
                    .error
                    .clone()
                    .unwrap_or_else(|| serde_json::json!(batch));
                errors.push(err);
            }
            Err(e) => errors.push(serde_json::json!({ "error": e.to_string() })),
        }
    }

    if values.is_empty() || success_count < minimum_successes {
        return Err(LitSdkError::Network(format!(
            "insufficient successful encrypted responses: got {success_count}, need {minimum_successes}; errors={}",
            serde_json::to_string(&errors).unwrap_or_default()
        )));
    }

    Ok(GenericEncryptedPayload {
        success: true,
        values,
        error: None,
    })
}

fn decrypt_batch_response<T, F>(
    encrypted_result: &GenericEncryptedPayload,
    jit: &NagaJitContext,
    extract: F,
) -> Result<Vec<T>, LitSdkError>
where
    F: Fn(serde_json::Value) -> Result<T, LitSdkError>,
{
    if !encrypted_result.success {
        return Err(LitSdkError::Network("batch decrypt failed".into()));
    }

    let mut verification_to_secret: HashMap<String, [u8; 32]> = HashMap::new();
    for (_url, kp) in &jit.key_set {
        let node_pk_hex = hex::encode(kp.public_key);
        verification_to_secret.insert(node_pk_hex.clone(), kp.secret_key);
        verification_to_secret.insert(format!("0x{node_pk_hex}"), kp.secret_key);
    }

    let mut out = vec![];
    for encrypted in &encrypted_result.values {
        let verification_key = encrypted.payload.verification_key.clone();
        let secret = verification_to_secret.get(&verification_key).ok_or_else(|| {
            LitSdkError::Network(format!(
                "no secret key for verification key {verification_key}"
            ))
        })?;

        let decrypted_bytes = wallet_decrypt(secret, encrypted)?;
        let decrypted_text = String::from_utf8(decrypted_bytes)
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let json_val: serde_json::Value =
            serde_json::from_str(&decrypted_text).map_err(|e| LitSdkError::Network(e.to_string()))?;

        out.push(extract(json_val)?);
    }

    Ok(out)
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DecryptNodeResponse {
    #[serde(rename = "signatureShare")]
    signature_share: SignatureShareWrapper,
    #[serde(rename = "shareId")]
    share_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SignatureShareWrapper {
    #[serde(rename = "ProofOfPossession")]
    proof_of_possession: ProofOfPossession,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProofOfPossession {
    identifier: String,
    value: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExecuteJsNodeValue {
    success: bool,
    #[serde(default)]
    claim_data: HashMap<String, serde_json::Value>,
    #[serde(default)]
    decrypted_data: serde_json::Value,
    #[serde(default)]
    logs: String,
    #[serde(default)]
    response: String,
    #[serde(default)]
    signed_data: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct NodeSetEntry {
    socket_address: String,
    value: u64,
}

fn pkp_sign_message_bytes(
    chain: &str,
    signing_scheme: &str,
    to_sign: &[u8],
    bypass_auto_hashing: bool,
) -> Result<Vec<u8>, LitSdkError> {
    if bypass_auto_hashing {
        return Ok(to_sign.to_vec());
    }

    match signing_scheme {
        "EcdsaK256Sha256" | "EcdsaP256Sha256" => match chain {
            "ethereum" => Ok(Keccak256::digest(to_sign).to_vec()),
            "bitcoin" | "cosmos" => Ok(Sha256::digest(to_sign).to_vec()),
            other => Err(LitSdkError::Config(format!(
                "chain \"{other}\" does not support ECDSA signing with Lit yet"
            ))),
        },
        "EcdsaP384Sha384" => match chain {
            "ethereum" => Ok(Keccak384::digest(to_sign).to_vec()),
            "bitcoin" | "cosmos" => Ok(Sha384::digest(to_sign).to_vec()),
            other => Err(LitSdkError::Config(format!(
                "chain \"{other}\" does not support ECDSA signing with Lit yet"
            ))),
        },
        _ => Ok(to_sign.to_vec()),
    }
}

fn node_set_from_urls(urls: &[String]) -> Vec<NodeSetEntry> {
    urls.iter()
        .map(|url| NodeSetEntry {
            socket_address: url.replace("http://", "").replace("https://", ""),
            value: 1,
        })
        .collect()
}

async fn orchestrate_handshake(
    http: &reqwest::Client,
    config: &NetworkConfig,
    version: &str,
) -> Result<OrchestrateHandshakeResponse, LitSdkError> {
    let request_id = random_hex(16);
    let timeout_dur = Duration::from_millis(config.abort_timeout_ms);

    let fut = async {
        let mut server_keys: HashMap<String, RawHandshakeResponse> = HashMap::new();

        let mut tasks = vec![];
        for url in &config.bootstrap_urls {
            let full_url = compose_lit_url(url, &config.endpoints.handshake);
            let challenge = random_hex(32);
            let body = serde_json::to_value(HandshakeRequestData {
                client_public_key: "test".into(),
                challenge: challenge.clone(),
                epoch: Some(0),
            })
            .unwrap();

            let url_clone = url.clone();
            let request_id_clone = request_id.clone();
            let challenge_clone = challenge.clone();
            tasks.push(async move {
                let res: Result<RawHandshakeResponse, LitSdkError> =
                    send_node_request(http, &full_url, body, &request_id_clone, version, 0).await;
                (url_clone, challenge_clone, res)
            });
        }

        let results = futures::future::join_all(tasks).await;

        let mut successful_urls = vec![];
        let mut failed_urls = vec![];
        let mut errors: Vec<String> = vec![];

        for (url, challenge, res) in results {
            match res {
                Ok(keys) => {
                    if config.required_attestation {
                        let Some(attestation) = keys.attestation.as_ref() else {
                            errors.push(format!("{url}: missing attestation"));
                            failed_urls.push(url);
                            continue;
                        };
                        if let Err(e) =
                            verify_sev_snp_attestation(http, attestation, &challenge).await
                        {
                            errors.push(format!("{url}: {e}"));
                            failed_urls.push(url);
                            continue;
                        }
                    }
                    let pk_hex = keys.node_identity_key.trim_start_matches("0x");
                    match hex::decode(pk_hex) {
                        Ok(bytes) if bytes.len() == 32 => {}
                        _ => {
                            errors.push(format!("{url}: invalid nodeIdentityKey"));
                            failed_urls.push(url);
                            continue;
                        }
                    }
                    successful_urls.push(url.clone());
                    server_keys.insert(url, keys);
                }
                Err(e) => {
                    errors.push(format!("{url}: {e}"));
                    failed_urls.push(url);
                }
            }
        }

        let minimum_required = config.minimum_threshold.max(1);

        if successful_urls.len() < minimum_required {
            return Err(LitSdkError::Handshake(format!(
                "insufficient successful handshakes: got {}, need {}; errors={}",
                successful_urls.len(),
                minimum_required,
                errors.join("; ")
            )));
        }

        let core = resolve_handshake_response(&server_keys, &request_id)?;
        let epoch = most_common_u64(server_keys.values().map(|k| k.epoch).collect())
            .unwrap_or(0);

        Ok(OrchestrateHandshakeResponse {
            server_keys,
            connected_nodes: successful_urls,
            core_node_config: core,
            threshold: minimum_required,
            epoch,
        })
    };

    timeout(timeout_dur, fut)
        .await
        .map_err(|_| {
            LitSdkError::Handshake(format!(
                "handshake timed out after {}ms",
                config.abort_timeout_ms
            ))
        })?
}

async fn verify_sev_snp_attestation(
    http: &reqwest::Client,
    attestation: &serde_json::Value,
    challenge_hex: &str,
) -> Result<(), LitSdkError> {
    let att_obj = attestation
        .as_object()
        .ok_or_else(|| LitSdkError::Handshake("invalid attestation: expected object".into()))?;

    let typ = att_obj
        .get("type")
        .and_then(|v| v.as_str())
        .ok_or_else(|| LitSdkError::Handshake("invalid attestation: missing type".into()))?;

    if typ != "AMD_SEV_SNP" {
        return Err(LitSdkError::Handshake(format!(
            "unsupported attestation type {typ}"
        )));
    }

    let challenge_bytes = hex::decode(challenge_hex).map_err(|e| {
        LitSdkError::Handshake(format!("invalid attestation challenge hex: {e}"))
    })?;
    if challenge_bytes.len() != 32 {
        return Err(LitSdkError::Handshake(format!(
            "attestation challenge must be 32 bytes; got {}",
            challenge_bytes.len()
        )));
    }

    let noonce_val = att_obj.get("noonce").ok_or_else(|| {
        LitSdkError::Handshake("invalid attestation: missing noonce".into())
    })?;
    let noonce = parse_attestation_bytes(noonce_val, "noonce")?;
    if noonce != challenge_bytes {
        return Err(LitSdkError::Handshake(
            "attestation noonce does not match challenge".into(),
        ));
    }

    let report_val = att_obj.get("report").ok_or_else(|| {
        LitSdkError::Handshake("invalid attestation: missing report".into())
    })?;
    let report_bytes = parse_attestation_bytes(report_val, "report")?;

    let mut data_map: BTreeMap<String, Vec<u8>> = BTreeMap::new();
    let data_obj = att_obj.get("data").and_then(|v| v.as_object()).ok_or_else(|| {
        LitSdkError::Handshake("invalid attestation: missing data".into())
    })?;
    for (k, v) in data_obj {
        data_map.insert(k.clone(), parse_attestation_bytes(v, &format!("data.{k}"))?);
    }

    let mut signatures: Vec<Vec<u8>> = vec![];
    if let Some(sig_arr) = att_obj.get("signatures").and_then(|v| v.as_array()) {
        for (idx, v) in sig_arr.iter().enumerate() {
            signatures.push(parse_attestation_bytes(v, &format!("signatures[{idx}]"))?);
        }
    }

    use sev::certs::snp::Certificate;
    use sev::firmware::guest::AttestationReport;
    use sev::parser::ByteParser;

    let report = AttestationReport::from_bytes(&report_bytes).map_err(|e| {
        LitSdkError::Handshake(format!("invalid SEV-SNP attestation report bytes: {e}"))
    })?;

    let vcek_url = SevSnp::vcek_url(&report);
    let res = http.get(&vcek_url).send().await?;
    let status = res.status();
    let cert_bytes = res.bytes().await?;
    if !status.is_success() {
        return Err(LitSdkError::Handshake(format!(
            "failed to fetch VCEK certificate ({status}) from {vcek_url}"
        )));
    }

    let cert = Certificate::from_der(cert_bytes.as_ref())
        .or_else(|_| Certificate::from_pem(cert_bytes.as_ref()))
        .map_err(|e| LitSdkError::Handshake(format!("invalid VCEK certificate: {e}")))?;

    SevSnp::verify(&report, &data_map, &signatures, &challenge_bytes, &cert)?;
    Ok(())
}

fn parse_attestation_bytes(
    v: &serde_json::Value,
    field: &str,
) -> Result<Vec<u8>, LitSdkError> {
    match v {
        serde_json::Value::String(s) => base64ct::Base64::decode_vec(s).map_err(|e| {
            LitSdkError::Handshake(format!("invalid base64 for {field}: {e}"))
        }),
        serde_json::Value::Array(arr) => {
            let mut out = Vec::with_capacity(arr.len());
            for (idx, entry) in arr.iter().enumerate() {
                let n = entry.as_u64().ok_or_else(|| {
                    LitSdkError::Handshake(format!(
                        "invalid byte value for {field}[{idx}]: expected number"
                    ))
                })?;
                if n > 255 {
                    return Err(LitSdkError::Handshake(format!(
                        "invalid byte value for {field}[{idx}]: {n}"
                    )));
                }
                out.push(n as u8);
            }
            Ok(out)
        }
        serde_json::Value::Null => Err(LitSdkError::Handshake(format!(
            "invalid {field}: null"
        ))),
        other => Err(LitSdkError::Handshake(format!(
            "invalid {field}: expected base64 string or byte array, got {other}"
        ))),
    }
}

fn resolve_handshake_response(
    server_keys: &HashMap<String, RawHandshakeResponse>,
    request_id: &str,
) -> Result<ResolvedHandshakeResponse, LitSdkError> {
    let latest_blockhash = most_common_value(
        server_keys
            .values()
            .map(|k| k.latest_blockhash.clone())
            .collect(),
    )
    .ok_or_else(|| {
        LitSdkError::Handshake(format!(
            "latestBlockhash unavailable for request {}",
            request_id
        ))
    })?;

    let subnet_pub_key = most_common_value(
        server_keys
            .values()
            .map(|k| k.subnet_public_key.clone())
            .collect(),
    )
    .unwrap_or_default();

    let network_pub_key = most_common_value(
        server_keys
            .values()
            .map(|k| k.network_public_key.clone())
            .collect(),
    )
    .unwrap_or_default();

    let network_pub_key_set = most_common_value(
        server_keys
            .values()
            .map(|k| k.network_public_key_set.clone())
            .collect(),
    )
    .unwrap_or_default();

    let hd_root_pubkeys = most_common_value_vec(
        server_keys
            .values()
            .map(|k| k.hd_root_pubkeys.clone())
            .collect(),
    )
    .unwrap_or_default();

    Ok(ResolvedHandshakeResponse {
        subnet_pub_key,
        network_pub_key,
        network_pub_key_set,
        hd_root_pubkeys,
        latest_blockhash,
    })
}

fn most_common_value(values: Vec<String>) -> Option<String> {
    let mut counts: HashMap<String, usize> = HashMap::new();
    for v in values {
        *counts.entry(v).or_insert(0) += 1;
    }
    counts.into_iter().max_by_key(|(_, c)| *c).map(|(v, _)| v)
}

fn most_common_value_vec(values: Vec<Vec<String>>) -> Option<Vec<String>> {
    let mut counts: HashMap<String, usize> = HashMap::new();
    for v in values {
        let key = serde_json::to_string(&v).ok()?;
        *counts.entry(key).or_insert(0) += 1;
    }
    counts
        .into_iter()
        .max_by_key(|(_, c)| *c)
        .and_then(|(k, _)| serde_json::from_str(&k).ok())
}

fn most_common_u64(values: Vec<u64>) -> Option<u64> {
    let mut counts: HashMap<u64, usize> = HashMap::new();
    for v in values {
        *counts.entry(v).or_insert(0) += 1;
    }
    counts.into_iter().max_by_key(|(_, c)| *c).map(|(v, _)| v)
}

fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    hex::encode(hasher.finalize())
}

fn random_hex(num_bytes: usize) -> String {
    let mut b = vec![0u8; num_bytes];
    rand::thread_rng().fill_bytes(&mut b);
    hex::encode(b)
}
