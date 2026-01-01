use crate::auth::{pkp_eth_address_from_pubkey, AuthContext};
use crate::client::LitClient;
use crate::error::LitSdkError;
use async_trait::async_trait;
use ethers::signers::{to_eip155_v, Signer};
use ethers::types::{
    transaction::{eip2718::TypedTransaction, eip712::Eip712},
    Address, Signature, U256,
};
use ethers::utils::hash_message;
use std::fmt;
use tokio::time::{sleep, Duration};

#[derive(Clone)]
pub struct PkpSigner {
    client: LitClient,
    pkp_public_key: String,
    address: Address,
    auth_context: AuthContext,
    chain_id: u64,
    user_max_price_wei: Option<U256>,
}

impl PkpSigner {
    pub fn new(
        client: LitClient,
        pkp_public_key: impl Into<String>,
        auth_context: AuthContext,
        chain_id: u64,
    ) -> Result<Self, LitSdkError> {
        let pkp_public_key = pkp_public_key.into();
        let checksum_address = pkp_eth_address_from_pubkey(&pkp_public_key)?;
        let address: Address = checksum_address
            .parse()
            .map_err(|e| LitSdkError::Config(format!("invalid PKP eth address: {e}")))?;

        Ok(Self {
            client,
            pkp_public_key,
            address,
            auth_context,
            chain_id,
            user_max_price_wei: None,
        })
    }

    pub fn with_user_max_price_wei(mut self, user_max_price_wei: U256) -> Self {
        self.user_max_price_wei = Some(user_max_price_wei);
        self
    }

    async fn sign_digest(&self, digest: [u8; 32]) -> Result<(U256, U256, u8), LitSdkError> {
        let mut last_err: Option<LitSdkError> = None;
        let mut res: Option<serde_json::Value> = None;
        for attempt in 0..3 {
            match self
                .client
                .pkp_sign_ethereum_with_options(
                    &self.pkp_public_key,
                    &digest,
                    &self.auth_context,
                    self.user_max_price_wei,
                    true,
                )
                .await
            {
                Ok(v) => {
                    res = Some(v);
                    break;
                }
                Err(err) => {
                    let msg = err.to_string();
                    let retryable = msg.contains("Rate Limit Exceeded")
                        || msg.contains("Pubkey share not found")
                        || msg.contains("unable to get signature share");
                    if retryable && attempt < 2 {
                        last_err = Some(err);
                        sleep(Duration::from_secs(10 * (attempt as u64 + 1))).await;
                        continue;
                    }
                    return Err(err);
                }
            }
        }
        let res = res.ok_or_else(|| {
            last_err.unwrap_or_else(|| LitSdkError::Network("pkpSign failed after retries".into()))
        })?;

        let sig_str = res
            .get("signature")
            .and_then(|v| v.as_str())
            .ok_or_else(|| LitSdkError::Crypto("pkpSign response missing signature field".into()))?;

        let sig_str = sig_str.replace('"', "");
        let sig_hex = sig_str.trim_start_matches("0x");
        let sig = hex::decode(sig_hex).map_err(|e| LitSdkError::Crypto(e.to_string()))?;

        if sig.len() != 64 {
            return Err(LitSdkError::Crypto(format!(
                "expected 64-byte signature, got {} bytes",
                sig.len()
            )));
        }

        let r = U256::from_big_endian(&sig[..32]);
        let s = U256::from_big_endian(&sig[32..]);

        let mut recid = res
            .get("recovery_id")
            .or_else(|| res.get("recoveryId"))
            .and_then(|v| v.as_u64())
            .map(|v| v as u8);

        if recid.is_none() {
            for candidate in [0u8, 1u8] {
                let sig = Signature {
                    r,
                    s,
                    v: 27u64 + candidate as u64,
                };
                if sig.recover(digest).ok() == Some(self.address) {
                    recid = Some(candidate);
                    break;
                }
            }
        }

        let recid = recid.ok_or_else(|| {
            LitSdkError::Crypto("failed to recover a valid recovery id".into())
        })?;

        Ok((r, s, recid))
    }
}

impl fmt::Debug for PkpSigner {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("PkpSigner")
            .field("pkp_public_key", &self.pkp_public_key)
            .field("address", &self.address)
            .field("chain_id", &self.chain_id)
            .finish()
    }
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
impl Signer for PkpSigner {
    type Error = LitSdkError;

    async fn sign_message<S: Send + Sync + AsRef<[u8]>>(
        &self,
        message: S,
    ) -> Result<Signature, Self::Error> {
        let digest = hash_message(message.as_ref()).0;
        let (r, s, recid) = self.sign_digest(digest).await?;
        Ok(Signature {
            r,
            s,
            v: 27u64 + recid as u64,
        })
    }

    async fn sign_transaction(&self, tx: &TypedTransaction) -> Result<Signature, Self::Error> {
        let digest = tx.sighash().0;
        let chain_id = tx
            .chain_id()
            .map(|id| id.as_u64())
            .unwrap_or(self.chain_id);
        let (r, s, recid) = self.sign_digest(digest).await?;

        Ok(Signature {
            r,
            s,
            v: to_eip155_v(recid, chain_id),
        })
    }

    async fn sign_typed_data<T: Eip712 + Send + Sync>(
        &self,
        payload: &T,
    ) -> Result<Signature, Self::Error> {
        let digest = payload
            .encode_eip712()
            .map_err(|e| LitSdkError::Crypto(format!("failed to encode EIP-712 typed data: {e}")))?;
        let (r, s, recid) = self.sign_digest(digest).await?;
        Ok(Signature {
            r,
            s,
            v: 27u64 + recid as u64,
        })
    }

    fn address(&self) -> Address {
        self.address
    }

    fn chain_id(&self) -> u64 {
        self.chain_id
    }

    fn with_chain_id<T: Into<u64>>(mut self, chain_id: T) -> Self {
        self.chain_id = chain_id.into();
        self
    }
}
