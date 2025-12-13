use lit_sdk::{create_lit_client, naga_dev, EncryptParams};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Provide current bootstrap URLs for the target network.
    // You can obtain these from the JS SDK connection info or your own network context.
    let config = naga_dev().with_bootstrap_urls([
        "https://<bootstrap-node-1>:7470",
        "https://<bootstrap-node-2>:7470",
        "https://<bootstrap-node-3>:7470",
    ]);

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

