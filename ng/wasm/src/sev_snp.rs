use std::collections::BTreeMap;

use serde::Deserialize;
use sev::certs::snp::Certificate;
use sev::firmware::host::TcbVersion;
use sha2::{Digest, Sha512};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use sev::certs::snp::{builtin::milan, ca, Chain, Verifiable};
use sev::firmware::guest::AttestationReport;

use crate::bytes::Bytes;

/// Gets the vcek url for the given attestation report.  You can fetch this certificate yourself, and pass it in to verify_attestation_report
#[wasm_bindgen(js_name = "sevSnpGetVcekUrl")]
pub fn sev_snp_get_vcek_url(attestation_report: &[u8]) -> Result<String, JsError> {
    let attestation_report = parse_attestation_report(attestation_report)?;
    let url = get_vcek_url(attestation_report);
    Ok(url)
}

fn get_vcek_url(attestation_report: AttestationReport) -> String {
    const KDS_CERT_SITE: &str = "https://kdsintf.amd.com";
    #[allow(dead_code)]
    const KDS_DEV_CERT_SITE: &str = "https://kdsintfdev.amd.com";

    #[allow(dead_code)]
    const KDS_CEK: &str = "/cek/id/";

    const KDS_VCEK: &str = "/vcek/v1/"; // KDS_VCEK/{product_name}/{hwid}?{tcb parameter list}
    #[allow(dead_code)]
    const KDS_VCEK_CERT_CHAIN: &str = "cert_chain"; // KDS_VCEK/{product_name}/cert_chain
    #[allow(dead_code)]
    const KDS_VCEK_CRL: &str = "crl"; // KDS_VCEK/{product_name}/crl"

    const PRODUCT_NAME: &str = "Milan";

    let AttestationReport {
        chip_id,
        reported_tcb:
            TcbVersion {
                bootloader,
                tee,
                snp,
                microcode,
                ..
            },
        ..
    } = attestation_report;

    format!(
        "{}{}{}/{}?blSPL={bootloader:0>2}&teeSPL={tee:0>2}&snpSPL={snp:0>2}&ucodeSPL={microcode:0>2}",
        KDS_CERT_SITE, KDS_VCEK, PRODUCT_NAME, hex::encode(chip_id)
    )
}

#[derive(Tsify, Deserialize)]
#[tsify(from_wasm_abi)]
pub struct AttestationData(BTreeMap<String, Bytes<Vec<u8>>>);

#[derive(Tsify, Deserialize)]
#[tsify(from_wasm_abi)]
pub struct AttestationSignatures(Vec<Bytes<Vec<u8>>>);

#[wasm_bindgen(js_name = "sevSnpVerify")]
pub fn sev_snp_verify(
    attestation_report: &[u8],
    data: AttestationData,
    signatures: AttestationSignatures,
    challenge: &[u8],
    vcek_certificate: &[u8],
) -> Result<(), JsError> {
    let attestation_report = parse_attestation_report(attestation_report)?;
    let vcek_certificate = parse_certificate(vcek_certificate)?;

    verify_certificate(vcek_certificate, attestation_report)?;
    verify_challenge(challenge, data, signatures, attestation_report)?;

    Ok(())
}

fn parse_attestation_report(attestation_report: &[u8]) -> Result<AttestationReport, JsError> {
    let report = unsafe { std::ptr::read(attestation_report.as_ptr() as *const _) };
    // TODO: run some validation here?
    Ok(report)
}

fn parse_certificate(vcek_certificate: &[u8]) -> Result<Certificate, JsError> {
    Certificate::from_der(&vcek_certificate).map_err(|e| JsError::new(e.to_string().as_str()))
}

fn verify_certificate(vcek: Certificate, report: AttestationReport) -> Result<(), JsError> {
    let ark = milan::ark().unwrap();
    let ask = milan::ask().unwrap();

    let ca = ca::Chain { ark, ask };

    let chain = Chain { ca, vcek };

    (&chain, &report)
        .verify()
        .map_err(|e| JsError::new(e.to_string().as_str()))
}

fn verify_challenge(
    challenge: &[u8],
    data: AttestationData,
    signatures: AttestationSignatures,
    attestation_report: AttestationReport,
) -> Result<(), JsError> {
    let expected_report_data = get_expected_report_data(data.0, signatures.0, challenge);

    if attestation_report.report_data != expected_report_data {
        return Err(
            JsError::new(
                "Report data does not match.  This generally indicates that the data, challenge/nonce, or signatures are bad."
            )
        );
    }
    Ok(())
}

fn get_expected_report_data(
    data: BTreeMap<String, Bytes<Vec<u8>>>,
    signatures: Vec<Bytes<Vec<u8>>>,
    challenge: &[u8],
) -> [u8; 64] {
    let mut hasher = Sha512::new();

    hasher.update("noonce");
    hasher.update(challenge);

    hasher.update("data");
    for (key, value) in data {
        hasher.update(key);
        hasher.update(value);
    }

    // FIXME: can we really have `signatures.len() == 0`?
    if signatures.len() > 0 {
        hasher.update("signatures");

        // FIXME: why is the slice needed?
        for s in &signatures[..signatures.len() - 1] {
            hasher.update(s);
        }
    }

    let result = hasher.finalize();
    let mut array = [0u8; 64];
    array.copy_from_slice(&result[..]);
    array
}
