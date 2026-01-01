use lit_sdk::accs::hash_unified_access_control_conditions;
use serde_json::json;

#[test]
fn hash_unified_evm_basic_is_stable() {
    let unified = json!([
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

    let hash = hash_unified_access_control_conditions(&unified).unwrap();
    assert_eq!(
        hex::encode(hash),
        "b4e19c5a204f3df017ee6a8781d29103469a43d061a2604f400c81af009eb209"
    );
}
