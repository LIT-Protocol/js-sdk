use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::network::NagaEndpoints;

#[derive(Clone, Debug)]
pub struct Endpoints {
    pub naga: NagaEndpoints,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HandshakeRequestData {
    pub client_public_key: String,
    pub challenge: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub epoch: Option<u64>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RawHandshakeResponse {
    pub server_public_key: String,
    pub subnet_public_key: String,
    pub network_public_key: String,
    pub network_public_key_set: String,
    pub client_sdk_version: String,
    pub hd_root_pubkeys: Vec<String>,
    #[serde(default)]
    pub attestation: Option<serde_json::Value>,
    pub latest_blockhash: String,
    pub node_version: String,
    pub epoch: u64,
    pub node_identity_key: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ResolvedHandshakeResponse {
    pub subnet_pub_key: String,
    pub network_pub_key: String,
    pub network_pub_key_set: String,
    pub hd_root_pubkeys: Vec<String>,
    pub latest_blockhash: String,
}

#[derive(Debug, Clone)]
pub struct OrchestrateHandshakeResponse {
    pub server_keys: HashMap<String, RawHandshakeResponse>,
    pub connected_nodes: Vec<String>,
    pub core_node_config: ResolvedHandshakeResponse,
    pub threshold: usize,
    pub epoch: u64,
}

#[derive(Debug, Clone)]
pub struct EncryptParams {
    pub data_to_encrypt: Vec<u8>,
    pub unified_access_control_conditions: Option<serde_json::Value>,
    pub hashed_access_control_conditions_hex: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct EncryptResponse {
    pub ciphertext_base64: String,
    pub data_to_encrypt_hash_hex: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct DecryptParams {
    pub ciphertext_base64: String,
    pub data_to_encrypt_hash_hex: String,
    pub unified_access_control_conditions: Option<serde_json::Value>,
    pub hashed_access_control_conditions_hex: Option<String>,
}

#[derive(Debug, Clone)]
pub struct DecryptResponse {
    pub decrypted_data: Vec<u8>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct ExecuteJsResponse {
    pub success: bool,
    pub signatures: HashMap<String, serde_json::Value>,
    pub response: serde_json::Value,
    pub logs: String,
}
