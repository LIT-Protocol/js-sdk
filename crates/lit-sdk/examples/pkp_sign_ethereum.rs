use lit_sdk::{
    create_eth_wallet_auth_data, create_lit_client, naga_dev, naga_local, naga_mainnet, naga_proto,
    naga_staging, naga_test, AuthConfig, LitAbility, NetworkConfig, ResourceAbilityRequest,
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

    let pkp_public_key = env::var("LIT_PKP_PUBLIC_KEY").or_else(|_| env::var("PKP_PUBLIC_KEY"))?;

    let config = config_for(&network)?.with_rpc_url(rpc_url);
    let client = create_lit_client(config).await?;

    let nonce = client
        .handshake_result()
        .core_node_config
        .latest_blockhash
        .clone();
    let auth_data = create_eth_wallet_auth_data(&eoa_private_key, &nonce).await?;

    let auth_config = AuthConfig {
        capability_auth_sigs: vec![],
        expiration: (chrono::Utc::now() + chrono::Duration::minutes(30)).to_rfc3339(),
        statement: "Lit Protocol Rust SDK - PKP signing example".into(),
        domain: "localhost".into(),
        resources: vec![ResourceAbilityRequest {
            ability: LitAbility::PKPSigning,
            resource_id: "*".into(),
            data: None,
        }],
    };

    let auth_context = client
        .create_pkp_auth_context(&pkp_public_key, auth_data, auth_config, None, None, None)
        .await?;

    let signature = client
        .pkp_sign_ethereum(&pkp_public_key, b"Hello from Rust!", &auth_context, None)
        .await?;

    println!("{}", serde_json::to_string_pretty(&signature)?);
    Ok(())
}

