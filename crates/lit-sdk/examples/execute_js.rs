use ethers::signers::{LocalWallet, Signer};
use ethers::utils::to_checksum;
use lit_sdk::{
    create_lit_client, create_siwe_message_with_resources, generate_session_key_pair, naga_dev,
    naga_local, naga_mainnet, naga_proto, naga_staging, naga_test, sign_siwe_with_eoa, AuthConfig,
    AuthContext, LitAbility, NetworkConfig, ResourceAbilityRequest,
};
use std::env;

fn config_for(network: &str) -> Result<NetworkConfig, Box<dyn std::error::Error>> {
    Ok(match network {
        "naga-dev" => naga_dev(),
        "naga-test" => naga_test(),
        "naga-staging" => naga_staging(),
        "naga-proto" => naga_proto(),
        "naga" => naga_mainnet(),
        "naga-local" => naga_local(),
        _ => return Err(format!("unsupported NETWORK_NAME: {network}").into()),
    })
}

fn normalize_0x_hex(s: String) -> String {
    if s.starts_with("0x") {
        s
    } else {
        format!("0x{s}")
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let _ = dotenvy::dotenv();

    let network = env::var("NETWORK_NAME").unwrap_or_else(|_| "naga-dev".to_string());
    let rpc_url = env::var("LIT_RPC_URL")
        .or_else(|_| env::var("LIT_TXSENDER_RPC_URL"))
        .or_else(|_| env::var("LIT_YELLOWSTONE_PRIVATE_RPC_URL"))
        .or_else(|_| env::var("LOCAL_RPC_URL"))?;

    let eoa_private_key = env::var("LIT_EOA_PRIVATE_KEY")
        .or_else(|_| env::var("LIVE_MASTER_ACCOUNT"))
        .or_else(|_| env::var("LOCAL_MASTER_ACCOUNT"))?;
    let eoa_private_key = normalize_0x_hex(eoa_private_key);

    let config = config_for(&network)?.with_rpc_url(rpc_url);
    let client = create_lit_client(config).await?;

    let session_key_pair = generate_session_key_pair();
    let auth_config = AuthConfig {
        capability_auth_sigs: vec![],
        expiration: (chrono::Utc::now() + chrono::Duration::minutes(30)).to_rfc3339(),
        statement: "Lit Protocol Rust SDK - executeJs example".into(),
        domain: "localhost".into(),
        resources: vec![ResourceAbilityRequest {
            ability: LitAbility::LitActionExecution,
            resource_id: "*".into(),
            data: None,
        }],
    };

    let wallet: LocalWallet = eoa_private_key.parse()?;
    let wallet_address = to_checksum(&wallet.address(), None);

    let nonce = client
        .handshake_result()
        .core_node_config
        .latest_blockhash
        .clone();
    let siwe_message = create_siwe_message_with_resources(
        &wallet_address,
        &session_key_pair.public_key,
        &auth_config,
        &nonce,
    )?;
    let auth_sig = sign_siwe_with_eoa(&eoa_private_key, &siwe_message).await?;

    let auth_context = AuthContext {
        session_key_pair,
        auth_config,
        delegation_auth_sig: auth_sig,
    };

    let code = r#"
(async () => {
  const { name } = jsParams;
  Lit.Actions.setResponse({ response: `hello ${name}` });
})();
"#;

    let res = client
        .execute_js(
            Some(code.to_string()),
            None,
            Some(serde_json::json!({ "name": "lit" })),
            &auth_context,
        )
        .await?;

    println!("response: {}", serde_json::to_string_pretty(&res.response)?);
    println!("signatures: {}", serde_json::to_string_pretty(&res.signatures)?);
    println!("logs:\n{}", res.logs);
    Ok(())
}
