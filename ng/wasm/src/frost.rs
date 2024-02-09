use std::{convert::TryInto as _, iter::zip};

use frost_core::{
    aggregate,
    keys::{PublicKeyPackage, VerifyingShare},
    round1::{NonceCommitment, SigningCommitments},
    round2::SignatureShare,
    Ciphersuite, Identifier, Signature, SigningPackage, VerifyingKey,
};
use js_sys::Uint8Array;
use serde_bytes::Bytes;
use wasm_bindgen::prelude::*;

use crate::abi::{from_js, into_js, JsResult};

pub fn combine_signature<C: Ciphersuite>(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    let message = from_js::<Vec<u8>>(message)?;

    let public_key = public_key_from_js(public_key)?;

    let n = identifiers.len();
    if hiding_nonces.len() != n
        || binding_nonces.len() != n
        || signature_shares.len() != n
        || verifying_shares.len() != n
    {
        return Err(JsError::new("mismatched number of shares"));
    }

    let identifiers = identifiers
        .into_iter()
        .map(identifier_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let hiding_nonces = hiding_nonces
        .into_iter()
        .map(nonce_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let binding_nonces = binding_nonces
        .into_iter()
        .map(nonce_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let signature_shares = signature_shares
        .into_iter()
        .map(signaure_share_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let verifying_shares = verifying_shares
        .into_iter()
        .map(verifying_share_from_js)
        .collect::<JsResult<Vec<_>>>()?;

    let commitments = zip(hiding_nonces.iter(), binding_nonces.iter())
        .map(|(h, b)| SigningCommitments::new(*h, *b));

    let signing_package = SigningPackage::new(
        identifiers.iter().cloned().zip(commitments).collect(),
        &message,
    );

    let public_key_package = PublicKeyPackage::new(
        identifiers.iter().cloned().zip(verifying_shares).collect(),
        public_key,
    );

    let signature = aggregate::<C>(
        &signing_package,
        &identifiers.iter().cloned().zip(signature_shares).collect(),
        &public_key_package,
    )?;

    let signature = into_js(Bytes::new(signature.serialize().as_ref()))?;

    Ok(signature)
}

pub fn verify_signature<C: Ciphersuite>(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    let message = from_js::<Vec<u8>>(message)?;
    let public_key = public_key_from_js::<C>(public_key)?;
    let signature = signature_from_js::<C>(signature)?;

    public_key.verify(&message, &signature)?;

    Ok(())
}

fn public_key_from_js<C: Ciphersuite>(k: Uint8Array) -> JsResult<VerifyingKey<C>> {
    let k = from_js::<Vec<u8>>(k)?;
    let k = k
        .try_into()
        .ok()
        .ok_or_else(|| JsError::new("cannot deserialize"))?;
    let k = VerifyingKey::<C>::deserialize(k)?;
    Ok(k)
}

fn identifier_from_js<C: Ciphersuite>(i: Uint8Array) -> Result<Identifier<C>, JsError> {
    let i = from_js::<Vec<u8>>(i)?;
    let i = i
        .try_into()
        .ok()
        .ok_or_else(|| JsError::new("cannot deserialize"))?;
    let i = Identifier::<C>::deserialize(&i)?;
    Ok(i)
}

fn nonce_from_js<C: Ciphersuite>(x: Uint8Array) -> Result<NonceCommitment<C>, JsError> {
    let x = from_js::<Vec<u8>>(x)?;
    let x = x
        .try_into()
        .ok()
        .ok_or_else(|| JsError::new("cannot deserialize"))?;
    let x = NonceCommitment::<C>::deserialize(x)?;
    Ok(x)
}

fn signaure_share_from_js<C: Ciphersuite>(x: Uint8Array) -> Result<SignatureShare<C>, JsError> {
    let x = from_js::<Vec<u8>>(x)?;
    let x = x
        .try_into()
        .ok()
        .ok_or_else(|| JsError::new("cannot deserialize"))?;
    let x = SignatureShare::<C>::deserialize(x)?;
    Ok(x)
}

fn verifying_share_from_js<C: Ciphersuite>(x: Uint8Array) -> Result<VerifyingShare<C>, JsError> {
    let x = from_js::<Vec<u8>>(x)?;
    let x = x
        .try_into()
        .ok()
        .ok_or_else(|| JsError::new("cannot deserialize"))?;
    let x = VerifyingShare::<C>::deserialize(x)?;
    Ok(x)
}

fn signature_from_js<C: Ciphersuite>(k: Uint8Array) -> JsResult<Signature<C>> {
    let k = from_js::<Vec<u8>>(k)?;
    let k = k
        .try_into()
        .ok()
        .ok_or_else(|| JsError::new("cannot deserialize"))?;
    let k = Signature::<C>::deserialize(k)?;
    Ok(k)
}

#[cfg(test)]
mod tests {
    use std::convert::TryInto;

    use frost_core::{keys::PublicKeyPackage, Signature};
    use js_sys::Uint8Array;
    use rand::SeedableRng as _;
    use serde_bytes::Bytes;
    use wasm_bindgen::JsValue;
    use wasm_bindgen_test::{console_log, wasm_bindgen_test};

    use crate::{
        abi::{from_js, into_js},
        frost::combine_signature,
    };

    #[wasm_bindgen_test]
    pub fn frost_ed25519_sha512() -> Result<(), JsValue> {
        const LIMIT: u16 = 3;
        const THRESHOLD: u16 = 2;

        let msg = hex::decode("74657374").unwrap();

        let message = into_js::<Uint8Array>(Bytes::new(&msg))?;
        let public_key = into_js::<Uint8Array>(Bytes::new(
            &hex::decode("899196af442a2c0d32d9c18b837a838379db18b37148bf35a4917202e0214658")
                .unwrap(),
        ))?;

        let identifiers = [
            "0100000000000000000000000000000000000000000000000000000000000000",
            "0200000000000000000000000000000000000000000000000000000000000000",
            "0300000000000000000000000000000000000000000000000000000000000000",
        ]
        .iter()
        .map(|s| into_js::<Uint8Array>(Bytes::new(&hex::decode(s).unwrap())))
        .collect::<Result<Vec<_>, _>>()?;

        let hiding_nonces = [
            "8ded48acb6cb53aecc4c3db42881d68139899e87b3eee9eabd87d05a685d046d",
            "a895aa9a8e588caeb89d765c738df48a5f4be3fa6b91b953e0b7bce5074c54fc",
            "7762508c2d030f72359daf77e82c9ecdc99d39a2f36f7d9cbc69ba9153e85013",
        ]
        .iter()
        .map(|s| into_js::<Uint8Array>(Bytes::new(&hex::decode(s).unwrap())))
        .collect::<Result<Vec<_>, _>>()?;

        let binding_nonces = [
            "2371452b8cce8907c5a056f468dad53149334de2098000a3f9c98badf48d99a0",
            "e3b026a1b011c7e6a9d09ce2b4945cbac261a61ad2f43234993c12edf63a630c",
            "1c2172836dc0b927e3d226458bd0be8d624cacca13fa82a258367eb025f41a38",
        ]
        .iter()
        .map(|s| into_js::<Uint8Array>(Bytes::new(&hex::decode(s).unwrap())))
        .collect::<Result<Vec<_>, _>>()?;

        let signature_shares = [
            "a8272cf614b6af2c178575792574c438ad9b617d3aca925edd4f58419d307304",
            "943afc49d0397adfea011b78f4963543be476aea4d1e4a35afb915bba3721c09",
            "2527bed7775274fd49c72e94beddb2cb16be356db29ac5b8a1bc795fc714e402",
        ]
        .iter()
        .map(|s| into_js::<Uint8Array>(Bytes::new(&hex::decode(s).unwrap())))
        .collect::<Result<Vec<_>, _>>()?;

        let verifying_shares = [
            "270e65d2e7d990c24d376b5fe008bcefe8638af62d38971e67b4c89bd2bdec07",
            "70f3807ea1c784f36fc900158a1c8ec3aaff7026be02e8edc0a2237c1eb73ccb",
            "3d6b6fdc64465c5d515770211fa981b799e3237b5d7023bf7f6a7e370add3ea7",
        ]
        .iter()
        .map(|s| into_js::<Uint8Array>(Bytes::new(&hex::decode(s).unwrap())))
        .collect::<Result<Vec<_>, _>>()?;

        let signature = combine_signature::<frost_ed25519::Ed25519Sha512>(
            message,
            public_key,
            identifiers,
            hiding_nonces,
            binding_nonces,
            signature_shares,
            verifying_shares,
        )?;

        let mut rng = rand::rngs::StdRng::seed_from_u64(0); // deterministic for testing

        let (_, public_package) = frost_core::keys::generate_with_dealer(
            LIMIT,
            THRESHOLD,
            frost_core::keys::IdentifierList::<frost_ed25519::Ed25519Sha512>::Default,
            &mut rng,
        )
        .unwrap();

        console_log!("{:?}", public_package);

        let signature = from_js::<Vec<u8>>(&signature)?;
        let signature =
            Signature::<frost_ed25519::Ed25519Sha512>::deserialize(signature.try_into().unwrap())
                .unwrap();

        public_package
            .verifying_key()
            .verify(&msg, &signature)
            .unwrap();

        Ok(())
    }
}

#[wasm_bindgen(js_name = "frostEd25519Combine")]
pub fn frost_ed25519_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature::<frost_ed25519::Ed25519Sha512>(
        message,
        public_key,
        identifiers,
        hiding_nonces,
        binding_nonces,
        signature_shares,
        verifying_shares,
    )
}

#[wasm_bindgen(js_name = "frostEd25519Verify")]
pub fn frost_ed25519_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature::<frost_ed25519::Ed25519Sha512>(message, public_key, signature)
}

#[wasm_bindgen(js_name = "frostEd448Combine")]
pub fn frost_ed448_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature::<frost_ed448::Ed448Shake256>(
        message,
        public_key,
        identifiers,
        hiding_nonces,
        binding_nonces,
        signature_shares,
        verifying_shares,
    )
}

#[wasm_bindgen(js_name = "frostEd448Verify")]
pub fn frost_ed448_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature::<frost_ed448::Ed448Shake256>(message, public_key, signature)
}

#[wasm_bindgen(js_name = "frostRistretto255Combine")]
pub fn frost_ristretto255_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature::<frost_ristretto255::Ristretto255Sha512>(
        message,
        public_key,
        identifiers,
        hiding_nonces,
        binding_nonces,
        signature_shares,
        verifying_shares,
    )
}

#[wasm_bindgen(js_name = "frostRistretto255Verify")]
pub fn frost_ristretto255_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature::<frost_ristretto255::Ristretto255Sha512>(message, public_key, signature)
}

#[cfg(any())]
#[wasm_bindgen(js_name = "frostSecp256k1Combine")]
pub fn frost_secp256k1_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature::<frost_secp256k1::Secp256K1Sha256>(
        message,
        public_key,
        identifiers,
        hiding_nonces,
        binding_nonces,
        signature_shares,
        verifying_shares,
    )
}

#[cfg(any())]
#[wasm_bindgen(js_name = "frostSecp256k1Verify")]
pub fn frost_secp256k1_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature::<frost_secp256k1::Secp256K1Sha256>(message, public_key, signature)
}

#[wasm_bindgen(js_name = "frostP256Combine")]
pub fn frost_p256_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature::<frost_p256::P256Sha256>(
        message,
        public_key,
        identifiers,
        hiding_nonces,
        binding_nonces,
        signature_shares,
        verifying_shares,
    )
}

#[wasm_bindgen(js_name = "frostP256Verify")]
pub fn frost_p256_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature::<frost_p256::P256Sha256>(message, public_key, signature)
}

#[cfg(any())]
#[wasm_bindgen(js_name = "frostP384Combine")]
pub fn frost_p384_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature::<frost_p384::P384Sha384>(
        message,
        public_key,
        identifiers,
        hiding_nonces,
        binding_nonces,
        signature_shares,
        verifying_shares,
    )
}

#[cfg(any())]
#[wasm_bindgen(js_name = "frostP384Verify")]
pub fn frost_p384_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature::<frost_p384::P384Sha384>(message, public_key, signature)
}

#[cfg(any())]
#[wasm_bindgen(js_name = "frostRedjubjubCombine")]
pub fn frost_redjubjub_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature::<frost_redjubjub::JubjubBlake2b512>(
        message,
        public_key,
        identifiers,
        hiding_nonces,
        binding_nonces,
        signature_shares,
        verifying_shares,
    )
}

#[cfg(any())]
#[wasm_bindgen(js_name = "frostRedjubjubVerify")]
pub fn frost_redjubjub_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature::<frost_redjubjub::JubjubBlake2b512>(message, public_key, signature)
}

#[cfg(any())]
#[wasm_bindgen(js_name = "frostTaprootCombine")]
pub fn frost_taproot_combine(
    message: Uint8Array,
    public_key: Uint8Array,
    identifiers: Vec<Uint8Array>,
    hiding_nonces: Vec<Uint8Array>,
    binding_nonces: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    verifying_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    combine_signature::<frost_taproot::Secp256K1Taproot>(
        message,
        public_key,
        identifiers,
        hiding_nonces,
        binding_nonces,
        signature_shares,
        verifying_shares,
    )
}

#[cfg(any())]
#[wasm_bindgen(js_name = "frostTaprootVerify")]
pub fn frost_taproot_verify(
    message: Uint8Array,
    public_key: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    verify_signature::<frost_taproot::Secp256K1Taproot>(message, public_key, signature)
}
