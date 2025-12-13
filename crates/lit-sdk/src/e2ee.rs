use crate::error::LitSdkError;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha512};
use sodalite::{box_, box_keypair_seed, box_open};
use chrono::Timelike;

fn always_32_bytes(bytes: Vec<u8>) -> [u8; 32] {
    let mut out = [0u8; 32];
    if bytes.len() >= 32 {
        out.copy_from_slice(&bytes[..32]);
    } else {
        out[32 - bytes.len()..].copy_from_slice(&bytes);
    }
    out
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedVersion1Payload {
    pub verification_key: String,
    pub random: String,
    pub created_at: String,
    pub ciphertext_and_tag: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedPayload {
    pub version: String,
    pub payload: EncryptedVersion1Payload,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenericEncryptedPayload {
    pub success: bool,
    #[serde(default)]
    pub values: Vec<EncryptedPayload>,
    #[serde(default)]
    pub error: Option<serde_json::Value>,
}

pub fn wallet_encrypt(
    my_secret_key: &[u8; 32],
    their_public_key_bytes: &[u8],
    message: &[u8],
) -> Result<EncryptedPayload, LitSdkError> {
    let their_pk = always_32_bytes(their_public_key_bytes.to_vec());

    let mut random = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut random);

    let created_at = chrono::Utc::now();
    // JS uses `new Date().toISOString()` which is millisecond precision and ends with `Z`.
    let created_at_ms = created_at
        .with_nanosecond((created_at.nanosecond() / 1_000_000) * 1_000_000)
        .expect("valid nanosecond");
    let created_at_seconds = created_at_ms.timestamp() as u64;
    let timestamp = created_at_seconds.to_be_bytes();
    let created_at_iso = created_at_ms
        .format("%Y-%m-%dT%H:%M:%S%.3fZ")
        .to_string();

    let mut my_pk = [0u8; 32];
    let mut my_sk = *my_secret_key;
    box_keypair_seed(&mut my_pk, &mut my_sk, my_secret_key);

    let mut aad = Vec::with_capacity(89);
    aad.push(0x01);
    aad.extend_from_slice(&random);
    aad.extend_from_slice(&timestamp);
    aad.extend_from_slice(&their_pk);
    aad.extend_from_slice(&my_pk);

    let mut hasher = Sha512::new();
    hasher.update(&aad);
    let aad_hash = hasher.finalize();
    let mut nonce = [0u8; 24];
    nonce.copy_from_slice(&aad_hash[..24]);

    // sodalite requires 32 leading zeros on plaintext
    let mut m = vec![0u8; 32 + message.len()];
    m[32..].copy_from_slice(message);
    let mut c = vec![0u8; m.len()];

    box_(&mut c, &m, &nonce, &their_pk, &my_sk)
        .map_err(|_| LitSdkError::Crypto("E2EE encryption failed".into()))?;

    Ok(EncryptedPayload {
        version: "1".into(),
        payload: EncryptedVersion1Payload {
            verification_key: hex::encode(my_pk),
            random: hex::encode(random),
            created_at: created_at_iso,
            ciphertext_and_tag: hex::encode(c),
        },
    })
}

pub fn wallet_decrypt(
    my_secret_key: &[u8; 32],
    data: &EncryptedPayload,
) -> Result<Vec<u8>, LitSdkError> {
    if data.version != "1" {
        return Err(LitSdkError::Crypto("unsupported encrypted payload version".into()));
    }

    let created_at =
        chrono::DateTime::parse_from_rfc3339(&data.payload.created_at)
            .map_err(|e| LitSdkError::Crypto(e.to_string()))?;
    let created_at_seconds = created_at.timestamp() as u64;
    let timestamp = created_at_seconds.to_be_bytes();

    let mut my_pk = [0u8; 32];
    let mut my_sk = *my_secret_key;
    box_keypair_seed(&mut my_pk, &mut my_sk, my_secret_key);

    let their_pk_bytes =
        hex::decode(data.payload.verification_key.trim_start_matches("0x"))
            .map_err(|e| LitSdkError::Crypto(e.to_string()))?;
    let their_pk = always_32_bytes(their_pk_bytes);

    let random_bytes =
        hex::decode(data.payload.random.trim_start_matches("0x"))
            .map_err(|e| LitSdkError::Crypto(e.to_string()))?;
    if random_bytes.len() != 16 {
        return Err(LitSdkError::Crypto("invalid random length".into()));
    }

    let mut aad = Vec::with_capacity(89);
    aad.push(0x01);
    aad.extend_from_slice(&random_bytes);
    aad.extend_from_slice(&timestamp);
    // swap perspective (receiver/sender) to match encrypting party
    aad.extend_from_slice(&my_pk);
    aad.extend_from_slice(&their_pk);

    let mut hasher = Sha512::new();
    hasher.update(&aad);
    let aad_hash = hasher.finalize();
    let mut nonce = [0u8; 24];
    nonce.copy_from_slice(&aad_hash[..24]);

    let c =
        hex::decode(data.payload.ciphertext_and_tag.trim_start_matches("0x"))
            .map_err(|e| LitSdkError::Crypto(e.to_string()))?;

    let mut m = vec![0u8; c.len()];
    box_open(&mut m, &c, &nonce, &their_pk, &my_sk)
        .map_err(|_| LitSdkError::Crypto("E2EE decryption failed".into()))?;

    if m.len() < 32 {
        return Err(LitSdkError::Crypto("decrypted payload too short".into()));
    }

    Ok(m[32..].to_vec())
}
