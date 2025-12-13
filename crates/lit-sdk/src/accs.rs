use crate::error::LitSdkError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OperatorAcc {
    operator: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReturnValueTestBasic {
    comparator: String,
    value: Value,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EvmBasicCondition {
    contract_address: String,
    chain: String,
    standard_contract_type: String,
    method: String,
    parameters: Vec<String>,
    return_value_test: ReturnValueTestBasic,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AbiParam {
    name: String,
    #[serde(rename = "type")]
    typ: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FunctionAbi {
    name: String,
    inputs: Vec<AbiParam>,
    outputs: Vec<AbiParam>,
    #[serde(default)]
    constant: bool,
    state_mutability: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReturnValueTestEvmContract {
    #[serde(skip_serializing_if = "Option::is_none")]
    key: Option<String>,
    comparator: String,
    value: Value,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EvmContractCondition {
    contract_address: String,
    function_name: String,
    function_params: Vec<Value>,
    function_abi: FunctionAbi,
    chain: String,
    return_value_test: ReturnValueTestEvmContract,
}

fn canonicalize_unified_item(item: &Value) -> Result<Value, LitSdkError> {
    if item.is_array() {
        let arr = item
            .as_array()
            .unwrap()
            .iter()
            .map(canonicalize_unified_item)
            .collect::<Result<Vec<_>, _>>()?;
        return Ok(Value::Array(arr));
    }

    if let Some(op) = item.get("operator") {
        let op_str = op
            .as_str()
            .ok_or_else(|| LitSdkError::Accs("operator must be a string".into()))?;
        let canonical = OperatorAcc {
            operator: op_str.to_string(),
        };
        return Ok(serde_json::to_value(canonical).unwrap());
    }

    let condition_type = item
        .get("conditionType")
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| {
            if item.get("functionName").is_some() || item.get("functionAbi").is_some() {
                "evmContract"
            } else {
                "evmBasic"
            }
        });

    match condition_type {
        "evmBasic" => {
            let cond: EvmBasicCondition = serde_json::from_value(item.clone())
                .map_err(|e| LitSdkError::Accs(e.to_string()))?;
            Ok(serde_json::to_value(cond).unwrap())
        }
        "evmContract" => {
            let cond: EvmContractCondition = serde_json::from_value(item.clone())
                .map_err(|e| LitSdkError::Accs(e.to_string()))?;
            Ok(serde_json::to_value(cond).unwrap())
        }
        other => Err(LitSdkError::Accs(format!(
            "unsupported unified conditionType: {other}"
        ))),
    }
}

/// Canonicalize unified access control conditions to the deterministic JSON form
/// used by the JS SDK.
pub fn canonicalize_unified_access_control_conditions(
    unified: &Value,
) -> Result<Value, LitSdkError> {
    let arr = unified.as_array().ok_or_else(|| {
        LitSdkError::Accs("unifiedAccessControlConditions must be an array".into())
    })?;

    let canonical_items = arr
        .iter()
        .map(canonicalize_unified_item)
        .collect::<Result<Vec<_>, _>>()?;

    Ok(Value::Array(canonical_items))
}

/// Hash unified access control conditions using the same canonicalization + SHA-256
/// scheme as the JS SDK. Supports `evmBasic`, `evmContract`, and `{ operator }` items.
pub fn hash_unified_access_control_conditions(
    unified: &Value,
) -> Result<Vec<u8>, LitSdkError> {
    let canonical = canonicalize_unified_access_control_conditions(unified)?;
    let arr = canonical.as_array().unwrap();
    if arr.is_empty() {
        return Err(LitSdkError::Accs("no conditions provided".into()));
    }

    let to_hash = serde_json::to_string(arr)
        .map_err(|e| LitSdkError::Accs(e.to_string()))?;

    let mut hasher = Sha256::new();
    hasher.update(to_hash.as_bytes());
    Ok(hasher.finalize().to_vec())
}

/// Canonicalize legacy access control conditions (`accessControlConditions`) to the deterministic
/// JSON form used by the JS SDK.
///
/// This supports `evmBasic`, `evmContract`, and `{ operator }` items.
pub fn canonicalize_access_control_conditions(
    access_control_conditions: &Value,
) -> Result<Value, LitSdkError> {
    let arr = access_control_conditions.as_array().ok_or_else(|| {
        LitSdkError::Accs("accessControlConditions must be an array".into())
    })?;

    let canonical_items = arr
        .iter()
        .map(canonicalize_unified_item)
        .collect::<Result<Vec<_>, _>>()?;

    Ok(Value::Array(canonical_items))
}

/// Hash legacy access control conditions (`accessControlConditions`) using the same canonicalization
/// + SHA-256 scheme as the JS SDK.
pub fn hash_access_control_conditions(
    access_control_conditions: &Value,
) -> Result<Vec<u8>, LitSdkError> {
    let canonical = canonicalize_access_control_conditions(access_control_conditions)?;
    let arr = canonical.as_array().unwrap();
    if arr.is_empty() {
        return Err(LitSdkError::Accs("no conditions provided".into()));
    }

    let to_hash =
        serde_json::to_string(arr).map_err(|e| LitSdkError::Accs(e.to_string()))?;

    let mut hasher = Sha256::new();
    hasher.update(to_hash.as_bytes());
    Ok(hasher.finalize().to_vec())
}
