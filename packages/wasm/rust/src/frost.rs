use std::convert::TryInto as _;

use lit_frost::{
    Signature, SignatureShare, VerifyingKey,
    VerifyingShare, Identifier, SigningCommitments,
};
use js_sys::Uint8Array;
use serde::Deserialize;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use crate::abi::{from_js, into_uint8array, JsResult};

#[derive(Tsify, Deserialize)]
#[tsify(from_wasm_abi)]
pub enum FrostVariant {
    Ed25519Sha512,
    Ed448Shake256,
    Ristretto255Sha512,
    Secp256K1Sha256,
    P256Sha256,
    P384Sha384,
    JubjubBlake2b512,
    Secp256K1Taproot,
}

pub fn combine_signature(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    signing_commitments: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    let message = from_js::<Vec<u8>>(message)?;

    let public_key = public_key_from_js(public_key)?;

    let n = identifiers.len();
    if signing_commitments.len() != n
        || signature_shares.len() != n
        || verifying_shares.len() != n
    {
        return Err(JsError::new("mismatched number of shares"));
    }

    let identifiers = identifiers
        .into_iter()
        .map(identifier_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let commitments = signing_commitments
        .into_iter()
        .map(commitments_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let signature_shares = signature_shares
        .into_iter()
        .map(signature_share_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let verifying_shares = verifying_shares
        .into_iter()
        .map(verifying_share_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let signing_commitments = identifiers.iter().zip(commitments.iter()).map(|(identifier, commitment)| {
        (identifier.clone(), commitment.clone())
    }).collect::<Vec<_>>();
    let signature_shares = identifiers.iter().zip(signature_shares.iter()).map(|(identifier, share)| {
        (identifier.clone(), share.clone())
    }).collect::<Vec<_>>();
    let verifying_shares = identifiers.iter().zip(verifying_shares.iter()).map(|(identifier, share)| {
        (identifier.clone(), share.clone())
    }).collect::<Vec<_>>();

    let signature = public_key.scheme.aggregate(
        &message,
        &signing_commitments,
        &signature_shares,
        &verifying_shares,
        &public_key
    ).map_err(|e| JsError::new(&e.to_string()))?;

    let s: Vec<u8> = signature.into();
    into_uint8array(&s)
}

pub fn verify_signature(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    let message = from_js::<Vec<u8>>(message)?;
    let public_key = public_key_from_js(public_key)?;
    let signature = signature_from_js(signature)?;

    public_key.scheme.verify(&message, &public_key, &signature)?;

    Ok(())
}

fn public_key_from_js(k: Uint8Array) -> JsResult<VerifyingKey> {
    let k = from_js::<Vec<u8>>(k)?;
    let k = k
        .try_into()
        .map_err(|_e| JsError::new("cannot deserialize"))?;
    Ok(k)
}

fn identifier_from_js(i: Uint8Array) -> Result<Identifier, JsError> {
    let i = from_js::<Vec<u8>>(i)?;
    let i = i
        .try_into()
        .map_err(|_e| JsError::new("cannot deserialize"))?;
    Ok(i)
}

fn commitments_from_js(x: Uint8Array) -> Result<SigningCommitments, JsError> {
    let x = from_js::<Vec<u8>>(x)?;
    let x = x
        .try_into()
        .map_err(|_e| JsError::new("cannot deserialize"))?;
    Ok(x)
}

fn signature_share_from_js(x: Uint8Array) -> Result<SignatureShare, JsError> {
    let x = from_js::<Vec<u8>>(x)?;
    let x = x
        .try_into()
        .map_err(|_e| JsError::new("cannot deserialize"))?;
    Ok(x)
}

fn verifying_share_from_js(x: Uint8Array) -> Result<VerifyingShare, JsError> {
    let x = from_js::<Vec<u8>>(x)?;
    let x = x
        .try_into()
        .map_err(|_e| JsError::new("cannot deserialize"))?;
    Ok(x)
}

fn signature_from_js(k: Uint8Array) -> JsResult<Signature> {
    let k = from_js::<Vec<u8>>(k)?;
    let k = k
        .try_into()
        .map_err(|_e| JsError::new("cannot deserialize"))?;
    Ok(k)
}

#[cfg(test)]
mod tests {
    use std::convert::TryInto;

    use lit_frost::{Scheme, Signature};
    use rand::SeedableRng as _;
    use wasm_bindgen::JsValue;
    use wasm_bindgen_test::{console_log, wasm_bindgen_test};

    use crate::{
        abi::{from_js, into_uint8array},
        frost::combine_signature,
    };

    // #[wasm_bindgen_test]
    // pub fn frost_ed25519_sha512() -> Result<(), JsValue> {
    //     const LIMIT: u16 = 3;
    //     const THRESHOLD: u16 = 2;
    //     const SCHEME: Scheme = Scheme::Ed25519Sha512;
    //
    //     let msg = hex::decode("74657374").unwrap();
    //
    //     let message = into_uint8array(&msg)?;
    //     let public_key = into_uint8array(
    //         &hex::decode("899196af442a2c0d32d9c18b837a838379db18b37148bf35a4917202e0214658")
    //             .unwrap(),
    //     )?;
    //
    //     let identifiers = [
    //         "0100000000000000000000000000000000000000000000000000000000000000",
    //         "0200000000000000000000000000000000000000000000000000000000000000",
    //         "0300000000000000000000000000000000000000000000000000000000000000",
    //     ]
    //     .iter()
    //     .map(|s| into_uint8array(hex::decode(s).unwrap()))
    //     .collect::<Result<Vec<_>, _>>()?;
    //
    //     let hiding_nonces = [
    //         "8ded48acb6cb53aecc4c3db42881d68139899e87b3eee9eabd87d05a685d046d",
    //         "a895aa9a8e588caeb89d765c738df48a5f4be3fa6b91b953e0b7bce5074c54fc",
    //         "7762508c2d030f72359daf77e82c9ecdc99d39a2f36f7d9cbc69ba9153e85013",
    //     ]
    //     .iter()
    //     .map(|s| into_uint8array(hex::decode(s).unwrap()))
    //     .collect::<Result<Vec<_>, _>>()?;
    //
    //     let binding_nonces = [
    //         "2371452b8cce8907c5a056f468dad53149334de2098000a3f9c98badf48d99a0",
    //         "e3b026a1b011c7e6a9d09ce2b4945cbac261a61ad2f43234993c12edf63a630c",
    //         "1c2172836dc0b927e3d226458bd0be8d624cacca13fa82a258367eb025f41a38",
    //     ]
    //     .iter()
    //     .map(|s| into_uint8array(hex::decode(s).unwrap()))
    //     .collect::<Result<Vec<_>, _>>()?;
    //
    //     let signature_shares = [
    //         "a8272cf614b6af2c178575792574c438ad9b617d3aca925edd4f58419d307304",
    //         "943afc49d0397adfea011b78f4963543be476aea4d1e4a35afb915bba3721c09",
    //         "2527bed7775274fd49c72e94beddb2cb16be356db29ac5b8a1bc795fc714e402",
    //     ]
    //     .iter()
    //     .map(|s| into_uint8array(hex::decode(s).unwrap()))
    //     .collect::<Result<Vec<_>, _>>()?;
    //
    //     let verifying_shares = [
    //         "270e65d2e7d990c24d376b5fe008bcefe8638af62d38971e67b4c89bd2bdec07",
    //         "70f3807ea1c784f36fc900158a1c8ec3aaff7026be02e8edc0a2237c1eb73ccb",
    //         "3d6b6fdc64465c5d515770211fa981b799e3237b5d7023bf7f6a7e370add3ea7",
    //     ]
    //     .iter()
    //     .map(|s| into_uint8array(hex::decode(s).unwrap()))
    //     .collect::<Result<Vec<_>, _>>()?;
    //
    //     let signature = SCHEME..agcombine_signature::<frost_ed25519::Ed25519Sha512>(
    //         message,
    //         public_key,
    //         identifiers,
    //         hiding_nonces,
    //         binding_nonces,
    //         signature_shares,
    //         verifying_shares,
    //     )?;
    //
    //     let mut rng = rand::rngs::StdRng::seed_from_u64(0); // deterministic for testing
    //
    //     let (_, public_package) = frost_core::keys::generate_with_dealer(
    //         LIMIT,
    //         THRESHOLD,
    //         frost_core::keys::IdentifierList::<frost_ed25519::Ed25519Sha512>::Default,
    //         &mut rng,
    //     )
    //     .unwrap();
    //
    //     console_log!("{:?}", public_package);
    //
    //     let signature = from_js::<Vec<u8>>(&signature)?;
    //     let signature =
    //         Signature::<frost_ed25519::Ed25519Sha512>::deserialize(signature.try_into().unwrap())
    //             .unwrap();
    //
    //     public_package
    //         .verifying_key()
    //         .verify(&msg, &signature)
    //         .unwrap();
    //
    //     Ok(())
    // }
}

#[wasm_bindgen(js_name = "frostCombine")]
pub fn frost_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    signing_commitments: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature(
        message,
        public_key,
        identifiers,
        signing_commitments,
        signature_shares,
        verifying_shares,
    )
}

#[wasm_bindgen(js_name = "frostVerify")]
pub fn frost_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature(message, public_key, signature)
}
