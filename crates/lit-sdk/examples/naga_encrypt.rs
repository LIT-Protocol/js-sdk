use lit_sdk::{create_lit_client, naga_dev, EncryptParams};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let _ = dotenvy::dotenv();

    // Provide an RPC URL so the client can auto-discover bootstrap URLs from the staking contract.
    // (You can still override `bootstrap_urls` explicitly if you want.)
    let rpc_url = std::env::var("LIT_RPC_URL")
        .or_else(|_| std::env::var("LIT_TXSENDER_RPC_URL"))
        .or_else(|_| std::env::var("LIT_YELLOWSTONE_PRIVATE_RPC_URL"))
        .or_else(|_| std::env::var("LOCAL_RPC_URL"))?;
    let config = naga_dev().with_rpc_url(rpc_url);

    let client = create_lit_client(config).await?;

    // Unified access control conditions (EVM example).
    let unified_accs = serde_json::json!([
        {
            "conditionType": "evmBasic",
            "contractAddress": "",
            "standardContractType": "",
            "chain": "ethereum",
            "method": "eth_getBalance",
            "parameters": [":userAddress", "latest"],
            "returnValueTest": {
                "comparator": ">=",
                "value": "1000000000000000000"
            }
        }
    ]);

    let encrypted = client
        .encrypt(EncryptParams {
            data_to_encrypt: b"hello lit".to_vec(),
            unified_access_control_conditions: Some(unified_accs),
            hashed_access_control_conditions_hex: None,
            metadata: None,
        })
        .await?;

    println!("ciphertext (base64): {}", encrypted.ciphertext_base64);
    println!("data hash (hex): {}", encrypted.data_to_encrypt_hash_hex);
    Ok(())
}
