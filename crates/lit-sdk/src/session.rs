use crate::auth::{AuthConfig, AuthSig, SessionKeyPair, LitAbility};
use crate::error::LitSdkError;
use ed25519_dalek::{SigningKey, Signer};
use ethers::types::U256;
use serde_json::json;
use std::collections::HashMap;
use chrono::Timelike;

/// Issue session signatures per node URL.
pub fn issue_session_sigs(
    session_key_pair: &SessionKeyPair,
    auth_config: &AuthConfig,
    delegation_auth_sig: &AuthSig,
    node_urls: &[String],
) -> Result<HashMap<String, AuthSig>, LitSdkError> {
    issue_session_sigs_with_max_price(
        session_key_pair,
        auth_config,
        delegation_auth_sig,
        node_urls,
        None,
    )
}

/// Issue session signatures per node URL with an optional maxPrice (wei) override.
///
/// When max_price_per_node_wei is None, defaults to unlimited (u128::MAX) to mirror JS behavior
/// for unpriced flows. For priced flows (payments/sponsorship), pass a per-node wei cap that
/// keeps total max spend within the sponsor/user budget.
pub fn issue_session_sigs_with_max_price(
    session_key_pair: &SessionKeyPair,
    auth_config: &AuthConfig,
    delegation_auth_sig: &AuthSig,
    node_urls: &[String],
    max_price_per_node_wei: Option<U256>,
) -> Result<HashMap<String, AuthSig>, LitSdkError> {
    let mut capabilities = auth_config.capability_auth_sigs.clone();
    capabilities.push(delegation_auth_sig.clone());

    // JS uses `new Date().toISOString()` for issuedAt (millis precision, Z suffix).
    let now = chrono::Utc::now();
    let issued_at = now
        .with_nanosecond((now.nanosecond() / 1_000_000) * 1_000_000)
        .expect("valid nanosecond")
        .format("%Y-%m-%dT%H:%M:%S%.3fZ")
        .to_string();

    let template = json!({
        "sessionKey": session_key_pair.public_key,
        "resourceAbilityRequests": auth_config.resources.iter().filter(|r| r.ability != LitAbility::ResolvedAuthContext).map(|r| {
            json!({
                "resource": {
                    "resourcePrefix": r.ability.resource_prefix(),
                    "resource": r.resource_id,
                },
                "ability": r.ability.as_str(),
                "data": r.data.clone().unwrap_or_else(|| json!({})),
            })
        }).collect::<Vec<_>>(),
        "capabilities": capabilities,
        "issuedAt": issued_at,
        "expiration": auth_config.expiration,
    });

    let secret_bytes =
        hex::decode(session_key_pair.secret_key.trim_start_matches("0x"))
            .map_err(|e| LitSdkError::Crypto(e.to_string()))?;
    let signing_key =
        SigningKey::from_bytes(&secret_bytes.try_into().map_err(|_| {
            LitSdkError::Crypto("invalid session secret key length".into())
        })?);

    let mut out = HashMap::new();
    // By default, mirror JS unlimited maxPrice (Unsigned 128 max) if pricing is not provided.
    let max_price_hex = if let Some(p) = max_price_per_node_wei {
        format!("0x{:x}", p)
    } else {
        format!("0x{:x}", u128::MAX)
    };

    for url in node_urls {
        let mut to_sign = template.clone();
        if let Some(obj) = to_sign.as_object_mut() {
            obj.insert("nodeAddress".into(), json!(url));
            obj.insert("maxPrice".into(), json!(max_price_hex.clone()));
        }
        let signed_message = serde_json::to_string(&to_sign)
            .map_err(|e| LitSdkError::Crypto(e.to_string()))?;
        let sig = signing_key.sign(signed_message.as_bytes());

        out.insert(
            url.clone(),
            AuthSig {
                sig: hex::encode(sig.to_bytes()),
                derived_via: "litSessionSignViaNacl".into(),
                signed_message,
                address: session_key_pair.public_key.clone(),
                algo: Some("ed25519".into()),
            },
        );
    }

    Ok(out)
}
