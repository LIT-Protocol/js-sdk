use crate::error::LitSdkError;
use crate::network::NetworkConfig;
use ethers::contract::abigen;
use ethers::prelude::*;
use ethers::providers::{Http, Provider};
use ethers::types::{Address, Bytes, I256, U256};
use ethers::utils::{keccak256, to_checksum};
use std::sync::Arc;
use tokio::time::{sleep, Duration};

abigen!(
    LedgerContract,
    r#"[{
        "inputs":[],
        "name":"deposit",
        "outputs":[],
        "stateMutability":"payable",
        "type":"function"
    },{
        "inputs":[{"internalType":"address","name":"user","type":"address"}],
        "name":"depositForUser",
        "outputs":[],
        "stateMutability":"payable",
        "type":"function"
    },{
        "inputs":[{"internalType":"int256","name":"amount","type":"int256"}],
        "name":"requestWithdraw",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[{"internalType":"int256","name":"amount","type":"int256"}],
        "name":"withdraw",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[{"internalType":"address","name":"user","type":"address"}],
        "name":"balance",
        "outputs":[{"internalType":"int256","name":"","type":"int256"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[{"internalType":"address","name":"user","type":"address"}],
        "name":"stableBalance",
        "outputs":[{"internalType":"int256","name":"","type":"int256"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[{"internalType":"address","name":"user","type":"address"}],
        "name":"latestWithdrawRequest",
        "outputs":[{"components":[
            {"internalType":"uint256","name":"timestamp","type":"uint256"},
            {"internalType":"uint256","name":"amount","type":"uint256"}
        ],"internalType":"struct LibLedgerStorage.WithdrawRequest","name":"","type":"tuple"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[],
        "name":"userWithdrawDelay",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    }]"#,
);

abigen!(
    PaymentDelegationContract,
    r#"[{
        "inputs":[{"internalType":"address","name":"user","type":"address"}],
        "name":"delegatePayments",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[{"internalType":"address[]","name":"users","type":"address[]"}],
        "name":"delegatePaymentsBatch",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[{"components":[
            {"internalType":"uint128","name":"totalMaxPrice","type":"uint128"},
            {"internalType":"uint256","name":"requestsPerPeriod","type":"uint256"},
            {"internalType":"uint256","name":"periodSeconds","type":"uint256"}
        ],"internalType":"struct LibPaymentDelegationStorage.Restriction","name":"r","type":"tuple"}],
        "name":"setRestriction",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[{"internalType":"address","name":"payer","type":"address"}],
        "name":"getRestriction",
        "outputs":[{"components":[
            {"internalType":"uint128","name":"totalMaxPrice","type":"uint128"},
            {"internalType":"uint256","name":"requestsPerPeriod","type":"uint256"},
            {"internalType":"uint256","name":"periodSeconds","type":"uint256"}
        ],"internalType":"struct LibPaymentDelegationStorage.Restriction","name":"","type":"tuple"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[{"internalType":"address","name":"user","type":"address"}],
        "name":"getPayers",
        "outputs":[{"internalType":"address[]","name":"","type":"address[]"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[{"internalType":"address","name":"payer","type":"address"}],
        "name":"getUsers",
        "outputs":[{"internalType":"address[]","name":"","type":"address[]"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[{"internalType":"address[]","name":"users","type":"address[]"}],
        "name":"getPayersAndRestrictions",
        "outputs":[
            {"internalType":"address[][]","name":"","type":"address[][]"},
            {"components":[
                {"internalType":"uint128","name":"totalMaxPrice","type":"uint128"},
                {"internalType":"uint256","name":"requestsPerPeriod","type":"uint256"},
                {"internalType":"uint256","name":"periodSeconds","type":"uint256"}
            ],"internalType":"struct LibPaymentDelegationStorage.Restriction[][]","name":"","type":"tuple[][]"}
        ],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[{"internalType":"address","name":"user","type":"address"}],
        "name":"undelegatePayments",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[{"internalType":"address[]","name":"users","type":"address[]"}],
        "name":"undelegatePaymentsBatch",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    }]"#,
);

abigen!(
    PkpNftEnumerableContract,
    r#"[{
        "inputs":[
            {"internalType":"address","name":"owner","type":"address"},
            {"internalType":"uint256","name":"index","type":"uint256"}
        ],
        "name":"tokenOfOwnerByIndex",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    }]"#,
);

abigen!(
    PkpNftMintContract,
    r#"[{
        "inputs":[],
        "name":"mintCost",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[
            {"internalType":"uint256","name":"keyType","type":"uint256"},
            {"internalType":"string","name":"keySetId","type":"string"}
        ],
        "name":"mintNext",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"payable",
        "type":"function"
    }]"#,
);

abigen!(
    PkpHelperContract,
    r#"[{
        "inputs":[
            {"internalType":"uint256","name":"keyType","type":"uint256"},
            {"internalType":"string","name":"keySetId","type":"string"},
            {"internalType":"uint256[]","name":"permittedAuthMethodTypes","type":"uint256[]"},
            {"internalType":"bytes[]","name":"permittedAuthMethodIds","type":"bytes[]"},
            {"internalType":"bytes[]","name":"permittedAuthMethodPubkeys","type":"bytes[]"},
            {"internalType":"uint256[][]","name":"permittedAuthMethodScopes","type":"uint256[][]"},
            {"internalType":"bool","name":"addPkpEthAddressAsPermittedAddress","type":"bool"},
            {"internalType":"bool","name":"sendPkpToItself","type":"bool"}
        ],
        "name":"mintNextAndAddAuthMethods",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"payable",
        "type":"function"
    }]"#,
);

abigen!(
    PubkeyRouterContract,
    r#"[{
        "inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],
        "name":"getPubkey",
        "outputs":[{"internalType":"bytes","name":"","type":"bytes"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[
            {"internalType":"address","name":"stakingContract","type":"address"},
            {"internalType":"string","name":"keySetId","type":"string"},
            {"internalType":"bytes32","name":"derivedKeyId","type":"bytes32"}
        ],
        "name":"getDerivedPubkey",
        "outputs":[{"internalType":"bytes","name":"","type":"bytes"}],
        "stateMutability":"view",
        "type":"function"
    }]"#,
);

abigen!(
    PkpPermissionsContract,
    r#"[{
        "inputs":[
            {"internalType":"uint256","name":"tokenId","type":"uint256"},
            {"components":[
                {"internalType":"uint256","name":"authMethodType","type":"uint256"},
                {"internalType":"bytes","name":"id","type":"bytes"},
                {"internalType":"bytes","name":"userPubkey","type":"bytes"}
            ],"internalType":"struct LibPKPPermissionsStorage.AuthMethod","name":"authMethod","type":"tuple"},
            {"internalType":"uint256[]","name":"scopes","type":"uint256[]"}
        ],
        "name":"addPermittedAuthMethod",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[
            {"internalType":"uint256","name":"tokenId","type":"uint256"},
            {"internalType":"uint256","name":"authMethodType","type":"uint256"},
            {"internalType":"bytes","name":"id","type":"bytes"},
            {"internalType":"uint256","name":"scopeId","type":"uint256"}
        ],
        "name":"removePermittedAuthMethodScope",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[
            {"internalType":"uint256","name":"tokenId","type":"uint256"},
            {"internalType":"uint256","name":"authMethodType","type":"uint256"},
            {"internalType":"bytes","name":"id","type":"bytes"}
        ],
        "name":"removePermittedAuthMethod",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },{
        "inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],
        "name":"getPermittedActions",
        "outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],
        "name":"getPermittedAddresses",
        "outputs":[{"internalType":"address[]","name":"","type":"address[]"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[
            {"internalType":"uint256","name":"tokenId","type":"uint256"},
            {"internalType":"uint256","name":"authMethodType","type":"uint256"},
            {"internalType":"bytes","name":"id","type":"bytes"},
            {"internalType":"uint256","name":"maxScopeId","type":"uint256"}
        ],
        "name":"getPermittedAuthMethodScopes",
        "outputs":[{"internalType":"bool[]","name":"","type":"bool[]"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],
        "name":"getPermittedAuthMethods",
        "outputs":[{"components":[
            {"internalType":"uint256","name":"authMethodType","type":"uint256"},
            {"internalType":"bytes","name":"id","type":"bytes"},
            {"internalType":"bytes","name":"userPubkey","type":"bytes"}
        ],"internalType":"struct LibPKPPermissionsStorage.AuthMethod[]","name":"","type":"tuple[]"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[
            {"internalType":"uint256","name":"authMethodType","type":"uint256"},
            {"internalType":"bytes","name":"id","type":"bytes"}
        ],
        "name":"getTokenIdsForAuthMethod",
        "outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[
            {"internalType":"uint256","name":"tokenId","type":"uint256"},
            {"internalType":"bytes","name":"ipfsCID","type":"bytes"}
        ],
        "name":"isPermittedAction",
        "outputs":[{"internalType":"bool","name":"","type":"bool"}],
        "stateMutability":"view",
        "type":"function"
    },{
        "inputs":[
            {"internalType":"uint256","name":"tokenId","type":"uint256"},
            {"internalType":"address","name":"user","type":"address"}
        ],
        "name":"isPermittedAddress",
        "outputs":[{"internalType":"bool","name":"","type":"bool"}],
        "stateMutability":"view",
        "type":"function"
    }]"#,
);

pub fn ledger_address_for(network: &str) -> Option<Address> {
    match network {
        "naga-dev" => Some("0x81061b50a66EBB3E7F9CEbeF2b1C1A961aE858F4".parse().ok()?),
        "naga-test" => Some("0xbA0aEB6Bbf58F1B74E896416A20DB5be51C991f2".parse().ok()?),
        "naga-staging" => Some("0x23Be686cAFCe69C5Fb075E2be7a4505598E338E8".parse().ok()?),
        "naga-proto" => Some("0x25be72246358491Ac7a1eF138C39Ff3b240E50b5".parse().ok()?),
        "naga" => Some("0x9BD023448d2D3b2D73fe61E4d7859007F6dA372c".parse().ok()?),
        _ => None,
    }
}

pub fn payment_delegation_address_for(network: &str) -> Option<Address> {
    match network {
        "naga-dev" => Some("0x2F202f846CBB27Aa5EbE6b9cfad50D65c49c01FF".parse().ok()?),
        "naga-test" => Some("0xd1E59c174BcF85012c54086AB600Dd0aB032e88B".parse().ok()?),
        "naga-staging" => Some("0x13fC0864A37B38D3C2A7d5E9C08D5124B9Cec4bF".parse().ok()?),
        "naga-proto" => Some("0x5033b79388EBBAf466B4CF82c0b72Abd9bB940d6".parse().ok()?),
        "naga" => Some("0x5EF658cB6ab3C3BfB75C8293B9a6C8ccb0b96C3c".parse().ok()?),
        _ => None,
    }
}

pub fn pkp_nft_address_for(network: &str) -> Option<Address> {
    match network {
        "naga-dev" => Some("0xB144B88514316a2f155D22937C76795b8fC9aDCd".parse().ok()?),
        "naga-test" => Some("0xaf4Dddb07Cdde48042e93eb5bf266b49950bC5BD".parse().ok()?),
        "naga-staging" => Some("0x92d2a4Acb70E498a486E0523AD42fF3F6d3D3642".parse().ok()?),
        "naga-proto" => Some("0xaeEA5fE3654919c8Bb2b356aDCb5dF4eC082C168".parse().ok()?),
        "naga" => Some("0x11eBfFeab32f6cb5775BeF83E09124B9322E4026".parse().ok()?),
        _ => None,
    }
}

pub fn pkp_helper_address_for(network: &str) -> Option<Address> {
    match network {
        "naga-dev" => Some("0xDC62fcb77554229FF2d9857B25f5BB824d33aE71".parse().ok()?),
        "naga-test" => Some("0x13428A18C0b181344F97ceaC5596F31a9d182e5c".parse().ok()?),
        "naga-staging" => Some("0xe97fFbc4eDa5CdF70375D4b8f87e476D40b628EC".parse().ok()?),
        "naga-proto" => Some("0xCCb4A87731B3eFd6732e257381486912eEde24C5".parse().ok()?),
        "naga" => Some("0xAe666c3080AA5Dd935574099c18E1eD779FFB231".parse().ok()?),
        _ => None,
    }
}

fn pubkey_router_address_for(network: &str) -> Option<Address> {
    match network {
        "naga-dev" => Some("0x9067d809df0CF7DaF6a9f20E39d572fee1564c8E".parse().ok()?),
        "naga-test" => Some("0x054Ddcfef7E9434413ad62A6F37946Bf6B6CFc1A".parse().ok()?),
        "naga-staging" => Some("0xE37847746012c756d5D91d37B311eeB8e59684e9".parse().ok()?),
        "naga-proto" => Some("0xB0c6B245B25F2e542c3570b53439825615371231".parse().ok()?),
        "naga" => Some("0x5655D71832f6f2AFD72c3012a60144f5572897F1".parse().ok()?),
        _ => None,
    }
}

fn pkp_permissions_address_for(network: &str) -> Option<Address> {
    match network {
        "naga-dev" => Some("0x85Fa92469Ed765791818b17C926d29fA824E25Ca".parse().ok()?),
        "naga-test" => Some("0x7255737630fCFb4914cF51552123eEe9abEc6120".parse().ok()?),
        "naga-staging" => Some("0x1E382ef3957218423C6e1a992a4cE6294861cC93".parse().ok()?),
        "naga-proto" => Some("0x3894cae120A6ca08150e6e51cBcBdD5c16115F9c".parse().ok()?),
        "naga" => Some("0xEB1F9A8567bC01b8cfa9d6e7078bEf587D908342".parse().ok()?),
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

fn provider_from_config(config: &NetworkConfig) -> Result<Arc<Provider<Http>>, LitSdkError> {
    let rpc_url = config
        .rpc_url
        .as_deref()
        .ok_or_else(|| LitSdkError::Config("rpc_url is required for chain APIs".into()))?;
    let provider =
        Provider::<Http>::try_from(rpc_url).map_err(|e| LitSdkError::Config(e.to_string()))?;
    Ok(Arc::new(provider))
}

fn parse_hex_bytes(hex_str: &str) -> Result<Bytes, LitSdkError> {
    let s = hex_str.strip_prefix("0x").unwrap_or(hex_str);
    let bytes = hex::decode(s).map_err(|e| LitSdkError::Config(e.to_string()))?;
    Ok(Bytes::from(bytes))
}

pub fn auth_method_id_for_eth_wallet(address: Address) -> Bytes {
    let checksum = to_checksum(&address, None);
    let msg = format!("{checksum}:lit");
    Bytes::from(keccak256(msg.as_bytes()).to_vec())
}

fn eth_address_from_pubkey(pubkey: &[u8]) -> Result<Address, LitSdkError> {
    if pubkey.len() < 2 {
        return Err(LitSdkError::Config("pubkey too short".into()));
    }
    let hash = keccak256(&pubkey[1..]);
    Ok(Address::from_slice(&hash[12..]))
}

#[derive(Clone, Debug, Default)]
pub struct Pagination {
    pub limit: usize,
    pub offset: usize,
}

#[derive(Clone, Debug)]
pub struct PaginationInfo {
    pub limit: usize,
    pub offset: usize,
    pub total: usize,
    pub has_more: bool,
}

#[derive(Clone, Debug)]
pub struct PkpData {
    pub token_id: U256,
    pub pubkey: String,
    pub eth_address: Address,
}

#[derive(Clone, Debug)]
pub struct MintPkpTx {
    pub hash: TxHash,
    pub receipt: TransactionReceipt,
    pub data: PkpData,
}

#[derive(Clone, Debug)]
pub struct PaginatedPkps {
    pub pkps: Vec<PkpData>,
    pub pagination: PaginationInfo,
}

async fn token_ids_for_owner<M: Middleware>(
    pkp_nft: &PkpNftEnumerableContract<M>,
    owner: Address,
) -> Vec<U256> {
    const BATCH_SIZE: usize = 5;
    const MAX_BATCHES: usize = 20;

    let mut out = vec![];
    for batch_index in 0..MAX_BATCHES {
        let start_index = batch_index * BATCH_SIZE;
        let calls = (0..BATCH_SIZE)
            .map(|i| {
                let index = U256::from((start_index + i) as u64);
                let call = pkp_nft.token_of_owner_by_index(owner, index);
                async move { call.call().await }
            })
            .collect::<Vec<_>>();

        let results = futures::future::join_all(calls).await;

        let mut successes = 0usize;
        for r in results {
            if let Ok(token_id) = r {
                successes += 1;
                out.push(token_id);
            }
        }

        if successes == 0 {
            break;
        }
    }

    out
}

async fn pkp_details_for_token_ids(
    config: &NetworkConfig,
    token_ids: &[U256],
) -> Result<Vec<PkpData>, LitSdkError> {
    let provider = provider_from_config(config)?;
    let router_addr = pubkey_router_address_for(config.network).ok_or_else(|| {
        LitSdkError::Config(format!(
            "unknown PubkeyRouter address for network {}",
            config.network
        ))
    })?;
    let router = PubkeyRouterContract::new(router_addr, provider);

    let mut out = Vec::with_capacity(token_ids.len());
    for token_id in token_ids {
        let pubkey_bytes: Bytes = router
            .get_pubkey(*token_id)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;

        let pubkey_hex = format!("0x{}", hex::encode(pubkey_bytes.as_ref()));
        let eth_address = eth_address_from_pubkey(pubkey_bytes.as_ref())?;

        out.push(PkpData {
            token_id: *token_id,
            pubkey: pubkey_hex,
            eth_address,
        });
    }

    Ok(out)
}

/// Fetch a derived public key from the PubkeyRouter contract.
///
/// Matches the JS SDK behavior used by `litClient.utils.getDerivedKeyId(...)`.
pub async fn get_derived_pubkey(config: &NetworkConfig, derived_key_id: H256) -> Result<String, LitSdkError> {
    const DEFAULT_KEY_SET_ID: &str = "naga-keyset1";

    let provider = provider_from_config(config)?;
    let router_addr = pubkey_router_address_for(config.network).ok_or_else(|| {
        LitSdkError::Config(format!(
            "unknown PubkeyRouter address for network {}",
            config.network
        ))
    })?;
    let staking_addr = staking_address_for(config.network).ok_or_else(|| {
        LitSdkError::Config(format!(
            "unknown Staking contract address for network {}",
            config.network
        ))
    })?;

    let router = PubkeyRouterContract::new(router_addr, provider);
    let pubkey_bytes: Bytes = router
        .get_derived_pubkey(staking_addr, DEFAULT_KEY_SET_ID.to_string(), derived_key_id.0)
        .call()
        .await
        .map_err(|e| LitSdkError::Network(e.to_string()))?;

    Ok(format!("0x{}", hex::encode(pubkey_bytes.as_ref())))
}

pub async fn view_pkps_by_address(
    config: &NetworkConfig,
    owner_address: Address,
    pagination: Pagination,
) -> Result<PaginatedPkps, LitSdkError> {
    let provider = provider_from_config(config)?;
    let pkp_nft_addr = pkp_nft_address_for(config.network).ok_or_else(|| {
        LitSdkError::Config(format!(
            "unknown PKPNFT address for network {}",
            config.network
        ))
    })?;

    let pkp_nft = PkpNftEnumerableContract::new(pkp_nft_addr, provider);
    let all_token_ids = token_ids_for_owner(&pkp_nft, owner_address).await;

    let total = all_token_ids.len();
    let limit = if pagination.limit == 0 { 10 } else { pagination.limit };
    let offset = pagination.offset;
    let has_more = offset + limit < total;

    let paginated = all_token_ids
        .iter()
        .skip(offset)
        .take(limit)
        .copied()
        .collect::<Vec<_>>();
    let pkps = pkp_details_for_token_ids(config, &paginated).await?;

    Ok(PaginatedPkps {
        pkps,
        pagination: PaginationInfo {
            limit,
            offset,
            total,
            has_more,
        },
    })
}

pub async fn view_pkps_by_auth_data(
    config: &NetworkConfig,
    auth_method_type: U256,
    auth_method_id_hex: &str,
    pagination: Pagination,
) -> Result<PaginatedPkps, LitSdkError> {
    let provider = provider_from_config(config)?;
    let permissions_addr = pkp_permissions_address_for(config.network).ok_or_else(|| {
        LitSdkError::Config(format!(
            "unknown PKPPermissions address for network {}",
            config.network
        ))
    })?;
    let permissions = PkpPermissionsContract::new(permissions_addr, provider);
    let auth_method_id = parse_hex_bytes(auth_method_id_hex)?;

    let token_ids: Vec<U256> = permissions
        .get_token_ids_for_auth_method(auth_method_type, auth_method_id)
        .call()
        .await
        .map_err(|e| LitSdkError::Network(e.to_string()))?;

    let total = token_ids.len();
    let limit = if pagination.limit == 0 { 50 } else { pagination.limit };
    let offset = pagination.offset;
    let has_more = offset + limit < total;

    let paginated = token_ids
        .iter()
        .skip(offset)
        .take(limit)
        .copied()
        .collect::<Vec<_>>();

    let pkps = pkp_details_for_token_ids(config, &paginated).await?;

    Ok(PaginatedPkps {
        pkps,
        pagination: PaginationInfo {
            limit,
            offset,
            total,
            has_more,
        },
    })
}

fn pkp_data_from_mint_receipt(receipt: &TransactionReceipt) -> Result<PkpData, LitSdkError> {
    let event_sig = H256::from(keccak256("PKPMinted(uint256,bytes)".as_bytes()));
    for log in &receipt.logs {
        if log.topics.get(0) != Some(&event_sig) || log.topics.len() < 2 {
            continue;
        }

        let token_id = U256::from_big_endian(log.topics[1].as_bytes());
        let decoded = ethers::abi::decode(&[ethers::abi::ParamType::Bytes], log.data.as_ref())
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let Some(ethers::abi::Token::Bytes(pubkey_bytes)) = decoded.into_iter().next() else {
            continue;
        };

        let pubkey_hex = format!("0x{}", hex::encode(pubkey_bytes.as_slice()));
        let eth_address = eth_address_from_pubkey(pubkey_bytes.as_slice())?;
        return Ok(PkpData {
            token_id,
            pubkey: pubkey_hex,
            eth_address,
        });
    }

    Err(LitSdkError::Network("PKPMinted event not found".into()))
}

pub struct PkpMintManager<M: Middleware> {
    pkp_nft: PkpNftMintContract<M>,
    pkp_helper: PkpHelperContract<M>,
}

impl<M: Middleware> PkpMintManager<M> {
    pub fn new(config: &NetworkConfig, middleware: Arc<M>) -> Result<Self, LitSdkError> {
        let pkp_nft_addr = pkp_nft_address_for(config.network).ok_or_else(|| {
            LitSdkError::Config(format!(
                "unknown PKPNFT address for network {}",
                config.network
            ))
        })?;
        let pkp_helper_addr = pkp_helper_address_for(config.network).ok_or_else(|| {
            LitSdkError::Config(format!(
                "unknown PKPHelper address for network {}",
                config.network
            ))
        })?;
        Ok(Self {
            pkp_nft: PkpNftMintContract::new(pkp_nft_addr, middleware.clone()),
            pkp_helper: PkpHelperContract::new(pkp_helper_addr, middleware),
        })
    }

    async fn receipt_with_pkp_data(
        &self,
        tx_hash: TxHash,
        mut receipt: TransactionReceipt,
    ) -> Result<(TransactionReceipt, PkpData), LitSdkError> {
        if receipt.status.unwrap_or_default().as_u64() != 1 {
            return Err(LitSdkError::Network(
                "PKP mint transaction failed".into(),
            ));
        }

        match pkp_data_from_mint_receipt(&receipt) {
            Ok(data) => return Ok((receipt, data)),
            Err(err) => {
                let mut last_err = err;
                let middleware = self.pkp_nft.client();
                for _ in 0..3 {
                    sleep(Duration::from_secs(2)).await;
                    let refreshed = middleware
                        .get_transaction_receipt(tx_hash)
                        .await
                        .map_err(|e| LitSdkError::Network(e.to_string()))?;
                    if let Some(r) = refreshed {
                        receipt = r;
                        match pkp_data_from_mint_receipt(&receipt) {
                            Ok(data) => return Ok((receipt, data)),
                            Err(err) => last_err = err,
                        }
                    }
                }
                Err(last_err)
            }
        }
    }

    pub async fn mint_next(
        &self,
        key_type: U256,
        key_set_id: impl Into<String>,
    ) -> Result<MintPkpTx, LitSdkError> {
        let mint_cost = self
            .pkp_nft
            .mint_cost()
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;

        let call = self
            .pkp_nft
            .mint_next(key_type, key_set_id.into())
            .value(mint_cost);

        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| LitSdkError::Network("mintNext tx dropped from mempool".into()))?;
        let (receipt, data) = self.receipt_with_pkp_data(hash, receipt).await?;
        Ok(MintPkpTx { hash, receipt, data })
    }

    pub async fn mint_next_and_add_auth_methods(
        &self,
        key_type: U256,
        key_set_id: impl Into<String>,
        permitted_auth_method_types: Vec<U256>,
        permitted_auth_method_ids: Vec<Bytes>,
        permitted_auth_method_pubkeys: Vec<Bytes>,
        permitted_auth_method_scopes: Vec<Vec<U256>>,
        add_pkp_eth_address_as_permitted_address: bool,
        send_pkp_to_itself: bool,
    ) -> Result<MintPkpTx, LitSdkError> {
        let n = permitted_auth_method_types.len();
        if permitted_auth_method_ids.len() != n
            || permitted_auth_method_pubkeys.len() != n
            || permitted_auth_method_scopes.len() != n
        {
            return Err(LitSdkError::Config(
                "permitted auth method arrays must be the same length".into(),
            ));
        }

        let mint_cost = self
            .pkp_nft
            .mint_cost()
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;

        let call = self
            .pkp_helper
            .mint_next_and_add_auth_methods(
                key_type,
                key_set_id.into(),
                permitted_auth_method_types,
                permitted_auth_method_ids,
                permitted_auth_method_pubkeys,
                permitted_auth_method_scopes,
                add_pkp_eth_address_as_permitted_address,
                send_pkp_to_itself,
            )
            .value(mint_cost);

        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| {
                LitSdkError::Network("mintNextAndAddAuthMethods tx dropped from mempool".into())
            })?;
        let (receipt, data) = self.receipt_with_pkp_data(hash, receipt).await?;
        Ok(MintPkpTx { hash, receipt, data })
    }

    pub async fn mint_with_custom_auth(
        &self,
        custom_auth_method_type: U256,
        custom_auth_method_id: Bytes,
        validation_ipfs_cid_v0: &str,
        scope: &str,
        add_pkp_eth_address_as_permitted_address: bool,
        send_pkp_to_itself: bool,
    ) -> Result<MintPkpTx, LitSdkError> {
        let scope_id = scope_id_for(scope).ok_or_else(|| {
            LitSdkError::Config(format!("unsupported auth scope: {scope}"))
        })?;
        let validation_ipfs_id = ipfs_cid_v0_to_bytes(validation_ipfs_cid_v0)?;

        self.mint_next_and_add_auth_methods(
            U256::from(2u64),
            "naga-keyset1",
            vec![custom_auth_method_type, U256::from(2u64)],
            vec![custom_auth_method_id, validation_ipfs_id],
            vec![Bytes::from(vec![]), Bytes::from(vec![])],
            vec![vec![U256::from(scope_id)], vec![U256::from(scope_id)]],
            add_pkp_eth_address_as_permitted_address,
            send_pkp_to_itself,
        )
        .await
    }

    pub async fn mint_with_eoa(&self) -> Result<MintPkpTx, LitSdkError> {
        self.mint_next(U256::from(2u64), "naga-keyset1").await
    }
}

#[derive(Clone, Debug)]
pub struct PaymentBalance {
    pub total_balance_wei: I256,
    pub available_balance_wei: I256,
}

#[derive(Clone, Debug)]
pub struct WithdrawRequest {
    pub timestamp: U256,
    pub amount: U256,
}

#[derive(Clone, Debug)]
pub struct WithdrawRequestInfo {
    pub request: WithdrawRequest,
    pub is_pending: bool,
}

#[derive(Clone, Debug)]
pub struct PaymentTx {
    pub hash: TxHash,
    pub receipt: TransactionReceipt,
}

pub struct PaymentManager<M: Middleware> {
    ledger: LedgerContract<M>,
}

impl<M: Middleware> PaymentManager<M> {
    pub fn new(config: &NetworkConfig, middleware: Arc<M>) -> Result<Self, LitSdkError> {
        let addr = ledger_address_for(config.network).ok_or_else(|| {
            LitSdkError::Config(format!(
                "unknown Ledger address for network {}",
                config.network
            ))
        })?;
        Ok(Self {
            ledger: LedgerContract::new(addr, middleware),
        })
    }

    pub async fn deposit(&self, amount_wei: U256) -> Result<PaymentTx, LitSdkError> {
        let call = self.ledger.deposit().value(amount_wei);
        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| LitSdkError::Network("deposit tx dropped from mempool".into()))?;
        Ok(PaymentTx { hash, receipt })
    }

    pub async fn deposit_for_user(
        &self,
        user_address: Address,
        amount_wei: U256,
    ) -> Result<PaymentTx, LitSdkError> {
        let call = self.ledger.deposit_for_user(user_address).value(amount_wei);
        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| LitSdkError::Network("depositForUser tx dropped from mempool".into()))?;
        Ok(PaymentTx { hash, receipt })
    }

    pub async fn get_balance(&self, user_address: Address) -> Result<PaymentBalance, LitSdkError> {
        let total = self
            .ledger
            .balance(user_address)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let available = self
            .ledger
            .stable_balance(user_address)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;

        Ok(PaymentBalance {
            total_balance_wei: total,
            available_balance_wei: available,
        })
    }

    pub async fn request_withdraw(&self, amount_wei: U256) -> Result<PaymentTx, LitSdkError> {
        let amount = I256::from_raw(amount_wei);
        let call = self.ledger.request_withdraw(amount);
        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| LitSdkError::Network("requestWithdraw tx dropped from mempool".into()))?;
        Ok(PaymentTx { hash, receipt })
    }

    pub async fn withdraw(&self, amount_wei: U256) -> Result<PaymentTx, LitSdkError> {
        let amount = I256::from_raw(amount_wei);
        let call = self.ledger.withdraw(amount);
        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| LitSdkError::Network("withdraw tx dropped from mempool".into()))?;
        Ok(PaymentTx { hash, receipt })
    }

    pub async fn get_withdraw_request(
        &self,
        user_address: Address,
    ) -> Result<WithdrawRequestInfo, LitSdkError> {
        let wr = self
            .ledger
            .latest_withdraw_request(user_address)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let is_pending = wr.timestamp > U256::zero() && wr.amount > U256::zero();
        Ok(WithdrawRequestInfo {
            request: WithdrawRequest {
                timestamp: wr.timestamp,
                amount: wr.amount,
            },
            is_pending,
        })
    }

    pub async fn get_withdraw_delay_seconds(&self) -> Result<U256, LitSdkError> {
        self.ledger
            .user_withdraw_delay()
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))
    }

    pub async fn can_execute_withdraw(
        &self,
        user_address: Address,
    ) -> Result<(bool, Option<u64>, WithdrawRequestInfo), LitSdkError> {
        let wr = self.get_withdraw_request(user_address).await?;
        let delay = self.get_withdraw_delay_seconds().await?;
        if !wr.is_pending {
            return Ok((false, None, wr));
        }

        let now_secs = std::time::SystemTime::now()
            .duration_since(std::time::SystemTime::UNIX_EPOCH)
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .as_secs();

        let req_time = wr.request.timestamp.as_u64();
        let delay_secs = delay.as_u64();
        let execute_time = req_time.saturating_add(delay_secs);
        if now_secs >= execute_time {
            Ok((true, None, wr))
        } else {
            Ok((false, Some((execute_time - now_secs) as u64), wr))
        }
    }
}

fn ipfs_cid_v0_to_bytes(cid_v0: &str) -> Result<Bytes, LitSdkError> {
    let bytes = bs58::decode(cid_v0)
        .into_vec()
        .map_err(|e| LitSdkError::Config(format!("invalid ipfs cid: {e}")))?;
    Ok(Bytes::from(bytes))
}

fn bytes_to_ipfs_cid_v0(bytes: &[u8]) -> String {
    bs58::encode(bytes).into_string()
}

fn scope_id_for(scope: &str) -> Option<u64> {
    match scope {
        "no-permissions" => Some(0),
        "sign-anything" => Some(1),
        "personal-sign" => Some(2),
        _ => None,
    }
}

fn scopes_to_u256(scopes: &[String]) -> Result<Vec<U256>, LitSdkError> {
    scopes
        .iter()
        .map(|s| {
            scope_id_for(s)
                .map(U256::from)
                .ok_or_else(|| LitSdkError::Config(format!("unknown scope: {s}")))
        })
        .collect()
}

#[derive(Clone, Debug)]
pub struct PkpAuthMethod {
    pub auth_method_type: U256,
    pub id: String,
    pub user_pubkey: String,
}

#[derive(Clone, Debug)]
pub struct PkpAuthMethodWithScopes {
    pub auth_method_type: U256,
    pub id: String,
    pub user_pubkey: String,
    pub scopes: Vec<String>,
}

#[derive(Clone, Debug)]
pub struct PkpPermissionsContext {
    pub actions: Vec<String>,
    pub addresses: Vec<Address>,
    pub auth_methods: Vec<PkpAuthMethodWithScopes>,
}

impl PkpPermissionsContext {
    pub fn is_address_permitted(&self, address: Address) -> bool {
        self.addresses.iter().any(|a| *a == address)
    }

    pub fn is_action_permitted(&self, ipfs_cid_v0: &str) -> bool {
        self.actions.iter().any(|a| a == ipfs_cid_v0)
    }

    pub fn is_auth_method_permitted(&self, auth_method_type: U256, auth_method_id_hex: &str) -> bool {
        let id = auth_method_id_hex.to_lowercase();
        self.auth_methods.iter().any(|m| {
            m.auth_method_type == auth_method_type && m.id.to_lowercase() == id
        })
    }
}

pub struct PkpPermissionsManager<M: Middleware> {
    contract: PkpPermissionsContract<M>,
    token_id: U256,
}

impl<M: Middleware> PkpPermissionsManager<M> {
    pub fn new(
        config: &NetworkConfig,
        middleware: Arc<M>,
        token_id: U256,
    ) -> Result<Self, LitSdkError> {
        let addr = pkp_permissions_address_for(config.network).ok_or_else(|| {
            LitSdkError::Config(format!(
                "unknown PKPPermissions address for network {}",
                config.network
            ))
        })?;
        Ok(Self {
            contract: PkpPermissionsContract::new(addr, middleware),
            token_id,
        })
    }

    pub async fn get_permitted_addresses(&self) -> Result<Vec<Address>, LitSdkError> {
        self.contract
            .get_permitted_addresses(self.token_id)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))
    }

    pub async fn get_permitted_actions(&self) -> Result<Vec<String>, LitSdkError> {
        let actions = self
            .contract
            .get_permitted_actions(self.token_id)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        Ok(actions.iter().map(|b| bytes_to_ipfs_cid_v0(b.as_ref())).collect())
    }

    pub async fn is_permitted_address(&self, user: Address) -> Result<bool, LitSdkError> {
        self.contract
            .is_permitted_address(self.token_id, user)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))
    }

    pub async fn is_permitted_action(&self, ipfs_cid_v0: &str) -> Result<bool, LitSdkError> {
        let ipfs_bytes = ipfs_cid_v0_to_bytes(ipfs_cid_v0)?;
        self.contract
            .is_permitted_action(self.token_id, ipfs_bytes)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))
    }

    pub async fn get_permitted_auth_methods(&self) -> Result<Vec<PkpAuthMethod>, LitSdkError> {
        let auth_methods = self
            .contract
            .get_permitted_auth_methods(self.token_id)
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;

        Ok(auth_methods
            .into_iter()
            .map(|am| PkpAuthMethod {
                auth_method_type: am.auth_method_type,
                id: format!("0x{}", hex::encode(am.id.as_ref())),
                user_pubkey: format!("0x{}", hex::encode(am.user_pubkey.as_ref())),
            })
            .collect())
    }

    pub async fn get_permitted_auth_method_scopes(
        &self,
        auth_method_type: U256,
        auth_method_id_hex: &str,
        scope_id: Option<u64>,
    ) -> Result<Vec<bool>, LitSdkError> {
        let max_scope_id = scope_id.unwrap_or(3);
        let id_bytes = parse_hex_bytes(auth_method_id_hex)?;
        self.contract
            .get_permitted_auth_method_scopes(
                self.token_id,
                auth_method_type,
                id_bytes,
                U256::from(max_scope_id),
            )
            .call()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))
    }

    pub async fn get_permissions_context(&self) -> Result<PkpPermissionsContext, LitSdkError> {
        let (actions, addresses, auth_methods) = futures::try_join!(
            self.get_permitted_actions(),
            self.get_permitted_addresses(),
            self.get_permitted_auth_methods()
        )?;

        let mut auth_methods_with_scopes = Vec::with_capacity(auth_methods.len());
        for am in &auth_methods {
            let flags = self
                .get_permitted_auth_method_scopes(am.auth_method_type, &am.id, None)
                .await?;
            let names = ["no-permissions", "sign-anything", "personal-sign"];
            let scopes: Vec<String> = flags
                .iter()
                .enumerate()
                .filter_map(|(i, enabled)| (*enabled && i < names.len()).then_some(names[i].to_string()))
                .collect();
            auth_methods_with_scopes.push(PkpAuthMethodWithScopes {
                auth_method_type: am.auth_method_type,
                id: am.id.clone(),
                user_pubkey: am.user_pubkey.clone(),
                scopes,
            });
        }

        Ok(PkpPermissionsContext {
            actions,
            addresses,
            auth_methods: auth_methods_with_scopes,
        })
    }

    pub async fn add_permitted_auth_method(
        &self,
        auth_method_type: U256,
        auth_method_id_hex: &str,
        user_pubkey_hex: &str,
        scopes: Vec<String>,
    ) -> Result<PaymentTx, LitSdkError> {
        let id = parse_hex_bytes(auth_method_id_hex)?;
        let user_pubkey = parse_hex_bytes(user_pubkey_hex)?;
        let scopes = scopes_to_u256(&scopes)?;

        let auth_method = pkp_permissions_contract::AuthMethod {
            auth_method_type,
            id,
            user_pubkey,
        };

        let call = self
            .contract
            .add_permitted_auth_method(self.token_id, auth_method, scopes);
        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| LitSdkError::Network("addPermittedAuthMethod tx dropped".into()))?;
        Ok(PaymentTx { hash, receipt })
    }

    pub async fn remove_permitted_auth_method_scope(
        &self,
        auth_method_type: U256,
        auth_method_id_hex: &str,
        scope_id: U256,
    ) -> Result<PaymentTx, LitSdkError> {
        let id = parse_hex_bytes(auth_method_id_hex)?;
        let call = self.contract.remove_permitted_auth_method_scope(
            self.token_id,
            auth_method_type,
            id,
            scope_id,
        );
        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| {
                LitSdkError::Network("removePermittedAuthMethodScope tx dropped".into())
            })?;
        Ok(PaymentTx { hash, receipt })
    }

    pub async fn remove_permitted_auth_method(
        &self,
        auth_method_type: U256,
        auth_method_id_hex: &str,
    ) -> Result<PaymentTx, LitSdkError> {
        let id = parse_hex_bytes(auth_method_id_hex)?;
        let call = self
            .contract
            .remove_permitted_auth_method(self.token_id, auth_method_type, id);
        let pending = call
            .send()
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?;
        let hash = *pending;
        let receipt = pending
            .await
            .map_err(|e| LitSdkError::Network(e.to_string()))?
            .ok_or_else(|| LitSdkError::Network("removePermittedAuthMethod tx dropped".into()))?;
        Ok(PaymentTx { hash, receipt })
    }
}
