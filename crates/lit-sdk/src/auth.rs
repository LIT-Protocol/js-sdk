use crate::error::LitSdkError;
use ed25519_dalek::SigningKey;
use ethers::signers::{LocalWallet, Signer};
use ethers::types::Address as EthAddress;
use ethers::utils::{keccak256, to_checksum};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionKeyPair {
    pub public_key: String,
    pub secret_key: String,
}

pub fn generate_session_key_pair() -> SessionKeyPair {
    let mut csprng = OsRng;
    let signing_key = SigningKey::generate(&mut csprng);
    let verifying_key = signing_key.verifying_key();

    SessionKeyPair {
        public_key: hex::encode(verifying_key.to_bytes()),
        secret_key: hex::encode(signing_key.to_bytes()),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthData {
    pub auth_method_id: String,
    pub auth_method_type: u32,
    pub access_token: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

pub async fn create_eth_wallet_auth_data(
    private_key_hex: &str,
    nonce: &str,
) -> Result<AuthData, LitSdkError> {
    use chrono::{SecondsFormat, Utc};
    use siwe::{Message, TimeStamp};

    let wallet: LocalWallet = private_key_hex
        .parse::<LocalWallet>()
        .map_err(|e| LitSdkError::Config(format!("invalid private key: {e}")))?;
    let checksum_address = to_checksum(&wallet.address(), None);

    // Match JS defaults from `createSiweMessage` in `@lit-protocol/auth-helpers`.
    let issued_at: TimeStamp = Utc::now()
        .to_rfc3339_opts(SecondsFormat::Millis, true)
        .parse::<TimeStamp>()
        .map_err(|e| LitSdkError::Config(format!("invalid issued_at timestamp: {e}")))?;
    let expiration_time: TimeStamp = (Utc::now() + chrono::Duration::days(7))
        .to_rfc3339_opts(SecondsFormat::Millis, true)
        .parse::<TimeStamp>()
        .map_err(|e| LitSdkError::Config(format!("invalid expiration timestamp: {e}")))?;

    let message = Message {
        domain: "localhost"
            .parse::<http::uri::Authority>()
            .map_err(|e| LitSdkError::Config(format!("invalid domain: {e}")))?,
        address: wallet.address().0,
        statement: Some("This is a test statement.  You can put anything you want here.".into()),
        uri: "https://localhost/login"
            .parse::<iri_string::types::UriString>()
            .map_err(|e| LitSdkError::Config(format!("invalid uri: {e}")))?,
        version: siwe::Version::V1,
        chain_id: 1,
        nonce: nonce.to_string(),
        issued_at,
        expiration_time: Some(expiration_time),
        not_before: None,
        request_id: None,
        resources: vec![],
    };

    let siwe_message = message.to_string();
    let auth_sig = sign_siwe_with_eoa(private_key_hex, &siwe_message).await?;

    let method_id_hash = keccak256(format!("{checksum_address}:lit").as_bytes());
    let auth_method_id = format!("0x{}", hex::encode(method_id_hash));

    Ok(AuthData {
        auth_method_id,
        auth_method_type: 1,
        access_token: serde_json::to_string(&auth_sig)
            .map_err(|e| LitSdkError::Config(format!("failed to serialize authSig: {e}")))?,
        public_key: None,
        metadata: None,
    })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthSig {
    pub sig: String,
    pub derived_via: String,
    pub signed_message: String,
    pub address: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub algo: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AuthConfig {
    pub capability_auth_sigs: Vec<AuthSig>,
    pub expiration: String,
    pub statement: String,
    pub domain: String,
    pub resources: Vec<ResourceAbilityRequest>,
}

#[derive(Debug, Clone, Default)]
pub struct CustomAuthParams {
    pub lit_action_code: Option<String>,
    pub lit_action_ipfs_id: Option<String>,
    pub js_params: Option<serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct ResourceAbilityRequest {
    pub ability: LitAbility,
    pub resource_id: String,
    pub data: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LitAbility {
    AccessControlConditionDecryption,
    AccessControlConditionSigning,
    PKPSigning,
    PaymentDelegation,
    LitActionExecution,
    /// Recap-only ability used by JS EOA auth contexts for resolved auth.
    ResolvedAuthContext,
}

impl LitAbility {
    pub fn as_str(&self) -> &'static str {
        match self {
            LitAbility::AccessControlConditionDecryption => {
                "access-control-condition-decryption"
            }
            LitAbility::AccessControlConditionSigning => {
                "access-control-condition-signing"
            }
            LitAbility::PKPSigning => "pkp-signing",
            LitAbility::PaymentDelegation => "lit-payment-delegation",
            LitAbility::LitActionExecution => "lit-action-execution",
            LitAbility::ResolvedAuthContext => "lit-resolved-auth-context",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "access-control-condition-decryption" => {
                Some(LitAbility::AccessControlConditionDecryption)
            }
            "access-control-condition-signing" => {
                Some(LitAbility::AccessControlConditionSigning)
            }
            "pkp-signing" => Some(LitAbility::PKPSigning),
            "lit-payment-delegation" => Some(LitAbility::PaymentDelegation),
            "lit-action-execution" => Some(LitAbility::LitActionExecution),
            "lit-resolved-auth-context" => Some(LitAbility::ResolvedAuthContext),
            _ => None,
        }
    }

    fn recap_namespace_and_ability(&self) -> (&'static str, &'static str) {
        match self {
            LitAbility::AccessControlConditionDecryption => ("Threshold", "Decryption"),
            LitAbility::AccessControlConditionSigning => ("Threshold", "Signing"),
            LitAbility::PKPSigning => ("Threshold", "Signing"),
            LitAbility::PaymentDelegation => ("Auth", "Auth"),
            LitAbility::LitActionExecution => ("Threshold", "Execution"),
            LitAbility::ResolvedAuthContext => ("Auth", "Auth"),
        }
    }

    pub fn resource_prefix(&self) -> &'static str {
        match self {
            LitAbility::AccessControlConditionDecryption
            | LitAbility::AccessControlConditionSigning => "lit-accesscontrolcondition",
            LitAbility::PKPSigning => "lit-pkp",
            LitAbility::PaymentDelegation => "lit-paymentdelegation",
            LitAbility::LitActionExecution => "lit-litaction",
            LitAbility::ResolvedAuthContext => "lit-resolvedauthcontext",
        }
    }

    pub fn resource_key(&self, resource_id: &str) -> String {
        format!("{}://{}", self.resource_prefix(), resource_id)
    }
}

/// Build a SIWE message (with a single recap URN) matching JS behavior.
pub fn create_siwe_message_with_resources(
    wallet_address: &str,
    session_public_key_hex: &str,
    auth_config: &AuthConfig,
    nonce: &str,
) -> Result<String, LitSdkError> {
    use chrono::{SecondsFormat, Utc};
    use siwe::{Message, TimeStamp};
    use siwe_recap::Capability;
    use std::collections::BTreeMap;

    let uri = format!("lit:session:{}", session_public_key_hex);

    let eth_addr: EthAddress = wallet_address
        .parse::<EthAddress>()
        .map_err(|e| LitSdkError::Config(format!("invalid wallet address: {e}")))?;

    let issued_at: TimeStamp = Utc::now()
        .to_rfc3339_opts(SecondsFormat::Millis, true)
        .parse::<TimeStamp>()
        .map_err(|e| LitSdkError::Config(format!("invalid issued_at timestamp: {e}")))?;

    let expiration_time: Option<TimeStamp> = Some(
        auth_config
            .expiration
            .parse::<TimeStamp>()
            .map_err(|e| LitSdkError::Config(format!("invalid expiration timestamp: {e}")))?,
    );

    let message = Message {
        domain: auth_config
            .domain
            .parse::<http::uri::Authority>()
            .map_err(|e| LitSdkError::Config(format!("invalid domain: {e}")))?,
        address: eth_addr.0,
        statement: Some(auth_config.statement.clone()),
        uri: uri
            .parse::<iri_string::types::UriString>()
            .map_err(|e| LitSdkError::Config(format!("invalid session uri: {e}")))?,
        version: siwe::Version::V1,
        chain_id: 1,
        nonce: nonce.to_string(),
        issued_at,
        expiration_time,
        not_before: None,
        request_id: None,
        resources: vec![],
    };

    if auth_config.resources.is_empty() {
        return Ok(message.to_string());
    }

    let mut cap = Capability::<serde_json::Value>::default();
    for req in &auth_config.resources {
        let (ns, ability) = req.ability.recap_namespace_and_ability();
        let resource_key = req.ability.resource_key(&req.resource_id);

        let nb_map: BTreeMap<String, serde_json::Value> = match &req.data {
            Some(val) => val
                .as_object()
                .map(|obj| obj.iter().map(|(k, v)| (k.clone(), v.clone())).collect())
                .unwrap_or_default(),
            None => BTreeMap::new(),
        };

        cap.with_action_convert(
            resource_key,
            format!("{}/{}", ns, ability),
            vec![nb_map],
        )
        .map_err(|e| {
            LitSdkError::Config(format!(
                "failed to add recap attenuation: {e}"
            ))
        })?;
    }

    let message = cap
        .build_message(message)
        .map_err(|e| LitSdkError::Config(e.to_string()))?;

    Ok(message.to_string())
}

pub fn validate_delegation_auth_sig(
    delegation_auth_sig: &AuthSig,
    session_public_key_hex: &str,
) -> Result<(), LitSdkError> {
    let expected_session_key_uri = if session_public_key_hex.starts_with("lit:session:") {
        session_public_key_hex.to_string()
    } else {
        format!("lit:session:{session_public_key_hex}")
    };

    let msg = siwe::Message::from_str(&delegation_auth_sig.signed_message)
        .map_err(|e| LitSdkError::Crypto(format!("invalid delegation SIWE message: {e}")))?;

    if let Some(exp) = msg.expiration_time {
        let exp_str = exp.to_string();
        let exp_dt = chrono::DateTime::parse_from_rfc3339(&exp_str)
            .map_err(|e| LitSdkError::Crypto(format!("invalid delegation expiration: {e}")))?;
        if exp_dt <= chrono::Utc::now() {
            return Err(LitSdkError::Crypto(format!(
                "delegation signature expired at {exp_str}"
            )));
        }
    }

    let uri = msg.uri.to_string();
    if uri != expected_session_key_uri {
        return Err(LitSdkError::Crypto(
            "session key URI in delegation signature does not match".into(),
        ));
    }

    Ok(())
}

fn base64url_decode_vec(input: &str) -> Result<Vec<u8>, LitSdkError> {
    use base64ct::{Base64Url, Base64UrlUnpadded, Encoding};

    Base64UrlUnpadded::decode_vec(input)
        .or_else(|_| Base64Url::decode_vec(input))
        .map_err(|e| LitSdkError::Crypto(format!("invalid base64url payload: {e}")))
}

fn resource_ability_requests_from_recap_urn(
    urn: &str,
) -> Result<Vec<ResourceAbilityRequest>, LitSdkError> {
    let encoded = urn
        .strip_prefix("urn:recap:")
        .ok_or_else(|| LitSdkError::Crypto("invalid recap URN".into()))?;

    let decoded = base64url_decode_vec(encoded)?;
    let payload: serde_json::Value = serde_json::from_slice(&decoded)
        .map_err(|e| LitSdkError::Crypto(format!("invalid recap JSON: {e}")))?;

    let att = payload
        .get("att")
        .and_then(|v| v.as_object())
        .ok_or_else(|| LitSdkError::Crypto("invalid recap attenuation payload".into()))?;

    let mut out = Vec::new();

    for (resource_key, ability_map) in att {
        let Some(ability_map) = ability_map.as_object() else {
            continue;
        };

        let (resource_prefix, resource_id) = resource_key
            .split_once("://")
            .unwrap_or((resource_key.as_str(), "*"));

        for (ability_key, restrictions) in ability_map {
            let (namespace, recap_ability) = ability_key
                .split_once('/')
                .unwrap_or((ability_key.as_str(), ""));

            let ability = match (resource_prefix, namespace, recap_ability) {
                ("lit-pkp", "Threshold", "Signing") => LitAbility::PKPSigning,
                ("lit-accesscontrolcondition", "Threshold", "Signing") => {
                    LitAbility::AccessControlConditionSigning
                }
                ("lit-accesscontrolcondition", "Threshold", "Decryption") => {
                    LitAbility::AccessControlConditionDecryption
                }
                ("lit-litaction", "Threshold", "Execution") => LitAbility::LitActionExecution,
                ("lit-paymentdelegation", "Auth", "Auth") => LitAbility::PaymentDelegation,
                ("lit-resolvedauthcontext", "Auth", "Auth") => LitAbility::ResolvedAuthContext,
                _ => continue,
            };

            let mut data = None;
            if let Some(arr) = restrictions.as_array() {
                if let Some(obj) = arr.iter().find(|v| v.is_object()) {
                    if obj.as_object().map(|o| !o.is_empty()).unwrap_or(false) {
                        data = Some(obj.clone());
                    }
                }
            }

            out.push(ResourceAbilityRequest {
                ability,
                resource_id: resource_id.to_string(),
                data,
            });
        }
    }

    Ok(out)
}

pub fn auth_config_from_delegation_auth_sig(
    delegation_auth_sig: &AuthSig,
) -> Result<AuthConfig, LitSdkError> {
    let msg = siwe::Message::from_str(&delegation_auth_sig.signed_message)
        .map_err(|e| LitSdkError::Crypto(format!("invalid SIWE message: {e}")))?;

    let expiration = msg
        .expiration_time
        .map(|t| t.to_string())
        .unwrap_or_else(|| (chrono::Utc::now() + chrono::Duration::hours(24)).to_rfc3339());

    let mut resources: Vec<ResourceAbilityRequest> = Vec::new();
    for uri in &msg.resources {
        let s = uri.to_string();
        if !s.starts_with("urn:recap:") {
            continue;
        }
        if let Ok(mut decoded) = resource_ability_requests_from_recap_urn(&s) {
            resources.append(&mut decoded);
        }
    }

    if resources.is_empty() {
        resources.push(ResourceAbilityRequest {
            ability: LitAbility::PKPSigning,
            resource_id: "*".into(),
            data: None,
        });
    }

    Ok(AuthConfig {
        capability_auth_sigs: vec![],
        expiration,
        statement: msg.statement.unwrap_or_default(),
        domain: msg.domain.to_string(),
        resources,
    })
}

pub fn pkp_eth_address_from_pubkey(pkp_public_key_hex: &str) -> Result<String, LitSdkError> {
    let pkp_hex = pkp_public_key_hex.trim_start_matches("0x");
    let pkp_bytes = hex::decode(pkp_hex)
        .map_err(|e| LitSdkError::Config(format!("invalid pkp public key hex: {e}")))?;
    if pkp_bytes.len() < 2 {
        return Err(LitSdkError::Config("pkp public key too short".into()));
    }
    let hash = keccak256(&pkp_bytes[1..]);
    let addr = EthAddress::from_slice(&hash[12..]);
    Ok(to_checksum(&addr, None))
}

/// Sign a SIWE message with an EOA private key (EIP-191 personal_sign).
pub async fn sign_siwe_with_eoa(
    private_key_hex: &str,
    siwe_message: &str,
) -> Result<AuthSig, LitSdkError> {
    let wallet: LocalWallet = private_key_hex
        .parse::<LocalWallet>()
        .map_err(|e| LitSdkError::Config(format!("invalid private key: {e}")))?;
    let address = ethers::utils::to_checksum(&wallet.address(), None);

    let sig = wallet
        .sign_message(siwe_message)
        .await
        .map_err(|e| LitSdkError::Crypto(e.to_string()))?;

    Ok(AuthSig {
        sig: sig.to_string(),
        derived_via: "web3.eth.personal.sign".into(),
        signed_message: siwe_message.into(),
        address,
        algo: None,
    })
}

#[derive(Debug, Clone)]
pub struct AuthContext {
    pub session_key_pair: SessionKeyPair,
    pub auth_config: AuthConfig,
    pub delegation_auth_sig: AuthSig,
}
